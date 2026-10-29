# Vidat – Video Chat Web App

A one-to-one video chatting website that connects two browsers directly using **WebRTC**. No app to install: open the site in any modern desktop or mobile browser, allow camera and microphone access, and you're in a live audio/video call with the other person on the site.

Built during the 2020 shift to remote work, the goal was a lightweight, cross-platform alternative to native video apps that saves device storage and works anywhere a browser does.

## Features

- **Peer-to-peer video and audio** streamed browser-to-browser over WebRTC
- **Single active session** for two people; a third visitor is redirected to a "Server Busy" page and asked to come back later
- **Mute toggle** to silence your peer's audio
- **Automatic cleanup**: when one person closes the tab, the peer connection is destroyed, their video is removed, and the session opens up for someone else

## Tech Stack

| Layer | Technology |
|---|---|
| Real-time media | WebRTC via [simple-peer](https://github.com/feross/simple-peer) |
| Signaling | [Socket.io](https://socket.io/) 2.x (offer/answer exchange) |
| Server | Node.js + [Express](https://expressjs.com/) 4 (serves static files) |
| Front end | JavaScript (ES6), HTML5, CSS, Bootstrap 4, jQuery |
| Bundling | Browserify / [watchify](https://github.com/browserify/watchify) (`public/main.js` → `public/bundle.js`) |
| Deployment | Heroku (`Procfile`) |

## How It Works

1. A visitor opens the site, grants camera/mic access, and the client emits `NewClient` to the server.
2. When a second visitor joins, the server tells them to create the initiating peer (`CreatePeer`).
3. The peers exchange an **offer** and **answer** through Socket.io (`Offer` → `BackOffer`, `Answer` → `BackAnswer`), after which media flows directly between the two browsers.
4. Any further visitor receives `SessionActive` and is redirected to `pages/siteBusy.html`.
5. On disconnect, the remaining peer receives `Disconnect`, removes the peer video, and the slot frees up.

## Project Structure

```
├── server.js              # Express server + Socket.io signaling
├── Procfile               # Heroku start command
├── package.json
└── public/
    ├── index.html         # Main page (local + peer video)
    ├── main.js            # Client logic (getUserMedia, simple-peer)
    ├── bundle.js          # Browserified build of main.js (served to browser)
    ├── css/
    │   ├── main.css
    │   └── siteBusy.css
    └── pages/
        └── siteBusy.html  # Shown when a session is already active
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (originally built on v12) and npm
- A browser with WebRTC support (Chrome, Firefox, Edge, Safari)
- A webcam and microphone

### Installation

```bash
git clone https://github.com/chhanamthorat/video-chat-webapp.git
cd video-chat-webapp
npm install
```

### Run locally

```bash
node server.js
```

Then open <http://localhost:3000> in two browser windows on the same computer and allow camera/microphone access in each.

The port defaults to `3000` and can be changed with the `PORT` environment variable:

```bash
PORT=8080 node server.js
```

> `npm start` runs the server with `nodemon` for auto-reload. `nodemon` isn't listed in the project's dependencies, so install it first (`npm install -g nodemon`) or use `node server.js` as above.

### Rebuilding the client bundle

The browser loads `public/bundle.js`, which is built from `public/main.js`. If you edit `main.js`, rebuild the bundle with:

```bash
npm run watch
```

This watches `main.js` and rewrites `bundle.js` on every change.

### Notes

- Browsers only allow camera/microphone access on **HTTPS** or `localhost`. To test across devices, deploy the app or serve it over HTTPS.
- The app supports **one session of two people** at a time.
- Connections use WebRTC's default STUN setup with no TURN server, so calls between some restrictive networks (e.g. strict corporate firewalls) may not connect.

## Deployment

The repo includes a `Procfile` (`web: node server.js`), so it can be deployed as-is to Heroku or any Node.js host that sets the `PORT` environment variable.

## Future Scope

- Package the site as a Progressive Web App (PWA)
- Support more than two participants per call
- Handle multiple concurrent sessions with load balancing

## Documentation

- [Report.pdf](Report.pdf) – project report (abstract, architecture, methodology, implementation)
- [PPT.pdf](PPT.pdf) – presentation slides
- [Demo.wmv](Demo.wmv) – demo video

## Author

**Chhanam Thorat**
