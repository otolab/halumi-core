#!/bin/bash

sudo chown ubuntu /home/ubuntu/.cache/yarn
sudo chown ubuntu /usr/local/lib/node_modules
sudo chown ubuntu /usr/local/share/knp
sudo chown ubuntu /usr/local/share/jumanpp

/home/ubuntu/init_dicts.sh

cd /home/ubuntu/halumi


if ! [ "$SERVER_MODE" = "" ]; then
  exec node /home/ubuntu/halumi/demo/server.js
else
  # exec tail -f /dev/null
  exec /bin/bash
fi