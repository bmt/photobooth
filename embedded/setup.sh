#!/bin/bash
env=$1
if [[ $env != 'staging' && $env != 'prod' && $env != 'dev' ]]; then
  echo 'You must specify one of [staging, prod, dev]'
  exit 1
fi

if [[ -e secrets ]]; then
  echo '## Updating secrets.'
  cd secrets
  git pull
  cd -
else
  echo '## Checking out secrets.'
  git clone https://github.com/bmt/photobooth-secrets.git secrets
fi

echo '## Installing packages'
npm install

if [[ $env != 'dev' ]]; then
  echo '## Setting up logs directories.'
  mkdir -p logs
fi

echo "## To start the app:"
echo "## $ ./start.sh $env to start the application."
