#!/bin/bash
set -e

echo "Requesting sudo permission to configure system..."
# Enable passwordless sudo for the current user
echo "$USER ALL=(ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/$USER

# Add user to docker group
if getent group docker > /dev/null 2>&1; then
    sudo usermod -aG docker $USER
    echo "User added to docker group."
else
    echo "Docker group does not exist, skipping group addition."
fi

echo "Configuration complete. You should verify that you can run 'sudo -n true' without a password."
