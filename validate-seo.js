#!/usr/bin/env node

/**
 * SEO Validation Script
 * Validates SEO optimization for AI/ML professional visibility
 */

const fs = require('fs').promises;
const path = require('path');

class SEOValidator {
    constructor() {
        this.htmlFile = './index.html';
        this.sitemapFile = './sitemap.xml';
        this.robotsFile = './robots.txt';
        this.manifestFile = './manifest.json';
        this.issues = [];
        this.warnings = [];
        this.successes = [];
    }

    async validate() {
        console.log('🔍 Running SEO validation for AI/ML portfolio...\n');
        
        try {
            await this.validateHTML();
            await this.validateSitemap();
            await this.validateRobots();
            await this.validateManifest();
            await this.validateStructuredData();
            await this.validatePerformance();
            
            this.generateReport();
        } catch (error) {
            console.error('❌ SEO validation failed:', error);
            process.exit(1);
        }
    }

    async validateHTML() {
        console.log('📄 Validating HTML meta tags...');
        
        const html = await fs.readFile(this.htmlFile, 'utf8');
        
        // Required meta tags for AI/ML professional
        const requiredTags = [
            { tag: 'title', pattern: /AI\/ML Engineer|Product Manager|Drug Discovery|Researcher/i },
            { tag: 'meta[name="description"]', pattern: /AI|ML|Machine Learning|Drug Discovery|Product Manager/i },
            { tag: 'meta[name="keywords"]', pattern: /AI|ML|Machine Learning|Drug Discovery|RAG|Python/i },
            { tag: 'meta[name="author"]', pattern: /Toluwanimi Odunewu/i },
            { tag: 'meta[property="og:title"]', pattern: /AI\/ML Engineer|Product Manager/i },
            { tag: 'meta[property="og:description"]', pattern: /AI|ML|Drug Discovery/i },
            { tag: 'meta[property="og:image"]', pattern: /headshot\.svg/i },
            { tag: 'meta[name="twitter:card"]', pattern: /summary_large_image/i },
            { tag: 'link[rel="canonical"]', pattern: /https?:\/\//i }
        ];

        for (const { tag, pattern } of requiredTags) {
            if (pattern.test(html)) {
                this.successes.push(`✅ ${tag} properly configured`);
            } else {
                this.issues.push(`❌ ${tag} missing or not optimized for AI/ML professional`);
            }
        }

        // Check for AI/ML specific keywords
        const aiKeywords = [
            'AI Engineer', 'ML Engineer', 'Machine Learning', 'Drug Discovery',
            'Neuropharmacology', 'RAG', 'AutoDescribe', 'PharmGPT', 'Healthcare AI',
            'Product Manager', 'Python', 'PyTorch', 'MLOps'
        ];

        const foundKeywords = aiKeywords.filter(keyword => 
            new RegExp(keyword, 'i').test(html)
        );

        if (foundKeywords.length >= 8) {
            this.successes.push(`✅ Rich AI/ML keyword coverage (${foundKeywords.length}/${aiKeywords.length})`);
        } else {
            this.warnings.push(`⚠️ Limited AI/ML keyword coverage (${foundKeywords.length}/${aiKeywords.length})`);
        }

        // Check structured data
        if (html.includes('application/ld+json')) {
            this.successes.push('✅ Structured data (JSON-LD) present');
        } else {
            this.issues.push('❌ Missing structured data for better search visibility');
        }

        console.log('✓ HTML validation completed\n');
    }

    async validateSitemap() {
        console.log('🗺️ Validating sitemap...');
        
        try {
            const sitemap = await fs.readFile(this.sitemapFile, 'utf8');
            
            // Check for required URLs
            const requiredUrls = [
                '/#hero', '/#projects', '/#publications', 
                '/#technical-artifacts', '/#skills', '/#contact'
            ];

            for (const url of requiredUrls) {
                if (sitemap.includes(url)) {
                    this.successes.push(`✅ Sitemap includes ${url}`);
                } else {
                    this.warnings.push(`⚠️ Sitemap missing ${url}`);
                }
            }

            // Check for technical content URLs
            const technicalUrls = [
                'drug-discovery-workflow.svg',
                'ml-pipeline-architecture.svg',
                'autodescribe-dashboard.svg'
            ];

            const technicalCount = technicalUrls.filter(url => sitemap.includes(url)).length;
            if (technicalCount >= 2) {
                this.successes.push(`✅ Technical diagrams in sitemap (${technicalCount})`);
            } else {
                this.warnings.push(`⚠️ Few technical diagrams in sitemap (${technicalCount})`);
            }

        } catch (error) {
            this.issues.push('❌ Sitemap file not found or invalid');
        }

        console.log('✓ Sitemap validation completed\n');
    }

    async validateRobots() {
        console.log('🤖 Validating robots.txt...');
        
        try {
            const robots = await fs.readFile(this.robotsFile, 'utf8');
            
            if (robots.includes('Allow: /')) {
                this.successes.push('✅ Robots.txt allows crawling');
            } else {
                this.issues.push('❌ Robots.txt may be blocking crawlers');
            }

            if (robots.includes('Sitemap:')) {
                this.successes.push('✅ Sitemap referenced in robots.txt');
            } else {
                this.warnings.push('⚠️ Sitemap not referenced in robots.txt');
            }

            if (robots.includes('Disallow: /test-') || robots.includes('Disallow: /*.py')) {
                this.successes.push('✅ Test files properly excluded');
            } else {
                this.warnings.push('⚠️ Test files not excluded from crawling');
            }

        } catch (error) {
            this.issues.push('❌ Robots.txt file not found');
        }

        console.log('✓ Robots.txt validation completed\n');
    }

    async validateManifest() {
        console.log('📱 Validating PWA manifest...');
        
        try {
            const manifestContent = await fs.readFile(this.manifestFile, 'utf8');
            const manifest = JSON.parse(manifestContent);
            
            const requiredFields = ['name', 'short_name', 'description', 'start_url', 'display', 'theme_color'];
            
            for (const field of requiredFields) {
                if (manifest[field]) {
                    this.successes.push(`✅ Manifest has ${field}`);
                } else {
                    this.issues.push(`❌ Manifest missing ${field}`);
                }
            }

            if (manifest.icons && manifest.icons.length > 0) {
                this.successes.push('✅ Manifest includes icons');
            } else {
                this.warnings.push('⚠️ Manifest missing icons');
            }

            if (manifest.shortcuts && manifest.shortcuts.length > 0) {
                this.successes.push('✅ PWA shortcuts configured');
            } else {
                this.warnings.push('⚠️ No PWA shortcuts configured');
            }

        } catch (error) {
            this.issues.push('❌ Manifest file not found or invalid JSON');
        }

        console.log('✓ Manifest validation completed\n');
    }

    async validateStructuredData() {
        console.log('🏗️ Validating structured data...');
        
        const html = await fs.readFile(this.htmlFile, 'utf8');
        
        // Extract JSON-LD scripts
        const jsonLdMatches = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/gs);
        
        if (!jsonLdMatches) {
            this.issues.push('❌ No structured data found');
            return;
        }

        let validSchemas = 0;
        const expectedSchemas = ['Person', 'WebSite', 'Portfolio'];

        for (const match of jsonLdMatches) {
            try {
                const jsonContent = match.replace(/<script[^>]*>|<\/script>/g, '').trim();
                const schema = JSON.parse(jsonContent);
                
                if (schema['@type'] && expectedSchemas.includes(schema['@type'])) {
                    validSchemas++;
                    this.successes.push(`✅ Valid ${schema['@type']} schema found`);
                }

                // Check Person schema specifics
                if (schema['@type'] === 'Person') {
                    const personFields = ['name', 'jobTitle', 'knowsAbout', 'sameAs'];
                    const hasFields = personFields.filter(field => schema[field]).length;
                    
                    if (hasFields >= 3) {
                        this.successes.push('✅ Person schema well-structured');
                    } else {
                        this.warnings.push('⚠️ Person schema could be more detailed');
                    }
                }

            } catch (error) {
                this.issues.push('❌ Invalid JSON-LD structured data');
            }
        }

        if (validSchemas >= 2) {
            this.successes.push(`✅ Multiple schema types implemented (${validSchemas})`);
        } else {
            this.warnings.push(`⚠️ Limited schema coverage (${validSchemas})`);
        }

        console.log('✓ Structured data validation completed\n');
    }

    async validatePerformance() {
        console.log('⚡ Validating performance factors...');
        
        // Check for performance optimizations
        const html = await fs.readFile(this.htmlFile, 'utf8');
        
        // Check for minified assets
        try {
            await fs.access('./assets/dist/combined.min.css');
            this.successes.push('✅ Minified CSS available');
        } catch {
            this.warnings.push('⚠️ Minified CSS not found');
        }

        try {
            await fs.access('./assets/dist/combined.min.js');
            this.successes.push('✅ Minified JavaScript available');
        } catch {
            this.warnings.push('⚠️ Minified JavaScript not found');
        }

        // Check for service worker
        try {
            await fs.access('./sw.js');
            this.successes.push('✅ Service worker implemented');
        } catch {
            this.warnings.push('⚠️ Service worker not found');
        }

        // Check for lazy loading
        if (html.includes('loading="lazy"') || html.includes('data-src')) {
            this.successes.push('✅ Lazy loading implemented');
        } else {
            this.warnings.push('⚠️ Lazy loading not detected');
        }

        // Check for preload hints
        if (html.includes('rel="preload"')) {
            this.successes.push('✅ Resource preloading configured');
        } else {
            this.warnings.push('⚠️ No resource preloading detected');
        }

        console.log('✓ Performance validation completed\n');
    }

    generateReport() {
        console.log('📊 SEO Validation Report\n');
        console.log('='.repeat(50));
        
        // Summary
        const totalChecks = this.successes.length + this.warnings.length + this.issues.length;
        const score = Math.round((this.successes.length / totalChecks) * 100);
        
        console.log(`\n🎯 SEO Score: ${score}%`);
        console.log(`✅ Passed: ${this.successes.length}`);
        console.log(`⚠️ Warnings: ${this.warnings.length}`);
        console.log(`❌ Issues: ${this.issues.length}\n`);
        
        // Detailed results
        if (this.successes.length > 0) {
            console.log('✅ SUCCESSES:');
            this.successes.forEach(success => console.log(`   ${success}`));
            console.log();
        }
        
        if (this.warnings.length > 0) {
            console.log('⚠️ WARNINGS:');
            this.warnings.forEach(warning => console.log(`   ${warning}`));
            console.log();
        }
        
        if (this.issues.length > 0) {
            console.log('❌ ISSUES TO FIX:');
            this.issues.forEach(issue => console.log(`   ${issue}`));
            console.log();
        }
        
        // Recommendations
        console.log('💡 RECOMMENDATIONS:');
        
        if (score >= 90) {
            console.log('   🏆 Excellent SEO optimization! Your AI/ML portfolio is well-optimized for search visibility.');
        } else if (score >= 75) {
            console.log('   🎉 Good SEO foundation. Address warnings to improve further.');
        } else if (score >= 60) {
            console.log('   📈 Decent SEO setup. Focus on fixing issues and adding missing elements.');
        } else {
            console.log('   🔧 SEO needs improvement. Address critical issues first.');
        }
        
        console.log('\n   • Regularly update content with new projects and research');
        console.log('   • Monitor Core Web Vitals and page speed');
        console.log('   • Build quality backlinks from AI/ML community');
        console.log('   • Keep technical content fresh and relevant');
        console.log('   • Submit sitemap to Google Search Console');
        
        // Save report
        const report = {
            timestamp: new Date().toISOString(),
            score: score,
            successes: this.successes,
            warnings: this.warnings,
            issues: this.issues,
            recommendations: [
                'Update content regularly with new projects',
                'Monitor Core Web Vitals',
                'Build quality backlinks',
                'Keep technical content current',
                'Submit to search engines'
            ]
        };
        
        fs.writeFile('./seo-report.json', JSON.stringify(report, null, 2))
            .then(() => console.log('\n📄 Detailed report saved to seo-report.json'))
            .catch(() => console.log('\n⚠️ Could not save detailed report'));
        
        console.log('\n' + '='.repeat(50));
        
        // Exit code based on issues
        if (this.issues.length > 0) {
            console.log('❌ SEO validation completed with issues');
            process.exit(1);
        } else {
            console.log('✅ SEO validation completed successfully');
            process.exit(0);
        }
    }
}

// CLI execution
if (require.main === module) {
    const validator = new SEOValidator();
    validator.validate().catch(console.error);
}

module.exports = SEOValidator;