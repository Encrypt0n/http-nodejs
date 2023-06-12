const express = require('express');
const https = require('https');
const NodeMediaServer = require('node-media-server');
const cors = require('cors');
const { Readable } = require('stream');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
app.use(cors());

const privateKey = `-----BEGIN PRIVATE KEY-----
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
jNlNQo3Ypuob0HDVSo6oz+tp0WNYqw==
-----END PRIVATE KEY-----
`;

const certificate = `-----BEGIN CERTIFICATE-----
MIIFCTCCAvGgAwIBAgIUJIYV+dz813HNcUyRXnjNt0qEn4YwDQYJKoZIhvcNAQEL
BQAwFDESMBAGA1UEAwwJbG9jYWxob3N0MB4XDTIzMDYxMjA3NTQ0NVoXDTI0MDYx
MTA3NTQ0NVowFDESMBAGA1UEAwwJbG9jYWxob3N0MIICIjANBgkqhkiG9w0BAQEF
AAOCAg8AMIICCgKCAgEAtQyYsBUIsI5Ht21TivlAoVZlGlk60FK64V2UhzSIlWSo
wutjz3iZnGvnEaSalSzHVrpv25RyY4EbcxJip9kZNo5z2TMkKyQqWfBjDjtIt10k
XdQX25mD0u8Rr2GaJjC2mNNtzjr57W0t7rCgBjBWqlpnl/lud8fq9PFmvA/PpEDL
SfK/43K3CdFhsGWIzqCWqW7vwvOKEM3m54kW9bLl4qmuKCcqMosFBHd6tySdIjQB
jzn4FcimJq4SJdUcnOVK2aC4/Hkv9rXENaoAPBTfUH2ajQr66VW5lbDhKR2EN//+
E13U/suR8i5Bkm/5I3IgO4/YB7PlieNzYUpPjRVjAJr+DCjqDUWceGWWgAH+hQXy
HYsNNtn8VMYoHhGiMMwUe0rhjzXW4+eQagwhU1lYScoUnBT4I1Ex4A2Z5yAqUGvy
TJ1oEZ9tKDHoav6E9zPbS7OSq/ai4ecUWAvced9MSVNYOa3EARzqA+Rf+2kKS3xm
78/K4a8c0VagJ6L7agp6O2cuum8m7UpRpP6Cm9MawBClYD9rFqwDqN3fOqktp+fN
VJ8EpqViWVVv9+V2tudUxIrzzzEoSEmYRYSwthDhxKy+gySoJbWCy0O9r2BHGZv8
YlCXOpgB7XOJ3yhKjXu4EH0rfuVO7ioCsIVOFp6Yz1yWqOXHJlLaSMKuNh/VQKMC
AwEAAaNTMFEwHQYDVR0OBBYEFFSoFkljePt9hGhxFnyTN5fCvvqQMB8GA1UdIwQY
MBaAFFSoFkljePt9hGhxFnyTN5fCvvqQMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZI
hvcNAQELBQADggIBACOdoPgAk/Y+h0WG/dLth6wUbdF8I6Miqs2mz4Dd8wb9yi3h
kjV4lpKVycotWnMGiqcs74kTP13mYCklIbXhoRevNJUV+KflxFBuXDaaDXpxhgx4
dW3u1lu64A0QoYhRzdSrFZxReRZvjBYe0ECKQqjB2OdlBO/DyUiFGureFNOdU3Co
eFq2QEI/Wzmg+qJHB4w1op/2secgIV/myXueibTo9zeuXG4ZAkvYspjXpg8ZkNJm
YJd4qvNBDZmNiRvWGfchEdRPE+WQAH0LwTQw/HZcy6jYdQIO1Ma28xS/gYSuMu3l
nEgUjRsXYeNlTY3sI09vbLAe674D6FVj5WkhtwdDCtRvLob3LE6X9evr7XSpvCih
dLIvtBB15THKmppsh3Oxgo7hjD0GBerMxamQAhINrD5s46ht1dQqzNXT8aQo6f1e
eAzhg+N3kGJxUpQCDoRil1w5lyxiHPvoM1mlVXSYs9fODgz/t1Agaf9tTSUV7A5o
HQfpxmQCnH7ZIHtxFAYRLM/omERsHPcEA3RHOzHHrd09togtm7qIbqKKG5ywNISW
/C5HWrSnxdoRTcNFs1BdKy7CkSVvgFyuQ95eSO5S09XPLCeuZa5CSBq3k/aGt5OT
hpdLj9iYaSWC6etkFQxHvt44bOVnvuqM2WqisynxQ5Yx9wv66QhEdNQRBsoQ
-----END CERTIFICATE-----
`;

const options = {
  key: privateKey,
  cert: certificate,
};

const server = https.createServer(options, app);

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
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  const videoStream = new Readable();
  videoStream._read = () => {};

  const camera = ffmpeg()
    .input(videoStream)
    .inputFormat('h264')
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
