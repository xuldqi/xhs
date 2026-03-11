#!/bin/bash

# GitHub Hosts Acceleration Script
# Updates /etc/hosts with fast IP addresses for GitHub services.
# Source: https://github.com/521xueweihan/GitHub520

URL="https://raw.hellogithub.com/hosts"
HOSTS_FILE="/etc/hosts"
START_MARK="# GitHub520 Host Start"
END_MARK="# GitHub520 Host End"

if [ "$(id -u)" != "0" ]; then
   echo "❌ This script must be run as root (sudo)." 1>&2
   exit 1
fi

echo "🚀 Fetching latest GitHub hosts..."
CONTENT=$(curl -s "$URL")

if [ -z "$CONTENT" ]; then
    echo "❌ Failed to fetch hosts. Check your internet connection."
    exit 1
fi

echo "📦 Backing up existing hosts file..."
cp "$HOSTS_FILE" "${HOSTS_FILE}.bak"

# Remove old block
sed -i "/$START_MARK/,/$END_MARK/d" "$HOSTS_FILE"

# Add new block
echo "" >> "$HOSTS_FILE"
echo "$START_MARK" >> "$HOSTS_FILE"
echo "$CONTENT" >> "$HOSTS_FILE"
echo "$END_MARK" >> "$HOSTS_FILE"

echo "✅ GitHub hosts updated successfully!"
echo "🔄 Refreshing DNS cache..."

if command -v systemd-resolve &> /dev/null; then
    systemd-resolve --flush-caches
elif command -v resolvectl &> /dev/null; then
    resolvectl flush-caches
elif [ -f /etc/init.d/nscd ]; then
    /etc/init.d/nscd restart
fi

echo "🎉 Done! Try 'git pull' or 'git push' now."
