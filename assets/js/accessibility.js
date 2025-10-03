/**
 * Accessibility Enhancement System
 * Provides comprehensive accessibility features for technical content
 */

class AccessibilityManager {
    constructor() {
        this.focusableElements = [];
        this.currentFocusIndex = -1;
        this.announcements = [];
        this.init();
    }

    init() {
        this.setupARIALabels();
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupFocusManagement();
        this.setupSkipLinks();
        this.setupHighContrastMode();
        this.setupReducedMotion();
        this.setupLiveRegions();
    }

    /**
     * Set up ARIA labels for technical diagrams and research visualizations
     */
    setupARIALabels() {
        console.log('🔍 Setting up ARIA labels...');

        // Technical diagrams
        const diagrams = document.querySelectorAll('.technical-diagram, .artifact-image, .diagram-container img');
        diagrams.forEach((diagram, index) => {
            if (!diagram.getAttribute('aria-label')) {
                const title = diagram.alt || diagram.title || `Technical diagram ${index + 1}`;
                diagram.setAttribute('aria-label', `${title}. Click to expand for detailed view.`);
            }
            
            diagram.setAttribute('role', 'img');
            diagram.setAttribute('tabindex', '0');
            
            // Add keyboard interaction
            diagram.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.expandDiagram(diagram);
                }
            });
        });

        // Research plots
        const plots = document.querySelectorAll('.research-plot, .data-visualization, .chart-container img');
        plots.forEach((plot, index) => {
            if (!plot.getAttribute('aria-label')) {
                const title = plot.alt || plot.title || `Research visualization ${index + 1}`;
                plot.setAttribute('aria-label', `${title}. Interactive data visualization.`);
            }
            
            plot.setAttribute('role', 'img');
            plot.setAttribute('tabindex', '0');
            plot.setAttribute('aria-describedby', this.createDescription(plot, 'research-data'));
        });

        // Project screenshots
        const screenshots = document.querySelectorAll('.project-screenshot, .project-image, .project-card img');
        screenshots.forEach((screenshot, index) => {
            if (!screenshot.getAttribute('aria-label')) {
                const title = screenshot.alt || screenshot.title || `Project screenshot ${index + 1}`;
                screenshot.setAttribute('aria-label', `${title}. Project demonstration image.`);
            }
            
            screenshot.setAttribute('role', 'img');
        });

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn, .category-filter');
        filterButtons.forEach(button => {
            const category = button.textContent || button.getAttribute('data-category');
            button.setAttribute('aria-label', `Filter by ${category}`);
            button.setAttribute('role', 'button');
            
            if (button.classList.contains('active')) {
                button.setAttribute('aria-pressed', 'true');
            } else {
                button.setAttribute('aria-pressed', 'false');
            }
        });

        // Modal dialogs
        const modals = document.querySelectorAll('.modal, .project-modal, .image-modal');
        modals.forEach(modal => {
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            
            const title = modal.querySelector('.modal-title, h1, h2, h3');
            if (title) {
                const titleId = `modal-title-${Date.now()}`;
                title.id = titleId;
                modal.setAttribute('aria-labelledby', titleId);
            }
        });

        console.log('✓ ARIA labels configured');
    }

    /**
     * Create descriptive text for complex content
     */
    createDescription(element, type) {
        const descId = `desc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        let descText = '';
        switch (type) {
            case 'research-data':
                descText = 'This visualization presents research data and analysis results. Use arrow keys to explore data points when focused.';
                break;
            case 'technical-diagram':
                descText = 'Technical architecture diagram showing system components and relationships. Press Enter to view in full screen.';
                break;
            case 'project-demo':
                descText = 'Project demonstration showing key features and functionality.';
                break;
            default:
                descText = 'Interactive content element. Use keyboard navigation to explore.';
        }
        
        const descElement = document.createElement('div');
        descElement.id = descId;
        descElement.className = 'sr-only';
        descElement.textContent = descText;
        
        document.body.appendChild(descElement);
        return descId;
    }

    /**
     * Set up comprehensive keyboard navigation
     */
    setupKeyboardNavigation() {
        console.log('⌨️ Setting up keyboard navigation...');

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Skip to main content (Alt + M)
            if (e.altKey && e.key === 'm') {
                e.preventDefault();
                this.skipToMain();
            }
            
            // Skip to navigation (Alt + N)
            if (e.altKey && e.key === 'n') {
                e.preventDefault();
                this.skipToNavigation();
            }
            
            // Toggle high contrast (Alt + H)
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                this.toggleHighContrast();
            }
            
            // Escape key handling
            if (e.key === 'Escape') {
                this.handleEscape();
            }
        });

        // Project category filters keyboard navigation
        const categoryFilters = document.querySelectorAll('.category-filter, .filter-btn');
        categoryFilters.forEach((filter, index) => {
            filter.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextIndex = (index + 1) % categoryFilters.length;
                    categoryFilters[nextIndex].focus();
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevIndex = (index - 1 + categoryFilters.length) % categoryFilters.length;
                    categoryFilters[prevIndex].focus();
                } else if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    filter.click();
                }
            });
        });

        // Project cards keyboard navigation
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `View details for ${card.querySelector('.project-card-title')?.textContent || 'project'}`);
            
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });

        // Modal keyboard navigation
        this.setupModalKeyboardNavigation();

        console.log('✓ Keyboard navigation configured');
    }

    setupModalKeyboardNavigation() {
        // Trap focus within modals
        document.addEventListener('keydown', (e) => {
            const openModal = document.querySelector('.modal.show, .project-modal.show, .image-modal.show');
            if (!openModal) return;

            if (e.key === 'Tab') {
                this.trapFocus(e, openModal);
            }
        });
    }

    trapFocus(e, modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * Set up screen reader support
     */
    setupScreenReaderSupport() {
        console.log('📢 Setting up screen reader support...');

        // Create live region for announcements
        this.liveRegion = document.createElement('div');
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('aria-atomic', 'true');
        this.liveRegion.className = 'sr-only';
        this.liveRegion.id = 'live-region';
        document.body.appendChild(this.liveRegion);

        // Announce page sections when they come into view
        if ('IntersectionObserver' in window) {
            const sectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const sectionName = this.getSectionName(entry.target);
                        this.announce(`Entering ${sectionName} section`);
                    }
                });
            }, { threshold: 0.5 });

            const sections = document.querySelectorAll('section[id]');
            sections.forEach(section => sectionObserver.observe(section));
        }

        // Announce filter changes
        document.addEventListener('click', (e) => {
            if (e.target.matches('.filter-btn, .category-filter')) {
                const category = e.target.textContent;
                this.announce(`Filtered to show ${category} items`);
                
                // Update aria-pressed states
                document.querySelectorAll('.filter-btn, .category-filter').forEach(btn => {
                    btn.setAttribute('aria-pressed', 'false');
                });
                e.target.setAttribute('aria-pressed', 'true');
            }
        });

        // Announce loading states
        this.setupLoadingAnnouncements();

        console.log('✓ Screen reader support configured');
    }

    setupLoadingAnnouncements() {
        // Announce when images finish loading
        document.addEventListener('load', (e) => {
            if (e.target.tagName === 'IMG' && e.target.classList.contains('lazy-image')) {
                const alt = e.target.alt || 'Image';
                this.announce(`${alt} loaded`);
            }
        }, true);

        // Announce when content is dynamically loaded
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.matches('.project-card, .artifact-item, .publication-item')) {
                                this.announce('Content updated');
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Announce messages to screen readers
     */
    announce(message, priority = 'polite') {
        if (!this.liveRegion) return;

        this.liveRegion.setAttribute('aria-live', priority);
        this.liveRegion.textContent = message;

        // Clear after announcement
        setTimeout(() => {
            this.liveRegion.textContent = '';
        }, 1000);

        console.log(`📢 Announced: ${message}`);
    }

    /**
     * Set up focus management
     */
    setupFocusManagement() {
        console.log('🎯 Setting up focus management...');

        // Enhance focus visibility
        const style = document.createElement('style');
        style.textContent = `
            .focus-visible {
                outline: 3px solid var(--color-primary) !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.2) !important;
            }
            
            .sr-only {
                position: absolute !important;
                width: 1px !important;
                height: 1px !important;
                padding: 0 !important;
                margin: -1px !important;
                overflow: hidden !important;
                clip: rect(0, 0, 0, 0) !important;
                white-space: nowrap !important;
                border: 0 !important;
            }
        `;
        document.head.appendChild(style);

        // Track focus for keyboard users
        let isKeyboardUser = false;
        
        document.addEventListener('keydown', () => {
            isKeyboardUser = true;
        });
        
        document.addEventListener('mousedown', () => {
            isKeyboardUser = false;
        });
        
        document.addEventListener('focusin', (e) => {
            if (isKeyboardUser) {
                e.target.classList.add('focus-visible');
            }
        });
        
        document.addEventListener('focusout', (e) => {
            e.target.classList.remove('focus-visible');
        });

        // Restore focus after modal closes
        this.setupModalFocusRestore();

        console.log('✓ Focus management configured');
    }

    setupModalFocusRestore() {
        let lastFocusedElement = null;

        // Store focus before modal opens
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-modal-trigger], .project-card, .artifact-image')) {
                lastFocusedElement = e.target;
            }
        });

        // Restore focus when modal closes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.matches('.modal, .project-modal, .image-modal')) {
                        if (!target.classList.contains('show') && lastFocusedElement) {
                            setTimeout(() => {
                                lastFocusedElement.focus();
                                lastFocusedElement = null;
                            }, 100);
                        }
                    }
                }
            });
        });

        observer.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['class']
        });
    }

    /**
     * Set up skip links for better navigation
     */
    setupSkipLinks() {
        console.log('🔗 Setting up skip links...');

        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#navigation" class="skip-link">Skip to navigation</a>
            <a href="#projects" class="skip-link">Skip to projects</a>
            <a href="#contact" class="skip-link">Skip to contact</a>
        `;

        // Style skip links
        const skipStyle = document.createElement('style');
        skipStyle.textContent = `
            .skip-links {
                position: absolute;
                top: -100px;
                left: 0;
                z-index: 9999;
            }
            
            .skip-link {
                position: absolute;
                top: -100px;
                left: 8px;
                padding: 8px 16px;
                background: var(--color-primary);
                color: white;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
                transition: top 0.3s;
            }
            
            .skip-link:focus {
                top: 8px;
            }
        `;
        document.head.appendChild(skipStyle);
        document.body.insertBefore(skipLinks, document.body.firstChild);

        // Add main content landmark if it doesn't exist
        if (!document.getElementById('main-content')) {
            const main = document.querySelector('main') || document.querySelector('.hero-section');
            if (main) {
                main.id = 'main-content';
                main.setAttribute('role', 'main');
            }
        }

        console.log('✓ Skip links configured');
    }

    skipToMain() {
        const main = document.getElementById('main-content') || document.querySelector('main');
        if (main) {
            main.focus();
            main.scrollIntoView({ behavior: 'smooth' });
            this.announce('Skipped to main content');
        }
    }

    skipToNavigation() {
        const nav = document.getElementById('navigation') || document.querySelector('nav');
        if (nav) {
            const firstLink = nav.querySelector('a, button');
            if (firstLink) {
                firstLink.focus();
                this.announce('Skipped to navigation');
            }
        }
    }

    /**
     * Set up high contrast mode
     */
    setupHighContrastMode() {
        console.log('🎨 Setting up high contrast mode...');

        // Check for system preference
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
        
        if (prefersHighContrast.matches) {
            this.enableHighContrast();
        }

        // Listen for changes
        prefersHighContrast.addEventListener('change', (e) => {
            if (e.matches) {
                this.enableHighContrast();
            } else {
                this.disableHighContrast();
            }
        });

        console.log('✓ High contrast mode configured');
    }

    toggleHighContrast() {
        const isEnabled = document.body.classList.contains('high-contrast');
        if (isEnabled) {
            this.disableHighContrast();
        } else {
            this.enableHighContrast();
        }
    }

    enableHighContrast() {
        document.body.classList.add('high-contrast');
        
        const style = document.createElement('style');
        style.id = 'high-contrast-styles';
        style.textContent = `
            .high-contrast {
                --color-primary: #0000ff !important;
                --color-text: #000000 !important;
                --color-background: #ffffff !important;
                --color-gray-600: #000000 !important;
                --color-gray-900: #000000 !important;
            }
            
            .high-contrast * {
                background-color: white !important;
                color: black !important;
                border-color: black !important;
            }
            
            .high-contrast a,
            .high-contrast button {
                color: #0000ff !important;
                text-decoration: underline !important;
            }
            
            .high-contrast img {
                filter: contrast(150%) !important;
            }
        `;
        
        document.head.appendChild(style);
        this.announce('High contrast mode enabled');
    }

    disableHighContrast() {
        document.body.classList.remove('high-contrast');
        const style = document.getElementById('high-contrast-styles');
        if (style) {
            style.remove();
        }
        this.announce('High contrast mode disabled');
    }

    /**
     * Set up reduced motion support
     */
    setupReducedMotion() {
        console.log('🎭 Setting up reduced motion support...');

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            this.enableReducedMotion();
        }

        prefersReducedMotion.addEventListener('change', (e) => {
            if (e.matches) {
                this.enableReducedMotion();
            } else {
                this.disableReducedMotion();
            }
        });

        console.log('✓ Reduced motion support configured');
    }

    enableReducedMotion() {
        document.body.classList.add('reduced-motion');
        this.announce('Reduced motion enabled');
    }

    disableReducedMotion() {
        document.body.classList.remove('reduced-motion');
    }

    /**
     * Set up live regions for dynamic content
     */
    setupLiveRegions() {
        // Status region for loading states
        const statusRegion = document.createElement('div');
        statusRegion.setAttribute('aria-live', 'polite');
        statusRegion.setAttribute('aria-label', 'Status updates');
        statusRegion.className = 'sr-only';
        statusRegion.id = 'status-region';
        document.body.appendChild(statusRegion);

        // Alert region for important messages
        const alertRegion = document.createElement('div');
        alertRegion.setAttribute('aria-live', 'assertive');
        alertRegion.setAttribute('aria-label', 'Important alerts');
        alertRegion.className = 'sr-only';
        alertRegion.id = 'alert-region';
        document.body.appendChild(alertRegion);
    }

    /**
     * Utility methods
     */
    getSectionName(section) {
        const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
        if (heading) {
            return heading.textContent.trim();
        }
        
        const id = section.id;
        return id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    expandDiagram(diagram) {
        // Integrate with existing image expansion functionality
        if (window.imageOptimizer && window.imageOptimizer.expandDiagram) {
            window.imageOptimizer.expandDiagram(diagram);
            this.announce('Diagram expanded to full screen. Press Escape to close.');
        }
    }

    handleEscape() {
        // Close any open modals
        const openModal = document.querySelector('.modal.show, .project-modal.show, .image-modal.show');
        if (openModal) {
            const closeButton = openModal.querySelector('.modal-close, .close-button');
            if (closeButton) {
                closeButton.click();
                this.announce('Modal closed');
            }
        }
    }

    /**
     * Accessibility audit
     */
    runAccessibilityAudit() {
        console.log('🔍 Running accessibility audit...');
        
        const issues = [];
        
        // Check for missing alt text
        const images = document.querySelectorAll('img');
        images.forEach((img, index) => {
            if (!img.alt && !img.getAttribute('aria-label')) {
                issues.push(`Image ${index + 1} missing alt text`);
            }
        });
        
        // Check for missing form labels
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach((input, index) => {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (!label && !input.getAttribute('aria-label')) {
                issues.push(`Form input ${index + 1} missing label`);
            }
        });
        
        // Check for proper heading hierarchy
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let lastLevel = 0;
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            if (level > lastLevel + 1) {
                issues.push(`Heading level skip at heading ${index + 1}`);
            }
            lastLevel = level;
        });
        
        console.log(`Accessibility audit complete. Found ${issues.length} issues:`, issues);
        return issues;
    }
}

// Initialize accessibility manager
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityManager = new AccessibilityManager();
    
    // Run audit in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setTimeout(() => {
            window.accessibilityManager.runAccessibilityAudit();
        }, 2000);
    }
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityManager;
}