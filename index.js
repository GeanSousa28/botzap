import makeWASocket, { useMultiFileAuthState, delay, DisconnectReason } from "@whiskeysockets/baileys";

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("✅ Conectado!");
    }

    if (connection === "close") {
      const motivo = lastDisconnect?.error?.output?.statusCode;

      console.log("❌ Conexão fechada:", motivo);

      // evita loop infinito se for logout
      if (motivo !== DisconnectReason.loggedOut) {
        console.log("🔄 Reconectando...");
        await delay(5000);
        startBot();
      } else {
        console.log("🚫 Sessão encerrada, precisa conectar de novo");
      }
    }
  });

  // 📲 Pairing Code (se não estiver logado)
  if (!state.creds.registered) {
    await delay(3000);

    const numero = "5598981666909"; // com DDI

    const code = await sock.requestPairingCode(numero);
    console.log("📲 Código de pareamento:", code);
  }

  // 💬 Mensagens
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
