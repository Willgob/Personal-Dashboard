import paho.mqtt.client as mqtt
import ssl
import json
import time, random, string
from dotenv import load_dotenv
import os

load_dotenv()


printer_ip = os.getenv("BAMBU_IP")
printer_serial = os.getenv("BAMBU_SERIAL")
printer_username = "bblp"
password = os.getenv("BAMBU_ACCESS_CODE")

latest_status = {}

def on_connect(client, userdata, flags, rc):
    print("MQTT Connected:", rc)
    if rc == 0:
        topic = f"device/{printer_serial}/report"
        client.subscribe(topic)
        print("subbed to: ", topic)
    else: 
        print("MQTT Connection failed: ",rc)




def on_message(client, userdata, msg):
    global latest_status
    try:
        payload = json.loads(msg.payload.decode() )

        for key, value in payload.items():
            if key not in latest_status:
                latest_status[key] = value
            else: 
                if isinstance(value, dict):
                    latest_status[key].update(value)
                else :
                    latest_status[key] = value

        print(json.dumps(latest_status, indent=2))
        print("message")
    except: pass

def request_full_data(client, serial):
    payload = {
        "pushing" : {
            "sequence_id" : "1",
            "command" : "pushall",
            "version" : 1,
            "push_target" : 1
        }
    }
    topic = f"device/{serial}/request"
    client.publish(topic, json.dumps(payload))
    print("requested full data")

def send_command(client, serial, payload):
    topic = f"device/{serial}/request"
    client.publish(topic, json.dumps(payload))
    print("Command sent: ", json.dumps(payload,indent=2))

def start_mqtt():

    client_id = "Personal_dashboard" + str(int(time.time()))
    client = mqtt.Client(client_id=client_id, clean_session=True)
    client.username_pw_set(printer_username, password)
    client.tls_set(cert_reqs=ssl.CERT_NONE)
    client.tls_insecure_set(True)

    client.on_connect = on_connect

    client.on_message =on_message
    client.connect(printer_ip, 8883, 60)
    client.loop_start()

    return client
