const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const siofu = require("socketio-file-upload");
const path = require('path');
const fs = require('fs');

let songs = [];

const songsPath = path.resolve(__dirname, './songs/');

app.use('/songs', express.static(__dirname + '/songs'));

// Rota única e principal do app, usada para servir o html;
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Binda o Socket File Uploader ao servidor Http;
app.use(siofu.router);

// Evento de conexão de um novo socket ao servidor;
io.on('connection', socket => {
  const uploader = new siofu();
  uploader.dir = songsPath;
  uploader.listen(socket);

  uploader.on('saved', ({ file }) => {
    const newFile = file.name.toLowerCase().replace(' ', '-');
    console.log(newFile);
    // songs.push(`songs/${file.base}`);
    // socket.emit('newSong', songs);
    // fs.copyFileSync(file.name.toLowerCase().replace('', '-'), songsPath);
  });
})

http.listen(3000);