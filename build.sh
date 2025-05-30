#!/bin/bash

pnpm build
mkdir -p ../gintos/demo/assets/frontend/dist
rm -rf ../gintos/demo/assets/frontend/dist/*
mv dist/* ../gintos/demo/assets/frontend/dist
