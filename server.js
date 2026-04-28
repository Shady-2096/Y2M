import express from 'express';
import ytdl from '@distube/ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

ffmpeg.setFfmpegPath(ffmpegStatic);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const sanitizeFilename = (name) =>
  name
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 120) || 'audio';

app.get('/api/info', async (req, res) => {
  const { url } = req.query;
  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }
  try {
    const { videoDetails } = await ytdl.getInfo(url);
    res.json({
      title: videoDetails.title,
      author: videoDetails.author?.name ?? null,
      lengthSeconds: Number(videoDetails.lengthSeconds),
      thumbnail: videoDetails.thumbnails?.at(-1)?.url ?? null,
      videoId: videoDetails.videoId,
    });
  } catch (err) {
    console.error('info error:', err.message);
    res.status(500).json({ error: 'Failed to fetch video info' });
  }
});

app.get('/api/convert', async (req, res) => {
  const { url } = req.query;
  const bitrate = Number(req.query.bitrate) || 192;

  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }
  if (![96, 128, 192, 256, 320].includes(bitrate)) {
    return res.status(400).json({ error: 'Unsupported bitrate' });
  }

  let info;
  try {
    info = await ytdl.getInfo(url);
  } catch (err) {
    console.error('getInfo failed:', err.message);
    return res.status(500).json({ error: 'Failed to load video' });
  }

  const filename = `${sanitizeFilename(info.videoDetails.title)}.mp3`;
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
  );

  const audioStream = ytdl.downloadFromInfo(info, {
    quality: 'highestaudio',
    filter: 'audioonly',
  });

  audioStream.on('error', (err) => {
    console.error('ytdl stream error:', err.message);
    if (!res.headersSent) res.status(500).end();
    else res.end();
  });

  ffmpeg(audioStream)
    .audioBitrate(bitrate)
    .toFormat('mp3')
    .on('error', (err) => {
      console.error('ffmpeg error:', err.message);
      if (!res.headersSent) res.status(500).end();
      else res.end();
    })
    .pipe(res, { end: true });

  req.on('close', () => {
    audioStream.destroy();
  });
});

app.listen(PORT, () => {
  console.log(`y2m listening on http://localhost:${PORT}`);
});
