FROM ubuntu:16.04
MAINTAINER Naoto Kato <naoto.kato@plaid.co.jp>

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 6.9.2
ENV NPM_VERSION 3.8.9
ENV YARN_VERSION 0.24.5

USER root

RUN apt-get update && apt-get upgrade -y

RUN apt-get install -y vim lv curl wget git jq python build-essential zip unzip sudo \
  && apt-get install -y xpdf \
  && apt-get clean

# install cabocha, knp
RUN \
  apt-get install -y mecab libmecab-dev mecab-ipadic-utf8 make curl xz-utils file patch \
  && apt-get install -y libboost1.58-all-dev zlib1g-dev \
  && apt-get clean

# install node
RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz" \
  && tar -xf "node-v$NODE_VERSION-linux-x64.tar.gz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.gz" \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs \
  && npm install -g npm@$NPM_VERSION yarn@$YARN_VERSION \
  && npm cache clean

# 作業ユーザの作成
RUN \
  useradd -m -d /home/ubuntu -s /bin/bash ubuntu && \
  echo 'ubuntu:ubuntu' | chpasswd && \
  echo "ubuntu ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
RUN \
  mkdir /home/ubuntu/.ssh

# 作業ユーザを切り替え
USER ubuntu
WORKDIR /home/ubuntu

RUN \
  git config --global user.email "dev+test@plaid.co.jp" \
  && git config --global user.name "docker image builder"

# mecab neologd辞書
RUN \
  git clone --depth 1 https://github.com/neologd/mecab-ipadic-neologd.git \
  && cd mecab-ipadic-neologd ; ./bin/install-mecab-ipadic-neologd -p /var/lib/mecab/dic/mecab-ipadic-neologd -n -y \
  && sudo update-alternatives --install /var/lib/mecab/dic/debian mecab-dictionary /var/lib/mecab/dic/mecab-ipadic-neologd 90 \
  && cd ../ ; rm -rf mecab-ipadic-neologd

# juman++をいれているので、現在は不要...のはずなのだが、juman.hがインストールされないようなので入れてある
RUN \
  curl -O -L "http://nlp.ist.i.kyoto-u.ac.jp/DLcounter/lime.cgi?down=http://nlp.ist.i.kyoto-u.ac.jp/nl-resource/juman/juman-7.01.tar.bz2" \
  && tar jxvf juman-7.01.tar.bz2 \
  && cd juman-7.01; ./configure && make && sudo make install && sudo ldconfig \
  && cd .. ; rm -rf juman-7.01 juman-7.01.tar.bz2

RUN \
  curl -O -L "http://nlp.ist.i.kyoto-u.ac.jp/DLcounter/lime.cgi?down=http://lotus.kuee.kyoto-u.ac.jp/nl-resource/jumanpp/jumanpp-1.02.tar.xz" \
  && tar xJvf jumanpp-1.02.tar.xz \
  && cd jumanpp-1.02; ./configure && make && sudo make install && sudo ldconfig \
  && cd .. ; rm -rf jumanpp-1.02 jumanpp-1.02.tar.xz

RUN \
  curl -O -L "http://nlp.ist.i.kyoto-u.ac.jp/DLcounter/lime.cgi?down=http://nlp.ist.i.kyoto-u.ac.jp/nl-resource/knp/knp-4.17.tar.bz2" \
  && tar jxvf knp-4.17.tar.bz2 \
  && cd knp-4.17; ./configure && make && sudo make install && sudo ldconfig \
  && cd .. ; rm -rf knp-4.17 knp-4.17.tar.bz2 ; knp -v

# 直接ダウンロードできないのでwebから直接取得、dockerディレクトリ下にダウンロード
# COPY CRF++-0.58.tar.gz ./
# RUN \
#   tar -xpf CRF++-0.58.tar.gz \
#   && cd CRF++-0.58; ./configure && make && sudo make install && sudo ldconfig \
#   && cd ../ ; rm -rf CRF++-0.58.tar.gz CRF++-0.58 

# 直接ダウンロードできないのでwebから直接取得、dockerディレクトリ下にダウンロード
# COPY cabocha-0.69.tar.bz2 ./
# RUN \
#   tar -xpf cabocha-0.69.tar.bz2 \
#   && cd cabocha-0.69 ; ./configure --with-charset=utf8 && make && make check && sudo make install \
#   && cd ../ ; rm -rf cabocha-0.69.tar.bz2 cabocha-0.69

COPY entrypoint.sh ./

ENTRYPOINT ["/home/ubuntu/entrypoint.sh"]
