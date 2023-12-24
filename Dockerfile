FROM oven/bun:1.0.20

WORKDIR /usr/app

COPY package.json .
COPY bun.lockb ./
COPY src ./
COPY public ./
COPY views ./
COPY config.ts ./

RUN bun install