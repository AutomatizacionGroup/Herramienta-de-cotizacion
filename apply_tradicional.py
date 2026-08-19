import re
import sys

files = [
    'Configurable keypad tradicional.html',
    'Keypad dimmer tradicional.html'
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
                if 'C4-KC' in sku: root_sku = 'c4_kcb_trad' # mapping to the ID in catalogo
                elif 'C4-KD' in sku: root_sku = 'c4_kd120_trad'
                else: continue
                
                if root_sku not in results:
                    results[root_sku] = img_match.group(1)
    except Exception as e:
        print(f"Error processing {filename}: {e}")

print("Images found:")
for k, v in results.items():
    print(k, "->", v)

if not results:
    print("No images found.")
    sys.exit()

# Update catalogo.js by finding the object with id: 'c4_kcb_trad' etc.
with open('webapp/catalogo.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

for target_id, url in results.items():
    # Regex to find id: 'target_id' and replace its img: '...'
    # format: id: 'c4_kcb_trad', ... img: 'https://...',
    pattern = r"(id:\s*'" + re.escape(target_id) + r"'.*?img:\s*')[^']+(\')"
    js_content = re.sub(pattern, r"\g<1>" + url + r"\g<2>", js_content, flags=re.DOTALL)

with open('webapp/catalogo.js', 'w', encoding='utf-8') as f:
    f.write(js_content)
print("Updated catalogo.js successfully.")
