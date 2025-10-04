// scan_quick.js - Cepat, regex saja

const groupLinkPattern = /https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{22}/g;

function scanQuick(message) {

    const links = message.match(groupLinkPattern) || [];

    return links;

}

module.exports = scanQuick;