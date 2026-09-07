const fs = require('fs');
let code = fs.readFileSync('src/pages/Prescription.tsx', 'utf8');

const replacement = `        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('create')}
            className={\`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all \${
              activeTab === 'create' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }\`}
          >
            <Stethoscope size={16} /> تحرير الروشتة والأدوية
          </button>
          
          {(isDeveloper || currentClinic?.allowPrescriptionCustomHeader !== false) && (
            <button
              onClick={() => setActiveTab('settings')}
              className={\`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all \${
                activeTab === 'settings' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }\`}
            >
              <Sliders size={16} /> إعدادات وتخصيص قالب الروشتة
            </button>
          )}

          <button`;

const regex = /<div className="flex items-center gap-2">[\s\S]*?<button\s+onClick=\{\(\) => setActiveTab\('history'\)\}/;
code = code.replace(regex, replacement + `\n            onClick={() => setActiveTab('history')}`);

fs.writeFileSync('src/pages/Prescription.tsx', code);
