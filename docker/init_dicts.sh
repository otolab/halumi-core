#!/bin/bash

if [ ! -f /usr/local/share/jumanpp/dic.bin ]; then
  echo 'jumanpp辞書を構築します...'
  cd /home/ubuntu
  mkdir jumanpp-dict
  cd jumanpp-dict
  tar -jxf ../jumanpp-dict.tar.bz2
  cd dict-build
  make
  mv jumanpp_dic/* ../jumanpp-resource
  cd ..
  echo "" | jumanpp -D jumanpp-resource
  sudo mkdir -p /usr/local/share/jumanpp
  sudo mv jumanpp-resource/* /usr/local/share/jumanpp/

  echo 'juman++辞書を構築しました' | jumanpp
  echo 'juman++辞書を構築しました'
fi


if [ ! -f /usr/local/share/knp/dict/crf.model ]; then
  echo 'knp辞書を構築します...'
  cd /home/ubuntu
  tar -jxf ~/knp-dict.tar.bz2
  # configureを実行したのと同じ場所に置かないといけない
  sudo mv knp-4.18 /root/
  sudo bash -c "cd /root/knp-4.18/dict; cp -v /home/ubuntu/knp_dict/user.dat ./auto/ && make && make install"
  sudo rm -r /root/knp-4.18

  echo 'KNP辞書を構築しました' | jumanpp | knp
  echo 'KNP辞書を構築しました'
fi


echo '辞書の準備が完了しました' | jumanpp | knp
echo '辞書の準備が完了しました'

