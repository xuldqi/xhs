# Server GitHub Acceleration Guide

Since you are running a server in a region with restricted GitHub access (likely China), here are the best ways to speed up `git clone` and other GitHub operations.

## Option 1: Use a GitHub Mirror (Free & Easiest)
This method uses a proxy service to wrap GitHub URLs. It requires no VPN or extra software.

**Run this command on your server:**
```bash
git config --global url."https://mirror.ghproxy.com/https://github.com".insteadOf "https://github.com"
```

> [!WARNING]
> **Important for Uploading (Pushing)**
> Mirrors are read-only or unsafe for authentication. If you need to **push** code to GitHub, do NOT use this option, or disable it before pushing.
> Use **Option 2 (HTTP Proxy)** instead if you need to push code.

To undo:
```bash
git config --global --unset url."https://mirror.ghproxy.com/https://github.com".insteadOf
```

## Option 2: Configure HTTP Proxy (If you have a proxy/VPN)
If your server has a proxy running (e.g., at `127.0.0.1:7890`), configure Git to use it.

**Command:**
```bash
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890
```

To undo:
```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

## Option 3: Modify Hosts File (Occasionally effective)
Sometimes adding specific IP addresses to `/etc/hosts` can help, but IPs change frequently. We recommend Option 1 or 2.

---

### Script: Auto-Configure Proxies
I have created a script `scripts/accelerate-github.sh` for you. Upload and run it on your server.

## Option 3: Hosts Acceleration (VPN Alternative)
If you don't have a proxy, you can update your system's `/etc/hosts` file to point to faster GitHub IPs directly. This often solves DNS pollution issues.

**Run the provided script:**
`scripts/update-github-hosts.sh`

(Requires `sudo` privileges)
