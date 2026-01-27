import paho.mqtt.client as mqtt
import ssl
import json
import time, random, string

printer_ip = "<IP HERE>"
serial = "bblp"
lan_code = "<LAN CODE HERE>"

client_id = "pdash_" + str(int(time.time()))

def on_connect(client, userdata, flags, rc):
    print("Connect returned code:", rc)
    if rc == 0:
        print("Connected successfully")
        client.subscribe(f"device/{serial}/report")
    elif rc == 5:
        print("❌ Not authorized — wrong LAN code")
    else:
        print("❌ Connection failed:", rc)

def on_message(client, userdata, msg):
    print(msg.topic, msg.payload)

client = mqtt.Client(client_id=client_id, clean_session=True)
client.username_pw_set(serial, lan_code)
client.tls_set(cert_reqs=ssl.CERT_NONE)
client.tls_insecure_set(True)

client.on_connect = on_connect
client.on_message = on_message

print("Connecting...")
client.connect(printer_ip, 8883, 60)
client.loop_forever()
