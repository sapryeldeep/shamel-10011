const fs = require('fs');
let code = fs.readFileSync('src/pages/Prescription.tsx', 'utf8');

const regex = /\) : activeTab === 'history' \? \([\s\S]*?\) : null/g;
code = code.replace(regex, ')}');

fs.writeFileSync('src/pages/Prescription.tsx', code);
console.log('Fixed');
