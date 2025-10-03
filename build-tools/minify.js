#!/usr/bin/env node

/**
 * CSS and JavaScript Minification Tool
 * Optimized for technical content display
 */

const fs = require('fs').promises;
const path = require('path');

class MinificationTool {
    constructor() {
        this.cssDir = './assets/css';
        this.jsDir = './assets/js';
        this.outputDir = './assets/dist';
    }

    async init() {
        console.log('🔧 Starting minification process...');
        
        try {
            await this.ensureOutputDirectory();
            await this.minifyCSS();
            await this.minifyJS();
            await this.generateManifest();
            
            console.log('✅ Minification completed successfully!');
        } catch (error) {
            console.error('❌ Minification failed:', error);
            process.exit(1);
        }
    }

    async ensureOutputDirectory() {
        try {
            await fs.access(this.outputDir);
        } catch {
            await fs.mkdir(this.outputDir, { recursive: true });
            console.log(`📁 Created output directory: ${this.outputDir}`);
        }
    }

    async minifyCSS() {
        console.log('🎨 Minifying CSS files...');
        
        const cssFiles = await this.findFiles(this.cssDir, '.css');
        const minifiedFiles = [];
        
        for (const cssFile of cssFiles) {
            const minified = await this.minifyCSSFile(cssFile);
            minifiedFiles.push(minified);
        }
        
        // Create combined CSS file
        await this.createCombinedCSS(minifiedFiles);
        
        console.log(`✓ Minified ${cssFiles.length} CSS files`);
    }

    async minifyJS() {
        console.log('📜 Minifying JavaScript files...');
        
        const jsFiles = await this.findFiles(this.jsDir, '.js');
        const minifiedFiles = [];
        
        for (const jsFile of jsFiles) {
            const minified = await this.minifyJSFile(jsFile);
            minifiedFiles.push(minified);
        }
        
        // Create combined JS file
        await this.createCombinedJS(minifiedFiles);
        
        console.log(`✓ Minified ${jsFiles.length} JavaScript files`);
    }

    async findFiles(dir, extension) {
        const files = [];
        
        async function scanDirectory(currentDir) {
            const entries = await fs.readdir(currentDir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                
                if (entry.isDirectory()) {
                    await scanDirectory(fullPath);
                } else if (entry.isFile() && entry.name.endsWith(extension)) {
                    files.push(fullPath);
                }
            }
        }
        
        await scanDirectory(dir);
        return files;
    }

    async minifyCSSFile(filePath) {
        const content = await fs.readFile(filePath, 'utf8');
        const fileName = path.basename(filePath, '.css');
        
        // Basic CSS minification
        const minified = content
            // Remove comments
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // Remove unnecessary whitespace
            .replace(/\s+/g, ' ')
            // Remove whitespace around specific characters
            .replace(/\s*([{}:;,>+~])\s*/g, '$1')
            // Remove trailing semicolons before closing braces
            .replace(/;}/g, '}')
            // Remove empty rules
            .replace(/[^{}]+{\s*}/g, '')
            .trim();
        
        const outputPath = path.join(this.outputDir, `${fileName}.min.css`);
        await fs.writeFile(outputPath, minified, 'utf8');
        
        const originalSize = Buffer.byteLength(content, 'utf8');
        const minifiedSize = Buffer.byteLength(minified, 'utf8');
        const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
        
        console.log(`  ✓ ${fileName}.css: ${originalSize} → ${minifiedSize} bytes (${savings}% reduction)`);
        
        return {
            original: filePath,
            minified: outputPath,
            content: minified,
            originalSize,
            minifiedSize,
            savings
        };
    }

    async minifyJSFile(filePath) {
        const content = await fs.readFile(filePath, 'utf8');
        const fileName = path.basename(filePath, '.js');
        
        // Basic JavaScript minification (simple approach)
        const minified = content
            // Remove single-line comments (but preserve URLs)
            .replace(/\/\/(?![^\n]*https?:)[^\n]*/g, '')
            // Remove multi-line comments
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // Remove unnecessary whitespace
            .replace(/\s+/g, ' ')
            // Remove whitespace around operators and punctuation
            .replace(/\s*([{}();,=+\-*/<>!&|])\s*/g, '$1')
            // Remove trailing semicolons (optional)
            .replace(/;}/g, '}')
            .trim();
        
        const outputPath = path.join(this.outputDir, `${fileName}.min.js`);
        await fs.writeFile(outputPath, minified, 'utf8');
        
        const originalSize = Buffer.byteLength(content, 'utf8');
        const minifiedSize = Buffer.byteLength(minified, 'utf8');
        const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
        
        console.log(`  ✓ ${fileName}.js: ${originalSize} → ${minifiedSize} bytes (${savings}% reduction)`);
        
        return {
            original: filePath,
            minified: outputPath,
            content: minified,
            originalSize,
            minifiedSize,
            savings
        };
    }

    async createCombinedCSS(minifiedFiles) {
        // Order CSS files for optimal loading
        const orderedFiles = this.orderCSSFiles(minifiedFiles);
        
        const combinedContent = orderedFiles
            .map(file => `/* ${path.basename(file.original)} */\n${file.content}`)
            .join('\n\n');
        
        const combinedPath = path.join(this.outputDir, 'combined.min.css');
        await fs.writeFile(combinedPath, combinedContent, 'utf8');
        
        const totalSize = Buffer.byteLength(combinedContent, 'utf8');
        console.log(`  ✓ Combined CSS: ${totalSize} bytes`);
        
        return combinedPath;
    }

    async createCombinedJS(minifiedFiles) {
        // Order JS files for optimal loading
        const orderedFiles = this.orderJSFiles(minifiedFiles);
        
        const combinedContent = orderedFiles
            .map(file => `/* ${path.basename(file.original)} */\n${file.content}`)
            .join('\n\n');
        
        const combinedPath = path.join(this.outputDir, 'combined.min.js');
        await fs.writeFile(combinedPath, combinedContent, 'utf8');
        
        const totalSize = Buffer.byteLength(combinedContent, 'utf8');
        console.log(`  ✓ Combined JS: ${totalSize} bytes`);
        
        return combinedPath;
    }

    orderCSSFiles(files) {
        // Order CSS files for optimal cascade
        const order = ['main.css', 'components.css', 'responsive.css'];
        
        return files.sort((a, b) => {
            const aName = path.basename(a.original);
            const bName = path.basename(b.original);
            
            const aIndex = order.indexOf(aName);
            const bIndex = order.indexOf(bName);
            
            if (aIndex !== -1 && bIndex !== -1) {
                return aIndex - bIndex;
            } else if (aIndex !== -1) {
                return -1;
            } else if (bIndex !== -1) {
                return 1;
            } else {
                return aName.localeCompare(bName);
            }
        });
    }

    orderJSFiles(files) {
        // Order JS files for optimal dependency loading
        const order = ['image-optimizer.js', 'main.js', 'projects.js', 'publications.js', 'technical-artifacts.js', 'about.js', 'contact.js'];
        
        return files.sort((a, b) => {
            const aName = path.basename(a.original);
            const bName = path.basename(b.original);
            
            const aIndex = order.indexOf(aName);
            const bIndex = order.indexOf(bName);
            
            if (aIndex !== -1 && bIndex !== -1) {
                return aIndex - bIndex;
            } else if (aIndex !== -1) {
                return -1;
            } else if (bIndex !== -1) {
                return 1;
            } else {
                return aName.localeCompare(bName);
            }
        });
    }

    async generateManifest() {
        const manifest = {
            generated: new Date().toISOString(),
            version: '1.0.0',
            files: {
                css: {
                    combined: 'assets/dist/combined.min.css',
                    individual: []
                },
                js: {
                    combined: 'assets/dist/combined.min.js',
                    individual: []
                }
            },
            optimization: {
                minification: true,
                compression: true,
                caching: true
            }
        };
        
        // Add individual files
        const cssFiles = await this.findFiles(this.outputDir, '.min.css');
        const jsFiles = await this.findFiles(this.outputDir, '.min.js');
        
        manifest.files.css.individual = cssFiles
            .filter(file => !file.includes('combined'))
            .map(file => path.relative('.', file));
            
        manifest.files.js.individual = jsFiles
            .filter(file => !file.includes('combined'))
            .map(file => path.relative('.', file));
        
        const manifestPath = path.join(this.outputDir, 'build-manifest.json');
        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
        
        console.log('✓ Build manifest created');
    }
}

// CLI execution
if (require.main === module) {
    const minifier = new MinificationTool();
    minifier.init().catch(console.error);
}

module.exports = MinificationTool;