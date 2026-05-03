const fs = require('fs');
let js = fs.readFileSync('public/app.js', 'utf8');

// 1. Fix leaderboard medals - use text ranks instead of empty emoji strings
js = js.replace(
    "if (idx === 0) rankDisplay = '';",
    "if (idx === 0) rankDisplay = '1';"
);
js = js.replace(
    "else if (idx === 1) rankDisplay = '';",
    "else if (idx === 1) rankDisplay = '2';"
);
js = js.replace(
    "else if (idx === 2) rankDisplay = '';",
    "else if (idx === 2) rankDisplay = '3';"
);

// 2. Fix badge emoji - replace with material icon
js = js.replace(
    '<span class="badge-emoji">${badge.emoji}</span>',
    '<span class="material-icons-outlined" style="font-size:28px;color:var(--primary)">military_tech</span>'
);

// 3. Fix daily challenge completed status (trailing space after emoji)
js = js.replace("'Completed '", "'Completed'");
js = js.replace("' Completed'", "'Completed'");

// 4. Fix toast message
js = js.replace("'Daily Challenge completed! +25 XP '", "'Daily Challenge completed! +25 XP'");

// 5. Fix learning path icon rendering  
// Find the template that uses t.icon and wrap in material icons span
js = js.replace(
    '${t.icon}',
    '<span class="material-icons-outlined">${t.icon}</span>'
);

// 6. Fix mood emojis - show text only (m.emoji is already empty)
// mood items render as: `<span class="mood-emoji">${m.emoji}</span>`
// Replace so the emoji span becomes a material icon based on label
js = js.replace(
    '`<span class="mood-emoji">${m.emoji}</span><span class="mood-label">${m.label}</span>`',
    '`<span class="mood-label">${m.label}</span>`'
);

// 7. Fix motivation emoji div - hide if empty
js = js.replace(
    '`\n                <div class="motivation-emoji">${msg.emoji}</div>',
    '`\n                <div class="motivation-emoji" style="display:none">${msg.emoji}</div>'
);

// 8. Remove shoutout emoji from shoutout cards 
js = js.replace(
    '`<div class="shoutout-card"><span class="shoutout-emoji">${s.emoji}</span><strong>${s.title}</strong><p>${s.text}</p></div>`',
    '`<div class="shoutout-card"><strong>${s.title}</strong><p>${s.text}</p></div>`'
);

fs.writeFileSync('public/app.js', js, 'utf8');
console.log('All icon fixes applied successfully');
