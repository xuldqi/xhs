#!/bin/bash

echo "🚀 GitHub Acceleration Configuration"
echo "=================================="
echo "1. Use HTTP Proxy (e.g., if you have a VPN/Proxy running)"
echo "2. Use GitHub Mirror (No VPN required, uses ghproxy.com)"
echo "3. Clear all GitHub proxy settings"
echo "4. Exit"
echo ""
read -p "Select an option (1-4): " option

case $option in
    1)
        read -p "Enter proxy address (e.g., http://127.0.0.1:7890): " proxy_url
        if [ -z "$proxy_url" ]; then
            echo "❌ Proxy URL cannot be empty."
            exit 1
        fi
        git config --global http.proxy "$proxy_url"
        git config --global https.proxy "$proxy_url"
        echo "✅ Git proxy set to $proxy_url"
        ;;
    2)
        git config --global url."https://mirror.ghproxy.com/https://github.com".insteadOf "https://github.com"
        echo "✅ Git mirror set to ghproxy.com"
        ;;
    3)
        git config --global --unset http.proxy
        git config --global --unset https.proxy
        git config --global --unset url."https://mirror.ghproxy.com/https://github.com".insteadOf
        echo "✅ All GitHub proxy settings cleared."
        ;;
    4)
        exit 0
        ;;
    *)
        echo "❌ Invalid option."
        exit 1
        ;;
esac

# Verify
echo ""
echo "Current Git Config:"
git config --global --list | grep "url\|proxy"
