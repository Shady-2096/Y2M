# y2m — YouTube to MP3

A small, self-hosted web app that converts a YouTube video to an MP3 file.
Built with Node.js, Express, `@distube/ytdl-core`, and a bundled
`ffmpeg-static` binary so there are no system dependencies to install.

## Quick start

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

- `PORT` — port to listen on (default `3000`).

## Project layout

```
server.js          Express server + conversion pipeline
public/index.html  UI
public/styles.css  Styles
public/app.js      Front-end logic
```

## Notice

This tool is intended for personal use with content you own or have
permission to download (your own uploads, Creative Commons works,
public-domain material, etc.). Downloading copyrighted material without
permission may violate YouTube's Terms of Service and your local
copyright laws. You are responsible for how you use this software.
