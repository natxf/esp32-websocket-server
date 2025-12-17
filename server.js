const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

let espSocket = null;
let appSocket = null;
let webAppSocket = null;

wss.on('connection', (ws) => {
  console.log('New client connected.');

  ws.on('message', (message) => {
    const msg = message.toString('utf8');
    console.log('Received:', msg);

   if (msg === 'ESP') {
      if (espSocket && espSocket !== ws) {
        espSocket.close();
      }
      espSocket = ws;
      console.log('Registered ESP device.');
    }

    else if (msg === 'APP') {
      appSocket = ws;
      console.log('Registered Mobile App.');
    } 
    else if (msg === 'WEBAPP') {
      webAppSocket = ws;
      console.log('Registered WebApp.');
    }

    else if (ws === espSocket) {
      // Message from ESP → forward to app and webapp
      if (appSocket && appSocket.readyState === WebSocket.OPEN) {
        appSocket.send(msg);
        console.log('Forwarded to Mobile APP:', msg);
      }
      if (webAppSocket && webAppSocket.readyState === WebSocket.OPEN) {
        webAppSocket.send(msg);
        console.log('Forwarded to WEBAPP:', msg);
      }
    } 
    else if (ws === appSocket) {
      // Message from Mobile App → forward to ESP
      if (espSocket && espSocket.readyState === WebSocket.OPEN) {
        espSocket.send(msg);
        console.log('Forwarded to ESP from APP:', msg);
      }
    } 
    else if (ws === webAppSocket) {
      // Message from Web App → forward to ESP
      if (espSocket && espSocket.readyState === WebSocket.OPEN) {
        espSocket.send(msg);
        console.log('Forwarded to ESP from WEBAPP:', msg);
      }
    } 
    else {
      console.log('Unhandled message or unknown client.');
    }
  });

  ws.on('close', () => {
    if (ws === espSocket) {
      console.log('ESP disconnected.');
      espSocket = null;
    } else if (ws === appSocket) {
      console.log('Mobile App disconnected.');
      appSocket = null;
    } else if (ws === webAppSocket) {
      console.log('WebApp disconnected.');
      webAppSocket = null;
    } else {
      console.log('Unknown client disconnected.');
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
