import ytdl from '@distube/ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { VALID_BITRATES, sanitizeFilename } from '../lib/util.js';

ffmpeg.setFfmpegPath(ffmpegStatic);

export default async function handler(req, res) {
  const { url } = req.query;
  const bitrate = Number(req.query.bitrate) || 192;

  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }
  if (!VALID_BITRATES.includes(bitrate)) {
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
}
