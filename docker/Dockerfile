FROM ubuntu:16.04
MAINTAINER Naoto Kato <naoto.kato@plaid.co.jp>

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 6.9.2
ENV NPM_VERSION 3.8.9
ENV YARN_VERSION 0.24.5

USER root

RUN apt-get update

RUN apt-get install -y curl jq python build-essential unzip sudo && apt-get clean

# for knp install
RUN \
  apt-get install -y libboost1.58-all-dev zlib1g-dev \
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

RUN sudo apt-get install -y tzdata && sudo apt-get clean

COPY entrypoint.sh ./

ENTRYPOINT ["/home/ubuntu/entrypoint.sh"]