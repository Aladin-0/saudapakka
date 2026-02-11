#!/bin/bash
echo "Starting Saudapakka in Development Mode..."
./generate_cert.sh
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
