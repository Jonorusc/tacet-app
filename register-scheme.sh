#!/bin/bash

# Define variables
SCHEME="tacet"
DESKTOP_FILE="$HOME/.local/share/applications/tacet-dev.desktop"
EXEC_PATH="$(pwd)/src-tauri/target/debug/app" 

# Context: We need to point to the actual debug binary, typically found in src-tauri/target/debug/app
# However, 'npm run tauri dev' runs the binary directly. 
# For deep linking to work in dev, we often need to manualy trigger the binary with the url.
# OR we register a desktop file that points to a wrapper or the simple binary.

echo "Creating desktop entry for $SCHEME..."

# Ensure applications directory exists
mkdir -p "$HOME/.local/share/applications"

# Check for xdg-mime
if ! command -v xdg-mime &> /dev/null; then
    echo "Error: xdg-mime is required but not installed."
    echo "Please run: sudo apt install xdg-utils"
    exit 1
fi

# Ensure the executable exists
if [ ! -f "$EXEC_PATH" ]; then
    echo "Error: Debug binary not found at $EXEC_PATH"
    echo "Please ensure 'npm run tauri dev' is running or has compiled the app."
    exit 1
fi

# Create .desktop file
cat > "$DESKTOP_FILE" <<EOF
[Desktop Entry]
Type=Application
Name=Tacet (Dev)
Exec=$EXEC_PATH %u
StartupNotify=true
Terminal=false
MimeType=x-scheme-handler/$SCHEME;
EOF

# Update MIME database
echo "Registering MIME type..."
xdg-mime default tacet-dev.desktop x-scheme-handler/$SCHEME

echo "Done! Deep link registered."
echo "You can test it with: xdg-open 'tacet://test'"
