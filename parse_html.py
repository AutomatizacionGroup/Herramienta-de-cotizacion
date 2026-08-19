import re
import json
from html import unescape

html_file = 'LUX.html'

try:
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Find all SKUs that start with C4-
    # LUX products might have specific SKUs. Let's capture the text around them.
    matches = re.finditer(r'C4-[A-Z0-9\-]+', content)

    skus = {}
    for match in matches:
        sku = match.group(0)
        
        # Get ~150 chars around it to find the title
        start = max(0, match.start() - 150)
        end = min(len(content), match.end() + 150)
        context = content[start:end]
        
        # In angular, usually it looks like title="Product Name" or <div class="title">Product Name</div>
        # Let's clean the context
        clean_context = re.sub(r'<[^>]+>', ' ', context) # remove html tags
        clean_context = re.sub(r'\s+', ' ', clean_context).strip()
        
        if sku not in skus:
            skus[sku] = clean_context

    with open('extracted_lux.json', 'w', encoding='utf-8') as f:
        json.dump(skus, f, indent=2, ensure_ascii=False)
    
    print(f"Extracted {len(skus)} unique LUX SKUs.")
    
except Exception as e:
    print(f"Error: {e}")
