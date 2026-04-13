# Audience Participation System

A real-time audience participation system for live performance, built with Node.js, Express, and Socket.IO.

## Architecture

```
server.js          — Express + Socket.IO server
public/
  audience.html    — Mobile-optimised page for audience members
  artist.html      — Dashboard for the artist/performer
```

## Setup

```bash
npm install
npm start
```

Server starts on **http://localhost:3000**

## URLs

| URL | Who |
|-----|-----|
| `http://localhost:3000` | Audience (share this via QR code or short URL) |
| `http://localhost:3000/backend` | Artist dashboard |

## How it works

### Audience flow
1. Audience member opens the URL on their phone
2. They see a waiting screen until the artist sends a prompt
3. When a prompt arrives it appears on their screen with a text input
4. They type and submit a response — it is sent instantly to the artist
5. They see a confirmation and wait for the next prompt

### Artist flow
1. Open `/artist` on your laptop/monitor
2. Type a prompt and click **Broadcast** (or use a Quick Prompt)
3. All connected audience members receive it simultaneously
4. Responses stream in live in the feed
5. Click **Close** to lock the prompt (no more responses accepted)
6. Repeat for the next prompt

## Deploying publicly (for real performances)

To make the audience URL accessible on phones at a venue, deploy to any Node.js host:

- **Railway / Render / Fly.io** — push and deploy in minutes
- **ngrok** (for quick testing) — `npx ngrok http 3000` gives you a public URL

Socket.IO handles reconnection automatically if phones briefly lose signal.

## Customisation ideas

- Add a QR code generator to the artist dashboard
- Export responses as CSV / JSON
- Add multiple concurrent prompts
- Show an anonymised word cloud of responses on a projection screen
