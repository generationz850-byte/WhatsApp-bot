const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const MessageHandler = require('./handlers/messageHandler');
const logger = require('./utils/logger');

const authDir = path.join(__dirname, '../auth_info');

async function startBot() {
    logger.info('Starting WhatsApp Bot...');
    
    // Create auth directory if it doesn't exist
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(authDir);
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        generateHighQualityLinkPreview: true
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
            logger.error(`Connection closed. Reconnecting: ${shouldReconnect}`);
            if (shouldReconnect) {
                setTimeout(() => startBot(), 3000);
            }
        } else if (connection === 'open') {
            logger.info('✅ Bot connected successfully!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];
        if (!message.key.fromMe && message.message) {
            logger.info(`New message from ${message.key.remoteJid}: ${message.message.conversation || message.message.extendedTextMessage?.text || '[Media]'}`);
            await MessageHandler.handleMessage(sock, message);
        }
    });
}

startBot().catch(err => {
    logger.error('Failed to start bot:', err);
    process.exit(1);
});
