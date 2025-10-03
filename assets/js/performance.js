/**
 * Runtime Performance Optimization
 * Handles client-side performance optimizations
 */

class PerformanceOptimizer {
    constructor() {
        this.metrics = {};
        this.observers = {};
        this.init();
    }

    init() {
        this.setupPerformanceMonitoring();
        this.optimizeScrolling();
        this.setupResourceHints();
        this.optimizeAnimations();
        this.setupIntersectionObservers();
    }

    /**
     * Set up performance monitoring and Core Web Vitals tracking
     */
    setupPerformanceMonitoring() {
        if (!('performance' in window)) return;

        // Monitor Core Web Vitals
        this.monitorCoreWebVitals();
        
        // Track custom metrics
        this.trackCustomMetrics();
        
        // Report performance data
        window.addEventListener('load', () => {
            setTimeout(() => this.reportPerformanceMetrics(), 1000);
        });
    }

    monitorCoreWebVitals() {
        // First Contentful Paint (FCP)
        if ('PerformanceObserver' in window) {
            try {
                const fcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
                    if (fcp) {
                        this.metrics.fcp = fcp.startTime;
                        console.log('FCP:', fcp.startTime);
                    }
                });
                fcpObserver.observe({ entryTypes: ['paint'] });
            } catch (error) {
                console.warn('FCP monitoring not supported');
            }

            // Largest Contentful Paint (LCP)
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.metrics.lcp = lastEntry.startTime;
                    console.log('LCP:', lastEntry.startTime);
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (error) {
                console.warn('LCP monitoring not supported');
            }

            // First Input Delay (FID)
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        this.metrics.fid = entry.processingStart - entry.startTime;
                        console.log('FID:', this.metrics.fid);
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (error) {
                console.warn('FID monitoring not supported');
            }

            // Cumulative Layout Shift (CLS)
            try {
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    });
                    this.metrics.cls = clsValue;
                    console.log('CLS:', clsValue);
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (error) {
                console.warn('CLS monitoring not supported');
            }
        }
    }

    trackCustomMetrics() {
        // Track time to interactive
        this.metrics.domContentLoaded = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
        this.metrics.loadComplete = performance.timing.loadEventEnd - performance.timing.navigationStart;
        
        // Track resource loading
        window.addEventListener('load', () => {
            const resources = performance.getEntriesByType('resource');
            this.metrics.resourceCount = resources.length;
            this.metrics.totalResourceSize = resources.reduce((total, resource) => {
                return total + (resource.transferSize || 0);
            }, 0);
        });
    }

    reportPerformanceMetrics() {
        console.group('Performance Metrics');
        console.log('Core Web Vitals:', {
            FCP: this.metrics.fcp,
            LCP: this.metrics.lcp,
            FID: this.metrics.fid,
            CLS: this.metrics.cls
        });
        console.log('Custom Metrics:', {
            domContentLoaded: this.metrics.domContentLoaded,
            loadComplete: this.metrics.loadComplete,
            resourceCount: this.metrics.resourceCount,
            totalResourceSize: this.metrics.totalResourceSize
        });
        console.groupEnd();

        // Send to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'performance_metrics', {
                fcp: this.metrics.fcp,
                lcp: this.metrics.lcp,
                fid: this.metrics.fid,
                cls: this.metrics.cls
            });
        }
    }

    /**
     * Optimize scrolling performance
     */
    optimizeScrolling() {
        let ticking = false;

        const optimizedScrollHandler = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        // Use passive listeners for better performance
        window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
        window.addEventListener('resize', optimizedScrollHandler, { passive: true });
    }

    handleScroll() {
        // Implement scroll-based optimizations
        const scrollY = window.scrollY;
        
        // Update header on scroll (if needed)
        const header = document.querySelector('.header');
        if (header) {
            if (scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Trigger lazy loading for elements coming into view
        this.triggerLazyLoading();
    }

    triggerLazyLoading() {
        // This integrates with the image optimizer
        if (window.imageOptimizer && window.imageOptimizer.updateObserver) {
            window.imageOptimizer.updateObserver();
        }
    }

    /**
     * Set up resource hints for better loading performance
     */
    setupResourceHints() {
        // Preload critical resources
        const criticalResources = [
            { href: 'assets/images/profile/headshot.svg', as: 'image' },
            { href: 'assets/data/ai-product-projects.json', as: 'fetch', crossorigin: 'anonymous' },
            { href: 'assets/data/ml-engineering-projects.json', as: 'fetch', crossorigin: 'anonymous' },
            { href: 'assets/data/research-projects.json', as: 'fetch', crossorigin: 'anonymous' }
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            if (resource.crossorigin) {
                link.crossOrigin = resource.crossorigin;
            }
            document.head.appendChild(link);
        });

        // DNS prefetch for external resources
        const externalDomains = [
            'fonts.googleapis.com',
            'fonts.gstatic.com',
            'github.com',
            'linkedin.com'
        ];

        externalDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = `//${domain}`;
            document.head.appendChild(link);
        });
    }

    /**
     * Optimize animations for better performance
     */
    optimizeAnimations() {
        // Respect user's motion preferences
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            document.documentElement.style.setProperty('--transition-fast', '0ms');
            document.documentElement.style.setProperty('--transition-base', '0ms');
            document.documentElement.style.setProperty('--transition-slow', '0ms');
        }

        // Listen for changes in motion preference
        prefersReducedMotion.addEventListener('change', (e) => {
            if (e.matches) {
                document.documentElement.style.setProperty('--transition-fast', '0ms');
                document.documentElement.style.setProperty('--transition-base', '0ms');
                document.documentElement.style.setProperty('--transition-slow', '0ms');
            } else {
                document.documentElement.style.removeProperty('--transition-fast');
                document.documentElement.style.removeProperty('--transition-base');
                document.documentElement.style.removeProperty('--transition-slow');
            }
        });

        // Use will-change property for elements that will animate
        const animatedElements = document.querySelectorAll('.hero-image-container, .project-card, .nav-link');
        animatedElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.willChange = 'transform';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.willChange = 'auto';
            });
        });
    }

    /**
     * Set up intersection observers for performance
     */
    setupIntersectionObservers() {
        // Observe sections for analytics and performance tracking
        if ('IntersectionObserver' in window) {
            const sectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const sectionName = entry.target.id || entry.target.className;
                        console.log(`Section in view: ${sectionName}`);
                        
                        // Track section views for analytics
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'section_view', {
                                section_name: sectionName
                            });
                        }
                    }
                });
            }, {
                threshold: 0.5
            });

            // Observe main sections
            const sections = document.querySelectorAll('section[id]');
            sections.forEach(section => {
                sectionObserver.observe(section);
            });

            this.observers.sections = sectionObserver;
        }
    }

    /**
     * Optimize network requests
     */
    optimizeNetworkRequests() {
        // Batch API requests where possible
        const requestQueue = [];
        let requestTimer = null;

        window.batchRequest = (url, options = {}) => {
            return new Promise((resolve, reject) => {
                requestQueue.push({ url, options, resolve, reject });
                
                if (requestTimer) {
                    clearTimeout(requestTimer);
                }
                
                requestTimer = setTimeout(() => {
                    this.processBatchedRequests();
                }, 50); // Batch requests within 50ms
            });
        };
    }

    processBatchedRequests() {
        // Process queued requests
        // This is a simplified implementation
        const requests = [...requestQueue];
        requestQueue.length = 0;
        
        requests.forEach(({ url, options, resolve, reject }) => {
            fetch(url, options)
                .then(response => resolve(response))
                .catch(error => reject(error));
        });
    }

    /**
     * Memory management
     */
    setupMemoryManagement() {
        // Clean up observers and event listeners when needed
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        // Monitor memory usage (if available)
        if ('memory' in performance) {
            setInterval(() => {
                const memInfo = performance.memory;
                if (memInfo.usedJSHeapSize > memInfo.jsHeapSizeLimit * 0.9) {
                    console.warn('High memory usage detected');
                    this.performMemoryCleanup();
                }
            }, 30000); // Check every 30 seconds
        }
    }

    performMemoryCleanup() {
        // Remove unused event listeners
        // Clear caches
        // Garbage collect where possible
        console.log('Performing memory cleanup');
    }

    cleanup() {
        // Clean up observers
        Object.values(this.observers).forEach(observer => {
            if (observer && observer.disconnect) {
                observer.disconnect();
            }
        });
    }

    /**
     * Get performance score
     */
    getPerformanceScore() {
        const score = {
            fcp: this.metrics.fcp < 1800 ? 'good' : this.metrics.fcp < 3000 ? 'needs-improvement' : 'poor',
            lcp: this.metrics.lcp < 2500 ? 'good' : this.metrics.lcp < 4000 ? 'needs-improvement' : 'poor',
            fid: this.metrics.fid < 100 ? 'good' : this.metrics.fid < 300 ? 'needs-improvement' : 'poor',
            cls: this.metrics.cls < 0.1 ? 'good' : this.metrics.cls < 0.25 ? 'needs-improvement' : 'poor'
        };

        return score;
    }
}

// Initialize performance optimizer
document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer = new PerformanceOptimizer();
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}