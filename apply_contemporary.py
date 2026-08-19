import re

files = [
    'Auxiliary keypad comtenporary.html',
    'Configurable keypad contemporary.html',
    'Keypad dimmer contemporary.html',
    'Switch, Contemporary.html'
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
                # E.g. C4-KCB-C-BL -> root is C4-KCB
                root_sku = '-'.join(sku.split('-')[:2]) 
                # wait, C4-KCB is 2 parts. C4-SW120277 is 2 parts. C4-KD120 is 2 parts.
                
                # Special cases if prefix is different
                if 'C4-SW120277' in sku: root_sku = 'C4-SW120277'
                elif 'C4-KD120' in sku: root_sku = 'C4-KD120'
                elif 'C4-KCB' in sku: root_sku = 'C4-KCB'
                elif 'C4-KA' in sku: root_sku = 'C4-KA'
                
                if root_sku not in results:
                    results[root_sku] = img_match.group(1)
    except Exception as e:
        print(f"Error processing {filename}: {e}")

print("Images found:")
for k, v in results.items():
    print(k, "->", v)

# Update catalogo.js directly
if results:
    with open('webapp/catalogo.js', 'r', encoding='utf-8') as f:
        js_content = f.read()

    for root_sku, url in results.items():
        # The partNumber in catalogo.js is 'C4-KCB-XX'
        target_part = root_sku + '-XX'
        pattern = r"(partNumber:\s*'" + re.escape(target_part) + r"'.*?img:\s*')[^']+(\')"
        js_content = re.sub(pattern, r"\g<1>" + url + r"\g<2>", js_content, flags=re.DOTALL)

    with open('webapp/catalogo.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
    print("Updated catalogo.js successfully.")
else:
    print("No images found to update.")
