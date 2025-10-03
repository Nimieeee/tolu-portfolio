// Product Management Projects Page JavaScript

class ProductManagementProjects {
    constructor() {
        this.projects = [];
        this.init();
    }

    async init() {
        await this.loadProjects();
        this.renderProjects();
    }

    async loadProjects() {
        try {
            // Add cache-busting parameter to force fresh data load
            const cacheBuster = new Date().getTime();
            const response = await fetch(`assets/data/ai-product-projects.json?v=${cacheBuster}`);
            const data = await response.json();
            this.projects = data.projects || [];
            console.log('Product Management projects loaded:', this.projects);
        } catch (error) {
            console.error('Error loading product management projects:', error);
            this.projects = [];
        }
    }

    renderProjects() {
        const container = document.getElementById('product-management-projects-grid');
        if (!container) {
            console.error('Projects container not found');
            return;
        }

        if (this.projects.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-600">No projects available at the moment.</p>';
            return;
        }

        console.log('Rendering product management projects:', this.projects.length);
        container.innerHTML = this.projects.map(project => this.createProjectCard(project)).join('');
    }

    createProjectCard(project) {
        const technologies = project.technologies ? project.technologies.slice(0, 3).join(', ') : '';
        const moreCount = project.technologies && project.technologies.length > 3 ? project.technologies.length - 3 : 0;
        
        // Create project-specific page URL
        const projectPageUrl = `${project.id}-project.html`;
        
        return `
            <div class="project-card" data-project-id="${project.id}">
                <div class="project-card-header">
                    ${project.images && project.images[0] ? 
                        `<img src="${project.images[0]}" alt="${project.title}" class="project-card-image" loading="lazy">` : 
                        '<div class="project-card-placeholder"></div>'
                    }
                    <div class="project-card-overlay">
                        <a href="${projectPageUrl}" class="project-card-view-btn">
                            View Details
                        </a>
                    </div>
                </div>
                <div class="project-card-content">
                    <h3 class="project-card-title">${project.title}</h3>
                    <p class="project-card-description">${project.description}</p>
                    <div class="project-card-technologies">
                        <span class="tech-tags">${technologies}${moreCount > 0 ? ` +${moreCount} more` : ''}</span>
                    </div>
                    <div class="project-card-actions">
                        ${project.artifacts?.prd ? 
                            `<a href="${project.artifacts.prd}" class="project-link" target="_blank" rel="noopener">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14,2 14,8 20,8"/>
                                    <line x1="16" y1="13" x2="8" y2="13"/>
                                    <line x1="16" y1="17" x2="8" y2="17"/>
                                    <polyline points="10,9 9,9 8,9"/>
                                </svg>
                                PRD
                            </a>` : ''
                        }
                        ${project.artifacts?.demo ? 
                            `<a href="${project.artifacts.demo}" class="project-link" target="_blank" rel="noopener">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polygon points="5,3 19,12 5,21"/>
                                </svg>
                                Demo
                            </a>` : ''
                        }
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Product Management Projects');
    new ProductManagementProjects();
});