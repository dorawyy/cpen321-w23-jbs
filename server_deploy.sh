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