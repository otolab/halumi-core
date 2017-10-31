#!/bin/bash

sudo chown ubuntu /home/ubuntu/.cache/yarn
sudo chown ubuntu /usr/local/lib/node_modules
sudo chown ubuntu /usr/local/share/knp
sudo chown ubuntu /usr/local/share/jumanpp


if [ ! -f /usr/local/share/knp/dict/dic.bin ]; then
  echo 'jumanpp辞書を構築します...'
  cd /home/ubuntu
  mkdir jumanpp-dict
  cd jumanpp-dict
  tar -jxvf ../jumanpp-dict.tar.bz2
  cd dict-build
  make
  mv jumanpp_dic/* ../jumanpp-resource
  cd ..
  echo "" | jumanpp -D jumanpp-resource
  sudo mkdir -p /usr/local/share/jumanpp
  sudo mv jumanpp-resource/* /usr/local/share/jumanpp/

  echo 'jumanpp辞書を構築しました' | jumanpp
fi


if [ ! -f /usr/local/share/knp/dict/crf.model ]; then
  echo 'knp辞書を構築します...'
  cd /home/ubuntu
  tar -jxvf ~/knp-dict.tar.bz2
  sudo mv knp-4.18 /root/
  sudo bash -c "cd /root/knp-4.18/dict; cp -v /home/ubuntu/knp_dict/user.dat ./auto/ && make && make install"
  sudo rm -r /root/knp-4.18

  echo 'KNP辞書を構築しました' | jumanpp | knp
fi

cd /home/ubuntu/halumi


if ! [ "$SERVER_MODE" = "" ]; then
  exec node /home/ubuntu/halumi/demo/server.js
else
  # exec tail -f /dev/null
  exec /bin/bash
fi