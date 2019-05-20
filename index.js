const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const siofu = require("socketio-file-upload");
const path = require('path');
const fs = require('fs');
const url = require('url');

// Array inicial com referências da pasta songs
let songs = [];

const songsPath = path.resolve(__dirname, './songs/');

// Lê o diretório '/songs' e adiciona ao array. Será a carga inicial da aplicação cliente na primeira conexão com o socket
const getSongs = fs.readdirSync(songsPath).map(song => `http://localhost:3000/songs/${encodeURI(song)}`);

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
  
  songs = getSongs;

  io.emit('getAllSongs', songs);

  uploader.on('saved', ({ file }) => {
    songs.push(`http://localhost:3000/songs/${encodeURI(file.name)}`);
    console.log(songs);
    io.emit('newSong', songs);
  });
})

http.listen(3000);