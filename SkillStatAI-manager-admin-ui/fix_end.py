path = "C:/Users/kisha/OneDrive/Desktop/cap sih/SkillStatAI-manager-admin-ui/src/components/AdminMaterialsQuiz.jsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

idx = content.rfind("          ) : (")
new_end = """          ) : (
            <div className="bg-white border border-[#EDEBE6] rounded-2xl p-12 text-center text-[#5B5850]">
              <FileText size={36} className="mx-auto text-[#A8A59C] mb-3" />
              <p className="text-base font-semibold text-[#14140F]">No Document Selected</p>
              <p className="text-xs text-[#5B5850] mt-1 max-w-sm mx-auto">
                Upload a training PDF or text document, or select one from the library on the left to review chunks and generate quizzes.
              </p>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
  );
}"""

content = content[:idx] + new_end
with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Replaced end.")
