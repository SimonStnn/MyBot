#!/bin/bash

# Fetch the latest changes from the git repository
git fetch

# Pull the latest version before running
git pull

# Run TypeScript compiler with the specified tsconfig.json file
tsc --project `pwd`/tsconfig.json

# Run bot
node `pwd`/build/index.js
