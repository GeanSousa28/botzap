const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection }) => {
    if (connection === "open") {
      console.log("✅ Bot conectado!");
    }

    if (connection === "close") {
      startBot();
    }
  });

  // 🔑 GERAR CÓDIGO DE CONEXÃO
  if (!sock.authState.creds.registered) {
    const phone = "5598981666909"; //
    const code = await sock.requestPairingCode(phone);
    console.log("🔗 Código de conexão:", code);
  }

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const texto = msg.message.conversation || "";

    if (texto === "!menu") {
      await sock.sendMessage(from, {
        text: "🤖 Bot online!"
      });
    }
  });
}

startBot();
