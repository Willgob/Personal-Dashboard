from flask import Flask, render_template, request, url_for, jsonify
import yaml
import psutil
import requests
from datetime import datetime, timedelta
import dbus
import subprocess
import time
import pyperclip
from threading import Thread

app = Flask(__name__)

clipboard_history = []

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


def get_current_audio():
     session_bus = dbus.SessionBus()
     players = [name for name in session_bus.list_names() if name.startswith('org.mpris.MediaPlayer2.')]
     if not players:
            return {"Error": "No audio players found"}
     
     player = session_bus.get_object(players[0], '/org/mpris/MediaPlayer2')
     props = dbus.Interface(player, 'org.freedesktop.DBus.Properties')

     metadata = props.Get('org.mpris.MediaPlayer2.Player', 'Metadata')
     status = props.Get('org.mpris.MediaPlayer2.Player', 'PlaybackStatus')
     position = props.Get('org.mpris.MediaPlayer2.Player', 'Position')

     title = metadata.get('xesam:title', 'Unknown Title')
     artists = metadata.get('xesam:artist', [])
     artist = ", ".join((str(a) for a in artists)) if artists else 'Unknown Artist'

     length = metadata.get('mpris:length', 0)
     picture_cover = metadata.get('mpris:artUrl', '')


     return{
          "title": str(title), 
          "artist": str(artist),
          "status": str(status),
          "position": int(position) // 1000000,
          "length": int(length) // 1000000,
          "cover" : picture_cover
          }

@app.route("/audio/current")
def audio_current():
     return get_current_audio()

def get_playing_audio():
    bus = dbus.SessionBus()
    players = [name for name in bus.list_names() if name.startswith("org.mpris.MediaPlayer2")]
    if not players:
         return None
    return bus.get_object(players[0], "/org/mpris/MediaPlayer2")


@app.route("/audio/play_pause", methods=["GET", "POST"])
def audio_play_pause():
     player = get_playing_audio()
     if player is None:
         return {"error": "No audio player found"}
     dbus_interface = dbus.Interface(player, "org.mpris.MediaPlayer2.Player").PlayPause()
     return {"status": "toggled"}


@app.route("/audio/next", methods=["GET", "POST"])
def audio_next():
        player = get_playing_audio()
        if player is None:
            return {"error": "No audio player found"}
        dbus_interface = dbus.Interface(player, "org.mpris.MediaPlayer2.Player").Next()
        return {"status": "skipped"}


@app.route("/audio/previous", methods=["GET", "POST"])
def audio_previous():
    player = get_playing_audio()
    if player is None:
         return {"error": "No audio player found"}
    dbus_interface = dbus.Interface(player, "org.mpris.MediaPlayer2.Player").Previous()
    return {"status": "previous"}


@app.route("/audio/seek", methods=["GET", "POST"])
def audio_seek():
     data = request.get_json()
     position_current = data.get("position", 0)
     player = get_playing_audio()
     player_interface = dbus.Interface(player, "org.mpris.MediaPlayer2.Player")
     player_interface.SetPosition("/org/mpris/MediaPlayer2", position_current * 1000000)
     return {"status": "seeked"}

     
def get_system_volume():
     out = subprocess.check_output(["wpctl", "get-volume", "@DEFAULT_AUDIO_SINK@"]).decode()
     vol_str = out.split()[1]
     vol = float(vol_str)
     return int(vol * 100)

@app.route("/audio/volume_up", methods=["GET", "POST"])
def audio_volume_up():
     subprocess.call(["wpctl", "set-volume", "@DEFAULT_AUDIO_SINK@", "3%+"])
     return {"volume" : get_system_volume()}

@app.route("/audio/volume_down", methods=["GET", "POST"])
def audio_volume_down():
     subprocess.call(["wpctl", "set-volume", "@DEFAULT_AUDIO_SINK@", "3%-"])
     return {"volume" : get_system_volume()}

@app.route("/audio/volume")
def audio_volume():
        volume = get_system_volume()
        return {"volume" : volume}

@app.route("/audio/lyrics/<artist>/<title>")
def lyrics(artist, title):
     res = requests.get(f"https://api.lyrics.ovh/v1/{artist}/{title}")
     data = res.json()
     lyrics= data.get("lyrics", "")
     lines = [line.strip() for line in lyrics.split("\n") if line.strip()]
     return jsonify({"lyrics": lines})

# def clipboard():
#      last_text = ""
#      while True:
#          try: 
#             text = pyperclip.paste()
#             if text != last_text:
#                 last_text = text
#                 clipboard_history.insert(0, text)
#                 if len(clipboard_history) > 15:
#                         clipboard_history.pop()
#          except Exception as e:
#             print("Clipboard error:", e)
#          time.sleep(0.5)

def get_clipboard_history():
     try:
          return subprocess.check_output(
               ["wl-paste", "--no-newline"],
               text= True 
          ).strip()
     except subprocess.CalledProcessError:
          return ""


def poll_clipboard():

     initial = get_clipboard_history()
     if initial:
          clipboard_history.insert(0, initial)

     proc = subprocess.Popen(
          ["wl-paste", "--watch"],
          stdout=subprocess.PIPE,
          stderr = subprocess.DEVNULL,
          text =True
     )

     for line in proc.stdout:
          text = line.strip()
          if text and (not clipboard_history or text != clipboard_history[0]):
               clipboard_history.insert(0, text)
               clipboard_history[:] = clipboard_history[:15]

Thread(target=poll_clipboard, daemon=True).start()



@app.route("/clipboard/history")
def get_clipboard_history():
    return jsonify({"history": clipboard_history})

if __name__ == '__main__':
    app.run(debug=True, port=5050)
