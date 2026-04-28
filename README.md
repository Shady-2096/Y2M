# y2m — YouTube to MP3

A small, self-hosted web app that converts a YouTube video to an MP3 file.
Built with Node.js, Express, `@distube/ytdl-core`, and a bundled
`ffmpeg-static` binary so there are no system dependencies to install.

## Quick start (local)

```bash
npm install
npm start
```

Then open <http://localhost:3000>, paste a YouTube URL, pick a bitrate, and
click **Convert**. The MP3 is streamed to your browser and saved to your
downloads folder.

## How it works

- `GET /api/info?url=…` fetches title/author/duration/thumbnail for the
  preview card.
- `GET /api/convert?url=…&bitrate=192` streams the highest-quality audio
  track from YouTube into ffmpeg, transcodes to MP3 on the fly, and pipes
  the result back to the client. Nothing touches disk on the server.

Supported bitrates: `96`, `128`, `192`, `256`, `320` kbps.

## Configuration

- `PORT` — port to listen on for `npm start` (default `3000`).

## Project layout

```
api/
  info.js          /api/info handler (also used by Vercel)
  convert.js       /api/convert handler (also used by Vercel)
lib/
  util.js          Shared helpers
public/
  index.html       UI
  styles.css       Styles
  app.js           Front-end logic
server.js          Express wrapper for self-hosting
vercel.json        Vercel function config
```

## Deploying to Vercel

1. Push this repo to GitHub (already done if you're reading this on GitHub).
2. Go to <https://vercel.com/new> and import the repository.
3. Accept the defaults and click **Deploy**. The handlers in `api/` are
   picked up automatically; `public/` is served as static files.

### Vercel limits to be aware of

This app is a tight fit for Vercel — it works for short clips but has
real constraints:

- **Function timeout.** Hobby = 10s, Pro = 60s default (raised to 300s by
  `vercel.json`). Long videos will time out before transcoding finishes.
- **Function size.** `ffmpeg-static` ships an ~78 MB binary. Hobby caps
  bundled functions at 50 MB compressed; Pro at 250 MB. Hobby may fail to
  deploy.
- **No background work.** Each request must complete in one synchronous
  function invocation.

If you hit these, **Render** or **Fly.io** are much better fits — they
run the Express server as a long-lived process with no time/size caps.
The `server.js` entrypoint and `npm start` script already work on both
without changes.

## Notice

This tool is intended for personal use with content you own or have
permission to download (your own uploads, Creative Commons works,
public-domain material, etc.). Downloading copyrighted material without
permission may violate YouTube's Terms of Service and your local
copyright laws. You are responsible for how you use this software.
