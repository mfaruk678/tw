const fs = require('fs');

const queueWriteFoundlist = require('./foundlist_writer');

function extractGroupCode(link) {

    try { return link.split('/').pop(); } catch { return link; }

}

function appendJoinListSafe(groupsWithInfo, filename = 'joinlist.json') {

    let latest = [];

    if (fs.existsSync(filename)) {

        try { latest = JSON.parse(fs.readFileSync(filename)); } catch { latest = []; }

    }

    const joinMap = {};

    latest.forEach(d => { const code = extractGroupCode(d.link); joinMap[code] = d; });

    groupsWithInfo.forEach(({ link, info, sharedBy }) => {

        const code = extractGroupCode(link);

        if (!joinMap[code]) {

            joinMap[code] = {

                link,

                id: info.id,

                name: info.subject,

                memberCount: info.size,

                creator: info.creator || '',

                sharedBy: sharedBy || '',

            };

        }

    });

    queueWriteFoundlist(Object.values(joinMap), filename, 5);

}

function isGroupCodeExistJoin(link, filename = 'joinlist.json') {

    if (!fs.existsSync(filename)) return false;

    try {

        const existing = JSON.parse(fs.readFileSync(filename));

        const code = extractGroupCode(link);

        return !!existing.find(d => extractGroupCode(d.link) === code);

    } catch { return false; }

}

module.exports = appendJoinListSafe;

module.exports.isGroupCodeExistJoin = isGroupCodeExistJoin;