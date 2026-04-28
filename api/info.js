import ytdl from '@distube/ytdl-core';

export default async function handler(req, res) {
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
    console.error('info error:', err);
    res.status(500).json({ error: `Failed to fetch video info: ${err.message}` });
  }
}
