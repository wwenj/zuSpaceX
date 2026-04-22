FROM node:24-alpine

LABEL maintainer="<man@wwenj.com>"
LABEL description="个人主站部署镜像"

# build.sh 依赖 bash 和 rsync
RUN apk add --no-cache bash rsync

# 保留全局 pnpm 和 cross-env
RUN npm install -g pnpm cross-env --registry=https://registry.npmmirror.com

# 设置工作目录
WORKDIR /app

# 复制整个项目代码
COPY . /app/

# 直接复用仓库根目录 build.sh 的一体化构建逻辑
RUN bash /app/build.sh

# 设置环境变量
ENV NODE_ENV=production

# 设置工作目录到 server
WORKDIR /app/server

# 暴露端口
EXPOSE 8080

# 启动服务
CMD ["npm", "run", "start:prod"]
