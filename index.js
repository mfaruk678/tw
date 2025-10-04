const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const scanQuick = require('./scan_quick');
const processAutoJoin = require('./autojoin');
const { joinliveActive, OWNER_JID, minMember } = require('./commands');
const appendFoundListSafe = require('./foundlist');
const appendJoinListSafe = require('./joinlist');
const { isGroupCodeExist } = require('./foundlist');
const { isGroupCodeExistJoin } = require('./joinlist');
const handleCommand = require('./commands');

const recentCache = new Map();

function cacheLink(link) {
    const code = link.split('/').pop();
    recentCache.set(code, Date.now());
}

function isLinkInCache(link) {
    const code = link.split('/').pop();
    const last = recentCache.get(code);
    if (!last) return false;
    if (Date.now() - last < 3600000) return true;
    recentCache.delete(code);
    return false;
}

let scanState = "Idle";
const getScanState = () => scanState;
const setScanState = (v) => { scanState = v; };

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        version
    });

    sock.ev.on('connection.update', (update) => {
        const { qr, connection, lastDisconnect } = update;
        if (qr) {
            qrcode.generate(qr, { small: true });
            console.log("Scan QR di atas menggunakan WhatsApp!");
        }
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== 401);
            console.log('Connection closed. Reconnect?', shouldReconnect);
        } else if (connection === 'open') {
            console.log('Connected to WhatsApp!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg.message || msg.key.fromMe) return;
            const isGroup = msg.key.remoteJid.endsWith('@g.us');
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

            if (text.startsWith('.')) {
                const [command, ...args] = text.trim().split(/\s+/);
                await handleCommand(command, sock, msg, args, getScanState, setScanState);
                return;
            }

            if (!isGroup) return;

            const links = scanQuick(text);
            if (!links.length) return;

            const sender = msg.key.participant ? ('+' + msg.key.participant.split('@')[0]) : '-';

            for (const link of links) {
                if (isLinkInCache(link)) continue;
                cacheLink(link);

                // Jika joinlive aktif, auto join langsung
                if (joinliveActive && joinliveActive()) {
                    await processAutoJoin(sock, [link], null, sender);
                    await new Promise(res => setTimeout(res, 2000));
                }
                // Jika scanlive aktif tapi joinlive tidak aktif, hanya simpan ke foundlist
                else if (getScanState() === "Running") {
                    if (!isGroupCodeExist(link)) {
                        const code = link.split('/').pop();
                        let groupInfo = { id: '', subject: '', size: 0 };
                        try {
                            const info = await sock.groupGetInviteInfo(code);
                            groupInfo = {
                                id: info.id || '',
                                subject: info.subject || '',
                                size: info.size || 0
                            };
                            // SIMPAN HANYA KALAU MEMBER >= minMember
                            if (groupInfo.size >= minMember()) {
                                appendFoundListSafe([{
                                    link,
                                    info: groupInfo,
                                    sharedBy: sender
                                }]);
                            }
                        } catch (e) {
                            // Info gagal diambil, tetap tidak disimpan
                        }
                    }
                }
            }
        } catch (e) {
            console.log('Error handle pesan masuk:', e);
        }
    });
}

startBot();