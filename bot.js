// ==============================================
// 🎰 CASINO WHATSAPP BOT COMPLETO - PARA GRUPOS
// ==============================================

console.log('🎰 INICIANDO CASINO BOT COMPLETO...\n');

// ================= CONFIGURACIÓN =================
const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const http = require('http');

// ================= BASE DE DATOS =================
let jugadores = {};

// ================= SERVIDOR HTTP =================
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>🎰 Casino WhatsApp Bot</title>
      <style>
        body { background: #000; color: #0f0; font-family: monospace; padding: 20px; text-align: center; }
        h1 { color: #ff0; }
        .qr { background: white; padding: 20px; display: inline-block; margin: 20px; }
      </style>
    </head>
    <body>
      <h1>🎰 CASINO WHATSAPP BOT</h1>
      <p>🤖 Bot activo y funcionando</p>
      <p>📱 Escanea el QR en los logs de Render</p>
      <p>👥 Agrega este bot a grupos para jugar con amigos</p>
    </body>
    </html>
  `);
}).listen(process.env.PORT || 3000, () => {
  console.log('✅ Servidor HTTP activo');
});

// ================= FUNCIONES DEL CASINO =================
function obtenerJugador(id, nombre) {
  if (!jugadores[id]) {
    jugadores[id] = {
      dinero: 1000,
      apuesta: 100,
      nombre: nombre || 'Jugador',
      juegos: 0,
      ganancias: 0,
      nivel: 1
    };
  }
  return jugadores[id];
}

function jugarDados(jugador) {
  if (jugador.apuesta > jugador.dinero) {
    return { error: `❌ SALDO INSUFICIENTE\nTienes: $${jugador.dinero}\nNecesitas: $${jugador.apuesta}` };
  }
  
  jugador.juegos++;
  const dado1 = Math.floor(Math.random() * 6) + 1;
  const dado2 = Math.floor(Math.random() * 6) + 1;
  const suma = dado1 + dado2;
  
  let resultado = `🎲 *DADOS*\n\n${dado1} + ${dado2} = ${suma}\n\n`;
  let ganancia = 0;
  
  if (suma === 7 || suma === 11) {
    ganancia = jugador.apuesta * 4;
    jugador.dinero += ganancia;
    jugador.ganancias += ganancia;
    resultado += `🎉 *¡JACKPOT! x4*\n💰 +$${ganancia}`;
  } else if (suma >= 8 && suma <= 10) {
    ganancia = jugador.apuesta * 2;
    jugador.dinero += ganancia;
    jugador.ganancias += ganancia;
    resultado += `✅ *¡GANASTE! x2*\n💰 +$${ganancia}`;
  } else {
    jugador.dinero -= jugador.apuesta;
    jugador.ganancias -= jugador.apuesta;
    resultado += `❌ *Perdiste*\n💸 -$${jugador.apuesta}`;
  }
  
  resultado += `\n\n💰 *Nuevo saldo:* $${jugador.dinero}`;
  return { resultado, ganancia };
}

function darBono(jugador) {
  const hoy = new Date().toISOString().split('T')[0];
  if (jugador.ultimoBono === hoy) {
    return { error: `⏳ *YA RECLAMASTE TU BONO HOY*\n\nVuelve mañana a las 00:00` };
  }
  
  const bono = Math.floor(Math.random() * 151) + 50; // 50-200
  jugador.dinero += bono;
  jugador.ganancias += bono;
  jugador.ultimoBono = hoy;
  
  return { 
    resultado: `🎁 *¡BONO DIARIO!*\n\n💰 *+$${bono}* añadidos\n🏦 *Saldo:* $${jugador.dinero}`,
    bono 
  };
}

function rankingGrupo(grupoId) {
  const jugadoresGrupo = Object.entries(jugadores)
    .filter(([id]) => id.includes(grupoId))
    .map(([id, j]) => ({ ...j, id }))
    .sort((a, b) => b.dinero - a.dinero)
    .slice(0, 10);
  
  if (jugadoresGrupo.length === 0) {
    return '📊 *RANKING*\n\nAún no hay jugadores en este grupo.';
  }
  
  let ranking = `🏆 *TOP 10 - ESTE GRUPO*\n\n`;
  jugadoresGrupo.forEach((j, i) => {
    const pos = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'][i];
    const nombreCorto = j.nombre.length > 12 ? j.nombre.substring(0, 10) + '...' : j.nombre;
    ranking += `${pos} *${nombreCorto}* - $${j.dinero}\n`;
  });
  
  return ranking;
}

// ================= WHATSAPP BOT =================
async function iniciarBot() {
  console.log('🔗 Conectando a WhatsApp...\n');
  
  try {
    const { state, saveCreds } = await useMultiFileAuthState('sesion-casino');
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      browser: ['Casino Bot', 'Chrome', '1.0'],
      connectTimeoutMs: 60000
    });

    // ================= MOSTRAR QR =================
    sock.ev.on('connection.update', ({ qr }) => {
      if (qr) {
        console.log('\n📱 📱 📱 📱 📱 📱 📱 📱 📱');
        console.log('📱 ESCANEA ESTE QR CON WHATSAPP:');
        console.log('📱 1. Abre WhatsApp');
        console.log('📱 2. Menú → Dispositivos vinculados');
        console.log('📱 3. Vincular dispositivo');
        console.log('📱 4. Escanea este código:');
        console.log('\n');
        qrcode.generate(qr, { small: false });
        console.log('\n📱 📱 📱 📱 📱 📱 📱 📱 📱\n');
      }
    });

    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', (update) => {
      const { connection } = update;
      if (connection === 'open') {
        console.log('✅ ¡CONECTADO A WHATSAPP!');
        console.log('🤖 Bot listo para grupos e individual');
      }
    });

    // ================= DETECTAR GRUPOS =================
    sock.ev.on('group-participants.update', async (update) => {
      try {
        const { id, participants, action } = update;
        const botId = sock.user.id;
        
        // Cuando añaden al bot a un grupo
        if (action === 'add' && participants.includes(botId)) {
          console.log(`👥 Añadido al grupo: ${id}`);
          
          await sock.sendMessage(id, {
            text: `🎰 *¡HOLA GRUPO!* 👋\n\nSoy el bot del casino. Todos pueden jugar:\n\n` +
                  `🎲 *dados* - Jugar a los dados\n` +
                  `💰 *apuesta 200* - Cambiar tu apuesta\n` +
                  `📊 *saldo* - Ver tu dinero (privado)\n` +
                  `🎁 *bonus* - Bono diario GRATIS\n` +
                  `🏆 *top* - Ranking del grupo\n` +
                  `❓ *ayuda* - Ver ayuda\n\n` +
                  `*¡Que empiece la diversión!* 🎮`
          });
        }
        
        // Cuando añaden a alguien al grupo
        if (action === 'add' && participants.length === 1) {
          const nuevo = participants[0];
          if (nuevo !== botId) {
            await sock.sendMessage(id, {
              text: `👋 ¡Bienvenido @${nuevo.split('@')[0]} al casino del grupo! Escribe *menu* para jugar.`,
              mentions: [nuevo]
            });
          }
        }
      } catch (error) {
        console.log('Error en grupo:', error.message);
      }
    });

    // ================= MANEJAR MENSAJES =================
    sock.ev.on('messages.upsert', async (m) => {
      const msg = m.messages[0];
      if (!msg.message || msg.key.fromMe) return;
      
      const from = msg.key.remoteJid;
      const texto = (msg.message.conversation || '').trim();
      const nombre = msg.pushName || 'Jugador';
      const esGrupo = from.endsWith('@g.us');
      
      console.log(`${esGrupo ? '👥' : '👤'} ${nombre}: ${texto}`);
      
      const jugador = obtenerJugador(from, nombre);
      const comando = texto.toLowerCase();
      let respuesta = '';
      
      // ================= COMANDOS GENERALES =================
      if (comando === 'menu' || comando === 'help') {
        respuesta = `🎰 *CASINO WHATSAPP BOT*\n\n` +
                   `👤 ${jugador.nombre}\n` +
                   `💰 *Saldo:* $${jugador.dinero}\n` +
                   `🎯 *Apuesta:* $${jugador.apuesta}\n\n` +
                   `*🎮 COMANDOS:*\n` +
                   `🎲 *dados* - Jugar a los dados\n` +
                   `💰 *apuesta 200* - Cambiar tu apuesta\n` +
                   `📊 *saldo* - Ver tu dinero\n` +
                   `🎁 *bonus* - Bono diario GRATIS\n` +
                   `🏆 *top* - Ranking ${esGrupo ? 'del grupo' : 'global'}\n` +
                   `❓ *ayuda* - Ver esta ayuda`;
        
      } else if (comando === 'dados') {
        const resultado = jugarDados(jugador);
        respuesta = resultado.error || resultado.resultado;
        
      } else if (comando.startsWith('apuesta')) {
        const partes = comando.split(' ');
        if (partes[1]) {
          const cantidad = parseInt(partes[1]);
          if (cantidad >= 10 && cantidad <= jugador.dinero) {
            jugador.apuesta = cantidad;
            respuesta = `✅ *APUESTA ACTUALIZADA*\n\nNueva apuesta: *$${cantidad}*`;
          } else {
            respuesta = `❌ *CANTIDAD INVÁLIDA*\n\nMínimo: $10\nMáximo: $${jugador.dinero}`;
          }
        } else {
          respuesta = `🎯 *APUESTA ACTUAL:* $${jugador.apuesta}\n\nUsa: *apuesta 200*`;
        }
        
      } else if (comando === 'saldo' || comando === 'dinero') {
        respuesta = `💰 *ESTADO DE CUENTA*\n\n` +
                   `Jugador: ${jugador.nombre}\n` +
                   `Saldo actual: *$${jugador.dinero}*\n` +
                   `Apuesta: *$${jugador.apuesta}*\n` +
                   `Juegos: ${jugador.juegos}\n` +
                   `Ganancias netas: *$${jugador.ganancias}*`;
        
      } else if (comando === 'bonus' || comando === 'bono') {
        const bono = darBono(jugador);
        respuesta = bono.error || bono.resultado;
        
      } else if (comando === 'top' || comando === 'ranking') {
        if (esGrupo) {
          respuesta = rankingGrupo(from);
        } else {
          respuesta = `🏆 *RANKING GLOBAL*\n\n(Para ranking del grupo, úsalo dentro de un grupo)`;
        }
        
      } else if (comando === 'ayuda') {
        respuesta = `❓ *AYUDA - CASINO BOT*\n\n` +
                   `*🎮 CÓMO JUGAR:*\n` +
                   `1. Configura tu apuesta con *apuesta 200*\n` +
                   `2. Juega con *dados*\n` +
                   `3. Reclama bono diario con *bonus*\n` +
                   `4. Sigue jugando y sube en el ranking!\n\n` +
                   `*📋 COMANDOS:*\n` +
                   `• *menu* - Ver menú\n` +
                   `• *dados* - Jugar dados\n` +
                   `• *apuesta 200* - Cambiar apuesta\n` +
                   `• *saldo* - Ver dinero\n` +
                   `• *bonus* - Bono diario\n` +
                   `• *top* - Ver ranking\n` +
                   `• *ayuda* - Esta ayuda\n\n` +
                   `*⚠️ REGLAS:*\n` +
                   `- Apuesta mínima: $10\n` +
                   `- Bono diario: 1 por día\n` +
                   `- ¡Diviértete responsablemente!`;
        
      } else if (comando === 'hola' || comando === 'hi') {
        respuesta = `🎰 *¡Hola ${jugador.nombre}!*\n\n` +
                   `Bienvenido al Casino WhatsApp Bot\n` +
                   `Tu saldo inicial: *$${jugador.dinero}*\n\n` +
                   `Escribe *menu* para ver los juegos.`;
        
      } else if (comando === 'invitar' && esGrupo) {
        respuesta = `📱 *INVITAR AMIGOS*\n\n` +
                   `Comparte este grupo con amigos para que jueguen al casino.\n` +
                   `¡Cuantos más jugadores, más divertido! 🎉`;
        
      } else if (comando === 'reglas' && esGrupo) {
        respuesta = `📜 *REGLAS DEL GRUPO*\n\n` +
                   `1. Respetar a todos los jugadores\n` +
                   `2. No spam de comandos\n` +
                   `3. Jugar responsablemente\n` +
                   `4. ¡Diviértete y gana mucho! 🎰`;
        
      } else if (texto.includes('@') && esGrupo) {
        // Si mencionan a alguien con @
        respuesta = `🎰 ¡Mencionaste a alguien! Invítalos a jugar con *dados*`;
      }
      
      // ================= ENVIAR RESPUESTA =================
      if (respuesta) {
        try {
          // En grupos, mencionar al jugador que escribió
          if (esGrupo && !comando.includes('@')) {
            const mencion = `@${msg.key.participant.split('@')[0]}\n\n`;
            respuesta = mencion + respuesta;
            
            await sock.sendMessage(from, {
              text: respuesta,
              mentions: [msg.key.participant]
            });
          } else {
            await sock.sendMessage(from, { text: respuesta });
          }
          
          console.log(`📤 Respuesta enviada a ${nombre}`);
        } catch (error) {
          console.log('Error enviando mensaje:', error.message);
        }
      }
    });

    // ================= MANEJO DE ERRORES =================
    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'close') {
        console.log('🔌 Conexión cerrada, reconectando...');
        setTimeout(iniciarBot, 5000);
      }
    });

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.log('🔄 Reconectando en 10 segundos...');
    setTimeout(iniciarBot, 10000);
  }
}

// ================= INICIAR BOT =================
iniciarBot();

// ================= MANEJAR ERRORES GLOBALES =================
process.on('unhandledRejection', (error) => {
  console.log('⚠️ Error no manejado:', error.message);
});

console.log('🚀 Bot inicializado correctamente');
