import re

# Read extracted JSON to get the context strings
import json
with open('extracted_lux.json', 'r', encoding='utf-8') as f:
    lux_data = json.load(f)

# Map part number roots (e.g. C4-L-UDIM) to their image URLs
img_urls = {}
for sku, context in lux_data.items():
    # Extract url from &quot;https://res.cloudinary.com/...&quot;
    match = re.search(r'url\(&quot;(https://res\.cloudinary\.com/[^&]+)&quot;\)', context)
    if match:
        url = match.group(1)
        # Get the root sku (e.g., C4-L-UDIM from C4-L-UDIM-R1)
        root_sku = '-'.join(sku.split('-')[:3])
        if root_sku not in img_urls:
            img_urls[root_sku] = url

print("Found image URLs for:", list(img_urls.keys()))

# Update catalogo.js
with open('webapp/catalogo.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

for root_sku, img_url in img_urls.items():
    # Regex to find the block for this sku and replace its img
    # The partNumber in catalogo is like 'C4-L-UDIM-XX'
    target_part = root_sku + '-XX'
    
    # We need to find the block containing partNumber: 'target_part' and replace its img: '...'
    # Let's do a simple string replace if possible, but regex is safer.
    
    # Find the block
    pattern = r"(partNumber:\s*'" + re.escape(target_part) + r"'.*?img:\s*')[^']+(\')"
    
    # Replace the img url
    js_content = re.sub(pattern, r"\g<1>" + img_url + r"\g<2>", js_content, flags=re.DOTALL)

with open('webapp/catalogo.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("Updated catalogo.js successfully.")
