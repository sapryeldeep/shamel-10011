const fs = require('fs');
let code = fs.readFileSync('src/pages/Prescription.tsx', 'utf8');

const regex = / {10}\)\}\n {8}<\/div>\n\n {8}\{\/\* Right Side: Live Prescription Paper Preview & Print Target \*\/\}/;

const historyTab = `
          ) : activeTab === 'history' ? (
            /* Tab 3: Prescription History */
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h6 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <History size={18} className="text-blue-600" /> سجل الروشتات السابقة
                </h6>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
                {(() => {
                  const allRx = Object.entries(state.rxStore || {}).flatMap(([pName, rxArr]) => {
                    return rxArr.map(rx => ({ ...rx, patientName: rx.patientName || pName }));
                  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                  if (allRx.length === 0) {
                    return <div className="text-center py-6 text-slate-400 text-xs font-semibold">لا يوجد روشتات مسجلة حتى الآن</div>;
                  }

                  return allRx.map((rx, idx) => (
                    <div key={rx.id || idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-sm text-slate-800 block mb-1">{rx.patientName}</strong>
                          <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 font-mono">{rx.date}</span>
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                            {rx.drugs?.length || 0} أصناف
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-600 font-semibold mt-1">التشخيص: <span className="text-indigo-700">{rx.diag || rx.diagnosis || '--'}</span></div>
                      
                      <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-200/60">
                        {currentClinic?.allowPrescriptionEdit !== false ? (
                          <button
                            onClick={() => {
                              setEditingRxId(rx.id || rx.date);
                              setEditingRxPatient(rx.patientName);
                              setRxPatient(rx.patientName);
                              setActiveDrugs(rx.drugs || []);
                              setRxDiag(rx.diag || rx.diagnosis || '');
                              setRxNotes(rx.notes || '');
                              if (rx.specialtyFields) setSpecialtyData(rx.specialtyFields);
                              if (rx.specialtyNeeds) setRxSelectedNeeds(rx.specialtyNeeds);
                              setActiveTab('create');
                            }}
                            className="px-4 py-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                          >
                            <Edit3 size={14} /> تعديل وإصدار
                          </button>
                        ) : (
                          <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1">
                            <Lock size={12} /> التعديل مغلق من قبل المطور
                          </span>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          ) : null}
        </div>

        {/* Right Side: Live Prescription Paper Preview & Print Target */}`;

const didMatch = regex.test(code);
console.log("Did match?", didMatch);

code = code.replace(regex, historyTab);

fs.writeFileSync('src/pages/Prescription.tsx', code);
