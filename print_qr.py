import os
import sys
import socket

def print_qr_and_links(title, url):
    # Try to reconfigure stdout to support UTF-8 on Windows
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
    
    print("\n" + "=" * 60)
    print(f" {title.upper()} ".center(60, "="))
    print(f"URL Link: {url}")
    print("=" * 60)
    
    try:
        import qrcode
        qr = qrcode.QRCode(version=1, box_size=1, border=2)
        qr.add_data(url)
        qr.make(fit=True)
        matrix = qr.get_matrix()
        
        print("Scan QR Code with your phone camera:")
        
        # Try Method 1: Unicode blocks (looks premium)
        try:
            for row in matrix:
                # True = black module (draw space on dark terminal), False = white (draw block)
                line = "".join("  " if cell else "██" for cell in row)
                print(line)
            print("=" * 60 + "\n")
            return
        except Exception:
            # If stdout fails to print Unicode, fall back to pure ASCII method
            pass
            
        # Method 2: Pure ASCII fallback (uses ## and spaces, works in any terminal)
        print("\n[Notice] Console doesn't support Unicode blocks. Showing ASCII fallback:")
        for row in matrix:
            line = "".join("  " if cell else "##" for cell in row)
            print(line)
        print("=" * 60 + "\n")
        
    except Exception as e:
        print(f"[Notice] Could not print QR Code: {e}")
    print("=" * 60 + "\n")

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
