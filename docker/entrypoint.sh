#!/bin/bash

sudo chown ubuntu /home/ubuntu/.cache/yarn
sudo chown ubuntu /usr/local/lib/node_modules

if ! [ "$SERVER_MODE" = "" ]; then
  exec node /home/ubuntu/halumi/demo/server.js
else
  exec tail -f /dev/null
fi