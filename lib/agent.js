import ytdl from '@distube/ytdl-core';

let cachedAgent;
let cachedSource;

export function getYtdlOptions() {
  const raw = process.env.YOUTUBE_COOKIES;
  if (!raw) return {};

  if (raw !== cachedSource) {
    cachedSource = raw;
    cachedAgent = null;
    try {
      const cookies = JSON.parse(raw);
      cachedAgent = ytdl.createAgent(cookies);
      console.log(`Loaded YouTube agent with ${cookies.length} cookies`);
    } catch (err) {
      console.error('Failed to parse YOUTUBE_COOKIES env var:', err.message);
    }
  }

  return cachedAgent ? { agent: cachedAgent } : {};
}
