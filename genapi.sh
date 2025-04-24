#!/bin/bash


# npm install -g ts-proto

CURR=`pwd`
BACKEND_PATH=../gintos/demo
mkdir -p $CURR/src/api/api

cd $BACKEND_PATH
echo "Generating proto files in $BACKEND_PATH"
API_PROTO_FILES=$(find api -name "*.proto")
protoc --experimental_allow_proto3_optional \
  --proto_path=./api \
  --proto_path=../third_party \
  --ts_proto_out=${CURR}/src/api/api \
  $API_PROTO_FILES
cd $CURR
echo "Generating proto files in $CURR/src/api/api"