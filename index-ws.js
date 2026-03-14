import express from 'express';
import { createServer } from 'http';
import { join } from 'node:path';

const app = express();
const server = createServer(app);

app.get('/', (req, res) => {
  res.sendFile(join(import.meta.dirname, 'index.html'));
});

server.listen(3000, () => {
  console.log('Server started on port 3000');
});
