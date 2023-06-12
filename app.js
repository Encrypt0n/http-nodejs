const express = require('express');
const https = require('https'); // Change from 'http' to 'https'
const fs = require('fs'); // Required for HTTPS server
const NodeMediaServer = require('node-media-server');
const cors = require('cors');
const { Readable } = require('stream');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
app.use(cors());
const options = {
  key: fs.readFileSync('private.key'), // Path to your private key file
  cert: fs.readFileSync('certificate.crt'), // Path to your certificate file
};
const server = https.createServer(options, app); // Create an HTTPS server

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
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server, perMessageDeflate: false }); // Use the HTTPS server for WebSocket

wss.on('connection', (ws) => {
  const videoStream = new Readable();
  videoStream._read = () => {};

  const camera = ffmpeg()
    .input(videoStream)
    //.inputFormat('h264')
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

// Start the server
server.listen(3000, () => {
  console.log('Server listening on port 3000');
});