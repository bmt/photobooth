#!/bin/bash
cd ../

if [[ $(uname) == "Darwin" ]]; then
  echo "Downloading OpenFrameworks 0.8.4 for mac."
  curl -O http://www.openframeworks.cc/versions/v0.8.4/of_v0.8.4_osx_release.zip
  unzip of_v0.8.4_osx_release.zip
  patch -p0 < interface/openssl.patch
elif [[ $(uname -m) == "armv7l" ]]; then
  echo "Downloading OpenFrameworks 20151003 nightly for Pi2"
  cd ../
  curl -O http://192.237.185.151/versions/nightly/of_v20151003_linuxarmv7l_nightly.tar.gz
  tar xvzf of_v20151003_linuxarmv7l_nightly.tar.gz
else
  echo "Unrecognized machine type: "
  echo $(uname -a)
fi

cd -
