#!/bin/sh

# Download Reasources
reset
GH_TOKEN=$(printenv GH_TOKEN)
find src/assets ! -name 'README.md' -type f -exec rm -r {} +
find src/assets ! -name 'assets' -type d -exec rm -rf {} +
git clone https://RealKoolisw:"$GH_TOKEN"@github.com/RealKoolisw/KooliswServer-Assets.git .DownloadedAssets
mv -v .DownloadedAssets/Bot/* src/assets
rm -rf .DownloadedAssets

# Nodejs Startup
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
export NVM_DIR
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install node
# npm --silent run build
npm run killall
clear
echo " _  __         _ _           ___      _   
| |/ /___  ___| (_)____ __ _| _ ) ___| |_ 
| ' </ _ \/ _ \ | (_-< V  V / _ \/ _ \  _|
|_|\_\___/\___/_|_/__/\_/\_/|___/\___/\__|
"
CHECK=$(du -sm . | cut -f1)
echo "Application information:
Disk Storage: $CHECK MB
"
npm --slient run start