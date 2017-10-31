#!/bin/bash

BASE_DIR="/home/ubuntu/knp_dict"
CMD="/usr/local/bin/make_db"

LANG=C
gzip -dkq $BASE_DIR/*.gz
sort $BASE_DIR/*.dat $* | uniq | sudo $CMD /usr/local/share/knp/dict/auto/auto.db -append \|
for name in $(ls $BASE_DIR/*.gz); do
  rm ${name%%.gz}
done