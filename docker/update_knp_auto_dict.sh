#!/bin/bash

BASE_DIR="/home/ubuntu/knp-4.18/dict/auto"
CMD="/usr/local/bin/make_db"

cd /home/ubuntu
if [ ! -d knp-4.18 ]; then
  tar -jxf knp-dict.tar.bz2
fi

LANG=C
sudo rm -v /usr/local/share/knp/dict/auto/auto.db
sort $BASE_DIR/*.dat $* | uniq | sudo $CMD /usr/local/share/knp/dict/auto/auto.db -append \|

