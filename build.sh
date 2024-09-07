#! /usr/bin/env bash

build() {
  bun build --compile --minify --sourcemap --target="bun-$1" ./src/main.ts --outfile="./builds/prismer-$1$2"
  zip -j "./builds/prismer-$1.zip" "./builds/prismer-$1$2"
}

rm -r ./builds
mkdir ./builds

build "windows-x64" ".exe"
build "linux-x64" ""
build "linux-arm64" ""

echo
find ./builds -maxdepth 1 -type f ! -name "*.zip" -exec ls -lh {} \; | awk '{print $5, $9}'
echo
find ./builds -maxdepth 1 -type f -name "*.zip" -exec ls -lh {} \; | awk '{print $5, $9}'
echo

echo "prismer'd :3"
