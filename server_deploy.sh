# absolute path to your private key pem file
PRIVATE_KEY="~/.ssh/EduMatchServer_arya.pem"
SERVER_PUBLIC_IP="20.151.90.36"
BACKEND_DIR="backend/*"

rm -rf backend/node_modules
echo "move files"
echo "scp -i $PRIVATE_KEY -r $BACKEND_DIR azureuser@${SERVER_PUBLIC_IP}:backend/"
scp -i $PRIVATE_KEY -r $BACKEND_DIR azureuser@${SERVER_PUBLIC_IP}:backend/

# recover node_modules
pushd backend/
npm install

# Restart the server
echo "Killing the current server"
ssh -i $PRIVATE_KEY azureuser@${SERVER_PUBLIC_IP} "sudo lsof -t -i:443 | sudo xargs kill -9"
echo "Starting a new server"
ssh -i $PRIVATE_KEY azureuser@${SERVER_PUBLIC_IP} "sudo ENV=prod nohup /home/azureuser/.nvm/versions/node/v20.8.0/bin/node backend/server.js > backend/output.log 2>&1 &" &
ssh -i $PRIVATE_KEY azureuser@${SERVER_PUBLIC_IP} "sudo cat backend/output.log"