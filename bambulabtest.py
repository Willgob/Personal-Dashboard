import socket
import json
import base64

PRINTER_IP = "192.168.68.62"
PORT = 8883
PASSWORD = "16dade9c"

def connect():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((PRINTER_IP, PORT))
    return s

def send_packet(sock, data):
    payload = json.dumps(data).encode()
    length = len(payload).to_bytes(4, "big")
    sock.sendall(length + payload)

def receive_packet(sock):
    length = int.from_bytes(sock.recv(4), "big")
    data = sock.recv(length)
    return json.loads(data.decode())

sock = connect()

# Authenticate (same as PrintMate)
auth_packet = {
    "msg": {
        "cmd": "auth",
        "password": PASSWORD
    }
}

send_packet(sock, auth_packet)

print("Waiting for printer data...")

while True:
    packet = receive_packet(sock)
    print(json.dumps(packet, indent=2))
