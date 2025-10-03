/**
 * Technical Artifacts Section
 * Handles loading and displaying technical artifacts including code repositories, 
 * diagrams, demos, and product documentation
 */

class TechnicalArtifactsManager {
    constructor() {
        this.artifacts = [];
        this.artifactsGrid = null;
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        try {
            this.setupDOM();
            this.showLoadingState();
            await this.loadArtifacts();
            this.renderArtifacts();
            this.setupFilters();
            this.hideLoadingState();
        } catch (error) {
            console.error('Error initializing technical artifacts:', error);
            this.hideLoadingState();
            this.showErrorState();
        }
    }

    async loadArtifacts() {
        try {
            const response = await fetch('assets/data/technical-artifacts.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.artifacts = data.artifacts || [];
        } catch (error) {
            console.error('Error loading technical artifacts data:', error);
            throw error;
        }
    }

    setupDOM() {
        this.artifactsGrid = document.getElementById('technical-artifacts-grid');
        if (!this.artifactsGrid) {
            console.error('Technical artifacts grid element not found');
            return;
        }
    }

    setupFilters() {
        // Create filter buttons if they don't exist
        const section = document.getElementById('technical-artifacts');
        if (!section) return;

        const existingFilters = section.querySelector('.artifact-filters');
        if (existingFilters) return; // Filters already exist

        const filtersContainer = document.createElement('div');
        filtersContainer.className = 'artifact-filters text-center mb-12';
        
        const categories = ['all', 'code-repository', 'diagram', 'demo', 'prd'];
        const categoryLabels = {
            'all': 'All Artifacts',
            'code-repository': 'Code Repositories',
            'diagram': 'Diagrams',
            'demo': 'Live Demos',
            'prd': 'Product Docs'
        };

        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = `filter-btn ${category === 'all' ? 'active' : ''}`;
            button.textContent = categoryLabels[category];
            button.setAttribute('data-filter', category);
            button.addEventListener('click', () => this.filterArtifacts(category));
            filtersContainer.appendChild(button);
        });

        // Insert filters before the grid
        const container = this.artifactsGrid.parentElement;
        const title = container.querySelector('.text-center.mb-16');
        container.insertBefore(filtersContainer, title.nextElementSibling);
    }

    renderArtifacts(filteredArtifacts = null) {
        if (!this.artifactsGrid) {
            this.showErrorState();
            return;
        }

        const artifactsToRender = filteredArtifacts || this.artifacts;

        if (!artifactsToRender.length) {
            this.showEmptyState();
            return;
        }

        // Group artifacts by category for better organization
        const groupedArtifacts = this.groupArtifactsByCategory(artifactsToRender);
        
        const artifactsHTML = artifactsToRender.map(artifact => 
            this.createArtifactCard(artifact)
        ).join('');

        this.artifactsGrid.innerHTML = artifactsHTML;
        
        // Update image optimizer to handle new images
        if (window.imageOptimizer) {
            window.imageOptimizer.updateObserver();
        }
    }

    groupArtifactsByCategory(artifacts) {
        return artifacts.reduce((groups, artifact) => {
            const category = artifact.category || 'other';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(artifact);
            return groups;
        }, {});
    }

    createArtifactCard(artifact) {
        const typeLabel = this.getTypeLabel(artifact.type);
        const typeClass = artifact.type.replace('-', '');
        
        return `
            <article class="artifact-item" data-artifact-id="${artifact.id}" data-category="${artifact.category}">
                <div class="artifact-header">
                    <span class="artifact-type ${typeClass}">${typeLabel}</span>
                </div>
                
                <h3 class="artifact-title">${artifact.title}</h3>
                
                <p class="artifact-description">${artifact.description}</p>
                
                <div class="artifact-technologies">
                    ${artifact.technologies.map(tech => 
                        `<span class="artifact-tech-tag">${tech}</span>`
                    ).join('')}
                </div>
                
                ${this.renderArtifactContent(artifact)}
                
                <div class="artifact-links">
                    ${this.renderArtifactLinks(artifact)}
                </div>
            </article>
        `;
    }

    renderArtifactContent(artifact) {
        if (artifact.images && artifact.images.length > 0) {
            return `
                <div class="artifact-images">
                    ${artifact.images.map(image => `
                        <img data-src="${image}" 
                             alt="${artifact.title} diagram" 
                             class="artifact-image technical-diagram"
                             loading="lazy">
                    `).join('')}
                </div>
            `;
        }
        return '';
    }

    renderArtifactLinks(artifact) {
        const links = [];
        
        if (artifact.url) {
            const linkText = this.getLinkText(artifact.type);
            const linkIcon = this.getLinkIcon(artifact.type);
            
            links.push(`
                <a href="${artifact.url}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="artifact-link primary"
                   aria-label="${linkText} for ${artifact.title}">
                    ${linkIcon}
                    ${linkText}
                </a>
            `);
        }

        if (artifact.images && artifact.images.length > 0) {
            links.push(`
                <button class="artifact-link" 
                        onclick="this.expandDiagram(this.closest('.artifact-item').querySelector('.artifact-image'))"
                        aria-label="View ${artifact.title} diagram">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21,15 16,10 5,21"></polyline>
                    </svg>
                    View Diagram
                </button>
            `);
        }

        return links.join('');
    }

    getTypeLabel(type) {
        const typeLabels = {
            'code-repository': 'Code Repository',
            'diagram': 'Technical Diagram',
            'demo': 'Live Demo',
            'prd': 'Product Document'
        };
        return typeLabels[type] || type;
    }

    getLinkText(type) {
        const linkTexts = {
            'code-repository': 'View Code',
            'diagram': 'View Diagram',
            'demo': 'Try Demo',
            'prd': 'Read Document'
        };
        return linkTexts[type] || 'View';
    }

    getLinkIcon(type) {
        const icons = {
            'code-repository': `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
            `,
            'demo': `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="5,3 19,12 5,21"></polygon>
                </svg>
            `,
            'prd': `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
            `,
            'diagram': `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21,15 16,10 5,21"></polyline>
                </svg>
            `
        };
        return icons[type] || `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15,3 21,3 21,9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
        `;
    }

    filterArtifacts(category) {
        this.currentFilter = category;
        
        // Update active filter button
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-filter') === category);
        });

        // Filter and render artifacts
        const filteredArtifacts = category === 'all' 
            ? this.artifacts 
            : this.artifacts.filter(artifact => artifact.type === category);
        
        this.renderArtifacts(filteredArtifacts);
    }

    showEmptyState() {
        if (!this.artifactsGrid) return;
        
        this.artifactsGrid.innerHTML = `
            <div class="empty-state col-span-full">
                <p class="text-gray-600 text-center">No technical artifacts available for the selected category.</p>
            </div>
        `;
    }

    showErrorState() {
        if (!this.artifactsGrid) return;
        
        this.artifactsGrid.innerHTML = `
            <div class="error-state col-span-full">
                <p class="text-red-600 text-center">
                    Sorry, there was an error loading the technical artifacts. Please try again later.
                </p>
            </div>
        `;
    }

    showLoadingState() {
        if (!this.artifactsGrid) return;
        
        this.artifactsGrid.innerHTML = `
            <div class="loading-state col-span-full text-center py-12">
                <div class="loading-spinner mx-auto mb-4"></div>
                <p class="text-gray-600">Loading technical artifacts...</p>
            </div>
        `;
    }

    hideLoadingState() {
        // Loading state will be replaced by renderArtifacts()
    }

    // Method to get artifacts by category
    getArtifactsByCategory(category) {
        return this.artifacts.filter(artifact => artifact.category === category);
    }

    // Method to get artifacts by type
    getArtifactsByType(type) {
        return this.artifacts.filter(artifact => artifact.type === type);
    }

    // Method to expand diagram (integrates with image optimizer)
    expandDiagram(img) {
        if (window.imageOptimizer && window.imageOptimizer.expandDiagram) {
            window.imageOptimizer.expandDiagram(img);
        } else {
            // Fallback expansion
            img.classList.toggle('expanded');
        }
    }
}

// Initialize technical artifacts manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.technicalArtifactsManager = new TechnicalArtifactsManager();
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TechnicalArtifactsManager;
}