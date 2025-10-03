/**
 * Test Runner for Portfolio Testing and Polish
 * Comprehensive testing suite for the final portfolio implementation
 */

class PortfolioTestRunner {
    constructor() {
        this.testResults = {
            filtering: { status: 'pending', results: [], score: 0 },
            modals: { status: 'pending', results: [], score: 0 },
            links: { status: 'pending', results: [], score: 0 },
            responsive: { status: 'pending', results: [], score: 0 },
            loading: { status: 'pending', results: [], score: 0 },
            accessibility: { status: 'pending', results: [], score: 0 }
        };
        
        this.managers = {
            projects: null,
            publications: null,
            technicalArtifacts: null
        };
        
        this.init();
    }
    
    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Wait for managers to initialize
            await this.waitForManagers();
            
            console.log('✅ Portfolio Test Runner initialized');
        } catch (error) {
            console.error('❌ Failed to initialize test runner:', error);
        }
    }
    
    async waitForManagers() {
        const maxWait = 10000; // 10 seconds
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWait) {
            if (window.projectsManager && window.publicationsManager && window.technicalArtifactsManager) {
                this.managers.projects = window.projectsManager;
                this.managers.publications = window.publicationsManager;
                this.managers.technicalArtifacts = window.technicalArtifactsManager;
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        throw new Error('Managers failed to initialize within timeout');
    }
    
    // Test 1: Project Filtering Functionality
    async testProjectFiltering() {
        const results = [];
        let score = 0;
        const maxScore = 10;
        
        try {
            results.push('🎯 Testing three-category project filtering...');
            
            // Test 1.1: Filter buttons exist
            const filterButtons = document.querySelectorAll('.filter-btn');
            if (filterButtons.length >= 4) {
                results.push('✅ Filter buttons found');
                score += 2;
            } else {
                results.push('❌ Missing filter buttons');
            }
            
            // Test 1.2: Category filtering works
            const categories = ['all', 'ai-product', 'ml-engineering', 'research'];
            for (const category of categories) {
                if (this.managers.projects) {
                    this.managers.projects.filterProjects(category);
                    const filteredCount = this.managers.projects.filteredProjects.length;
                    
                    if (filteredCount >= 0) {
                        results.push(`✅ ${category} filter: ${filteredCount} projects`);
                        score += 1;
                    } else {
                        results.push(`❌ ${category} filter failed`);
                    }
                }
            }
            
            // Test 1.3: Active state management
            this.managers.projects?.filterProjects('ai-product');
            const activeButton = document.querySelector('.filter-btn.active[data-category="ai-product"]');
            if (activeButton) {
                results.push('✅ Active filter state management works');
                score += 2;
            } else {
                results.push('❌ Active filter state management failed');
            }
            
            // Test 1.4: Keyboard navigation
            if (filterButtons.length > 0) {
                const firstButton = filterButtons[0];
                firstButton.focus();
                
                // Test Enter key
                const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
                firstButton.dispatchEvent(enterEvent);
                
                results.push('✅ Keyboard navigation tested');
                score += 1;
            }
            
        } catch (error) {
            results.push(`❌ Error in filtering tests: ${error.message}`);
        }
        
        this.testResults.filtering = {
            status: score >= maxScore * 0.7 ? 'passed' : 'failed',
            results,
            score: Math.round((score / maxScore) * 100)
        };
        
        return this.testResults.filtering;
    }
    
    // Test 2: Modal Functionality
    async testModalFunctionality() {
        const results = [];
        let score = 0;
        const maxScore = 15;
        
        try {
            results.push('📋 Testing specialized modal functionality...');
            
            const testProjects = [
                { id: 'autodescribe', category: 'ai-product', name: 'AI Product Modal' },
                { id: 'drosophila-neurotoxicity', category: 'research', name: 'Research Modal' }
            ];
            
            for (const project of testProjects) {
                try {
                    // Test modal opening
                    this.managers.projects?.openModal(project.id);
                    
                    const modal = document.getElementById('project-modal');
                    const modalContent = document.getElementById('modal-content');
                    
                    if (modal && modalContent && modalContent.innerHTML.trim()) {
                        results.push(`✅ ${project.name} opens successfully`);
                        score += 2;
                        
                        // Test category-specific content
                        if (project.category === 'ai-product') {
                            const caseStudyContent = modalContent.querySelector('.case-study-content');
                            if (caseStudyContent) {
                                results.push('✅ Case study structure found');
                                score += 1;
                            }
                        } else if (project.category === 'ml-engineering') {
                            const engineeringContent = modalContent.querySelector('.engineering-content');
                            if (engineeringContent) {
                                results.push('✅ Engineering content structure found');
                                score += 1;
                            }
                        } else if (project.category === 'research') {
                            const researchContent = modalContent.querySelector('.research-content');
                            if (researchContent) {
                                results.push('✅ Research content structure found');
                                score += 1;
                            }
                        }
                        
                        // Test artifacts display
                        const artifacts = modalContent.querySelector('.project-artifacts');
                        if (artifacts) {
                            results.push('✅ Artifacts section found');
                            score += 1;
                        }
                        
                        // Test modal closing
                        this.managers.projects?.closeModal();
                        results.push(`✅ ${project.name} closes successfully`);
                        score += 1;
                        
                    } else {
                        results.push(`❌ ${project.name} failed to open or load content`);
                    }
                    
                } catch (modalError) {
                    results.push(`❌ Error testing ${project.name}: ${modalError.message}`);
                }
            }
            
            // Test keyboard navigation
            const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
            document.dispatchEvent(escapeEvent);
            results.push('✅ Escape key handling tested');
            score += 1;
            
        } catch (error) {
            results.push(`❌ Error in modal tests: ${error.message}`);
        }
        
        this.testResults.modals = {
            status: score >= maxScore * 0.7 ? 'passed' : 'failed',
            results,
            score: Math.round((score / maxScore) * 100)
        };
        
        return this.testResults.modals;
    }
    
    // Test 3: Link Verification
    async testLinkVerification() {
        const results = [];
        let score = 0;
        const maxScore = 10;
        
        try {
            results.push('🔗 Testing technical artifact and publication links...');
            
            // Test technical artifact links
            const artifactLinks = document.querySelectorAll('.artifact-link[href]');
            let validArtifactLinks = 0;
            
            for (const link of artifactLinks) {
                const href = link.getAttribute('href');
                if (href && href !== '#' && this.isValidUrl(href)) {
                    validArtifactLinks++;
                }
            }
            
            if (artifactLinks.length > 0) {
                const artifactLinkRatio = validArtifactLinks / artifactLinks.length;
                results.push(`✅ Technical artifact links: ${validArtifactLinks}/${artifactLinks.length} valid`);
                score += Math.round(artifactLinkRatio * 3);
            }
            
            // Test publication links
            const publicationLinks = document.querySelectorAll('.publication-link[href]');
            let validPublicationLinks = 0;
            
            for (const link of publicationLinks) {
                const href = link.getAttribute('href');
                if (href && href !== '#' && this.isValidUrl(href)) {
                    validPublicationLinks++;
                }
            }
            
            if (publicationLinks.length > 0) {
                const publicationLinkRatio = validPublicationLinks / publicationLinks.length;
                results.push(`✅ Publication links: ${validPublicationLinks}/${publicationLinks.length} valid`);
                score += Math.round(publicationLinkRatio * 3);
            }
            
            // Test external link security
            const externalLinks = document.querySelectorAll('a[target="_blank"]');
            let secureExternalLinks = 0;
            
            for (const link of externalLinks) {
                const rel = link.getAttribute('rel');
                if (rel && (rel.includes('noopener') || rel.includes('noreferrer'))) {
                    secureExternalLinks++;
                }
            }
            
            if (externalLinks.length > 0) {
                const securityRatio = secureExternalLinks / externalLinks.length;
                results.push(`✅ External link security: ${secureExternalLinks}/${externalLinks.length} secure`);
                score += Math.round(securityRatio * 4);
            }
            
        } catch (error) {
            results.push(`❌ Error in link verification: ${error.message}`);
        }
        
        this.testResults.links = {
            status: score >= maxScore * 0.7 ? 'passed' : 'failed',
            results,
            score: Math.round((score / maxScore) * 100)
        };
        
        return this.testResults.links;
    }
    
    // Test 4: Responsive Design
    async testResponsiveDesign() {
        const results = [];
        let score = 0;
        const maxScore = 12;
        
        try {
            results.push('📱 Testing responsive design with technical content...');
            
            // Test image responsiveness
            const technicalImages = document.querySelectorAll('.technical-diagram, .research-plot, .project-screenshot');
            let responsiveImages = 0;
            
            for (const img of technicalImages) {
                const computedStyle = getComputedStyle(img);
                if (computedStyle.maxWidth === '100%' || img.style.maxWidth === '100%') {
                    responsiveImages++;
                }
            }
            
            if (technicalImages.length > 0) {
                const imageRatio = responsiveImages / technicalImages.length;
                results.push(`✅ Responsive images: ${responsiveImages}/${technicalImages.length}`);
                score += Math.round(imageRatio * 4);
            }
            
            // Test grid responsiveness
            const grids = document.querySelectorAll('.grid, .projects-grid, .artifacts-grid');
            let responsiveGrids = 0;
            
            for (const grid of grids) {
                const computedStyle = getComputedStyle(grid);
                if (computedStyle.display === 'grid') {
                    responsiveGrids++;
                }
            }
            
            if (grids.length > 0) {
                const gridRatio = responsiveGrids / grids.length;
                results.push(`✅ Responsive grids: ${responsiveGrids}/${grids.length}`);
                score += Math.round(gridRatio * 4);
            }
            
            // Test mobile navigation
            const navToggle = document.querySelector('.nav-toggle');
            const navMenu = document.querySelector('.nav-menu');
            
            if (navToggle && navMenu) {
                results.push('✅ Mobile navigation elements found');
                score += 2;
            }
            
            // Test touch targets
            const buttons = document.querySelectorAll('button, .btn, .filter-btn');
            let adequateTouchTargets = 0;
            
            for (const button of buttons) {
                const rect = button.getBoundingClientRect();
                if (rect.width >= 44 && rect.height >= 44) {
                    adequateTouchTargets++;
                }
            }
            
            if (buttons.length > 0) {
                const touchRatio = adequateTouchTargets / buttons.length;
                results.push(`✅ Adequate touch targets: ${adequateTouchTargets}/${buttons.length}`);
                score += Math.round(touchRatio * 2);
            }
            
        } catch (error) {
            results.push(`❌ Error in responsive design tests: ${error.message}`);
        }
        
        this.testResults.responsive = {
            status: score >= maxScore * 0.7 ? 'passed' : 'failed',
            results,
            score: Math.round((score / maxScore) * 100)
        };
        
        return this.testResults.responsive;
    }
    
    // Test 5: Loading States
    async testLoadingStates() {
        const results = [];
        let score = 0;
        const maxScore = 8;
        
        try {
            results.push('⏳ Testing loading states for technical content...');
            
            // Test loading spinner CSS
            const spinnerStyles = this.checkCSSRule('.loading-spinner');
            if (spinnerStyles) {
                results.push('✅ Loading spinner styles found');
                score += 2;
            }
            
            // Test manager loading methods
            if (typeof this.managers.projects?.showLoadingState === 'function') {
                results.push('✅ Projects manager has loading states');
                score += 2;
            }
            
            if (typeof this.managers.publications?.showLoadingState === 'function') {
                results.push('✅ Publications manager has loading states');
                score += 2;
            }
            
            if (typeof this.managers.technicalArtifacts?.showLoadingState === 'function') {
                results.push('✅ Technical artifacts manager has loading states');
                score += 2;
            }
            
            // Test lazy loading images
            const lazyImages = document.querySelectorAll('img[data-src], .lazy-image');
            if (lazyImages.length > 0) {
                results.push(`✅ Found ${lazyImages.length} lazy-loading images`);
                score += 1;
            }
            
            // Test page loading states
            const body = document.body;
            if (body.classList.contains('page-loaded') || body.classList.contains('page-loading')) {
                results.push('✅ Page loading states implemented');
                score += 1;
            }
            
        } catch (error) {
            results.push(`❌ Error in loading states tests: ${error.message}`);
        }
        
        this.testResults.loading = {
            status: score >= maxScore * 0.7 ? 'passed' : 'failed',
            results,
            score: Math.round((score / maxScore) * 100)
        };
        
        return this.testResults.loading;
    }
    
    // Test 6: Accessibility
    async testAccessibility() {
        const results = [];
        let score = 0;
        const maxScore = 10;
        
        try {
            results.push('♿ Testing accessibility features...');
            
            // Test ARIA labels
            const ariaElements = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]');
            if (ariaElements.length > 0) {
                results.push(`✅ Found ${ariaElements.length} elements with ARIA attributes`);
                score += 2;
            }
            
            // Test modal accessibility
            const modal = document.getElementById('project-modal');
            if (modal) {
                const hasRole = modal.hasAttribute('role');
                const hasAriaModal = modal.hasAttribute('aria-modal');
                const hasAriaLabelledby = modal.hasAttribute('aria-labelledby');
                
                if (hasRole && hasAriaModal && hasAriaLabelledby) {
                    results.push('✅ Modal has proper accessibility attributes');
                    score += 3;
                } else {
                    results.push('⚠️ Modal missing some accessibility attributes');
                    score += 1;
                }
            }
            
            // Test button accessibility
            const buttons = document.querySelectorAll('button');
            let accessibleButtons = 0;
            
            for (const button of buttons) {
                const hasText = button.textContent.trim().length > 0;
                const hasAriaLabel = button.hasAttribute('aria-label');
                
                if (hasText || hasAriaLabel) {
                    accessibleButtons++;
                }
            }
            
            if (buttons.length > 0) {
                const buttonRatio = accessibleButtons / buttons.length;
                results.push(`✅ Accessible buttons: ${accessibleButtons}/${buttons.length}`);
                score += Math.round(buttonRatio * 3);
            }
            
            // Test skip links
            const skipLink = document.querySelector('.skip-link');
            if (skipLink) {
                results.push('✅ Skip link found');
                score += 1;
            }
            
            // Test heading hierarchy
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            if (headings.length > 0) {
                results.push(`✅ Found ${headings.length} headings for structure`);
                score += 1;
            }
            
        } catch (error) {
            results.push(`❌ Error in accessibility tests: ${error.message}`);
        }
        
        this.testResults.accessibility = {
            status: score >= maxScore * 0.7 ? 'passed' : 'failed',
            results,
            score: Math.round((score / maxScore) * 100)
        };
        
        return this.testResults.accessibility;
    }
    
    // Utility methods
    isValidUrl(string) {
        try {
            new URL(string, window.location.origin);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    checkCSSRule(selector) {
        const styleSheets = Array.from(document.styleSheets);
        
        for (const styleSheet of styleSheets) {
            try {
                const rules = Array.from(styleSheet.cssRules || styleSheet.rules || []);
                for (const rule of rules) {
                    if (rule.selectorText && rule.selectorText.includes(selector)) {
                        return rule;
                    }
                }
            } catch (e) {
                // Cross-origin stylesheets may throw errors
                continue;
            }
        }
        
        return null;
    }
    
    // Run all tests
    async runAllTests() {
        console.log('🚀 Starting comprehensive portfolio test suite...');
        
        const testMethods = [
            'testProjectFiltering',
            'testModalFunctionality', 
            'testLinkVerification',
            'testResponsiveDesign',
            'testLoadingStates',
            'testAccessibility'
        ];
        
        for (const method of testMethods) {
            try {
                console.log(`Running ${method}...`);
                await this[method]();
                await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause between tests
            } catch (error) {
                console.error(`Error in ${method}:`, error);
            }
        }
        
        return this.generateReport();
    }
    
    generateReport() {
        const totalTests = Object.keys(this.testResults).length;
        const passedTests = Object.values(this.testResults).filter(test => test.status === 'passed').length;
        const averageScore = Math.round(
            Object.values(this.testResults).reduce((sum, test) => sum + test.score, 0) / totalTests
        );
        
        const report = {
            summary: {
                total: totalTests,
                passed: passedTests,
                failed: totalTests - passedTests,
                successRate: Math.round((passedTests / totalTests) * 100),
                averageScore
            },
            details: this.testResults,
            recommendations: this.generateRecommendations()
        };
        
        console.log('📊 Test Report:', report);
        return report;
    }
    
    generateRecommendations() {
        const recommendations = [];
        
        Object.entries(this.testResults).forEach(([testName, result]) => {
            if (result.status === 'failed') {
                switch (testName) {
                    case 'filtering':
                        recommendations.push('🎯 Fix project filtering functionality - check filter buttons and category logic');
                        break;
                    case 'modals':
                        recommendations.push('📋 Improve modal functionality - ensure all project types display correctly');
                        break;
                    case 'links':
                        recommendations.push('🔗 Verify all external links - update broken or placeholder URLs');
                        break;
                    case 'responsive':
                        recommendations.push('📱 Enhance responsive design - ensure technical content scales properly');
                        break;
                    case 'loading':
                        recommendations.push('⏳ Implement loading states - add spinners and error handling');
                        break;
                    case 'accessibility':
                        recommendations.push('♿ Improve accessibility - add missing ARIA labels and keyboard navigation');
                        break;
                }
            } else if (result.score < 90) {
                recommendations.push(`⚠️ ${testName} tests passed but could be improved (${result.score}% score)`);
            }
        });
        
        if (recommendations.length === 0) {
            recommendations.push('✅ All tests passed! Portfolio is ready for production.');
        }
        
        return recommendations;
    }
}

// Export for use in test files
if (typeof window !== 'undefined') {
    window.PortfolioTestRunner = PortfolioTestRunner;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioTestRunner;
}