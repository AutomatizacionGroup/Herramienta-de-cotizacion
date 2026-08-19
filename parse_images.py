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
                root_sku = '-'.join(sku.split('-')[:3]) # e.g. C4-KCB from C4-KCB-BL
                if root_sku not in results:
                    results[root_sku] = img_match.group(1)
        
        return results
    except Exception as e:
        print(f"Error processing {filename}: {e}")
        return {}

cont_data = process_file('Contemporary.html')
trad_data = process_file('Tradicional.html')

print("Contemporary Images found:", len(cont_data))
for k, v in list(cont_data.items())[:5]:
    print(k, v)

print("\nTradicional Images found:", len(trad_data))
for k, v in list(trad_data.items())[:5]:
    print(k, v)

# Save to json for reference
with open('extracted_images.json', 'w') as f:
    json.dump({'Contemporary': cont_data, 'Tradicional': trad_data}, f, indent=2)
