#!/usr/bin/env node

/**
 * Critical CSS Extraction Tool
 * Extracts above-the-fold CSS for faster initial rendering
 */

const fs = require('fs').promises;
const path = require('path');

class CriticalCSSExtractor {
    constructor() {
        this.cssDir = './assets/css';
        this.outputDir = './assets/dist';
        this.htmlFile = './index.html';
    }

    async init() {
        console.log('🎯 Extracting critical CSS...');
        
        try {
            await this.ensureOutputDirectory();
            const criticalCSS = await this.extractCriticalCSS();
            await this.saveCriticalCSS(criticalCSS);
            await this.generateInlineCSS(criticalCSS);
            
            console.log('✅ Critical CSS extraction completed!');
        } catch (error) {
            console.error('❌ Critical CSS extraction failed:', error);
            process.exit(1);
        }
    }

    async ensureOutputDirectory() {
        try {
            await fs.access(this.outputDir);
        } catch {
            await fs.mkdir(this.outputDir, { recursive: true });
        }
    }

    async extractCriticalCSS() {
        console.log('🔍 Analyzing above-the-fold content...');
        
        // Define critical selectors for above-the-fold content
        const criticalSelectors = [
            // CSS Variables (always critical)
            ':root',
            
            // Base styles
            'html', 'body',
            
            // Header and navigation
            '.header', '.nav-container', '.nav-brand', '.nav-logo',
            '.nav-menu', '.nav-item', '.nav-link', '.nav-toggle',
            '.hamburger-line',
            
            // Hero section (above-the-fold)
            '.hero-section', '.hero-content', '.hero-image',
            '.hero-image-container', '.hero-headshot', '.hero-image-overlay',
            '.hero-text', '.hero-greeting', '.hero-greeting-text',
            '.hero-name', '.hero-name-text', '.hero-title',
            '.hero-title-prefix', '.hero-title-dynamic', '.hero-cursor',
            '.hero-description', '.hero-actions', '.hero-cta-primary',
            '.hero-cta-secondary', '.hero-cta-icon', '.hero-social',
            '.hero-social-link',
            
            // Loading states
            '.loading', '.loaded', '.fallback',
            
            // Basic layout utilities
            '.container', '.text-center', '.mb-16', '.py-20',
            '.grid', '.grid-cols-1', '.md\\:grid-cols-2', '.lg\\:grid-cols-3',
            '.gap-8', '.gap-12',
            
            // Typography
            '.text-3xl', '.text-4xl', '.font-bold', '.text-gray-900',
            '.text-lg', '.text-gray-600', '.max-w-3xl', '.mx-auto',
            
            // Buttons (likely above-the-fold)
            '.btn', '.btn-primary', '.btn-secondary',
            
            // Responsive utilities for mobile-first
            '@media (min-width: 768px)',
            '@media (min-width: 1024px)'
        ];
        
        // Read all CSS files
        const cssFiles = await this.findCSSFiles();
        let allCSS = '';
        
        for (const cssFile of cssFiles) {
            const content = await fs.readFile(cssFile, 'utf8');
            allCSS += content + '\n';
        }
        
        // Extract critical CSS
        const criticalCSS = this.extractMatchingRules(allCSS, criticalSelectors);
        
        console.log(`✓ Extracted ${criticalCSS.split('\n').length} lines of critical CSS`);
        
        return criticalCSS;
    }

    async findCSSFiles() {
        const files = [];
        const entries = await fs.readdir(this.cssDir);
        
        for (const entry of entries) {
            if (entry.endsWith('.css')) {
                files.push(path.join(this.cssDir, entry));
            }
        }
        
        return files;
    }

    extractMatchingRules(css, selectors) {
        const criticalRules = [];
        const lines = css.split('\n');
        let currentRule = '';
        let braceCount = 0;
        let inRule = false;
        let isMediaQuery = false;
        let mediaQueryContent = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Handle CSS variables (always critical)
            if (line.includes(':root') || (inRule && line.includes('--'))) {
                if (!inRule) {
                    currentRule = line;
                    inRule = true;
                } else {
                    currentRule += '\n  ' + line;
                }
                
                if (line.includes('{')) braceCount++;
                if (line.includes('}')) {
                    braceCount--;
                    if (braceCount === 0) {
                        criticalRules.push(currentRule);
                        currentRule = '';
                        inRule = false;
                    }
                }
                continue;
            }
            
            // Handle media queries
            if (line.startsWith('@media')) {
                isMediaQuery = true;
                mediaQueryContent = line;
                braceCount = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
                continue;
            }
            
            if (isMediaQuery) {
                mediaQueryContent += '\n' + line;
                braceCount += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
                
                if (braceCount === 0) {
                    // Check if media query contains critical selectors
                    if (this.containsCriticalSelectors(mediaQueryContent, selectors)) {
                        criticalRules.push(mediaQueryContent);
                    }
                    isMediaQuery = false;
                    mediaQueryContent = '';
                }
                continue;
            }
            
            // Handle regular rules
            if (line.includes('{') && !inRule) {
                const selector = line.substring(0, line.indexOf('{')).trim();
                
                if (this.isCriticalSelector(selector, selectors)) {
                    currentRule = line;
                    inRule = true;
                    braceCount = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
                }
            } else if (inRule) {
                currentRule += '\n  ' + line;
                braceCount += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
            }
            
            if (inRule && braceCount === 0) {
                criticalRules.push(currentRule);
                currentRule = '';
                inRule = false;
            }
        }
        
        return criticalRules.join('\n\n');
    }

    isCriticalSelector(selector, criticalSelectors) {
        return criticalSelectors.some(critical => {
            // Exact match
            if (selector === critical) return true;
            
            // Class/ID match
            if (selector.includes(critical)) return true;
            
            // Pseudo-selector match
            if (critical.includes('::') || critical.includes(':')) {
                return selector.includes(critical.split(':')[0]);
            }
            
            return false;
        });
    }

    containsCriticalSelectors(mediaQuery, selectors) {
        return selectors.some(selector => mediaQuery.includes(selector));
    }

    async saveCriticalCSS(criticalCSS) {
        const outputPath = path.join(this.outputDir, 'critical.css');
        await fs.writeFile(outputPath, criticalCSS, 'utf8');
        
        const size = Buffer.byteLength(criticalCSS, 'utf8');
        console.log(`✓ Critical CSS saved: ${size} bytes`);
        
        return outputPath;
    }

    async generateInlineCSS(criticalCSS) {
        // Minify critical CSS for inlining
        const minified = criticalCSS
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\s+/g, ' ')
            .replace(/\s*([{}:;,>+~])\s*/g, '$1')
            .replace(/;}/g, '}')
            .trim();
        
        const inlineCSS = `<style>${minified}</style>`;
        
        const outputPath = path.join(this.outputDir, 'critical-inline.html');
        await fs.writeFile(outputPath, inlineCSS, 'utf8');
        
        console.log(`✓ Inline CSS generated: ${Buffer.byteLength(minified, 'utf8')} bytes`);
        
        // Generate instructions for implementation
        const instructions = `
<!-- Critical CSS Implementation Instructions -->
<!-- 
1. Add this to the <head> section of your HTML, before any other CSS:
${inlineCSS}

2. Load the remaining CSS asynchronously:
<link rel="preload" href="assets/dist/combined.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="assets/dist/combined.min.css"></noscript>

3. This will improve First Contentful Paint (FCP) and Largest Contentful Paint (LCP) metrics.
-->
        `;
        
        const instructionsPath = path.join(this.outputDir, 'critical-css-instructions.html');
        await fs.writeFile(instructionsPath, instructions, 'utf8');
        
        return { inlineCSS, minified };
    }
}

// CLI execution
if (require.main === module) {
    const extractor = new CriticalCSSExtractor();
    extractor.init().catch(console.error);
}

module.exports = CriticalCSSExtractor;