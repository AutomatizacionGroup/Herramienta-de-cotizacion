import re
import json

html_file = 'Wireless Lighting.html'
with open(html_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's search for JSON-like structures that contain "C4-"
# This is tricky without knowing the exact key. Let's just look for any text content that might be product names.
# Alternatively, I can just grab the SKUs and format a clean catalogo.js because the user said:
# "Ahi tienes todos los modelos de contemporary, de Essential, de LUX y de tradicional bien filtrados"

matches = set(re.findall(r'C4-[A-Z0-9\-]+', content))

print(f"Total unique C4- codes found: {len(matches)}")
for m in list(matches)[:20]:
    print(m)
