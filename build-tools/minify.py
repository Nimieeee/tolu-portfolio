#!/usr/bin/env python3

import os
import re
import json
from pathlib import Path

def minify_css(content):
    """Simple CSS minification"""
    # Remove comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    # Remove unnecessary whitespace
    content = re.sub(r'\s+', ' ', content)
    # Remove whitespace around specific characters
    content = re.sub(r'\s*([{}:;,>+~])\s*', r'\1', content)
    # Remove trailing semicolons before closing braces
    content = re.sub(r';}', '}', content)
    return content.strip()

def minify_js(content):
    """Simple JavaScript minification"""
    # Remove single-line comments (preserve URLs)
    content = re.sub(r'//(?![^\n]*https?:)[^\n]*', '', content)
    # Remove multi-line comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    # Remove unnecessary whitespace
    content = re.sub(r'\s+', ' ', content)
    return content.strip()

def main():
    print('🔧 Starting minification process...')
    
    # Create output directory
    dist_dir = Path('assets/dist')
    dist_dir.mkdir(exist_ok=True)
    
    # Process CSS files
    print('🎨 Minifying CSS files...')
    css_files = []
    css_dir = Path('assets/css')
    
    for css_file in css_dir.glob('*.css'):
        with open(css_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        minified = minify_css(content)
        output_file = dist_dir / f'{css_file.stem}.min.css'
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(minified)
        
        css_files.append(str(output_file))
        savings = ((len(content) - len(minified)) / len(content) * 100) if content else 0
        print(f'  ✓ {css_file.name}: {len(content)} → {len(minified)} bytes ({savings:.1f}% reduction)')
    
    # Process JS files
    print('📜 Minifying JavaScript files...')
    js_files = []
    js_dir = Path('assets/js')
    
    for js_file in js_dir.glob('*.js'):
        with open(js_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        minified = minify_js(content)
        output_file = dist_dir / f'{js_file.stem}.min.js'
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(minified)
        
        js_files.append(str(output_file))
        savings = ((len(content) - len(minified)) / len(content) * 100) if content else 0
        print(f'  ✓ {js_file.name}: {len(content)} → {len(minified)} bytes ({savings:.1f}% reduction)')
    
    # Create combined files
    print('📦 Creating combined files...')
    
    # Combined CSS
    css_order = ['main.css', 'components.css', 'responsive.css']
    combined_css = []
    
    for css_name in css_order:
        css_path = dist_dir / f'{Path(css_name).stem}.min.css'
        if css_path.exists():
            with open(css_path, 'r', encoding='utf-8') as f:
                combined_css.append(f'/* {css_name} */\n{f.read()}')
    
    combined_css_content = '\n\n'.join(combined_css)
    combined_css_path = dist_dir / 'combined.min.css'
    
    with open(combined_css_path, 'w', encoding='utf-8') as f:
        f.write(combined_css_content)
    
    print(f'  ✓ Combined CSS: {len(combined_css_content)} bytes')
    
    # Combined JS
    js_order = ['image-optimizer.js', 'main.js', 'projects.js', 'publications.js', 
                'technical-artifacts.js', 'about.js', 'contact.js', 'performance.js']
    combined_js = []
    
    for js_name in js_order:
        js_path = dist_dir / f'{Path(js_name).stem}.min.js'
        if js_path.exists():
            with open(js_path, 'r', encoding='utf-8') as f:
                combined_js.append(f'/* {js_name} */\n{f.read()}')
    
    combined_js_content = '\n\n'.join(combined_js)
    combined_js_path = dist_dir / 'combined.min.js'
    
    with open(combined_js_path, 'w', encoding='utf-8') as f:
        f.write(combined_js_content)
    
    print(f'  ✓ Combined JS: {len(combined_js_content)} bytes')
    
    # Create manifest
    manifest = {
        'generated': '2024-12-19T12:00:00.000Z',
        'version': '1.0.0',
        'files': {
            'css': {
                'combined': 'assets/dist/combined.min.css',
                'individual': css_files
            },
            'js': {
                'combined': 'assets/dist/combined.min.js',
                'individual': js_files
            }
        }
    }
    
    manifest_path = dist_dir / 'build-manifest.json'
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)
    
    print('✓ Build manifest created')
    print('✅ Minification completed successfully!')

if __name__ == '__main__':
    main()