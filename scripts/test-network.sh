#!/bin/bash

echo "🔍 Saudapakka Network Diagnostics"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if containers are running
echo -e "\n${YELLOW}[1/7] Checking Docker Containers...${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep saudapakka
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Containers are running${NC}"
else
    echo -e "${RED}❌ Containers not running. Run: docker-compose up -d${NC}"
    # Don't exit, try to get more info
fi

# Test 2: Test backend directly
echo -e "\n${YELLOW}[2/7] Testing Backend Direct Access...${NC}"
# Use localhost:8005 because that's what is mapped in docker-compose.dev.yml (8005:8000)
BACKEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8005/api/health/)
# If health endpoint doesn't exist, try /api/
if [ "$BACKEND_TEST" -ne 200 ]; then
    BACKEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8005/api/)
fi

if [ "$BACKEND_TEST" -eq 200 ] || [ "$BACKEND_TEST" -eq 404 ]; then
    echo -e "${GREEN}✅ Backend accessible on port 8005 (HTTP $BACKEND_TEST)${NC}"
else
    echo -e "${RED}❌ Backend not accessible on port 8005 (HTTP $BACKEND_TEST)${NC}"
    echo "   Try: docker logs saudapakka_backend"
fi

# Test 3: Test Nginx
echo -e "\n${YELLOW}[3/7] Testing Nginx Proxy...${NC}"
NGINX_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80/)
if [ "$NGINX_TEST" -eq 200 ]; then
    echo -e "${GREEN}✅ Nginx accessible on port 80${NC}"
else
    echo -e "${RED}❌ Nginx not accessible (HTTP $NGINX_TEST)${NC}"
    echo "   Try: docker logs saudapakka_nginx"
fi

# Test 4: Test API through Nginx
echo -e "\n${YELLOW}[4/7] Testing API through Nginx...${NC}"
API_NGINX_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/)
if [ "$API_NGINX_TEST" -eq 200 ] || [ "$API_NGINX_TEST" -eq 404 ]; then
    echo -e "${GREEN}✅ API accessible through Nginx (HTTP $API_NGINX_TEST)${NC}"
else
    echo -e "${RED}❌ API not accessible through Nginx (HTTP $API_NGINX_TEST)${NC}"
    echo "   Check nginx configuration"
fi

# Test 5: Test CORS
echo -e "\n${YELLOW}[5/7] Testing CORS Headers...${NC}"
# Use 8005 for direct backend test
CORS_TEST=$(curl -s -I http://localhost:8005/api/ -H "Origin: http://localhost:3010" | grep -i "access-control")
if [ ! -z "$CORS_TEST" ]; then
    echo -e "${GREEN}✅ CORS headers present${NC}"
    echo "$CORS_TEST"
else
    echo -e "${RED}❌ CORS headers missing${NC}"
    echo "   Check Django CORS settings"
fi

# Test 6: Test Frontend
echo -e "\n${YELLOW}[6/7] Testing Frontend...${NC}"
FRONTEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/)
if [ "$FRONTEND_TEST" -eq 200 ]; then
    echo -e "${GREEN}✅ Frontend accessible on port 3010${NC}"
else
    echo -e "${RED}❌ Frontend not accessible (HTTP $FRONTEND_TEST)${NC}"
    echo "   Try: docker logs saudapakka_frontend"
fi

# Test 7: Check Docker Network
echo -e "\n${YELLOW}[7/7] Checking Docker Network (default bridge checking)...${NC}"
# Since we didn't explicitly define a network in the provided docker-compose files, it uses the default one
docker network ls | grep saudapkaa_mediakit
if [ $? -eq 0 ]; then
     echo -e "${GREEN}✅ Project network exists${NC}"
else
     echo -e "${YELLOW}⚠️ Could not find specific project network, might be using default${NC}"
fi

# Summary
echo -e "\n${YELLOW}=================================="
echo "Summary & Next Steps"
echo "==================================${NC}"
echo ""
echo "Access URLs:"
echo "  Frontend: http://localhost:3010"
echo "  Backend:  http://localhost:8005/api/"
echo "  Nginx:    http://localhost/"
echo ""
