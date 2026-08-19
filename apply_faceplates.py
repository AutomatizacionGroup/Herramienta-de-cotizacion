import re

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
            
        matches = re.finditer(r'C4-FP[1-6]', content)
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

# Update catalogo.js
with open('webapp/catalogo.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

# Make sure they are in their own category
js_content = js_content.replace("linea: 'LUX', // We can filter this generically\n          tipo: 'Faceplate',", "linea: 'Faceplates',\n          tipo: 'Faceplate',")

for target_id, url in results.items():
    # target_id like C4-FP1. We need to match partNumber: 'C4-FP1-XX'
    target_part = target_id + '-XX'
    pattern = r"(partNumber:\s*'" + re.escape(target_part) + r"'.*?img:\s*')[^']+(\')"
    js_content = re.sub(pattern, r"\g<1>" + url + r"\g<2>", js_content, flags=re.DOTALL)

with open('webapp/catalogo.js', 'w', encoding='utf-8') as f:
    f.write(js_content)
    
print("Updated catalogo.js successfully.")
