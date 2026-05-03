const fs = require('fs');
const path = require('path');

const dir = 'c:\\1\\Beginner-Coding-Practice-Tracker\\public';

function cleanFile(filename) {
    const p = path.join(dir, filename);
    let content = fs.readFileSync(p, 'utf8');
    
    // Replace the em-dash in various forms
    content = content.replace(/—/g, '-');
    content = content.replace(/ΓÇö/g, '-');
    content = content.replace(/â€”/g, '-');
    
    // Remove emojis that might be causing issues
    content = content.replace(/🌱/g, '');
    content = content.replace(/ðŸŒ±/g, '');
    content = content.replace(/≡ƒî▒/g, '');
    content = content.replace(/ΓÜí/g, '');
    
    fs.writeFileSync(p, content, 'utf8');
    console.log(`Cleaned ${filename}`);
}

cleanFile('index.html');
cleanFile('main.js');
