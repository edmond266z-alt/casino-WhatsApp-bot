// CASINO WHATSAPP BOT - VERSIÓN SIMPLE
const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

console.log('🎰 CASINO BOT INICIANDO...\n');

let players = {};

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', ({ qr }) => {
        if (qr) {
            console.log('\n📱 ESCANEA ESTE QR:\n');
            qrcode.generate(qr, { small: true });
        }
    });
    
    sock.ev.on('connection.update', ({ connection }) => {
        if (connection === 'open') {
            console.log('✅ ¡CONECTADO! Envía "menu" al bot');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        
        const from = msg.key.remoteJid;
        const text = (msg.message.conversation || '').toLowerCase().trim();
        const name = msg.pushName || 'Amigo';
        
        if (!players[from]) {
            players[from] = { money: 1000, bet: 100, name: name };
        }
        
        const p = players[from];
        let reply = '';
        
        if (text === 'menu') {
            reply = `🎰 CASINO BOT\n\n💰 $${p.money} | 🎯 $${p.bet}\n\n🎲 dados - Jugar\n💰 apuesta 200 - Cambiar\n📊 saldo - Ver dinero\n🎁 bonus - Bono gratis`;
        
        } else if (text === 'dados') {
            if (p.bet > p.money) {
                reply = `❌ Necesitas $${p.bet}, tienes $${p.money}`;
            } else {
                const d1 = Math.floor(Math.random()*6)+1;
                const d2 = Math.floor(Math.random()*6)+1;
                const sum = d1 + d2;
                
                reply = `🎲 ${d1}+${d2}=${sum}\n`;
                
                if (sum === 7 || sum === 11) {
                    const win = p.bet * 4;
                    p.money += win;
                    reply += `🎉 JACKPOT! +$${win}`;
                } else if (sum >= 8 && sum <= 10) {
                    const win = p.bet * 2;
                    p.money += win;
                    reply += `✅ GANASTE! +$${win}`;
                } else {
                    p.money -= p.bet;
                    reply += `❌ Perdiste -$${p.bet}`;
                }
                
                reply += `\n💰 Ahora: $${p.money}`;
            }
        
        } else if (text.startsWith('apuesta')) {
            const num = parseInt(text.split(' ')[1]);
            if (num >= 10 && num <= p.money) {
                p.bet = num;
                reply = `✅ Apuesta: $${num}`;
            } else {
                reply = `❌ Entre $10 y $${p.money}`;
            }
        
        } else if (text === 'saldo') {
            reply = `💰 $${p.money}\n🎯 $${p.bet}`;
        
        } else if (text === 'bonus') {
            const bonus = Math.floor(Math.random()*100)+50;
            p.money += bonus;
            reply = `🎁 +$${bonus}\n💰 $${p.money}`;
        
        } else if (text === 'hola') {
            reply = `🎰 ¡Hola ${p.name}! Escribe "menu"`;
        
        } else {
            reply = `Envía "menu" para comenzar`;
        }
        
        if (reply) await sock.sendMessage(from, { text: reply });
    });
}

start().catch(console.error);
