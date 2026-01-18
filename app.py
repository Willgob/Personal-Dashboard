from flask import Flask, render_template
import yaml
import psutil

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

if __name__ == '__main__':
    app.run(debug=True, port=5050)
