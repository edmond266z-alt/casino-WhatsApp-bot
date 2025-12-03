// BOT SIMPLE PARA RENDER
console.log('🤖 Iniciando bot...');

const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

// Esto es OBLIGATORIO en Render para que no se duerma
require('http').createServer((req, res) => {
  res.writeHead(200);
  res.end('🎰 Bot activo');
}).listen(process.env.PORT || 3000);

async function iniciar() {
    try {
        console.log('🔗 Conectando a WhatsApp...');
        const { state, saveCreds } = await useMultiFileAuthState('auth');
        
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: true
        });

        sock.ev.on('creds.update', saveCreds);
        
        sock.ev.on('connection.update', ({ qr }) => {
            if (qr) {
                console.log('\n📱 ESCANEA ESTE QR CON WHATSAPP:\n');
                qrcode.generate(qr, { small: true });
            }
        });

        // Responder mensajes simples
        sock.ev.on('messages.upsert', async (m) => {
            const msg = m.messages[0];
            if (msg.message?.conversation === 'hola') {
                await sock.sendMessage(msg.key.remoteJid, { text: '🎰 ¡Hola! Escribe "menu"' });
            }
            if (msg.message?.conversation === 'menu') {
                await sock.sendMessage(msg.key.remoteJid, { text: '🎰 MENU:\n\n🎲 dados\n💰 saldo\n🎁 bonus' });
            }
        });

        console.log('✅ Bot listo para usar');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        // Reintentar en 10 segundos
        setTimeout(iniciar, 10000);
    }
}

// Iniciar el bot
iniciar();

// Evitar que se cierre por errores
process.on('unhandledRejection', (error) => {
    console.log('⚠️ Error no manejado:', error.message);
});
