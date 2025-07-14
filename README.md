# FreeMeeting — React + WebRTC Video Conferencing App

---

## Loyha haqida

**FreeMeeting** — zamonaviy, sodda va oson ishlatiladigan video konferensiya platformasi.  
React, WebRTC va Socket.io texnologiyalari asosida yaratilgan bo‘lib, foydalanuvchilar **xonalar yaratib**, real vaqt rejimida video va audio orqali muloqot qilishlari mumkin.

---

## Asosiy xususiyatlar

- Foydalanuvchi ismini kiritib, maxsus xona (room) yaratish yoki unga kirish  
- Real vaqtli video va audio almashish (WebRTC)  
- 1 dan 4 va undan ortiq foydalanuvchilar uchun moslashuvchan video grid  
- Mikrofon va kamerani yoqish/o‘chirish funksiyalari  
- Meetingdan chiqish tugmasi  
- Kamera o‘chirilganda ismdan avatar (dumaloq) ko‘rsatish  
- Mobil va desktop uchun responsive dizayn  
- Zamonaviy UI TailwindCSS yordamida yaratilgan

---

## Texnologiyalar

- React 18 (Functional Components, Hooks)  
- TailwindCSS (responsive va tezkor dizayn)  
- WebRTC (RTCPeerConnection, getUserMedia)  
- Socket.io (signaling server uchun)  
- Node.js + Express (signaling server backend)  
- React Router (SPA routing)

---

## Loyihani ishga tushurish

### 1. Backend signaling serverni ishga tushurish

```bash
cd server
npm install
node index.js
```

---

### 2. Frontend React ilovasini ishga tushurish

```bash
cd ..
npm install
npm run dev
```

---

### Loyihaning papka tuzilishi (arxitektura)

```js
webrtc-meeting/
├── node_modules/
├── public/
├── src/               # React frontend
│    ├── components/
│    ├── pages/
│    └── ...
├── server/            # Backend signaling server
│    ├── index.js
│    └── package.json
├── package.json
├── tailwind.config.js
└── vite.config.js
```