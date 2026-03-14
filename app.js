import http from 'node:http';

const server = http.createServer((req, res) => {
  res.write('On the way to being a full snack engineer');
  res.end();
});

server.listen(3000, () => {
  console.log('Server started on port 3000');
});
