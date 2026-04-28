import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import infoHandler from './api/info.js';
import convertHandler from './api/convert.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/api/info', infoHandler);
app.get('/api/convert', convertHandler);

app.listen(PORT, () => {
  console.log(`y2m listening on http://localhost:${PORT}`);
});
