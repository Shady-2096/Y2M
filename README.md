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

- `PORT` — port to listen on (default `3000`). Render sets this
  automatically.

## Project layout

```
api/
  info.js          /api/info handler
  convert.js       /api/convert handler
lib/
  util.js          Shared helpers
public/
  index.html       UI
  styles.css       Styles
  app.js           Front-end logic
server.js          Express entrypoint
render.yaml        Render Blueprint config
```

## Deploying to Render

This repo includes a `render.yaml` Blueprint, so deploying is one click:

1. Push to GitHub (already done if you're reading this on GitHub).
2. Go to <https://dashboard.render.com/select-repo?type=blueprint>.
3. Pick the `y2m` repository. Render reads `render.yaml` and proposes a
   free-tier web service. Click **Apply**.
4. Wait ~2 minutes for the first build. Render gives you a URL like
   `https://y2m.onrender.com`.

The free tier sleeps after 15 minutes of inactivity and takes a few
seconds to wake on the next request. Upgrade to the Starter plan ($7/mo)
to keep it always-on.

## Notice

This tool is intended for personal use with content you own or have
permission to download (your own uploads, Creative Commons works,
public-domain material, etc.). Downloading copyrighted material without
permission may violate YouTube's Terms of Service and your local
copyright laws. You are responsible for how you use this software.
