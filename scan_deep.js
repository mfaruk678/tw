// scan_deep.js - Cek validasi join link, simpan info creator

async function scanDeep(links, sock) {

    const validLinks = [];

    for (const link of links) {

        const code = link.split('/').pop();

        try {

            const info = await sock.groupGetInviteInfo(code);

            if (info.id) {

                validLinks.push({ link, info: { ...info, creator: info.creator || '' } });

            }

        } catch { }

    }

    return validLinks;

}

module.exports = scanDeep;