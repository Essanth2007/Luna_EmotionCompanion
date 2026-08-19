import importlib.metadata, json
pkgs = ["openai", "pytest", "httpx"]
result = {}
for p in pkgs:
    try:
        result[p] = importlib.metadata.version(p)
    except Exception as e:
        result[p] = f"ERROR: {e}"
with open(r"C:\Users\dhivy\AppData\Local\Temp\pkg_versions.txt", "w") as f:
    json.dump(result, f)
