path = "C:/Users/kisha/OneDrive/Desktop/cap sih/SkillStatAI-manager-admin-ui/src/components/AdminMaterialsQuiz.jsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

import re

# Find the block around Trash2
bad_pattern = r"""                        >\n                          <Trash2 size=\{13\} />\n                        </button>\n.*?\}\)\}"""

good_replacement = """                        >
                          <Trash2 size={13} />
                        </button>
                        </div>
                      </div>
                    );
                  })}"""

content = re.sub(bad_pattern, good_replacement, content, flags=re.DOTALL)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed map block.")
