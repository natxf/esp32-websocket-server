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
    } else if (ws === espSocket) {
      // ESP sent something
      if (appSocket && appSocket.readyState === WebSocket.OPEN) {
        appSocket.send(msg);
        console.log('Forwarded to APP:', msg);
      } else {
        console.log('ESP sent a message but APP not connected yet.');
      }
    } else if (ws === appSocket) {
      // APP sent something
      if (espSocket && espSocket.readyState === WebSocket.OPEN) {
        espSocket.send(msg);
        console.log('Forwarded to ESP:', msg);
      } else {
        console.log('APP sent a message but ESP not connected yet.');
      }
    } else {
      console.log('Unhandled message or unknown client.');
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
