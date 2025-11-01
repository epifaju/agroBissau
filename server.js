const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { initializeSocket } = require('./lib/socket-server.js');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.io
  initializeSocket(httpServer);

  const startServer = (portToUse) => {
    httpServer
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${portToUse} is in use, trying ${portToUse + 1}...`);
          startServer(portToUse + 1);
        } else {
          console.error(err);
          process.exit(1);
        }
      })
      .listen(portToUse, () => {
        console.log(`> Ready on http://${hostname}:${portToUse}`);
        if (portToUse !== port) {
          console.log(`> Note: Port changed from ${port} to ${portToUse}`);
        }
      });
  };

  startServer(port);
});

