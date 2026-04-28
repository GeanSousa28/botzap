const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state
  });

  sock.ev.on("creds.update", saveCreds);

  // conexão
  sock.ev.on("connection.update", async ({ connection }) => {
    if (connection === "open") {
      console.log("✅ Bot conectado!");
    }

    if (connection === "close") {
      console.log("🔄 Reconectando...");
      startBot();
    }
  });

  // 🔑 CÓDIGO DE CONEXÃO (SEU NÚMERO)
  if (!state.creds.registered) {
    const phoneNumber = "5598981666909";
    const code = await sock.requestPairingCode(phoneNumber);
    console.log("📲 Código de conexão:", code);
  }

  // comandos
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const texto =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    if (texto === "!menu") {
      await sock.sendMessage(from, {
        text: "🤖 Bot online!\n\nComandos:\n!menu\n!ping"
      });
    }

    if (texto === "!ping") {
      await sock.sendMessage(from, {
        text: "🏓 Pong! Funcionando!"
      });
    }
  });
}

startBot();
