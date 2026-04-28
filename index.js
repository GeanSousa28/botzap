const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection }) => {
    if (connection === "open") {
      console.log("✅ Conectado com sucesso!");
    }

    if (connection === "close") {
      console.log("🔄 Reconectando...");
      await delay(5000);
      startBot();
    }
  });

  // 🔑 GERA CÓDIGO DE CONEXÃO (SEU NÚMERO)
  if (!state.creds.registered) {
    await delay(3000); // espera inicializar
    const code = await sock.requestPairingCode("5598981666909");
    console.log("📲 Código de conexão:", code);
  }

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
        text: "🤖 Bot online!"
      });
    }
  });
}

startBot();
