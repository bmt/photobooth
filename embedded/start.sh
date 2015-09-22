#!/bin/bash
if [[ $1 == 'staging' ]]; then
  source ./secrets/env/staging.sh
elif [[ $1 == 'prod' ]]; then
  source ./secrets/env/prod.sh
elif [[ $1 == 'dev' ]]; then
  source ./secrets/env/prod.sh
else
  echo "You must specify one of [dev, staging, prod]."
  exit 1
fi

if [[ $1 != 'dev' ]]; then
  ./node_modules/.bin/forever start -a -l forever.main.log -o logs/main.out.log -e logs/main.err.log main.js
else
  node main.js
fi

