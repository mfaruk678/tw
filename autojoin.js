const appendJoinListSafe = require('./joinlist');
const { isGroupCodeExistJoin } = require('./joinlist');
const { OWNER_JID, minMember } = require('./commands');

let joinSuccessGlobalCounter = 0;
let joinlivePaused = false;
let pauseTimer = null;

async function processAutoJoin(sock, links, sendProgressFn, sharedBy = '') {
    let results = [], success = [], expired = [], failed = [];

    for (let idx = 0; idx < links.length; idx++) {
        if (joinlivePaused) break;

        const link = links[idx];
        const code = link.split('/').pop();

        if (isGroupCodeExistJoin(link)) {
            results.push({ link, status: 'duplikat', name: '' });
            continue;
        }

        try {
            const info = await sock.groupGetInviteInfo(code);
            if (!info.id) throw new Error('Invalid group');
            if (info.isExpired) {
                expired.push(link);
                results.push({ link, status: 'kadaluarsa', name: info.subject });
                continue;
            }

            // HANYA JOIN KALAU MEMBER >= minMember
            if ((info.size || 0) < minMember()) {
                results.push({ link, status: `member kurang dari ${minMember()}`, name: info.subject });
                continue;
            }

            await sock.groupAcceptInvite(code);
            success.push({ link, info });
            results.push({ link, status: 'berhasil', name: info.subject });

            joinSuccessGlobalCounter++;
            await new Promise(res => setTimeout(res, 2000));

            if (joinSuccessGlobalCounter >= 60) {
                joinlivePaused = true;
                if (typeof sock.sendMessage === 'function') {
                    await sock.sendMessage(
                        OWNER_JID,
                        { text: `⏸️ JoinLive di-pause otomatis selama 30 menit karena sudah join 60 grup. Akan lanjut otomatis setelah jeda.` }
                    );
                }

                pauseTimer = setTimeout(() => {
                    joinlivePaused = false;
                    joinSuccessGlobalCounter = 0;
                    if (typeof sock.sendMessage === 'function') {
                        sock.sendMessage(
                            OWNER_JID,
                            { text: `✅ JoinLive aktif lagi, proses join lanjut!` }
                        );
                    }
                }, 1800000); // 30 menit
                break;
            }
        } catch (e) {
            failed.push(link);
            results.push({ link, status: 'gagal', error: e.message });
        }
    }

    if (success.length > 0) appendJoinListSafe(success.map(s => ({
        link: s.link,
        info: s.info,
        sharedBy
    })));

    const summary = [
        `*AutoJoin Selesai*`,
        `Berhasil: ${success.length}`,
        `Gagal: ${failed.length}`,
        `Link Kadaluarsa: ${expired.length}`,
        ``,
        ...results.slice(0, 10).map((r,i) =>
            `${i+1}. ${r.link}\n   Status: ${r.status}${r.name ? `\n   Nama: ${r.name}` : ''}${r.error ? `\n   Error: ${r.error}` : ''}`
        ),
        results.length > 10 ? `\nDan ${results.length-10} lagi...` : ''
    ].join('\n');

    return summary;
}

module.exports = processAutoJoin;