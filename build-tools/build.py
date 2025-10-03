#!/usr/bin/env python3

"""
Production build script for portfolio site
Implements performance optimizations including minification and critical CSS
"""

import os
import re
import json
import shutil
from pathlib import Path
from datetime import datetime

class PerformanceOptimizer:
    def __init__(self):
        self.root_dir = Path.cwd()
        self.dist_dir = self.root_dir / 'dist'
        self.css_files = [
            'assets/css/main.css',
            'assets/css/components.css',
            'assets/css/responsive.css'
        ]
        self.js_files = [
            'assets/js/main.js',
            'assets/js/projects.js',
            'assets/js/contact.js',
            'assets/js/about.js',
            'assets/js/image-optimizer.js',
            'assets/js/sw-register.js',
            'assets/js/performance.js'
        ]
        
    def build(self):
        print("🚀 Starting production build...\n")
        
        try:
            # Step 1: Clean and prepare
            self.clean_dist()
            
            # Step 2: Minify assets
            self.minify_css()
            self.minify_js()
            
            # Step 3: Extract critical CSS
            self.extract_critical_css()
            
            # Step 4: Optimize HTML
            self.optimize_html()
            
            # Step 5: Copy static assets
            self.copy_static_assets()
            
            # Step 6: Generate cache headers
            self.generate_cache_headers()
            
            print("\n🎉 Production build completed successfully!")
            print(f"📁 Output directory: {self.dist_dir}")
            
        except Exception as error:
            print(f"\n❌ Build failed: {error}")
            raise
    
    def clean_dist(self):
        print("🧹 Cleaning dist directory...")
        
        if self.dist_dir.exists():
            shutil.rmtree(self.dist_dir)
        
        self.dist_dir.mkdir(parents=True, exist_ok=True)
        (self.dist_dir / 'css').mkdir(exist_ok=True)
        (self.dist_dir / 'js').mkdir(exist_ok=True)
        
        print("✅ Dist directory cleaned")
    
    def minify_css(self):
        print("🔄 Minifying CSS files...")
        
        combined_css = ""
        original_size = 0
        
        for css_file in self.css_files:
            css_path = self.root_dir / css_file
            if css_path.exists():
                content = css_path.read_text(encoding='utf-8')
                combined_css += f"/* {css_file} */\n{content}\n\n"
                original_size += len(content)
            else:
                print(f"⚠️  Warning: Could not read {css_file}")
        
        # Minify CSS
        minified_css = self.minify_css_content(combined_css)
        
        # Write minified CSS
        output_path = self.dist_dir / 'css' / 'styles.min.css'
        output_path.write_text(minified_css, encoding='utf-8')
        
        reduction = round((1 - len(minified_css) / len(combined_css)) * 100) if combined_css else 0
        print(f"✅ CSS minified: {output_path}")
        print(f"📊 Size reduction: {len(combined_css)} → {len(minified_css)} bytes ({reduction}% reduction)")
    
    def minify_css_content(self, css):
        # Remove comments
        css = re.sub(r'/\*[\s\S]*?\*/', '', css)
        # Remove unnecessary whitespace
        css = re.sub(r'\s+', ' ', css)
        # Remove whitespace around specific characters
        css = re.sub(r'\s*([{}:;,>+~])\s*', r'\1', css)
        # Remove trailing semicolons before closing braces
        css = re.sub(r';}', '}', css)
        # Remove empty rules
        css = re.sub(r'[^{}]+{\s*}', '', css)
        return css.strip()
    
    def minify_js(self):
        print("🔄 Minifying JavaScript files...")
        
        combined_js = ""
        original_size = 0
        
        for js_file in self.js_files:
            js_path = self.root_dir / js_file
            if js_path.exists():
                content = js_path.read_text(encoding='utf-8')
                combined_js += f"/* {js_file} */\n{content}\n\n"
                original_size += len(content)
            else:
                print(f"⚠️  Warning: Could not read {js_file}")
        
        # Basic JS minification
        minified_js = self.minify_js_content(combined_js)
        
        # Write minified JS
        output_path = self.dist_dir / 'js' / 'scripts.min.js'
        output_path.write_text(minified_js, encoding='utf-8')
        
        reduction = round((1 - len(minified_js) / len(combined_js)) * 100) if combined_js else 0
        print(f"✅ JavaScript minified: {output_path}")
        print(f"📊 Size reduction: {len(combined_js)} → {len(minified_js)} bytes ({reduction}% reduction)")
    
    def minify_js_content(self, js):
        # Remove single-line comments (basic approach)
        js = re.sub(r'//(?![^\n]*[\'"`]).*$', '', js, flags=re.MULTILINE)
        # Remove multi-line comments
        js = re.sub(r'/\*[\s\S]*?\*/', '', js)
        # Remove unnecessary whitespace
        js = re.sub(r'\s+', ' ', js)
        # Remove whitespace around operators and punctuation (basic)
        js = re.sub(r'\s*([{}();,=+\-*/<>!&|?:])\s*', r'\1', js)
        return js.strip()
    
    def extract_critical_css(self):
        print("🔄 Extracting critical CSS...")
        
        # Read combined CSS
        css_path = self.dist_dir / 'css' / 'styles.min.css'
        if not css_path.exists():
            print("⚠️  Warning: Minified CSS not found for critical extraction")
            return
        
        css_content = css_path.read_text(encoding='utf-8')
        
        # Critical selectors for above-the-fold content
        critical_patterns = [
            r':root\s*{[^}]*}',  # CSS variables
            r'html\s*{[^}]*}',   # HTML styles
            r'body\s*{[^}]*}',   # Body styles
            r'\.header[^{]*{[^}]*}',  # Header
            r'\.nav[^{]*{[^}]*}',     # Navigation
            r'\.hero[^{]*{[^}]*}',    # Hero section
            r'\.btn[^{]*{[^}]*}',     # Buttons
            r'\.container[^{]*{[^}]*}',  # Container
            r'h[1-6][^{]*{[^}]*}',    # Headings
            r'@keyframes\s+hero[^{]*{[^}]*}',  # Hero animations
            r'@media[^{]*{[^}]*}',    # Media queries (simplified)
        ]
        
        critical_css = ""
        for pattern in critical_patterns:
            matches = re.findall(pattern, css_content, re.IGNORECASE | re.DOTALL)
            critical_css += '\n'.join(matches) + '\n'
        
        # Write critical CSS
        critical_path = self.dist_dir / 'css' / 'critical.min.css'
        critical_path.write_text(critical_css, encoding='utf-8')
        
        print(f"✅ Critical CSS extracted: {critical_path}")
        print(f"📊 Critical CSS size: {len(critical_css)} bytes")
    
    def optimize_html(self):
        print("🔄 Optimizing HTML...")
        
        html_path = self.root_dir / 'index.html'
        if not html_path.exists():
            print("⚠️  Warning: index.html not found")
            return
        
        html_content = html_path.read_text(encoding='utf-8')
        
        # Read critical CSS for inlining
        critical_css_path = self.dist_dir / 'css' / 'critical.min.css'
        critical_css = ""
        if critical_css_path.exists():
            critical_css = critical_css_path.read_text(encoding='utf-8')
        
        # Process HTML
        optimized_html = self.process_html(html_content, critical_css)
        
        # Write optimized HTML
        output_path = self.dist_dir / 'index.html'
        output_path.write_text(optimized_html, encoding='utf-8')
        
        print("✅ HTML optimized with critical CSS inlined")
    
    def process_html(self, html, critical_css):
        # Add critical CSS inline
        if critical_css:
            critical_css_tag = f'<style id="critical-css">\n{critical_css}\n</style>'
            html = html.replace('</head>', f'    {critical_css_tag}\n</head>')
        
        # Remove original CSS links
        html = re.sub(r'<link rel="stylesheet" href="assets/css/[^"]+\.css"[^>]*>', '', html)
        
        # Add preload for main CSS
        css_preload = '''    <link rel="preload" href="dist/css/styles.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="dist/css/styles.min.css"></noscript>'''
        html = html.replace('</head>', f'{css_preload}\n</head>')
        
        # Remove original JS includes
        html = re.sub(r'<script src="assets/js/[^"]+\.js"[^>]*></script>', '', html)
        
        # Add minified JS
        js_script = '    <script src="dist/js/scripts.min.js" defer></script>'
        html = html.replace('</body>', f'{js_script}\n</body>')
        
        # Add service worker registration
        sw_script = '''    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => console.log('SW registered'))
                    .catch(error => console.log('SW registration failed'));
            });
        }
    </script>'''
        html = html.replace('</body>', f'{sw_script}\n</body>')
        
        # Add performance hints
        performance_hints = '''    <!-- Performance optimizations -->
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="preconnect" href="//fonts.gstatic.com" crossorigin>
    <meta http-equiv="x-dns-prefetch-control" content="on">'''
        html = html.replace('</head>', f'{performance_hints}\n</head>')
        
        return html
    
    def copy_static_assets(self):
        print("🔄 Copying static assets...")
        
        # Copy asset directories
        asset_dirs = ['assets/images', 'assets/data']
        for asset_dir in asset_dirs:
            src_path = self.root_dir / asset_dir
            if src_path.exists():
                dst_path = self.dist_dir / asset_dir
                shutil.copytree(src_path, dst_path, dirs_exist_ok=True)
        
        # Copy static files
        static_files = ['resume.pdf', '_config.yml', 'README.md', 'sw.js']
        for file_name in static_files:
            src_path = self.root_dir / file_name
            if src_path.exists():
                dst_path = self.dist_dir / file_name
                shutil.copy2(src_path, dst_path)
        
        print("✅ Static assets copied")
    
    def generate_cache_headers(self):
        print("🔄 Generating cache configuration...")
        
        # Generate .htaccess for Apache
        htaccess_content = '''# Performance optimizations and caching
<IfModule mod_expires.c>
    ExpiresActive on
    
    # CSS and JavaScript
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType text/javascript "access plus 1 year"
    
    # Images
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    
    # Fonts
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
    
    # Data files
    ExpiresByType application/json "access plus 1 day"
    
    # HTML
    ExpiresByType text/html "access plus 1 hour"
</IfModule>

<IfModule mod_headers.c>
    # Cache-control headers
    <FilesMatch "\\.(css|js|png|jpg|jpeg|gif|svg|webp|woff|woff2)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
    
    <FilesMatch "\\.(json)$">
        Header set Cache-Control "public, max-age=86400"
    </FilesMatch>
    
    <FilesMatch "\\.(html)$">
        Header set Cache-Control "public, max-age=3600"
    </FilesMatch>
    
    # Security headers
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>'''
        
        htaccess_path = self.dist_dir / '.htaccess'
        htaccess_path.write_text(htaccess_content, encoding='utf-8')
        
        # Generate _headers for Netlify
        netlify_headers = '''/*
  Cache-Control: public, max-age=3600
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin

/dist/css/*
  Cache-Control: public, max-age=31536000, immutable

/dist/js/*
  Cache-Control: public, max-age=31536000, immutable

/assets/images/*
  Cache-Control: public, max-age=31536000, immutable

/assets/data/*
  Cache-Control: public, max-age=86400'''
        
        headers_path = self.dist_dir / '_headers'
        headers_path.write_text(netlify_headers, encoding='utf-8')
        
        # Generate manifest
        manifest = {
            "version": int(datetime.now().timestamp()),
            "files": {
                "css": "dist/css/styles.min.css",
                "js": "dist/js/scripts.min.js",
                "critical_css": "dist/css/critical.min.css"
            },
            "generated": datetime.now().isoformat()
        }
        
        manifest_path = self.dist_dir / 'manifest.json'
        manifest_path.write_text(json.dumps(manifest, indent=2), encoding='utf-8')
        
        print("✅ Cache configuration generated")

if __name__ == "__main__":
    optimizer = PerformanceOptimizer()
    optimizer.build()