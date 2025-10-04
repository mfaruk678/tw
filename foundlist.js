const fs = require('fs');

const queueWriteFoundlist = require('./foundlist_writer');

function extractGroupCode(link) {

    try { return link.split('/').pop(); } catch { return link; }

}

function appendFoundListSafe(linksWithInfo, filename = 'foundlist.json') {

    let latest = [];

    if (fs.existsSync(filename)) {

        try { latest = JSON.parse(fs.readFileSync(filename)); } catch { latest = []; }

    }

    const foundMap = {};

    latest.forEach(d => { const code = extractGroupCode(d.link); foundMap[code] = d; });

    linksWithInfo.forEach(({ link, info, sharedBy }) => {

        const code = extractGroupCode(link);

        if (!foundMap[code]) {

            foundMap[code] = {

                link,

                id: info.id,

                name: info.subject,

                memberCount: info.size,

                creator: info.creator || '',

                sharedBy: sharedBy || '',

            };

        }

    });

    queueWriteFoundlist(Object.values(foundMap), filename, 5);

}

function isGroupCodeExist(link, filename = 'foundlist.json') {

    if (!fs.existsSync(filename)) return false;

    try {

        const existing = JSON.parse(fs.readFileSync(filename));

        const code = extractGroupCode(link);

        return !!existing.find(d => extractGroupCode(d.link) === code);

    } catch { return false; }

}

module.exports = appendFoundListSafe;

module.exports.isGroupCodeExist = isGroupCodeExist;