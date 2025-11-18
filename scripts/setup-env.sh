#!/bin/bash
# Setup MCP environment variables globally for Claude Desktop
# This script loads .env file and exports variables to the current shell

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: .env file not found at $ENV_FILE"
    echo "Please create it from .env.example"
    exit 1
fi

# Load environment variables from .env file
echo "Loading environment variables from $ENV_FILE"

# Export each variable
set -a
source "$ENV_FILE"
set +a

echo "✓ Environment variables loaded successfully"
echo ""
echo "The following variables are now available:"
echo "  - CONTEXT7_API_KEY"
echo "  - GITHUB_MCP_PAT"
echo "  - N8N_API_KEY"
echo "  - N8N_API_URL"
echo ""
echo "Note: These are only available in the current shell session."
echo "To make them permanent, add them to your shell profile:"
echo "  - For bash: ~/.bash_profile or ~/.bashrc"
echo "  - For zsh: ~/.zshrc"
