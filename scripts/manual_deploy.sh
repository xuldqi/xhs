#!/bin/bash
echo "Starting manual deployment..."

# 1. Define variables
SERVER_USER="novcat"
SERVER_IP="115.191.56.242"
LOCAL_NGINX="nginx.conf"
REMOTE_NGINX="nginx.conf.upload"

echo "Please enter the SSH password when prompted."

# 2. Upload nginx.conf to the server
echo "Uploading nginx.conf..."
scp -o StrictHostKeyChecking=no $LOCAL_NGINX $SERVER_USER@$SERVER_IP:~/$REMOTE_NGINX

if [ $? -ne 0 ]; then
    echo "Upload failed! Please check your connection or password."
    exit 1
fi

# 3. Apply changes on the server
echo "Applying changes on server..."
ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << EOF
    # Find the container ID (assuming name contains 'xiaohongshu' or we list recent nginx containers)
    # Using 'docker ps' to look for the container.
    CONTAINER_ID=\$(docker ps | grep -i 'xiaohongshu' | awk '{print \$1}' | head -n 1)
    
    # If not found by name, try finding by image name from Dockerfile (usually built via dokploy it might have random name)
    # Try looking for a container running nginx
    if [ -z "\$CONTAINER_ID" ]; then
        CONTAINER_ID=\$(docker ps | grep -i 'nginx' | awk '{print \$1}' | head -n 1)
    fi

    if [ -z "\$CONTAINER_ID" ]; then
        echo "Error: Could not find the running application container."
        exit 1
    fi

    echo "Found container: \$CONTAINER_ID"

    # Copy the config into the container (requires sudo or docker group permissions)
    # Assuming novcat is in docker group or we need sudo? 
    # User said root pwd available but novcat user. Let's try direct docker command first.
    
    echo "Updating Nginx config in container..."
    docker cp ~/$REMOTE_NGINX \$CONTAINER_ID:/etc/nginx/conf.d/default.conf
    
    echo "Reloading Nginx..."
    docker exec \$CONTAINER_ID nginx -s reload
    
    echo "Done! Verifying domains..."
    docker exec \$CONTAINER_ID nginx -T | grep server_name
EOF

echo "Deployment script finished."
