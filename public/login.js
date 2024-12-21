// Elemen DOM
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");
const messagesDiv = document.getElementById("messages");

let socket;
let tokenkey;
let nameuser;

document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    nameuser = username;

    // Mengirim data ke backend
    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          tokenkey = data.key;
          connectServer();
        } else {
          document.getElementById("errorMessage").innerText = data.message;
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        document.getElementById("errorMessage").innerText =
          "Terjadi kesalahan. Coba lagi.";
      });
  });

function connectServer() {
  if (!socket) {
    // Membuat koneksi ke server
    const socket = io("https://petarungan.site/", {
      auth: {
        key: tokenkey, // Ganti dengan key yang valid
        nama: nameuser,
      },
    });

    // Mendengarkan event 'connected' untuk menerima ID
    socket.on("connected", (data) => {
      console.log("Connected with ID: " + data.id);
      document.getElementById("broadcasting-container").style.display = "block";
      document.getElementById("login-container").style.display = "none";

      // Kirim pesan ke server
      sendBtn.addEventListener("click", () => {
        const message = messageInput.value;
        if (message) {
          socket.emit("sendMessage", message);
          appendMessage(`Anda: ${message}`, true);
          messageInput.value = "";
        }
      });
    });

    // Terima pesan broadcast dari server
    socket.on("broadcastMessage", (data) => {
      const { name, message } = data;
      appendMessage(`${name} : ${message}`, false);
    });

    // Menangani koneksi terputus
    // socket.on('disconnect', () => {
    // console.log('Disconnected from server');
    // });

    console.log("Connection initiated...");
  } else {
    console.log("Already connected!");
  }
}

// Tambahkan pesan ke div
function appendMessage(msg, isSender) {
  const messageElem = document.createElement("p");
  messageElem.textContent = msg;
  // Tambahkan kelas untuk menentukan posisi pesan
  messageElem.classList.add(isSender ? "sender" : "receiver");
  messagesDiv.appendChild(messageElem);
}
