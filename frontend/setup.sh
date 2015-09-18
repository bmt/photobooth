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
  echo '## Configuring nginx.'
  sudo mkdir -p /etc/nginx/ssl
  sudo cp host_config/nginx/photobooth-$env /etc/nginx/sites-available/photobooth-$env
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo rm -f /etc/nginx/sites-enabled/photobooth-*
  sudo ln -sf /etc/nginx/sites-available/photobooth-$env /etc/nginx/sites-enabled/

  echo '## Configuring mongodb.'
  sudo cp host_config/mongodb/mongodb.conf /etc/mongodb.conf

  echo '## Setting up logs directories.'
  mkdir -p logs
fi

echo '## Installing secrets.'
cd secrets
./setup.sh $env
cd -

if [[ $env != 'dev' ]]; then
  sudo service nginx restart
  sudo service mongodb restart

  echo '## Building javascript'
  grunt build

  echo "## To start the app:"
  echo "## $ ./start.sh $env to start the application."
else
  # Set the environment variables.
  echo "## To set environment variables:"
  echo "## $ source secrets/env/$env.sh"
  echo ""
  echo "## To start the app:"
  echo "## $ grunt"
fi
