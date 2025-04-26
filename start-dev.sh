#!/bin/bash

# Function to check if a port is in use
check_port() {
    lsof -i :$1 >/dev/null 2>&1
    return $?
}

# Kill any processes running on port 3000
echo "Killing processes on port 3000..."
if check_port 3000; then
    echo "Killing process on port 3000..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi

# Wait and verify port is free
echo "Verifying port is free..."
if check_port 3000; then
    echo "ERROR: Port 3000 is still in use. Please manually kill the process using:"
    echo "lsof -i :3000"
    exit 1
fi

# Start frontend
echo "Starting frontend server on port 3000..."
npm start 