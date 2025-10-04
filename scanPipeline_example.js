// Tambahkan/ubah kode di pipeline join (setelah sukses join grup)

const { saveOrUpdateGroup } = require('./joined_groups');

// ... setelah berhasil join grup newGroupId ...

const groupId = newGroupId;

let groupMetadata = {};

try {

    groupMetadata = await sock.groupMetadata(groupId);

} catch { }

const admins = (groupMetadata.participants || []).filter(p => p.admin).map(a => '+' + a.id.replace(/@.+$/, ''));

const members = (groupMetadata.participants || []).map(p => '+' + p.id.replace(/@.+$/, ''));

const count62 = members.filter(m => m.startsWith('+62')).length;

const count60 = members.filter(m => m.startsWith('+60')).length;

let majority = '';

if (count62 > count60) majority = '+62';

else if (count60 > count62) majority = '+60';

else majority = 'other';

let inviteCode = '';

try {

    inviteCode = await sock.groupInviteCode(groupId);

} catch { }

const groupObj = {

    id: groupId,

    name: groupMetadata.subject,

    memberCount: groupMetadata.size,

    creator: (groupMetadata.owner ? '+' + groupMetadata.owner.replace(/@.+$/, '') : ''),

    majority,

    link: inviteCode ? `https://chat.whatsapp.com/${inviteCode}` : '',

    admins

};

saveOrUpdateGroup(groupObj);