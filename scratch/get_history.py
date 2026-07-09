import json

log_path = r"C:\Users\vishal AV\.gemini\antigravity-ide\brain\57260b46-8b5e-4b23-bdc1-a8ff0fff4539\.system_generated\logs\transcript.jsonl"
out_path = r"c:\Users\vishal AV\Downloads\king\scratch\history.txt"

with open(log_path, "r", encoding="utf-8") as f, open(out_path, "w", encoding="utf-8") as out:
    for line in f:
        try:
            data = json.loads(line)
            if data.get("type") == "USER_INPUT":
                out.write("=== USER INPUT ===\n")
                out.write(data.get("content", ""))
                out.write("\n\n")
        except Exception as e:
            out.write(f"Error parsing line: {e}\n")
print("Done writing history to", out_path)
