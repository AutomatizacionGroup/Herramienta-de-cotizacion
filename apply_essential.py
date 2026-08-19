import re
import json

def process_file(filename):
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
            
        matches = re.finditer(r'C4-[A-Z0-9\-]+', content)
        
        results = {}
        for match in matches:
            sku = match.group(0)
            start = max(0, match.start() - 200)
            end = min(len(content), match.end() + 200)
            context = content[start:end]
            
            img_match = re.search(r'url\(&quot;(https://res\.cloudinary\.com/[^&]+)&quot;\)', context)
            if img_match:
                # E.g. C4-FPD120-E-WH. Root is C4-FPD120-E
                parts = sku.split('-')
                if len(parts) >= 4:
                    root_sku = '-'.join(parts[:4]) 
                else:
                    root_sku = sku
                
                if root_sku not in results:
                    results[root_sku] = img_match.group(1)
        
        return results
    except Exception as e:
        print(f"Error processing {filename}: {e}")
        return {}

ess_data = process_file('Essential.html')

print("Essential Images found:", len(ess_data))
for k, v in list(ess_data.items())[:5]:
    print(k, v)

# Update catalogo.js directly
if ess_data:
    with open('webapp/catalogo.js', 'r', encoding='utf-8') as f:
        js_content = f.read()

    for root_sku, url in ess_data.items():
        # The partNumber in catalogo.js is 'C4-FPD120-E-XX'
        target_part = root_sku + '-XX'
        pattern = r"(partNumber:\s*'" + re.escape(target_part) + r"'.*?img:\s*')[^']+(\')"
        
        # fallback if root_sku doesn't have -E but catalog does (e.g. C4-KA-E)
        # Actually in essential line they are C4-FPD120-E, C4-SW120277-E, C4-KA-E
        js_content = re.sub(pattern, r"\g<1>" + url + r"\g<2>", js_content, flags=re.DOTALL)

    with open('webapp/catalogo.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
    print("Updated catalogo.js with Essential images.")
else:
    print("No images found to update.")
