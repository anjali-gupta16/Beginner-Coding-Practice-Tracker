const fs = require('fs');
const js = fs.readFileSync('public/app.js', 'utf8');
const css = fs.readFileSync('public/app.css', 'utf8');
let html = fs.readFileSync('public/index.html', 'utf8');

// Inline CSS
html = html.replace('<link rel="stylesheet" href="app.css">', '<style>\n' + css + '\n</style>');

// Inline JS
html = html.replace('<script src="app.js"></script>', '<script>\n' + js + '\n</script>');

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Done! Inlined JS and CSS. HTML size:', html.length, 'bytes');
