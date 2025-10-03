#!/usr/bin/env node

/**
 * Image Optimization Script
 * Optimizes images for technical content and research visualizations
 */

const fs = require('fs').promises;
const path = require('path');

class ImageOptimizationTool {
    constructor() {
        this.imageDir = './assets/images';
        this.optimizedDir = './assets/images/optimized';
        this.supportedFormats = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
        this.compressionQuality = 85;
    }

    async init() {
        console.log('🖼️  Starting image optimization...');
        
        try {
            await this.ensureDirectories();
            await this.optimizeImages();
            await this.generateFallbackImages();
            await this.createImageManifest();
            
            console.log('✅ Image optimization completed successfully!');
        } catch (error) {
            console.error('❌ Image optimization failed:', error);
            process.exit(1);
        }
    }

    async ensureDirectories() {
        const directories = [
            this.optimizedDir,
            path.join(this.optimizedDir, 'thumbnails'),
            path.join(this.optimizedDir, 'webp'),
            path.join(this.imageDir, 'fallbacks')
        ];

        for (const dir of directories) {
            try {
                await fs.access(dir);
            } catch {
                await fs.mkdir(dir, { recursive: true });
                console.log(`📁 Created directory: ${dir}`);
            }
        }
    }

    async optimizeImages() {
        const imageFiles = await this.findImageFiles();
        
        console.log(`🔍 Found ${imageFiles.length} images to optimize`);
        
        for (const imagePath of imageFiles) {
            await this.optimizeImage(imagePath);
        }
    }

    async findImageFiles() {
        const imageFiles = [];
        
        async function scanDirectory(dir) {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    await scanDirectory(fullPath);
                } else if (entry.isFile()) {
                    const ext = path.extname(entry.name).toLowerCase();
                    if (this.supportedFormats.includes(ext)) {
                        imageFiles.push(fullPath);
                    }
                }
            }
        }
        
        await scanDirectory.call(this, this.imageDir);
        return imageFiles;
    }

    async optimizeImage(imagePath) {
        const ext = path.extname(imagePath).toLowerCase();
        const relativePath = path.relative(this.imageDir, imagePath);
        const baseName = path.basename(imagePath, ext);
        const dirName = path.dirname(relativePath);
        
        console.log(`🔧 Optimizing: ${relativePath}`);
        
        try {
            // For SVG files, just copy and minify if possible
            if (ext === '.svg') {
                await this.optimizeSVG(imagePath, relativePath);
                return;
            }
            
            // For other formats, we'll implement basic optimization
            // In a real scenario, you'd use libraries like sharp, imagemin, etc.
            await this.copyWithOptimization(imagePath, relativePath);
            
        } catch (error) {
            console.warn(`⚠️  Failed to optimize ${relativePath}:`, error.message);
        }
    }

    async optimizeSVG(sourcePath, relativePath) {
        try {
            let svgContent = await fs.readFile(sourcePath, 'utf8');
            
            // Basic SVG optimization - remove comments and unnecessary whitespace
            svgContent = svgContent
                .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
                .replace(/\s+/g, ' ') // Normalize whitespace
                .replace(/>\s+</g, '><') // Remove whitespace between tags
                .trim();
            
            const optimizedPath = path.join(this.optimizedDir, relativePath);
            await fs.mkdir(path.dirname(optimizedPath), { recursive: true });
            await fs.writeFile(optimizedPath, svgContent, 'utf8');
            
            console.log(`  ✓ SVG optimized: ${relativePath}`);
        } catch (error) {
            console.warn(`  ⚠️  SVG optimization failed for ${relativePath}:`, error.message);
        }
    }

    async copyWithOptimization(sourcePath, relativePath) {
        // For now, just copy the file
        // In production, you'd use image optimization libraries
        const optimizedPath = path.join(this.optimizedDir, relativePath);
        await fs.mkdir(path.dirname(optimizedPath), { recursive: true });
        await fs.copyFile(sourcePath, optimizedPath);
        
        console.log(`  ✓ Copied: ${relativePath}`);
    }

    async generateFallbackImages() {
        console.log('🎨 Generating fallback images...');
        
        const fallbackSVG = this.createFallbackSVG();
        const fallbackPath = path.join(this.imageDir, 'fallbacks', 'default-fallback.svg');
        
        await fs.writeFile(fallbackPath, fallbackSVG, 'utf8');
        
        // Generate category-specific fallbacks
        const categories = ['technical-diagram', 'research-plot', 'project-screenshot'];
        
        for (const category of categories) {
            const categorySVG = this.createCategoryFallbackSVG(category);
            const categoryPath = path.join(this.imageDir, 'fallbacks', `${category}-fallback.svg`);
            await fs.writeFile(categoryPath, categorySVG, 'utf8');
        }
        
        console.log('✓ Fallback images generated');
    }

    createFallbackSVG() {
        return `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#f7f8f9"/>
  <rect x="50" y="50" width="300" height="200" fill="#e5e7eb" stroke="#d1d5db" stroke-width="2" stroke-dasharray="5,5" rx="8"/>
  <circle cx="200" cy="120" r="20" fill="#9ca3af"/>
  <rect x="160" y="160" width="80" height="8" fill="#d1d5db" rx="4"/>
  <rect x="140" y="180" width="120" height="8" fill="#e5e7eb" rx="4"/>
  <text x="200" y="220" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#6b7280">
    Image not available
  </text>
</svg>`;
    }

    createCategoryFallbackSVG(category) {
        const categoryConfig = {
            'technical-diagram': {
                title: 'Technical Diagram',
                icon: '⚙️',
                color: '#3b82f6'
            },
            'research-plot': {
                title: 'Research Plot',
                icon: '📊',
                color: '#10b981'
            },
            'project-screenshot': {
                title: 'Project Screenshot',
                icon: '🖥️',
                color: '#f59e0b'
            }
        };

        const config = categoryConfig[category] || categoryConfig['technical-diagram'];

        return `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#f8fafc"/>
  <rect x="50" y="50" width="300" height="200" fill="white" stroke="${config.color}" stroke-width="2" stroke-dasharray="8,4" rx="12"/>
  <circle cx="200" cy="120" r="25" fill="${config.color}" opacity="0.1"/>
  <text x="200" y="130" text-anchor="middle" font-family="Arial, sans-serif" font-size="24">${config.icon}</text>
  <text x="200" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#374151">
    ${config.title}
  </text>
  <text x="200" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#6b7280">
    Content not available
  </text>
</svg>`;
    }

    async createImageManifest() {
        console.log('📋 Creating image manifest...');
        
        const manifest = {
            generated: new Date().toISOString(),
            optimized: true,
            fallbacks: {
                default: 'assets/images/fallbacks/default-fallback.svg',
                'technical-diagram': 'assets/images/fallbacks/technical-diagram-fallback.svg',
                'research-plot': 'assets/images/fallbacks/research-plot-fallback.svg',
                'project-screenshot': 'assets/images/fallbacks/project-screenshot-fallback.svg'
            },
            categories: {
                diagrams: [],
                plots: [],
                screenshots: [],
                wireframes: []
            }
        };

        // Scan for categorized images
        try {
            const diagramsDir = path.join(this.imageDir, 'diagrams');
            const diagrams = await fs.readdir(diagramsDir);
            manifest.categories.diagrams = diagrams.map(file => `assets/images/diagrams/${file}`);
        } catch (error) {
            // Directory doesn't exist, skip
        }

        try {
            const wireframesDir = path.join(this.imageDir, 'wireframes');
            const wireframes = await fs.readdir(wireframesDir);
            manifest.categories.wireframes = wireframes.map(file => `assets/images/wireframes/${file}`);
        } catch (error) {
            // Directory doesn't exist, skip
        }

        try {
            const projectsDir = path.join(this.imageDir, 'projects');
            const projects = await fs.readdir(projectsDir, { withFileTypes: true });
            
            for (const project of projects) {
                if (project.isDirectory()) {
                    try {
                        const projectFiles = await fs.readdir(path.join(projectsDir, project.name));
                        const screenshots = projectFiles
                            .filter(file => this.supportedFormats.includes(path.extname(file).toLowerCase()))
                            .map(file => `assets/images/projects/${project.name}/${file}`);
                        manifest.categories.screenshots.push(...screenshots);
                    } catch (error) {
                        // Skip if can't read project directory
                    }
                }
            }
        } catch (error) {
            // Directory doesn't exist, skip
        }

        const manifestPath = path.join(this.imageDir, 'image-manifest.json');
        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
        
        console.log('✓ Image manifest created');
    }
}

// CLI execution
if (require.main === module) {
    const optimizer = new ImageOptimizationTool();
    optimizer.init().catch(console.error);
}

module.exports = ImageOptimizationTool;