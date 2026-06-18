import os
import sys
import socket

def print_qr_and_links(title, url):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
    
    print("\n" + "=" * 50)
    print(f" {title.upper()} ".center(50, "="))
    print(f"URL Link: {url}")
    print("=" * 50)
    print("Scan QR Code to open:")
    try:
        import qrcode
        qr = qrcode.QRCode(version=1, box_size=1, border=1)
        qr.add_data(url)
        qr.make(fit=True)
        qr.print_ascii(out=sys.stdout, invert=True)
    except Exception as e:
        print(f"[Notice] Could not print QR Code: {e}")
    print("=" * 50 + "\n")

if __name__ == '__main__':
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
    except Exception:
        local_ip = "127.0.0.1"
        
    local_app_url = f"http://{local_ip}:8000/index.html"
    print_qr_and_links("SmartCrop AI (Local Network View)", local_app_url)
