export const VALID_BITRATES = [96, 128, 192, 256, 320];

export const sanitizeFilename = (name) =>
  name
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 120) || 'audio';
