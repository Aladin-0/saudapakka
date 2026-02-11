#!/bin/bash
echo "=== NEXT.JS MOBILE TESTING DIAGNOSTIC REPORT ==="
echo "Date: $(date)"
echo "OS: $(uname -a)"
echo "Next.js Version: $(grep '"next":' saudapakka_frontend/package.json | cut -d '"' -f 4)"

echo ""
echo "--- Network Information ---"
# Get local IP (try hostname -I first, then ip addr)
LOCAL_IP=$(hostname -I | awk '{print $1}')
echo "Computer IP: $LOCAL_IP"

echo ""
echo "--- Server Configuration (Inside Docker) ---"
# Check dev script
DEV_SCRIPT=$(grep '"dev":' saudapakka_frontend/package.json)
echo "Dev Command in package.json: $DEV_SCRIPT"

# Check listening ports
echo "--- Ports (3000, 8000, 80) ---"
if command -v netstat >/dev/null 2>&1; then
    netstat -tuln | grep -E '3000|8000|:80 '
elif command -v ss >/dev/null 2>&1; then
    ss -tuln | grep -E '3000|8000|:80 '
else
    echo "Netstat/ss not available"
fi

echo ""
echo "--- Firewall Status ---"
if command -v ufw >/dev/null 2>&1; then
    if sudo ufw status | grep -q "Status: active"; then
         sudo ufw status | grep 3000 || echo "Port 3000 not explicitly allowed in UFW"
    else
        echo "UFW is inactive"
    fi
else
    echo "UFW not installed/found"
fi

echo ""
echo "--- Docker Containers ---"
sudo docker compose ps

echo ""
echo "--- Curl Tests ---"
echo "Testing Localhost:3000 (Host)..."
curl -I http://localhost:3000 --connect-timeout 2 || echo "Failed (Expected if running in Docker without host networking)"

echo "Testing Local IP ($LOCAL_IP:3000)..."
curl -I http://$LOCAL_IP:3000 --connect-timeout 2 || echo "Failed/Timed out"

echo "Testing Nginx Port 80..."
curl -I http://localhost:80 --connect-timeout 2 || echo "Failed"

echo ""
echo "--- Access URL ---"
echo "Tunnel: https://29edb7c217896c6f-152-56-0-77.serveousercontent.com"
echo "Local IP (Only on same WiFi): http://$LOCAL_IP:3000"
