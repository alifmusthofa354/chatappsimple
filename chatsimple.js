const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const socketIo = require("socket.io");
const { randomUUID } = require("crypto");

// Inisialisasi aplikasi
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Folder statis untuk file frontend
app.use(express.static(__dirname + "/public"));

// Simulasi data pengguna untuk login
let users = [{ id: null, username: "admin", key: "kjsdf-kdksd-kksdk-uewnw" }];

// Route untuk login
app.post("/chatsimple/login", (req, res) => {
  const { username } = req.body;
  const user = users.find((u) => u.username === username);
  const key = randomUUID();
  if (user) {
    res.json({
      success: false,
      message: `maaf ${username} sudah ada yang punya`,
      key: null,
    });
  } else {
    res.json({
      success: true,
      message: "berhasil masuk ke broadcasting",
      key: key,
    });
  }
});

// Socket.IO untuk broadcasting
io.on("connection", (socket) => {
  // Mengambil data dari auth
  const { key, nama } = socket.handshake.auth;
  console.log(`${nama} connected dengan nomor key ${key}`);
  users.push({ id: socket.id, username: nama, key: key });
  // Mengirimkan ID socket kepada client setelah koneksi berhasil
  socket.emit("connected", { id: socket.id });

  // Menerima pesan dari klien dan broadcast ke semua klien lain
  socket.on("sendMessage", (message) => {
    const user = users.find((user) => user.id === socket.id);
    const name = user ? user.username : "Anonim";
    console.log(`${name} : `, message);
    socket.broadcast.emit("broadcastMessage", { name, message });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete users[socket.id];
  });
});

// Jalankan server
const PORT = 5002;
server.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
