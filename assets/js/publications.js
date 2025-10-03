/**
 * Publications and Writing Section
 * Handles loading and displaying publications, research papers, blog posts, and articles
 */

class PublicationsManager {
    constructor() {
        this.publications = [];
        this.publicationsGrid = null;
        this.init();
    }

    async init() {
        try {
            this.setupDOM();
            this.showLoadingState();
            await this.loadPublications();
            this.renderPublications();
            this.hideLoadingState();
        } catch (error) {
            console.error('Error initializing publications:', error);
            this.hideLoadingState();
            this.showErrorState();
        }
    }

    async loadPublications() {
        try {
            const response = await fetch('assets/data/publications.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.publications = data.publications || [];
        } catch (error) {
            console.error('Error loading publications data:', error);
            throw error;
        }
    }

    setupDOM() {
        this.publicationsGrid = document.getElementById('publications-grid');
        if (!this.publicationsGrid) {
            console.error('Publications grid element not found');
            return;
        }
    }

    renderPublications() {
        if (!this.publicationsGrid || !this.publications.length) {
            this.showEmptyState();
            return;
        }

        // Sort publications by date (newest first) and featured status
        const sortedPublications = this.publications.sort((a, b) => {
            // Featured publications first
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;

            // Then by date
            return new Date(b.publishedDate) - new Date(a.publishedDate);
        });

        const publicationsHTML = sortedPublications.map(publication =>
            this.createPublicationCard(publication)
        ).join('');

        this.publicationsGrid.innerHTML = publicationsHTML;
    }

    createPublicationCard(publication) {
        const formattedDate = this.formatDate(publication.publishedDate);
        const typeLabel = this.getTypeLabel(publication.type);
        const typeClass = publication.type.replace('-', '');

        return `
            <article class="publication-item" data-publication-id="${publication.id}">
                <div class="publication-header">
                    <span class="publication-type ${typeClass}">${typeLabel}</span>
                    ${publication.featured ? '<span class="featured-badge">Featured</span>' : ''}
                </div>
                
                <h3 class="publication-title">
                    <a href="${publication.url}" target="_blank" rel="noopener noreferrer">
                        ${publication.title}
                    </a>
                </h3>
                
                <p class="publication-description">
                    ${publication.description}
                </p>
                
                ${publication.abstract ? `
                    <div class="publication-abstract">
                        <strong>Abstract:</strong> ${publication.abstract}
                    </div>
                ` : ''}
                
                <div class="publication-meta">
                    <span class="publication-date">${formattedDate}</span>
                    <div class="publication-tags">
                        ${publication.tags.map(tag =>
            `<span class="publication-tag">${tag}</span>`
        ).join('')}
                    </div>
                </div>
                
                <div class="publication-links">
                    <a href="${publication.url}" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="publication-link"
                       aria-label="Read ${publication.title}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15,3 21,3 21,9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        Read ${this.getTypeLabel(publication.type)}
                    </a>
                </div>
            </article>
        `;
    }

    getTypeLabel(type) {
        const typeLabels = {
            'research-paper': 'Research Paper',
            'blog-post': 'Blog Post',
            'linkedin-article': 'LinkedIn Article'
        };
        return typeLabels[type] || type;
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    }

    showEmptyState() {
        if (!this.publicationsGrid) return;

        this.publicationsGrid.innerHTML = `
            <div class="empty-state">
                <p class="text-gray-600 text-center">No publications available at the moment.</p>
            </div>
        `;
    }

    showErrorState() {
        if (!this.publicationsGrid) return;

        this.publicationsGrid.innerHTML = `
            <div class="error-state">
                <p class="text-red-600 text-center">
                    Sorry, there was an error loading the publications. Please try again later.
                </p>
            </div>
        `;
    }

    showLoadingState() {
        if (!this.publicationsGrid) return;

        this.publicationsGrid.innerHTML = `
            <div class="loading-state text-center py-12">
                <div class="loading-spinner mx-auto mb-4"></div>
                <p class="text-gray-600">Loading publications...</p>
            </div>
        `;
    }

    hideLoadingState() {
        // Loading state will be replaced by renderPublications()
    }

    // Method to filter publications by type
    filterByType(type) {
        const filteredPublications = type === 'all'
            ? this.publications
            : this.publications.filter(pub => pub.type === type);

        const sortedPublications = filteredPublications.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return new Date(b.publishedDate) - new Date(a.publishedDate);
        });

        const publicationsHTML = sortedPublications.map(publication =>
            this.createPublicationCard(publication)
        ).join('');

        this.publicationsGrid.innerHTML = publicationsHTML;
    }

    // Method to get publications by tag
    getPublicationsByTag(tag) {
        return this.publications.filter(pub =>
            pub.tags.some(pubTag =>
                pubTag.toLowerCase().includes(tag.toLowerCase())
            )
        );
    }

    // Method to get featured publications
    getFeaturedPublications() {
        return this.publications.filter(pub => pub.featured);
    }
}

// Initialize publications manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.publicationsManager = new PublicationsManager();
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PublicationsManager;
}