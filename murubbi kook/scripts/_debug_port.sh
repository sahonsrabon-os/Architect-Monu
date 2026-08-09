#!/bin/bash
echo "--- uname ---"
uname -s
echo "--- netstat raw (filtered) ---"
netstat -ano | grep -E ":5000|:5001|:9999" | head -10
echo "--- port_pid 5000 test ---"
netstat -ano 2>/dev/null | awk -v p=":5000" '($1 ~ /TCP/) && ($2 ~ p"$") && ($4 == "LISTENING") { print $5; exit }'
echo "--- port_pid 9999 test ---"
netstat -ano 2>/dev/null | awk -v p=":9999" '($1 ~ /TCP/) && ($2 ~ p"$") && ($4 == "LISTENING") { print $5; exit }'