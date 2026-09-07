const fs = require('fs');
let code = fs.readFileSync('src/pages/Prescription.tsx', 'utf8');

// The original file is severely corrupted by the regex.
// I will just download the original file from the workspace history if possible? No, I don't have that.
// Let's replace '}}' with '}' where it's structurally wrong.
code = code.replace(/\)\}\}/g, ')}');

fs.writeFileSync('src/pages/Prescription.tsx', code);
