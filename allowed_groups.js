// allowed_groups.js - Simpan grup yang boleh akses command

const fs = require('fs');

const filename = 'allowed_groups.json';

function addGroupAllowed(id) {

    let arr = [];

    if (fs.existsSync(filename)) {

        try { arr = JSON.parse(fs.readFileSync(filename)); } catch { arr = []; }

    }

    if (!arr.includes(id)) arr.push(id);

    fs.writeFileSync(filename, JSON.stringify(arr, null, 2));

}

function isGroupAllowed(id) {

    let arr = [];

    if (fs.existsSync(filename)) {

        try { arr = JSON.parse(fs.readFileSync(filename)); } catch { arr = []; }

    }

    return arr.includes(id);

}

function getAllowedGroupList() {

    if (fs.existsSync(filename)) {

        try { return JSON.parse(fs.readFileSync(filename)); } catch { return []; }

    }

    return [];

}

module.exports = { addGroupAllowed, isGroupAllowed, getAllowedGroupList };