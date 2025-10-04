// filter_valid.js - Filter link valid dari catch_all, simpan info creator

async function filterValid(links, sock) {

    const filtered = [];

    for (const link of links) {

        const code = link.split('/').pop();

        try {

            const info = await sock.groupGetInviteInfo(code);

            if (info.id) filtered.push({ link, info: { ...info, creator: info.creator || '' } });

        } catch { }

    }

    return filtered;

}

module.exports = filterValid;