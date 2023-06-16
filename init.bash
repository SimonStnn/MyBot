#!/bin/bash

# # Set the desired working directory
# WORKING_DIR="`pwd`/src"

# # Change the working directory
# cd "$WORKING_DIR"

echo "Working directory: $(pwd)"

# Run TypeScript compiler with the specified tsconfig.json file
tsc --project `pwd`/tsconfig.json

# Run bot
node `pwd`/build/index.js