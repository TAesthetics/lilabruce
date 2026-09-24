#!/data/data/com.termux/files/usr/bin/bash
# Run on your phone, inside Termux, against a host you are allowed to test.
# pkg install -y nmap dnsutils curl openssl
set -eu
HOST="${1:-}"
if [ -z "$HOST" ]; then
  echo "usage: bash termux-wire.sh <host>"
  exit 1
fi
echo "# TEMPLE lab — $HOST"
echo "## DNS"
getent hosts "$HOST" || true
echo "## TCP (top ports, connect scan)"
if command -v nmap >/dev/null 2>&1; then
  nmap -Pn -T4 --top-ports 50 --open "$HOST"
else
  echo "nmap is not installed. pkg install nmap"
fi
echo "## HTTP"
curl -sI --max-time 8 "https://$HOST/" || curl -sI --max-time 8 "http://$HOST/" || true
echo "## TLS"
echo | openssl s_client -connect "$HOST:443" -servername "$HOST" 2>/dev/null | openssl x509 -noout -subject -issuer -dates || true
