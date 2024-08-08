#!/usr/bin/env bash

# Find the process ID using port 5000
pid=$(lsof -ti :5000)

# Check if a process was found
if [ -n "$pid" ]; then
    echo "Process found on port 5000. PID: $pid"
    kill -9 $pid
    echo "Process killed."
else
    echo "No process found running on port 5000."
fi
