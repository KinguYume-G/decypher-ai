import re
from pathlib import Path

def process_file(src, dest):
    content = Path(src).read_text(encoding='utf-8')
    
    # Extract main content
    main_match = re.search(r'<main.*?>([\s\S]*?)</main>', content, re.IGNORECASE)
    if not main_match:
        print(f'No main found in {src}')
        return
        
    main_content = main_match.group(1)
    
    # Common React conversions
    main_content = main_content.replace('class=', 'className=')
    main_content = main_content.replace('for=', 'htmlFor=')
    main_content = main_content.replace('stroke-width', 'strokeWidth')
    main_content = main_content.replace('stroke-dasharray', 'strokeDasharray')
    main_content = main_content.replace('stroke-dashoffset', 'strokeDashoffset')
    main_content = main_content.replace('viewbox', 'viewBox')
    main_content = main_content.replace('style="font-variation-settings: \\\'FILL\\\' 1;"', 'style={{fontVariationSettings: "\\\'FILL\\\' 1"}}')
    
    # Self-close inputs and imgs and brs and hrs
    main_content = re.sub(r'(<(?:img|input|br|hr)[^>]*?)(?<!/)>', r'\1 />', main_content)

    # Convert HTML comments to JSX comments
    main_content = re.sub(r'<!--(.*?)-->', r'{/*\1*/}', main_content, flags=re.DOTALL)

    react_code = f"""import React from 'react';
import AppShell from '@/components/layout/AppShell';

export default function Page() {{
  return (
    <AppShell>
      <div className="flex-1 p-margin-desktop w-full max-w-7xl mx-auto">
        {{/* Content from Stitch */}}
        {main_content}
      </div>
    </AppShell>
  );
}}
"""
    Path(dest).parent.mkdir(parents=True, exist_ok=True)
    Path(dest).write_text(react_code, encoding='utf-8')
    print(f'Wrote {dest}')

process_file('stitch/system_settings_api_management/code.html', 'frontend/src/app/settings/page.tsx')
process_file('stitch/saved_opportunities/code.html', 'frontend/src/app/saved/page.tsx')
process_file('stitch/emerging_tech_market_shifts/code.html', 'frontend/src/app/market/page.tsx')
