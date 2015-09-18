#!/bin/bash
if [[ $1 == 'staging' ]]; then
  source ./secrets/env/staging.sh
elif [[ $1 == 'prod' ]]; then
  source ./secrets/env/prod.sh
else
  echo "You must specify one of [staging, prod]."
  exit 1
fi

./node_modules/.bin/forever start -a -l forever.server.log -o logs/server.out.log -e logs/server.err.log server.js
