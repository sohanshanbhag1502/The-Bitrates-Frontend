#!/bin/sh

env | grep VITE_APP_ | awk '{ print length, $0 }' | sort -rn | cut -d" " -f2- | while read -r line ; do
    
    key=$(echo "$line" | cut -d '=' -f 1)
    value=$(echo "$line" | cut -d '=' -f 2- | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
    
    if [ -n "$value" ]; then
        find /usr/share/nginx/html -type f -name '*.js' \
            -exec sed -i "s|${key}|${value}|g" '{}' +
    fi
done

echo "Starting Nginx..."
exec "$@"