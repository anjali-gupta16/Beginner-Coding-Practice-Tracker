const fs = require('fs');
const t = fs.readFileSync('public/app.js', 'utf8');
console.log('ranks fixed:', t.includes("rankDisplay = '1';"));
console.log('badge mat icon:', t.includes('military_tech'));
console.log('mood-emoji removed:', !t.includes('mood-emoji'));
console.log('shoutout-emoji removed:', !t.includes('shoutout-emoji'));
