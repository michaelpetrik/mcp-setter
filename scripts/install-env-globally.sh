#!/bin/bash
# Install MCP environment variables globally by adding them to shell profile
# This makes them available to Claude Desktop and other applications

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: .env file not found at $ENV_FILE"
    echo "Please create it from .env.example"
    exit 1
fi

# Detect shell
SHELL_NAME=$(basename "$SHELL")
if [ "$SHELL_NAME" = "zsh" ]; then
    PROFILE_FILE="$HOME/.zshrc"
elif [ "$SHELL_NAME" = "bash" ]; then
    if [ -f "$HOME/.bash_profile" ]; then
        PROFILE_FILE="$HOME/.bash_profile"
    else
        PROFILE_FILE="$HOME/.bashrc"
    fi
else
    echo "Unknown shell: $SHELL_NAME"
    echo "Please manually add environment variables to your shell profile"
    exit 1
fi

echo "Detected shell: $SHELL_NAME"
echo "Profile file: $PROFILE_FILE"
echo ""

# Check if already added
if grep -q "# MCP Server Environment Variables" "$PROFILE_FILE" 2>/dev/null; then
    echo "⚠️  MCP environment variables already added to $PROFILE_FILE"
    echo "Please edit manually if you need to update them"
    exit 0
fi

# Add environment variables to profile
echo "Adding MCP environment variables to $PROFILE_FILE..."
echo "" >> "$PROFILE_FILE"
echo "# MCP Server Environment Variables" >> "$PROFILE_FILE"
echo "# Added by mcp-setter on $(date)" >> "$PROFILE_FILE"

# Read .env and add each variable
while IFS= read -r line; do
    # Skip empty lines and comments
    if [[ -z "$line" ]] || [[ "$line" =~ ^#.* ]]; then
        continue
    fi

    # Export the variable
    echo "export $line" >> "$PROFILE_FILE"
done < "$ENV_FILE"

echo "" >> "$PROFILE_FILE"

echo "✓ Environment variables added successfully to $PROFILE_FILE"
echo ""
echo "To apply changes immediately, run:"
echo "  source $PROFILE_FILE"
echo ""
echo "Or restart your terminal/Claude Desktop application"
