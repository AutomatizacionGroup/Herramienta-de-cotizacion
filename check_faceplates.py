import re
import json

files = [
    'Faceplates.html',
    'Faceplates 2.html',
    'Faceplates 3.html'
]

results = {}

for filename in files:
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
            
        matches = re.finditer(r'C4-[A-Z0-9\-]+', content)
        for match in matches:
            sku = match.group(0)
            start = max(0, match.start() - 200)
            end = min(len(content), match.end() + 200)
            context = content[start:end]
            
            img_match = re.search(r'url\(&quot;(https://res\.cloudinary\.com/[^&]+)&quot;\)', context)
            if img_match:
                if sku not in results:
                    results[sku] = img_match.group(1)
    except Exception as e:
        print(f"Error processing {filename}: {e}")

print("Images found:")
for k, v in results.items():
    print(k, "->", v)

