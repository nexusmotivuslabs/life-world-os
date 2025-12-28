#!/bin/bash
# Get Local IP Address
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    ipconfig getifaddr en0 || ipconfig getifaddr en1
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    hostname -I | awk '{print $1}'
else
    echo "Please run: ipconfig (Windows) or ifconfig (Unix)"
fi
