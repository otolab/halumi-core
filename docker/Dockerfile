FROM ubuntu:16.04 as builder

USER root

RUN \
  apt-get update \
  && apt-get install -y curl jq python build-essential unzip \
  && apt-get install -y libboost1.58-all-dev zlib1g-dev \
  && apt-get clean

WORKDIR /root/

RUN \
  mkdir -p /root/dist

# juman++をいれているので、現在は不要...のはずなのだが、juman.hがインストールされないようなので入れてある
# distには移動しない
RUN \
  curl -O -L "http://nlp.ist.i.kyoto-u.ac.jp/DLcounter/lime.cgi?down=http://nlp.ist.i.kyoto-u.ac.jp/nl-resource/juman/juman-7.01.tar.bz2"
RUN \
  tar jxvf juman-7.01.tar.bz2 \
  && cd juman-7.01; ./configure \
  && make \
  && make install \
  && make install DESTDIR=/root/dist \
  && ldconfig

# jumanpp
RUN echo "# build juman++" \
  && curl -O -L "http://nlp.ist.i.kyoto-u.ac.jp/DLcounter/lime.cgi?down=http://lotus.kuee.kyoto-u.ac.jp/nl-resource/jumanpp/jumanpp-1.02.tar.xz" \
  && tar xJvf jumanpp-1.02.tar.xz \
  && cd jumanpp-1.02; ./configure \
  && make \
  && make install DESTDIR=/root/dist \
  && rm /root/dist/usr/local/share/jumanpp/* \
  && ldconfig \
  && echo "# jumanpp-dictパッケージ" \
  && cd dict-build \
  && rm -f *.mdic jumanpp_dic \
  && cd ../jumanpp-resource \
  && rm -f lang.mdl.direct *.map \
  && rm -f dic.base dic.bin dic.da dic.form dic.form_type dic.imis dic.pos dic.read dic.rep dic.spos version \
  && cd ../ \
  && mkdir -p /root/dist/home && mkdir -p /root/dist/home/ubuntu && mkdir -p /root/dist/home/ubuntu/knp_dict \
  && tar -jcvf /root/dist/home/ubuntu/jumanpp-dict.tar.bz2 dict-build/ jumanpp-resource \
  && cd /root && rm -r jumanpp-1.02.tar.xz jumanpp-1.02/

# knp
RUN echo "# build KNP" \
  && curl -O -L "http://nlp.ist.i.kyoto-u.ac.jp/DLcounter/lime.cgi?down=http://nlp.ist.i.kyoto-u.ac.jp/nl-resource/knp/knp-4.18.tar.bz2" \
  && tar jxvf knp-4.18.tar.bz2 \
  && cd knp-4.18 \
  && ./configure \
  && make \
  && make install DESTDIR=/root/dist \
  && cd .. \
  && echo '## knp-dictパッケージ' \
  && mkdir -p /root/dist/home && mkdir -p /root/dist/home/ubuntu && mkdir -p /root/dist/home/ubuntu/knp_dict \
  && rm -r /root/dist/usr/local/share/knp/dict \
  && (cd knp-4.18/dict/; make clean) \
  && tar -jcvf /root/dist/home/ubuntu/knp-dict.tar.bz2 knp-4.18/dict/ knp-4.18/Makefile* knp-4.18/config.status knp-4.18/configure knp-4.18/configure.ac knp-4.18/aclocal.m4 knp-4.18/system/make_db knp-4.18/system/make_cf_index \
  && echo '## knpユーザ辞書' \
  && cp knp-4.18/system/make_db knp-4.18/system/make_cf_index /usr/local/bin \
  && cp knp-4.18/dict/auto/auto.dat knp-4.18/dict/auto/wikipedia.dat /root/dist/home/ubuntu/knp_dict \
  && gzip -9 /root/dist/home/ubuntu/knp_dict/auto.dat /root/dist/home/ubuntu/knp_dict/wikipedia.dat \
  && rm -r knp-4.18.tar.bz2 knp-4.18/

RUN strip /root/dist/usr/local/bin/jumanpp /root/dist/usr/local/bin/mkdarts_jumanpp /root/dist/usr/local/bin/knp

# --------------------------------
FROM ubuntu:16.04
MAINTAINER Naoto Kato <naoto.kato@plaid.co.jp>

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 8.8.1
ENV NPM_VERSION 3.8.9
ENV YARN_VERSION 1.2.1

WORKDIR /root/

USER root

RUN \
  apt-get update \
  && apt-get install -y curl jq python unzip sudo tzdata git bzip2 make \
  && apt-get install -y zlib1g \
  && apt-get clean

# install node
RUN \
  curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz" \
  && tar -xf "node-v$NODE_VERSION-linux-x64.tar.gz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.gz" \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs \
  && npm install -g npm@$NPM_VERSION yarn@$YARN_VERSION \
  && npm cache clean

# 作業ユーザの作成
RUN \
  useradd -m -d /home/ubuntu -s /bin/bash ubuntu && \
  echo 'ubuntu:ubuntu' | chpasswd && \
  echo "ubuntu ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers && \
  mkdir /home/ubuntu/.ssh

# 作業ユーザを切り替え
USER ubuntu
WORKDIR /home/ubuntu

# buildからコピー
COPY --from=builder /root/dist /

RUN sudo ldconfig

RUN sudo chown ubuntu:ubuntu /home/ubuntu

# ユーザ辞書
COPY knp_user.dat /home/ubuntu/knp_dict/user.dat

# 辞書構築（volumeを使うとキャッシュできる）
COPY init_dicts.sh /home/ubuntu/

# ユーザ辞書更新のツール
COPY update_knp_auto_dict.sh /home/ubuntu/knp_dict/

# halumi_coreライブラリを展開
RUN \
  git clone --depth 1 --branch master --single-branch https://github.com/otolab/halumi-core.git halumi \
  && rm -fr halumi/.git halumi/docker

WORKDIR /home/ubuntu/halumi

RUN yarn install && yarn cache clean

# entrypointで辞書構築(init_dicts.sh)も行う
COPY entrypoint.sh /home/ubuntu/


ENTRYPOINT ["/home/ubuntu/entrypoint.sh"]