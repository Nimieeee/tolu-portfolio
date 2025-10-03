/**
 * Image Optimization System
 * Handles lazy loading, fallback images, and optimization for technical content
 */

class ImageOptimizer {
    constructor() {
        this.lazyImages = [];
        this.fallbackImage = 'assets/images/fallback-image.svg';
        this.categoryFallbacks = {
            'technical-diagram': 'assets/images/fallbacks/technical-diagram-fallback.svg',
            'research-plot': 'assets/images/fallbacks/research-plot-fallback.svg',
            'project-screenshot': 'assets/images/fallbacks/project-screenshot-fallback.svg',
            'default': 'assets/images/fallbacks/default-fallback.svg'
        };
        this.observerOptions = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.setupFallbackHandling();
        this.optimizeExistingImages();
    }

    /**
     * Set up Intersection Observer for lazy loading
     */
    setupLazyLoading() {
        // Check if Intersection Observer is supported
        if ('IntersectionObserver' in window) {
            this.lazyImageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                });
            }, this.observerOptions);

            this.observeLazyImages();
        } else {
            // Fallback for browsers without Intersection Observer
            this.loadAllImages();
        }
    }

    /**
     * Find and observe all lazy-loadable images
     */
    observeLazyImages() {
        const lazyImages = document.querySelectorAll('img[data-src], img[data-lazy]');
        lazyImages.forEach(img => {
            this.lazyImageObserver.observe(img);
        });
    }

    /**
     * Load a specific image
     */
    loadImage(img) {
        const src = img.dataset.src || img.dataset.lazy;
        if (src) {
            // Create a new image to preload
            const imageLoader = new Image();
            
            imageLoader.onload = () => {
                img.src = src;
                img.classList.add('loaded');
                img.classList.remove('loading');
                
                // Remove data attributes after loading
                delete img.dataset.src;
                delete img.dataset.lazy;
            };

            imageLoader.onerror = () => {
                this.handleImageError(img);
            };

            // Add loading class
            img.classList.add('loading');
            imageLoader.src = src;
        }
    }

    /**
     * Handle image loading errors with fallback
     */
    handleImageError(img) {
        console.warn(`Failed to load image: ${img.src || img.dataset.src}`);
        
        // Determine appropriate fallback based on image context
        let fallbackSrc = this.fallbackImage;
        
        // Check for category-specific fallbacks
        if (img.classList.contains('technical-diagram') || img.closest('.technical-diagram')) {
            fallbackSrc = this.categoryFallbacks['technical-diagram'];
        } else if (img.classList.contains('research-plot') || img.closest('.research-plot')) {
            fallbackSrc = this.categoryFallbacks['research-plot'];
        } else if (img.classList.contains('project-screenshot') || img.closest('.project-screenshot')) {
            fallbackSrc = this.categoryFallbacks['project-screenshot'];
        } else if (img.classList.contains('artifact-image')) {
            // For technical artifacts, use technical diagram fallback
            fallbackSrc = this.categoryFallbacks['technical-diagram'];
        }
        
        // Set fallback image
        img.src = fallbackSrc;
        img.classList.add('fallback');
        img.classList.remove('loading');
        
        // Add error handling attributes
        img.setAttribute('alt', img.getAttribute('alt') || 'Image not available');
        img.setAttribute('title', 'Image could not be loaded');
    }

    /**
     * Set up global error handling for all images
     */
    setupFallbackHandling() {
        // Handle existing images that fail to load
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                this.handleImageError(e.target);
            }
        }, true);
    }

    /**
     * Optimize existing images in the DOM
     */
    optimizeExistingImages() {
        const images = document.querySelectorAll('img:not([data-src]):not([data-lazy])');
        images.forEach(img => {
            // Add loading attribute for modern browsers
            if ('loading' in HTMLImageElement.prototype) {
                img.loading = 'lazy';
            }

            // Add error handling
            img.addEventListener('error', () => {
                this.handleImageError(img);
            });

            // Add loaded class if image is already loaded
            if (img.complete && img.naturalHeight !== 0) {
                img.classList.add('loaded');
            }
        });
    }

    /**
     * Fallback for browsers without Intersection Observer
     */
    loadAllImages() {
        const lazyImages = document.querySelectorAll('img[data-src], img[data-lazy]');
        lazyImages.forEach(img => {
            this.loadImage(img);
        });
    }

    /**
     * Create optimized image element
     */
    createOptimizedImage(src, alt = '', className = '') {
        const img = document.createElement('img');
        
        // Use lazy loading
        img.dataset.src = src;
        img.alt = alt;
        img.className = className;
        
        // Add placeholder while loading
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjhmOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Mb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg==';
        
        // Observe for lazy loading
        if (this.lazyImageObserver) {
            this.lazyImageObserver.observe(img);
        }
        
        return img;
    }

    /**
     * Preload critical images
     */
    preloadCriticalImages(imagePaths) {
        imagePaths.forEach(path => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = path;
            document.head.appendChild(link);
        });
    }

    /**
     * Get optimized image URL based on device capabilities
     */
    getOptimizedImageUrl(basePath, options = {}) {
        const {
            width = null,
            height = null,
            quality = 85,
            format = 'auto'
        } = options;

        // For SVG files, return as-is
        if (basePath.endsWith('.svg')) {
            return basePath;
        }

        // For other formats, you could implement server-side optimization
        // For now, return the original path
        return basePath;
    }

    /**
     * Create responsive image with multiple sources
     */
    createResponsiveImage(sources, alt = '', className = '') {
        const picture = document.createElement('picture');
        
        // Add source elements for different screen sizes
        sources.forEach(source => {
            const sourceElement = document.createElement('source');
            sourceElement.media = source.media;
            sourceElement.dataset.srcset = source.srcset;
            picture.appendChild(sourceElement);
        });

        // Add fallback img element
        const img = document.createElement('img');
        img.dataset.src = sources[sources.length - 1].srcset.split(' ')[0];
        img.alt = alt;
        img.className = className;
        picture.appendChild(img);

        // Observe for lazy loading
        if (this.lazyImageObserver) {
            this.lazyImageObserver.observe(img);
        }

        return picture;
    }

    /**
     * Update image observer when new images are added
     */
    updateObserver() {
        if (this.lazyImageObserver) {
            this.observeLazyImages();
        }
    }

    /**
     * Cleanup observer
     */
    destroy() {
        if (this.lazyImageObserver) {
            this.lazyImageObserver.disconnect();
        }
    }
}

// Technical content specific image optimization
class TechnicalImageOptimizer extends ImageOptimizer {
    constructor() {
        super();
        this.setupTechnicalImageHandling();
    }

    setupTechnicalImageHandling() {
        this.setupDiagramOptimization();
        this.setupResearchPlotOptimization();
        this.setupProjectScreenshotOptimization();
    }

    /**
     * Optimize technical diagrams
     */
    setupDiagramOptimization() {
        const diagrams = document.querySelectorAll('.technical-diagram, .artifact-image, .diagram-container img');
        diagrams.forEach(diagram => {
            // Add click-to-expand functionality
            diagram.addEventListener('click', (e) => {
                this.expandDiagram(e.target);
            });

            // Add loading optimization
            diagram.loading = 'lazy';
            
            // Add accessibility
            if (!diagram.alt) {
                diagram.alt = 'Technical diagram - click to expand';
            }
        });
    }

    /**
     * Optimize research plots and visualizations
     */
    setupResearchPlotOptimization() {
        const plots = document.querySelectorAll('.research-plot, .data-visualization, .chart-container img');
        plots.forEach(plot => {
            // Add high-resolution loading for research plots
            plot.loading = 'lazy';
            
            // Add accessibility for research content
            if (!plot.alt) {
                plot.alt = 'Research data visualization';
            }

            // Add zoom functionality for detailed plots
            plot.addEventListener('click', (e) => {
                this.expandResearchPlot(e.target);
            });
        });
    }

    /**
     * Optimize project screenshots
     */
    setupProjectScreenshotOptimization() {
        const screenshots = document.querySelectorAll('.project-screenshot, .project-image, .project-card img');
        screenshots.forEach(screenshot => {
            screenshot.loading = 'lazy';
            
            // Add hover effects for project images
            screenshot.addEventListener('mouseenter', () => {
                screenshot.classList.add('hover-enhanced');
            });

            screenshot.addEventListener('mouseleave', () => {
                screenshot.classList.remove('hover-enhanced');
            });
        });
    }

    /**
     * Expand technical diagram in modal
     */
    expandDiagram(diagram) {
        const modal = this.createImageModal(diagram, 'technical-diagram-modal');
        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    /**
     * Expand research plot in modal
     */
    expandResearchPlot(plot) {
        const modal = this.createImageModal(plot, 'research-plot-modal');
        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    /**
     * Create image expansion modal
     */
    createImageModal(img, className = '') {
        const modal = document.createElement('div');
        modal.className = `image-modal ${className}`;
        
        const backdrop = document.createElement('div');
        backdrop.className = 'image-modal-backdrop';
        
        const content = document.createElement('div');
        content.className = 'image-modal-content';
        
        const expandedImg = document.createElement('img');
        expandedImg.src = img.src || img.dataset.src;
        expandedImg.alt = img.alt;
        expandedImg.className = 'expanded-image';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'image-modal-close';
        closeBtn.innerHTML = '×';
        closeBtn.setAttribute('aria-label', 'Close image');
        
        // Close functionality
        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        };
        
        closeBtn.addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);
        
        // Keyboard support
        document.addEventListener('keydown', function escapeHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        });
        
        content.appendChild(expandedImg);
        content.appendChild(closeBtn);
        modal.appendChild(backdrop);
        modal.appendChild(content);
        
        return modal;
    }
}

// Initialize image optimization when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.imageOptimizer = new TechnicalImageOptimizer();
    
    // Preload critical images
    const criticalImages = [
        'assets/images/profile/headshot.svg',
        'assets/images/fallback-image.svg'
    ];
    
    window.imageOptimizer.preloadCriticalImages(criticalImages);
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ImageOptimizer, TechnicalImageOptimizer };
}