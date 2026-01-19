from flask import Flask, render_template, request
import yaml
import psutil
import requests
from datetime import datetime, timedelta

app = Flask(__name__)

def load_dashboard_config():
    with open('config/dashboard.yaml', 'r') as file:
        config = yaml.safe_load(file)
    return config

@app.route('/')
def home():
    config = load_dashboard_config()
    print(config)
    return render_template("index.html", widgets=config["widgets"])

@app.route("/pcstats")
def pcstats():
        cpu_percent = psutil.cpu_percent(interval=0.3)
        
        ram = psutil.virtual_memory()
        disk = psutil.disk_usage('/')

        return{
             "cpu_percent": cpu_percent,
             "ram_installed" : ram.total,
             "ram_usage" : ram.used,
             "ram_percent" : ram.percent,
             "disk_installed" : disk.total,
             "disk_usage" : disk.used,
             "disk_percent" : disk.percent

        }

@app.route("/apprun", methods=["POST"])
def run_command():
    import subprocess, shlex
    cmd = request.json.get("cmd")

    try:
        subprocess.Popen(shlex.split(cmd))
        return{"ok" : True}
    except Exception as e:
        return{"ok": False, "error": str(e)}
    

@app.route("/hackatime/today")
def hackatime():
     config = load_dashboard_config()
     print("widgets:")
     for w in config["widgets"]:
            if w.get("type") == "hackatime":
                print(w)

     widget = next((w for w in config["widgets"] if w["type"] == "hackatime"), None)
     username = widget.get("username")
     API_key = widget.get("API")

     url = f"https://hackatime.hackclub.com/api/hackatime/v1/users/{username}/statusbar/today"
     headers = {"Authorization" : f"Bearer {API_key}"}

     r = requests.get(url, headers=headers)
     data = r.json()
     print(r.status_code)
     print(r.text)

     if "error" in data:
        return{
            "error" : data['error']
        }
     grand_total = data['data']['grand_total']

    #  return data

     return{
         "Time Today": grand_total['text']
     }

@app.route("/hackatime/data")
def hackatime_data():
     config = load_dashboard_config()
     print("widgets:")
     for w in config["widgets"]:
            if w.get("type") == "hackatime":
                print(w)

     widget = next((w for w in config["widgets"] if w["type"] == "hackatime"), None)
     username = widget.get("username")
     API_key = widget.get("API")

     url = f"https://hackatime.hackclub.com/api/v1/users/{username}/stats"
     headers = {"Authorization" : f"Bearer {API_key}"}

     r = requests.get(url, headers=headers)
     data = r.json()
     print(r.status_code)
     print(r.text)  



     return data


if __name__ == '__main__':
    app.run(debug=True, port=5050)
