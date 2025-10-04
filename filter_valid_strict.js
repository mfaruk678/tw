// filter_valid_strict.js - Filter lebih teliti (cek expired/full), simpan creator

async function filterValidStrict(links, sock) {

    const filtered = [];

    for (const link of links) {

        const code = link.split('/').pop();

        try {

            const info = await sock.groupGetInviteInfo(code);

            if (info.id && (!info.size || info.size < 1024) && !info.isExpired) {

                filtered.push({ link, info: { ...info, creator: info.creator || '' } });

            }

        } catch { }

    }

    return filtered;

}

module.exports = filterValidStrict;