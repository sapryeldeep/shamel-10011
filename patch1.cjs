const fs = require('fs');
let code = fs.readFileSync('src/pages/Prescription.tsx', 'utf8');

const replacement = `            <button
              onClick={() => setActiveTab('settings')}
              className={\`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all \${
                activeTab === 'settings' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }\`}
            >
              <Sliders size={16} /> إعدادات وتخصيص قالب الروشتة
            </button>
          )}`;

const regex = /<button[\s\S]*?\) : null}/;
code = code.replace(regex, replacement);

fs.writeFileSync('src/pages/Prescription.tsx', code);
