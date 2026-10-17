# DüzceHUB - Full Stack Starter

Bu repo, sana gösterdiğin tasarıma benzeyen tam çalışan bir başlangıç projesidir.

İçerik:
- server/: Node.js + Express + TypeScript + Prisma + SQLite (auth, post, upload, socket)
- client/: React + Vite + TypeScript (giriş, akış, paylaşım, sohbet client)
- docker-compose.yml (opsiyonel postgres if desired)
- .env.example

Çalıştırma (lokal, hızlı):

1) Root klasörü değil, önce server ve client için bağımlılıkları kur:

  cd server
  npm install
  npm run migrate
  npm run seed
  npm run dev

Ayrı terminalde:

  cd client
  npm install
  npm run dev

Server: http://localhost:4000
Client: http://localhost:5173

Not: Bu bir başlangıç iskeletidir. Gelişmiş güvenlik, doğrulama ve üretim yapılandırması eklenmelidir.
