import time
from bambu_connect import BambuClient

client = BambuClient("192.168.68.62", "15946490", "01P00C490400556")

while True:
    try:
        info = client.dump_info()
        print("\n=== POLLED STATUS ===")
        print(info)
    except Exception as e:
        print("Failed:", e)

    time.sleep(5)
