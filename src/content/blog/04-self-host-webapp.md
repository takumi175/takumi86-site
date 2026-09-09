---
title: "自作アプリを Render から自宅サーバーに引っ越した"
description: "React + Flask + PostgreSQL の3層構成を Docker Compose で自宅サーバーに載せた記録。Nginx をリバースプロキシに置いて CORS を消す構成と、DB初期化でハマった話。"
pubDate: 2026-08-29
tags: ["Docker", "Nginx", "Flask", "自宅サーバー"]
---

以前 Render にデプロイしていた中国語単語アプリを、自宅サーバーに引っ越した。

Render の無料プランは15分アクセスがないとスリープして、次のアクセスで30秒待たされる。ポートフォリオとして見せるときにこれが地味に困る。自宅サーバーなら常時起動なので、その待ちがない。

## 元の構成

```
frontend  React 18 + Vite + MUI      → 静的ファイル (dist)
backend   Flask + SQLAlchemy + JWT   → gunicorn
database  PostgreSQL
```

Render の `render.yaml` でフロント・バック・DB を3サービスに分けてデプロイしていた。

## 移行後の構成

Docker Compose で3コンテナにまとめた。

```
ブラウザ
  ↓ http://192.168.11.15:8080
[Nginx]        React のビルド済みファイルを配信
  ↓ /api だけ転送
[Flask]        gunicorn ワーカー2
  ↓
[PostgreSQL]
```

**Nginx をリバースプロキシに置いたのがポイント。** `/` は React の画面、`/api` は Flask に振り分ける。この形にするとフロントと API が**同一オリジン**になるので、CORS の設定が要らなくなる。

Render では別ドメインだったので `FRONTEND_URL` を環境変数で渡して CORS を許可していたが、その仕組みごと不要になった。

## docker-compose.yml

```yaml
services:
  db:
    image: postgres:16
    container_name: cwapp-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: cwdb
      POSTGRES_USER: cwuser
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db-data:/var/lib/postgresql/data
      - ./initdb:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U cwuser -d cwdb"]
      interval: 5s
      timeout: 5s
      retries: 10

  backend:
    build: ./backend
    container_name: cwapp-backend
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql+psycopg2://cwuser:${DB_PASSWORD}@db:5432/cwdb
      SECRET_KEY: ${SECRET_KEY}
      FRONTEND_URL: ${FRONTEND_URL}
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_URL: ""
    container_name: cwapp-frontend
    restart: unless-stopped
    ports:
      - "8080:80"
    depends_on:
      - backend

volumes:
  db-data:
```

`healthcheck` と `condition: service_healthy` を入れているのは、DB の準備ができる前に backend が起動して接続エラーになるのを防ぐため。

`VITE_API_URL: ""` を空文字にしているのが重要で、これでフロントエンドのコードが `${API_URL}/api/login` → `/api/login` という相対パスを生成する。Nginx が同一オリジンで受けるので、これで通る。

## backend/Dockerfile

```dockerfile
FROM python:3.13-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000
CMD ["gunicorn", "-b", "0.0.0.0:5000", "-w", "2", "app:app"]
```

`psycopg2` のビルドに `libpq-dev` と `build-essential` が要る。`psycopg2-binary` を使えば不要になるが、本番では非推奨とされているのでソースからビルドしている。

## frontend/Dockerfile

マルチステージビルドで、Node でビルドして Nginx に配置する。

```dockerfile
FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

Vite の環境変数は**ビルド時に埋め込まれる**ので、`ARG` で受けて `ENV` に渡す必要がある。実行時に変えることはできない。

## nginx.conf

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

`proxy_pass http://backend:5000` の `backend` はコンテナ名。同じ Docker ネットワーク内なので名前解決される。

`try_files $uri $uri/ /index.html` は SPA のルーティング対応。React Router で `/quiz` のような URL に直接アクセスしても、`index.html` を返して JS 側でルーティングさせる。

## ハマったところ：DB の初期化順序

**`docker-entrypoint-initdb.d` はファイルをアルファベット順に実行する。**

元のリポジトリには以下の3ファイルが置いてあった。

```
scores.sql
users.sql
words.sql
```

アルファベット順だと `scores` → `users` → `words` の順になる。ところが `scores` テーブルは `users(id)` を外部キーで参照している。

```sql
CREATE TABLE scores (
    user_id INT REFERENCES users(id),
    ...
);
```

`users` がまだ存在しない状態で実行されるのでエラーになる。

番号を振って解決した。

```
mkdir -p initdb
cp backend/database/users.sql  initdb/01_users.sql
cp backend/database/words.sql  initdb/02_words.sql
cp backend/database/scores.sql initdb/03_scores.sql
```

ログで正しい順序を確認できる。

```
running /docker-entrypoint-initdb.d/01_users.sql
CREATE TABLE
running /docker-entrypoint-initdb.d/02_words.sql
CREATE TABLE
INSERT 0 400
running /docker-entrypoint-initdb.d/03_scores.sql
CREATE TABLE
```

400語のデータも無事に投入された。

なお `docker-entrypoint-initdb.d` が実行されるのは**ボリュームが空のときだけ**だ。一度起動した後に SQL を変えても反映されない。作り直すには `docker compose down -v` でボリュームごと消す必要がある。

## 環境変数

リポジトリ直下に `.env` を置く。

```
DB_PASSWORD=<パスワード>
SECRET_KEY=<ランダム文字列>
FRONTEND_URL=http://192.168.11.15:8080
```

`SECRET_KEY` は生成できる。

```
openssl rand -hex 32
```

`.gitignore` に `.env` を追加しておくこと。

## 起動

```
docker compose up -d --build
```

初回はイメージのダウンロードとビルドで10分ほどかかる。

```
$ docker compose ps
NAME             STATUS                    PORTS
cwapp-backend    Up About a minute         5000/tcp
cwapp-db         Up About a minute (healthy) 5432/tcp
cwapp-frontend   Up About a minute         0.0.0.0:8080->80/tcp
```

`http://192.168.11.15:8080` でアクセスできる。

## Render との違い

**スリープしない。** これが一番大きい。

**DB の容量制限がない。** Render の無料 PostgreSQL は容量制限に加えて、90日で削除される。

**ログが見放題。** `docker compose logs -f` でいつでも追える。

代わりに、**自宅の回線と電源に依存する。** 停電したら止まるし、回線が切れたら外から見えない。可用性を求めるなら外部サービスの方がいい。

個人の学習用途やポートフォリオなら、悪くないトレードオフだと思う。

## 開発サイクル

VS Code の Remote-SSH でサーバーに直接繋いでいるので、コードを編集して、

```
docker compose up -d --build
```

これだけで反映される。ローカルで開発してから push して、というステップが要らない。

いずれ GitHub に push したら自動デプロイされる仕組みにしたいが、いまはこれで十分回っている。

## 外部公開

家庭内と Tailscale 経由なら上記の URL でアクセスできるが、他人に見せるには外部公開が要る。

一時的に見せるだけなら Cloudflare Tunnel が手軽だった。

```
cloudflared tunnel --url http://localhost:8080
```

これだけで `https://ランダム.trycloudflare.com` が発行される。ルーターのポートを開ける必要がなく、HTTPS も自動で付く。

ターミナルを閉じると切断され、URL は毎回変わる。常時公開したいなら独自ドメインを取って正式なトンネルを設定することになる。
