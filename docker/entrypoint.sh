#!/bin/bash

sudo chown ubuntu /home/ubuntu/.cache/yarn
sudo chown ubuntu /usr/local/lib/node_modules

exec tail -f /dev/null