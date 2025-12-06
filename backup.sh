#!/bin/sh

### Load NVM (needed for cron)
export NVM_DIR="$HOME/.nvm"
# Load NVM if available
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

### Ensure a default Node version is active
# nvm use default is safest for cron
if command -v nvm >/dev/null 2>&1; then
    nvm use default >/dev/null 2>&1
fi

### Functions
get_node_version() {
    node_ver="$(node -v 2>/dev/null)" || {
        echo "Node not found" >&2
        return 1
    }
    printf "%s\n" "${node_ver#v}"
}

get_node_path() {
    command -v node
}

get_npm_path() {
    command -v npm
}

### Ensure pnpm exists using NVM's Node, not Windows Node
if ! command -v pnpm >/dev/null 2>&1; then
    echo "PNPM not found, installing..."
    npm install -g pnpm --silent
fi

PNPM="$(command -v pnpm)"

### Run backup with pnpm
"$PNPM" backup
