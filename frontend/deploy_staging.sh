./stop.sh
echo '## Updating code'
git pull

./setup.sh staging
./start.sh staging
