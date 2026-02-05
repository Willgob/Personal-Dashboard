import base64
import datetime
import os
import random
import subprocess
import time
from datetime import timedelta
from threading import Thread
import dbus
import psutil
import pyperclip
import requests
import yaml
from dotenv import load_dotenv
from flask import Flask, Response, jsonify, render_template, request, url_for

import bambu_lab_mqtt
from bambu_camera import BambuCamera

mqtt_client = bambu_lab_mqtt.start_mqtt()

bambu_lab_mqtt.request_full_data(mqtt_client, bambu_lab_mqtt.printer_serial)

app = Flask(__name__)

clipboard_history = []
Hackatime_API_KEY = os.getenv("HACKATIME_API_KEY")
print(Hackatime_API_KEY)

MAIL_API_KEY = os.getenv("MAIL_API_KEY")


def load_dashboard_config():
    with open("config/dashboard.yaml", "r") as file:
        config = yaml.safe_load(file)
    return config


@app.route("/")
def home():
    config = load_dashboard_config()
    print(config)
    return render_template("index.html", widgets=config["widgets"])


@app.route("/pcstats")
def pcstats():
    cpu_percent = psutil.cpu_percent(interval=0.3)

    ram = psutil.virtual_memory()
    disk = psutil.disk_usage("/")

    return {
        "cpu_percent": cpu_percent,
        "ram_installed": ram.total,
        "ram_usage": ram.used,
        "ram_percent": ram.percent,
        "disk_installed": disk.total,
        "disk_usage": disk.used,
        "disk_percent": disk.percent,
    }


@app.route("/apprun", methods=["POST"])
def run_command():
    import shlex
    import subprocess

    cmd = request.json.get("cmd")

    try:
        subprocess.Popen(shlex.split(cmd))
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}


@app.route("/hackatime/today")
def hackatime():
    config = load_dashboard_config()
    print("widgets:")
    for w in config["widgets"]:
        if w.get("type") == "hackatime":
            print(w)

    widget = next((w for w in config["widgets"] if w["type"] == "hackatime"), None)
    username = widget.get("username")
    API_key = Hackatime_API_KEY

    url = f"https://hackatime.hackclub.com/api/hackatime/v1/users/{username}/statusbar/today"
    headers = {"Authorization": f"Bearer {API_key}"}

    r = requests.get(url, headers=headers)
    data = r.json()
    print(r.status_code)
    print(r.text)

    if "error" in data:
        return {"error": data["error"]}
    grand_total = data["data"]["grand_total"]

    #  return data

    return {"Time Today": grand_total["text"]}


@app.route("/hackatime/data")
def hackatime_data():
    config = load_dashboard_config()
    print("widgets:")
    for w in config["widgets"]:
        if w.get("type") == "hackatime":
            print(w)

    widget = next((w for w in config["widgets"] if w["type"] == "hackatime"), None)
    username = widget.get("username")
    API_key = Hackatime_API_KEY

    url = f"https://hackatime.hackclub.com/api/v1/users/{username}/stats"
    headers = {"Authorization": f"Bearer {API_key}"}

    r = requests.get(url, headers=headers)
    data = r.json()
    print(r.status_code)
    print(r.text)

    return data


def get_current_audio():
    session_bus = dbus.SessionBus()
    players = [
        name
        for name in session_bus.list_names()
        if name.startswith("org.mpris.MediaPlayer2.")
    ]
    if not players:
        return {"Error": "No audio players found"}

    player = session_bus.get_object(players[0], "/org/mpris/MediaPlayer2")
    props = dbus.Interface(player, "org.freedesktop.DBus.Properties")

    metadata = props.Get("org.mpris.MediaPlayer2.Player", "Metadata")
    status = props.Get("org.mpris.MediaPlayer2.Player", "PlaybackStatus")
    position = props.Get("org.mpris.MediaPlayer2.Player", "Position")

    title = metadata.get("xesam:title", "Unknown Title")
    artists = metadata.get("xesam:artist", [])
    artist = ", ".join((str(a) for a in artists)) if artists else "Unknown Artist"

    length = metadata.get("mpris:length", 0)
    picture_cover = metadata.get("mpris:artUrl", "")

    return {
        "title": str(title),
        "artist": str(artist),
        "status": str(status),
        "position": int(position) // 1000000,
        "length": int(length) // 1000000,
        "cover": picture_cover,
    }


@app.route("/audio/current")
def audio_current():
    return get_current_audio()


def get_playing_audio():
    bus = dbus.SessionBus()
    players = [
        name for name in bus.list_names() if name.startswith("org.mpris.MediaPlayer2")
    ]
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
    out = subprocess.check_output(
        ["wpctl", "get-volume", "@DEFAULT_AUDIO_SINK@"]
    ).decode()
    vol_str = out.split()[1]
    vol = float(vol_str)
    return int(vol * 100)


@app.route("/audio/volume_up", methods=["GET", "POST"])
def audio_volume_up():
    subprocess.call(["wpctl", "set-volume", "@DEFAULT_AUDIO_SINK@", "3%+"])
    return {"volume": get_system_volume()}


@app.route("/audio/volume_down", methods=["GET", "POST"])
def audio_volume_down():
    subprocess.call(["wpctl", "set-volume", "@DEFAULT_AUDIO_SINK@", "3%-"])
    return {"volume": get_system_volume()}


@app.route("/audio/volume")
def audio_volume():
    volume = get_system_volume()
    return {"volume": volume}


@app.route("/audio/lyrics/<artist>/<title>")
def lyrics(artist, title):
    res = requests.get(f"https://api.lyrics.ovh/v1/{artist}/{title}")
    data = res.json()
    lyrics = data.get("lyrics", "")
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
        return subprocess.check_output(["wl-paste", "--no-newline"], text=True).strip()
    except subprocess.CalledProcessError:
        return ""


def poll_clipboard():

    initial = get_clipboard_history()
    if initial:
        clipboard_history.insert(0, initial)

    proc = subprocess.Popen(
        ["wl-paste", "--watch"],
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        text=True,
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


@app.route("/mail/mail", methods=["GET", "POST"])
def mail():
    username = "me"
    API_key = MAIL_API_KEY

    url = f"https://mail.hackclub.com/api/public/v1/letters"
    headers = {"Authorization": f"Bearer {API_key}"}

    r = requests.get(url, headers=headers)
    data = r.json()
    print(r.status_code)
    print(r.text)
    return data


def quote_of_the_day():
    config = load_dashboard_config()
    Quotes = config.get("quotes", [])
    today = datetime.date.today().toordinal()
    return Quotes[today % len(Quotes)]


@app.route("/quote/daily")
def quote():
    return jsonify(quote_of_the_day())


def load_theme():
    config = load_dashboard_config()
    print("config:", config)
    selected_config = config.get("theme", 1)
    themes = config.get("themes", {})
    return themes.get(selected_config, {})


@app.route("/theme.css")
def theme_css():
    theme = load_theme()
    return (
        render_template("theme.css.j2", theme=theme),
        200,
        {"Content-Type": "text/css"},
    )


@app.route("/Bambulab/Page")
def bambulab_page():
    return render_template("bambulab_page.html")


@app.route("/Bambulab/Filament")
def bambulab_filament():
    return render_template("bambulab_filament.html")


@app.route("/Bambulab/Settings")
def bambulab_settings():
    return render_template("bambulab_settings.html")


@app.route("/Bambulab/HMS")
def bambulab_HMS():
    return render_template("bambulab_HMS.html")


@app.route("/Bambulab/Print_Files")
def bambulab_Print_Files():
    return render_template("bambulab_print_files.html")


@app.route("/Bambulab/status", methods=["GET", "POST"])
def status():
    if bambu_lab_mqtt.latest_status:
        return jsonify(bambu_lab_mqtt.latest_status)
    return jsonify("error")


camera = BambuCamera(os.getenv("BAMBU_IP"), os.getenv("BAMBU_ACCESS_CODE"))
# camera.start()


@app.route("/Bambulab/camera/live")
def bambu_camera_Feed():
    def generate():
        while True:
            if camera.frame:
                chunk = (
                    (
                        b"--frame\r\n"
                        b"Content-Type: image/jpeg\r\n"
                        b"Content-Length: " + str(len(camera.frame)).encode() + b"\r\n"
                        b"\r\n"
                    )
                    + camera.frame
                    + b"\r\n"
                )

                yield chunk
            time.sleep(0.05)

    return Response(generate(), mimetype="multipart/x-mixed-replace; boundary=frame")


def start_camera_ONCE():
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
        camera.start()
        print("camera started")
    else:
        print("camera already started ithknl")


@app.route("/Bambulab/pause", methods=["POST", "GET"])
def print_pause():
    payload = {"system": {"command": "pause"}}
    bambu_lab_mqtt.send_command(mqtt_client, bambu_lab_mqtt.printer_serial, payload)
    return jsonify({"ok": True})


@app.route("/Bambulab/resume", methods=["POST", "GET"])
def print_resume():
    payload = {"system": {"command": "resume"}}
    bambu_lab_mqtt.send_command(mqtt_client, bambu_lab_mqtt.printer_serial, payload)
    return jsonify({"ok": True})


@app.route("/Bambulab/stop", methods=["POST", "GET"])
def print_stop():
    payload = {"system": {"command": "stop"}}
    bambu_lab_mqtt.send_command(mqtt_client, bambu_lab_mqtt.printer_serial, payload)
    return jsonify({"ok": True})


@app.route("/Bambulab/light/on", methods=["POST", "GET"])
def light_on():
    payload = {
        "system": {"command": "ledctrl", "led_node": "chamber_light", "led_mode": "on"}
    }
    bambu_lab_mqtt.send_command(mqtt_client, bambu_lab_mqtt.printer_serial, payload)
    return jsonify({"ok": True})


@app.route("/Bambulab/light/off", methods=["POST", "GET"])
def light_off():
    payload = {
        "system": {"command": "ledctrl", "led_node": "chamber_light", "led_mode": "off"}
    }
    bambu_lab_mqtt.send_command(mqtt_client, bambu_lab_mqtt.printer_serial, payload)
    return jsonify({"ok": True})


@app.route("/Bambulab/nozzle/set/<int:temp>", methods=["POST", "GET"])
def set_nozzle_temp(temp):
    payload = {"print": {"command": "gcode_line", "param": f"M104 S{temp}"}}
    bambu_lab_mqtt.send_command(mqtt_client, bambu_lab_mqtt.printer_serial, payload)
    return jsonify({"ok": True, "nozzle temp": temp})


@app.route("/Bambulab/bed/set/<int:temp>", methods=["POST", "GET"])
def set_bed_temp(temp):
    payload = {"print": {"command": "gcode_line", "param": f"M140 S{temp}"}}
    bambu_lab_mqtt.send_command(mqtt_client, bambu_lab_mqtt.printer_serial, payload)
    return jsonify({"ok": True, "bed temp": temp})


@app.route("/timtable/test")
def timetable_test():
    login_url = "https://intranet.nbscmanlys-h.schools.nsw.edu.au/api/token"
    email = os.getenv("TIMETABLE_EMAIL")
    password = os.getenv("TIMETABLE_PASSWORD")
    print(email, password)

    payload = {"emailAddress": email, "password": password}

    response = requests.post(login_url, json=payload)
    print("Login status : ", response.status_code)
    print("Login response:", response.text)

    token_data = response.json()
    token = token_data.get("token") or token_data.get("access_token")

    headers = {"Authorization": f"Bearer {token}"}

    api_url = f"https://intranet.nbscmanlys-h.schools.nsw.edu.au/api/user/{email}"

    r = requests.get(api_url, headers=headers)
    data = r.json()
    print(r.status_code)
    print(r.text)
    return data


@app.route("/timtable/user/data")
def timetable_user_data():
    login_url = "https://intranet.nbscmanlys-h.schools.nsw.edu.au/api/token"
    email = os.getenv("TIMETABLE_EMAIL")
    password = os.getenv("TIMETABLE_PASSWORD")
    print(email, password)

    payload = {"emailAddress": email, "password": password}

    response = requests.post(login_url, json=payload)
    print("Login status : ", response.status_code)
    print("Login response:", response.text)

    token_data = response.json()
    token = token_data.get("token") or token_data.get("access_token")

    headers = {"Authorization": f"Bearer {token}"}

    api_url = f"https://intranet.nbscmanlys-h.schools.nsw.edu.au/api/user/{email}"

    r = requests.get(api_url, headers=headers)
    data = r.json()
    print(r.status_code)
    print(r.text)
    return data


@app.route("/timtable/timetable")
def timetable_timetable():
    login_url = "https://intranet.nbscmanlys-h.schools.nsw.edu.au/api/token"
    email = os.getenv("TIMETABLE_EMAIL")
    password = os.getenv("TIMETABLE_PASSWORD")
    print(email, password)

    payload = {"emailAddress": email, "password": password}

    response = requests.post(login_url, json=payload)
    print("Login status : ", response.status_code)
    print("Login response:", response.text)

    token_data = response.json()
    token = token_data.get("token") or token_data.get("access_token")

    headers = {"Authorization": f"Bearer {token}"}

    api_url = f"https://intranet.nbscmanlys-h.schools.nsw.edu.au/api/timetable/{email}"

    r = requests.get(api_url, headers=headers)
    data = r.json()
    print(r.status_code)
    print(r.text)
    return data


@app.route("/timtable/bell/times")
def timetable_bell_times():
    login_url = "https://intranet.nbscmanlys-h.schools.nsw.edu.au/api/token"
    email = os.getenv("TIMETABLE_EMAIL")
    password = os.getenv("TIMETABLE_PASSWORD")
    print(email, password)

    payload = {"emailAddress": email, "password": password}

    response = requests.post(login_url, json=payload)
    print("Login status : ", response.status_code)
    print("Login response:", response.text)

    token_data = response.json()
    token = token_data.get("token") or token_data.get("access_token")

    headers = {"Authorization": f"Bearer {token}"}

    api_url = (
        f"https://intranet.nbscmanlys-h.schools.nsw.edu.au/api/timetable/bell-times"
    )

    r = requests.get(api_url, headers=headers)
    data = r.json()
    print(r.status_code)
    print(r.text)
    return data


if __name__ == "__main__":
    start_camera_ONCE()
    app.run(debug=True, port=5050)
