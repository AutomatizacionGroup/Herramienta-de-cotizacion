import json
import re

with open('extracted_images.json', 'r') as f:
    data = json.load(f)

# Hardcode some mappings based on what we found to the partNumbers in catalogo.js
mappings = {
    'C4-APD120-XX': 'https://res.cloudinary.com/control4/image/upload/e_trim:1/c_fit,h_200,w_500,q_auto,f_auto,dpr_auto/Image/C4-APD120-C-AU-1_jxc9fh.png',
    'C4-FPD120-XX': 'https://res.cloudinary.com/control4/image/upload/e_trim:1/c_fit,h_200,w_500,q_auto,f_auto,dpr_auto/Image/C4-APD120-C-AU-1_jxc9fh.png', # Use same APD image as FPD looks identical
}

# The user's HTML didn't capture the switch or keypad because of lazy loading.
# I will only update the APD/FPD for now.

with open('webapp/catalogo.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

for part, url in mappings.items():
    pattern = r"(partNumber:\s*'" + re.escape(part) + r"'.*?img:\s*')[^']+(\')"
    js_content = re.sub(pattern, r"\g<1>" + url + r"\g<2>", js_content, flags=re.DOTALL)

with open('webapp/catalogo.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("Updated APD/FPD images.")
