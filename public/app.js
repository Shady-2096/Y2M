const form = document.getElementById('form');
const urlInput = document.getElementById('url');
const bitrateSelect = document.getElementById('bitrate');
const submitBtn = document.getElementById('submit');
const statusEl = document.getElementById('status');
const preview = document.getElementById('preview');
const thumb = document.getElementById('thumb');
const titleEl = document.getElementById('title');
const authorEl = document.getElementById('author');
const durationEl = document.getElementById('duration');

let infoTimer;
let lastInfoUrl = '';

const formatDuration = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
};

const setStatus = (msg, isError = false) => {
  statusEl.textContent = msg;
  statusEl.classList.toggle('error', isError);
};

const fetchInfo = async (url) => {
  if (url === lastInfoUrl) return;
  lastInfoUrl = url;
  try {
    const res = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
    if (!res.ok) {
      preview.classList.add('hidden');
      return;
    }
    const data = await res.json();
    titleEl.textContent = data.title;
    authorEl.textContent = data.author ?? '';
    durationEl.textContent = formatDuration(data.lengthSeconds);
    thumb.src = data.thumbnail ?? '';
    thumb.alt = data.title;
    preview.classList.remove('hidden');
  } catch {
    preview.classList.add('hidden');
  }
};

urlInput.addEventListener('input', () => {
  clearTimeout(infoTimer);
  const url = urlInput.value.trim();
  if (!url) {
    preview.classList.add('hidden');
    lastInfoUrl = '';
    return;
  }
  infoTimer = setTimeout(() => fetchInfo(url), 400);
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = urlInput.value.trim();
  const bitrate = bitrateSelect.value;
  if (!url) return;

  submitBtn.disabled = true;
  setStatus('Converting… this can take a moment for long videos.');

  try {
    const res = await fetch(
      `/api/convert?url=${encodeURIComponent(url)}&bitrate=${bitrate}`
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? `HTTP ${res.status}`);
    }

    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition') ?? '';
    const match = disposition.match(/filename\*=UTF-8''([^;]+)/);
    const filename = match ? decodeURIComponent(match[1]) : 'audio.mp3';

    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(downloadUrl);

    setStatus('Done! Check your downloads.');
  } catch (err) {
    setStatus(err.message || 'Conversion failed', true);
  } finally {
    submitBtn.disabled = false;
  }
});
