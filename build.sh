#!/bin/bash

# 获取第一个参数（如果有）
ENV=$1

echo "\n\n🚀 【前端构建】步骤 1. 开始构建\n\n"
cd ./client
# 遇到错误时停止脚本执行
set -e

echo "\n\n🚀 【前端构建】步骤 2. 安装依赖\n\n"
pnpm install 

echo "\n\n🚀 【前端构建】步骤 3. 构建项目\n\n"
pnpm run build

echo "\n\n🚀 【前端构建】步骤 4. 准备目录\n\n"
# 删除并重新创建目录
rm -rf ../server/views ../server/public
mkdir -p ../server/views ../server/public

echo "\n\n🚀 【前端构建】步骤 5. 复制 index.html 到服务端 views 目录\n\n"
rsync -av --progress ./dist/index.html ../server/views/

echo "\n\n🚀 【前端构建】步骤 6. 复制静态资源到服务端 public 目录\n\n"
rsync -av --progress ./dist/ ../server/public/ --exclude index.html

echo "\n\n✅ 【前端构建】构建完成！index.html已复制到views/，静态资源已复制到public/\n\n"

echo "\n\n🚀 【NestJS 构建】步骤 1. 开始构建\n\n"
cd ../server
# 遇到错误时停止脚本执行
set -e

echo "\n\n🚀 【NestJS 构建】步骤 2. 安装依赖\n\n"
pnpm install

echo "\n\n🚀 【NestJS 构建】步骤 3. 构建项目\n\n"
npm run build


echo "\n\n✅ 【NestJS 构建】构建完成！\n\n"