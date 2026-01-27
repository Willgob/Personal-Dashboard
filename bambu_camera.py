import ssl
import socket
import struct
import threading
import time

class BambuCamera:
    def __init__(self, ip,lan_code):
        self.ip = ip
        self.lan_code = lan_code
        self.frame = None
        self.running = False
    
    def create_auth( self ):
        packet = bytearray(80)
        struct.pack_into("<I", packet, 0, 0x40)
        struct.pack_into("<I", packet, 4, 0x3000)

        packet[16:16+len(b"bblp")] = b"bblp"
        packet[48:48+len(self.lan_code.encode())] = self.lan_code.encode()
        return bytes(packet)

    def start(self):
        if self.running:
            return
        self.running = True
        threading.Thread(target=self._run, daemon=True).start()

    def _run(self):
        while self.running:
            try:

                print("camera started")

                ctx = ssl.create_default_context()
                ctx.check_hostname = False
                ctx.verify_mode = ssl.CERT_NONE

                sock = socket.create_connection((self.ip, 6000), timeout=10)
                tls = ctx.wrap_socket(sock,server_hostname=self.ip)
                tls.sendall(self.create_auth())

                header = b""
                while self.running:
                    while len(header) < 16:
                        chunk = tls.recv(16 - len(header))
                        if not chunk:
                            raise ConnectionError("Camera not connected/Disconnected")
                        header += chunk
                    
                    payload_size = struct.unpack_from("<I", header, 0)[0]
                    header = b""
                    if payload_size <= 0 or payload_size > 10 * 1024 *1024:
                        continue

                    img = b""
                    while len(img) < payload_size:
                        chunk = tls.recv(payload_size - len(img))
                        if not chunk:
                            raise ConnectionError("Camer disconnected")
                        img += chunk
                    
                    if img.startswith(b"/xFF/xD8") and img.endswith(b"/xFF/xD9"):
                        self.frame = img

            except Exception as e:
                print("Camer error", e)
                time.sleep(1)            
        