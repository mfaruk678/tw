// catch_all.js - Tangkap SEMUA link grup WA

const groupLinkPattern = /https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{22}/g;

function catchAll(message) {

    return message.match(groupLinkPattern) || [];

}

module.exports = catchAll;