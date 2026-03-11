FROM node:20-alpine

WORKDIR /app

# 使用淘宝/阿里云镜像加速
RUN npm config set registry https://registry.npmmirror.com

COPY package*.json ./

# 安装依赖
RUN npm install

COPY . .

# 构建 TypeScript
RUN npm run build

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["npm", "start"]
