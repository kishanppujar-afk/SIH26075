path = "C:/Users/kisha/OneDrive/Desktop/cap sih/SkillStatAI-manager-admin-ui/src/components/AdminMaterialsQuiz.jsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

target = '<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">'
new_tabs = """<div className="flex gap-2 mb-6 border-b border-[#EDEBE6] pb-2">
          {['quiz_studio', 'publisher', 'telemetry', 'profile'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${activeTab === tab ? 'bg-[#14140F] text-white' : 'text-[#5B5850] hover:bg-[#FAFAF9]'}`}
            >
              {tab === 'quiz_studio' ? 'RAG Quiz Generator' : tab === 'publisher' ? 'Upload Notes & PPTs' : tab === 'telemetry' ? 'Trainee Telemetry' : 'Trainer Profile'}
            </button>
          ))}
        </div>

        {activeTab === 'publisher' && <PublisherLibraryTab />}
        {activeTab === 'telemetry' && <TraineeTelemetryTab />}
        {activeTab === 'profile' && <TrainerProfileTab />}

        {activeTab === 'quiz_studio' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">"""

if "Upload Notes & PPTs" not in content:
    content = content.replace(target, new_tabs, 1)
    # add the closing brace
    content = content.replace("        </div>\n      </div>\n  );\n}", "          </div>\n        )}\n      </div>\n    </div>\n  );\n}")
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Injected successfully.")
