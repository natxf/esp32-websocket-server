const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

let espSocket = null;
let appSocket = null;

wss.on('connection', (ws) => {
  console.log('New client connected.');

  ws.on('message', (message) => {
    const msg = message.toString('utf8');
    console.log('Received:', msg);

    if (msg === 'ESP') {
      espSocket = ws;
      console.log('Registered ESP device.');
    } else if (msg === 'APP') {
      appSocket = ws;
      console.log('Registered Flutter app.');
    } else if (ws === appSocket && espSocket && espSocket.readyState === WebSocket.OPEN) {
      espSocket.send(msg);
      console.log('Forwarded to ESP:', msg);
    } else if (ws === espSocket && appSocket && appSocket.readyState === WebSocket.OPEN) {
      appSocket.send(msg);
      console.log('Forwarded to APP:', msg);
    } else {
      console.log('Unhandled message or no valid peer connected.');
    }
  });

  ws.on('close', () => {
    if (ws === espSocket) {
      console.log('ESP disconnected.');
      espSocket = null;
    } else if (ws === appSocket) {
      console.log('App disconnected.');
      appSocket = null;
    } else {
      console.log('Unknown client disconnected.');
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
