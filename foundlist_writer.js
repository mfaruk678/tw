const fs = require('fs');

let queue = [];

let writing = false;

function getNextListFilename(basename) {

    let idx = 2;

    while (fs.existsSync(`${basename}${idx}.json`)) idx++;

    return `${basename}${idx}.json`;

}

function queueWriteFoundlist(data, filename = 'foundlist.json', limitMB = 5) {

    queue.push({ data, filename, limitMB });

    processQueue();

}

function processQueue() {

    if (writing || queue.length === 0) return;

    writing = true;

    const { data, filename, limitMB } = queue.shift();

    try {

        if (fs.existsSync(filename)) {

            const stats = fs.statSync(filename);

            if (stats.size > limitMB * 1024 * 1024) {

                const basename = filename.replace(/\.json$/, '');

                const nextFile = getNextListFilename(basename);

                fs.renameSync(filename, nextFile);

                fs.writeFileSync(filename, '[]');

            }

        }

    } catch (e) {

        console.error('Split/rename error:', e);

    }

    fs.writeFile(filename, JSON.stringify(data, null, 2), (err) => {

        writing = false;

        if (err) console.error('Write error:', err);

        processQueue();

    });

}

module.exports = queueWriteFoundlist;