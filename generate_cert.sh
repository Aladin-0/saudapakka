#!/bin/bash
set -e

DOMAIN="saudapakka.com"
CERT_DIR="./certbot/conf/live/$DOMAIN"

mkdir -p "$CERT_DIR"

if [ ! -f "$CERT_DIR/fullchain.pem" ]; then
    echo "Generating self-signed certificate for $DOMAIN..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$CERT_DIR/privkey.pem" \
        -out "$CERT_DIR/fullchain.pem" \
        -subj "/C=IN/ST=Maharastra/L=Pune/O=Saudapakka/CN=$DOMAIN"
    echo "Certificate generated at $CERT_DIR"
else
    echo "Certificate already exists for $DOMAIN"
fi
