const fs = require('fs');

function scrub(file) {
    let content = fs.readFileSync(file, 'utf8');
    // Replace all non-ASCII characters
    content = content.replace(/[^\x00-\x7F]/g, '');
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Scrubbed ${file}`);
}

scrub('public/main.js');
scrub('public/index.html');
