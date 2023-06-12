import express from 'express';
import NodeMediaServer from 'node-media-server';
import cors from 'cors';
import { Readable } from 'stream';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import greenlock from 'greenlock-express';
import { WebSocketServer } from 'ws';
import { createServer } from 'https';
import { readFileSync } from 'fs';

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
app.use(cors());

const streamName = 'myStream';
const rtmpUrl = `rtmp://localhost/live/${streamName}`;

// Configure the Node Media Server
const config = {
  rtmp: {
    port: 1935,
    chunk_size: 4096,
    gop_cache: false,
    ping: 1,
    ping_timeout: 60,
  },
  http: {
    port: 8001,
    mediaroot: './media',
    allow_origin: '*',
  },
};

// Create an instance of the Node Media Server
const nms = new NodeMediaServer(config);

// Start the Node Media Server
nms.run();

// Serve the client-side code
app.use(express.static('public'));

// WebSocket server
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws) => {
  const videoStream = new Readable();
  videoStream._read = () => {};

  const camera = ffmpeg()
    .input(videoStream)
    .inputOptions('-re')
    .outputOptions('-c:v copy')
    .outputOptions('-f flv')
    .output(rtmpUrl);

  console.log('Streaming started');
  camera.run();

  camera.on('end', () => {
    console.log('Streaming finished');
  });

  camera.on('error', (error) => {
    console.error('Error streaming video:', error);
  });

  ws.on('message', (message) => {
    videoStream.push(message);
  });

  ws.on('close', () => {
    videoStream.destroy();
    camera.kill();
  });
});

// Create the HTTPS server
const server = createServer({
  cert: readFileSync('certificate.crt'),
  key: readFileSync('private.key'),
  requestCert: false,
  rejectUnauthorized: false,
});

// Start the server
server.listen(3000, () => {
  console.log('Server listening on port 3000');
});

// Upgrade incoming HTTP requests to WebSocket
server.on('upgrade', (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
});
