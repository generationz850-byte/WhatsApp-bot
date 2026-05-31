const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, isJidBroadcast } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');
const CommandHandler = require('./handlers/commandHandler');
const qrcode = require('qrcode-terminal');

const authDir = path.join(__dirname, '../auth_info');

async function startBot() {
    logger.info('🤖 Starting WhatsApp Bot...');
    
    // Create auth directory if it doesn't exist
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
        logger.info(`📁 Created auth directory at ${authDir}`);
    }

    try {
        const { state, saveCreds } = await useMultiFileAuthState(authDir);
        
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            generateHighQualityLinkPreview: true,
            browser: ['WhatsApp Bot', 'Chrome', '2.2400.1']
        });

        // Handle connection updates
        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                console.log('\n\n');
                console.log('=====================================');
                console.log('📱 QR Code Generated!');
                console.log('Scan with WhatsApp on your phone:');
                console.log('Settings > Linked Devices > Link a Device');
                console.log('=====================================\n');
                qrcode.generate(qr, { small: true });
                console.log('\n=====================================\n');
                logger.info('📱 QR Code generated. Scan it with WhatsApp to authenticate.');
            }
            
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                logger.error(`❌ Connection closed. Reason: ${lastDisconnect?.error?.output?.statusCode}`);
                if (shouldReconnect) {
                    logger.info('🔄 Reconnecting in 3 seconds...');
                    setTimeout(() => startBot(), 3000);
                } else {
                    logger.error('🚫 Bot logged out. Please re-authenticate.');
                }
            } else if (connection === 'open') {
                logger.info('✅ Bot connected successfully!');
                console.log('\n\n');
                console.log('╔═══════════════════════════════════╗');
                console.log('║   ✅ BOT IS NOW RUNNING ✅        ║');
                console.log('║   Ready to receive messages!      ║');
                console.log('╚═══════════════════════════════════╝');
                console.log('\n');
            } else if (connection === 'connecting') {
                logger.info('⏳ Connecting to WhatsApp...');
            }
        });

        // Save credentials whenever they're updated
        sock.ev.on('creds.update', saveCreds);

        // Handle incoming messages
        sock.ev.on('messages.upsert', async (m) => {
            try {
                for (const message of m.messages) {
                    // Skip messages sent by the bot and broadcast messages
                    if (message.key.fromMe || isJidBroadcast(message.key.remoteJid)) {
                        continue;
                    }

                    const senderJid = message.key.remoteJid;
                    const senderName = message.pushName || senderJid;
                    
                    // Extract message content
                    let messageContent = '';
                    if (message.message?.conversation) {
                        messageContent = message.message.conversation;
                    } else if (message.message?.extendedTextMessage?.text) {
                        messageContent = message.message.extendedTextMessage.text;
                    } else if (message.message?.imageMessage?.caption) {
                        messageContent = message.message.imageMessage.caption;
                    } else {
                        messageContent = '[Media or unknown message type]';
                    }

                    logger.info(`📨 Message from ${senderName} (${senderJid}): ${messageContent}`);

                    // Process the message with command handler
                    await CommandHandler.handle(sock, message, senderJid, messageContent);
                }
            } catch (error) {
                logger.error(`Error processing message: ${error.message}`);
            }
        });

        // Handle group updates
        sock.ev.on('groups.update', async (groupUpdates) => {
            for (const update of groupUpdates) {
                logger.info(`📢 Group update: ${JSON.stringify(update)}`);
            }
        });

        // Handle chat updates (typing, etc.)
        sock.ev.on('message-status.update', (messageStatus) => {
            logger.debug(`Message status update: ${JSON.stringify(messageStatus)}`);
        });

    } catch (error) {
        logger.error(`Fatal error: ${error.message}`);
        logger.error(`Stack: ${error.stack}`);
        process.exit(1);
    }
}

// Start the bot
startBot().catch(err => {
    logger.error(`Failed to start bot: ${err.message}`);
    process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    logger.info('🛑 Bot shutting down gracefully...');
    process.exit(0);
});
