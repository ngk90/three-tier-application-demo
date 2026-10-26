const http = require('http');

function pr41Reply(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>PR41_PREVIEW_OK</h1>');
}

http.createServer(pr41Reply).listen(8000, '0.0.0.0');
