// AI Engineering Projects Page JavaScript

class AIEngineeringProjects {
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
            const response = await fetch(`assets/data/ml-engineering-projects.json?v=${cacheBuster}`);
            const data = await response.json();
            this.projects = data.projects || [];
            console.log('Projects loaded:', this.projects);
        } catch (error) {
            console.error('Error loading AI engineering projects:', error);
            this.projects = [];
        }
    }

    renderProjects() {
        const container = document.getElementById('ai-engineering-projects-grid');
        if (!container) {
            console.error('Projects container not found');
            return;
        }

        if (this.projects.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-600">No projects available at the moment.</p>';
            return;
        }

        console.log('Rendering projects:', this.projects.length);
        container.innerHTML = this.projects.map(project => this.createProjectCard(project)).join('');
    }

    createProjectCard(project) {
        const technologies = project.technologies ? project.technologies.slice(0, 3).join(', ') : '';
        const moreCount = project.technologies && project.technologies.length > 3 ? project.technologies.length - 3 : 0;
        
        return `
            <div class="project-card" data-project-id="${project.id}">
                <div class="project-card-header">
                    ${project.images && project.images[0] ? 
                        `<img src="${project.images[0]}" alt="${project.title}" class="project-card-image" loading="lazy">` : 
                        '<div class="project-card-placeholder"></div>'
                    }
                    <div class="project-card-overlay">
                        <a href="pharmgpt-project.html" class="project-card-view-btn">
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
                        ${project.artifacts?.repository ? 
                            `<a href="${project.artifacts.repository}" class="project-link" target="_blank" rel="noopener">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                                Code
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
    console.log('Initializing AI Engineering Projects');
    new AIEngineeringProjects();
});