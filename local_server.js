// Local development server with /api/nisd-rural support
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const apiHandlers = {
  '/api/nisd-rural': require('./api/nisd-rural.js'),
  '/api/areg': require('./api/areg.js'),
  '/api/chitta': require('./api/chitta.js')
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle API route
  if (apiHandlers[pathname]) {
    const handler = apiHandlers[pathname];
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        if (body && req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
          req.body = JSON.parse(body);
        }
      } catch (e) {}
      req.query = parsedUrl.query;

      // Enhance res with status, json and send helpers
      res.status = function(code) {
        res.statusCode = code;
        return res;
      };
      res.json = function(data) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
      };
      res.send = function(data) {
        res.end(data);
      };

      try {
        await handler(req, res);
      } catch (err) {
        console.error('API execution error:', err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Static file serving
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') safePath = '/index.html';
  let filePath = path.join(PUBLIC_DIR, safePath);

  if (!fs.existsSync(filePath)) {
    // Try dist/
    filePath = path.join(PUBLIC_DIR, 'dist', safePath);
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Local server running at http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/nisd-rural`);
});
