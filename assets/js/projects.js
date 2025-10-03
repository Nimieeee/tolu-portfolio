/**
 * Projects JavaScript - Fixed Version
 * Handles three-category project showcase and modal functionality
 */

class ProjectsManager {
  constructor() {
    this.allProjects = [];
    this.filteredProjects = [];
    this.currentCategory = 'all';
    this.currentProject = null;
    this.currentImageIndex = 0;
    this.previouslyFocusedElement = null;

    // DOM elements
    this.projectsGrid = document.getElementById('projects-grid');
    this.categoryFilters = null; // Will be created dynamically
    this.modalBackdrop = document.getElementById('project-modal-backdrop');
    this.modal = document.getElementById('project-modal');
    this.modalTitle = document.getElementById('modal-title');
    this.modalContent = document.getElementById('modal-content');
    this.modalClose = document.getElementById('modal-close');

    this.init();
  }

  async init() {
    try {
      this.showLoadingState();
      await this.loadProjects();
      this.createCategoryFilters();
      this.renderProjects();
      this.bindEvents();
      this.hideLoadingState();
    } catch (error) {
      console.error('Failed to initialize projects:', error);
      this.hideLoadingState();
      
      // Try to load fallback projects
      try {
        this.loadFallbackProjects();
        this.createCategoryFilters();
        this.renderProjects();
        this.bindEvents();
        console.log('Loaded fallback projects successfully');
      } catch (fallbackError) {
        console.error('Failed to load fallback projects:', fallbackError);
        this.showError('Failed to load projects. Please try again later.');
      }
    }
  }

  async loadProjects() {
    try {
      console.log('Starting to load projects...');
      
      // Try to load projects sequentially to better handle errors
      const projectData = { ai: null, ml: null, research: null };
      
      // Load AI Product projects
      try {
        const aiResponse = await fetch('assets/data/ai-product-projects.json');
        if (aiResponse.ok) {
          projectData.ai = await aiResponse.json();
          console.log(`Loaded ${projectData.ai.projects?.length || 0} AI product projects`);
        } else {
          console.warn(`Failed to load AI product projects: ${aiResponse.status}`);
        }
      } catch (error) {
        console.warn('Error loading AI product projects:', error);
      }
      
      // Load ML Engineering projects
      try {
        const mlResponse = await fetch('assets/data/ml-engineering-projects.json');
        if (mlResponse.ok) {
          projectData.ml = await mlResponse.json();
          console.log(`Loaded ${projectData.ml.projects?.length || 0} ML engineering projects`);
        } else {
          console.warn(`Failed to load ML engineering projects: ${mlResponse.status}`);
        }
      } catch (error) {
        console.warn('Error loading ML engineering projects:', error);
      }
      
      // Load Research projects
      try {
        const researchResponse = await fetch('assets/data/research-projects.json');
        if (researchResponse.ok) {
          projectData.research = await researchResponse.json();
          console.log(`Loaded ${projectData.research.projects?.length || 0} research projects`);
        } else {
          console.warn(`Failed to load research projects: ${researchResponse.status}`);
        }
      } catch (error) {
        console.warn('Error loading research projects:', error);
      }

      // Combine all successfully loaded projects
      this.allProjects = [
        ...(projectData.ai?.projects || []).map(p => ({ ...p, category: 'ai-product' })),
        ...(projectData.ml?.projects || []).map(p => ({ ...p, category: 'ml-engineering' })),
        ...(projectData.research?.projects || []).map(p => ({ ...p, category: 'research' }))
      ];

      this.filteredProjects = [...this.allProjects];
      
      if (this.allProjects.length === 0) {
        throw new Error('No projects could be loaded from any data file');
      }
      
      console.log(`Successfully loaded ${this.allProjects.length} total projects`);
    } catch (error) {
      console.error('Error loading projects:', error);
      throw error;
    }
  }

  createCategoryFilters() {
    if (!this.projectsGrid) return;

    // Create filter container before the projects grid
    const projectsContainer = this.projectsGrid.closest('.container');
    if (!projectsContainer) return;

    // Find the header div (with title and description)
    const headerDiv = projectsContainer.querySelector('.text-center.mb-16');
    if (!headerDiv) return;

    // Create filter buttons container
    const filterContainer = document.createElement('div');
    filterContainer.className = 'project-filters mb-12';
    filterContainer.innerHTML = `
      <div class="flex flex-wrap justify-center gap-4">
        <button class="filter-btn active" data-category="all" aria-pressed="true">
          All Projects
        </button>
        <button class="filter-btn" data-category="ai-product" aria-pressed="false">
          AI Product Management
        </button>
        <button class="filter-btn" data-category="ml-engineering" aria-pressed="false">
          ML Engineering
        </button>
        <button class="filter-btn" data-category="research" aria-pressed="false">
          Research Projects
        </button>
      </div>
    `;

    // Insert filter container after the header
    headerDiv.insertAdjacentElement('afterend', filterContainer);

    this.categoryFilters = filterContainer.querySelectorAll('.filter-btn');
  }

  renderProjects() {
    if (!this.projectsGrid) return;

    if (this.filteredProjects.length === 0) {
      const categoryName = this.getCategoryDisplayName(this.currentCategory);
      this.projectsGrid.innerHTML = `<p class="text-center text-gray-500 col-span-full">No ${categoryName.toLowerCase()} available.</p>`;
      return;
    }

    const projectsHTML = this.filteredProjects.map(project => this.createProjectCard(project)).join('');
    this.projectsGrid.innerHTML = projectsHTML;

    // Add new images to lazy loading system
    if (window.imageOptimizer) {
      const newImages = this.projectsGrid.querySelectorAll('img[data-src]');
      window.imageOptimizer.addLazyImages(newImages);
    }
  }

  filterProjects(category) {
    this.currentCategory = category;

    if (category === 'all') {
      this.filteredProjects = [...this.allProjects];
    } else {
      this.filteredProjects = this.allProjects.filter(project => project.category === category);
    }

    this.renderProjects();
    this.updateFilterButtons();
  }

  updateFilterButtons() {
    if (!this.categoryFilters) return;

    this.categoryFilters.forEach(btn => {
      const isActive = btn.dataset.category === this.currentCategory;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive.toString());
    });
  }

  getCategoryDisplayName(category) {
    const categoryNames = {
      'all': 'Projects',
      'ai-product': 'AI Product Management Projects',
      'ml-engineering': 'ML Engineering Projects',
      'research': 'Research Projects'
    };
    return categoryNames[category] || 'Projects';
  }

  createProjectCard(project) {
    const firstImage = project.images && project.images.length > 0 ? project.images[0] : null;
    const techTags = project.technologies ? project.technologies.slice(0, 3).map(tech =>
      `<span class="project-card-tech-tag">${tech}</span>`
    ).join('') : '';

    // Create optimized image with lazy loading
    const imageHTML = firstImage ?
      `<img data-src="${firstImage}" 
           alt="${project.title}" 
           class="lazy-image project-card-img project-screenshot"
           loading="lazy"
           sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw">` :
      `<div class="project-card-placeholder">
         <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
           <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
           <circle cx="8.5" cy="8.5" r="1.5"/>
           <polyline points="21,15 16,10 5,21"/>
         </svg>
         <span>Image Coming Soon</span>
       </div>`;

    // Get category badge
    const categoryBadge = this.getCategoryBadge(project.category);

    return `
      <article class="project-card" data-project-id="${project.id}" data-category="${project.category}" 
               role="button" tabindex="0" 
               aria-label="View details for ${project.title} in ${this.getCategoryDisplayName(project.category)}"
               aria-describedby="project-${project.id}-description">
        <div class="project-card-image">
          ${imageHTML}
          ${categoryBadge}
        </div>
        <div class="project-card-content">
          <h3 class="project-card-title">${project.title}</h3>
          <p class="project-card-description" id="project-${project.id}-description">${project.description}</p>
          <div class="project-card-tech" aria-label="Technologies used">
            ${techTags}
            ${project.technologies && project.technologies.length > 3 ?
        `<span class="project-card-tech-tag" aria-label="${project.technologies.length - 3} additional technologies">+${project.technologies.length - 3} more</span>` : ''
      }
          </div>
        </div>
      </article>
    `;
  }

  getCategoryBadge(category) {
    const badges = {
      'ai-product': '<span class="project-category-badge ai-product">AI Product</span>',
      'ml-engineering': '<span class="project-category-badge ml-engineering">ML Engineering</span>',
      'research': '<span class="project-category-badge research">Research</span>'
    };
    return badges[category] || '';
  }

  bindEvents() {
    // Category filter events
    if (this.categoryFilters) {
      this.categoryFilters.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const category = e.target.dataset.category;
          this.filterProjects(category);
        });

        // Keyboard support for filter buttons
        btn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const category = e.target.dataset.category;
            this.filterProjects(category);
          }
        });
      });
    }

    // Project card click events
    if (this.projectsGrid) {
      this.projectsGrid.addEventListener('click', (e) => {
        const projectCard = e.target.closest('.project-card');
        if (projectCard) {
          const projectId = projectCard.dataset.projectId;
          this.openModal(projectId);
        }
      });

      // Keyboard support for project cards
      this.projectsGrid.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const projectCard = e.target.closest('.project-card');
          if (projectCard) {
            e.preventDefault();
            const projectId = projectCard.dataset.projectId;
            this.openModal(projectId);
          }
        }
      });
    }

    // Modal close events
    if (this.modalClose) {
      this.modalClose.addEventListener('click', () => this.closeModal());
    }

    if (this.modalBackdrop) {
      this.modalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.modalBackdrop) {
          this.closeModal();
        }
      });
    }

    // Keyboard events for modal
    document.addEventListener('keydown', (e) => {
      if (this.isModalOpen()) {
        switch (e.key) {
          case 'Escape':
            this.closeModal();
            break;
          case 'ArrowLeft':
            e.preventDefault();
            this.previousImage();
            break;
          case 'ArrowRight':
            e.preventDefault();
            this.nextImage();
            break;
        }
      }
    });
  }

  openModal(projectId) {
    const project = this.allProjects.find(p => p.id === projectId);
    if (!project) {
      console.error('Project not found:', projectId);
      return;
    }

    this.currentProject = project;
    this.currentImageIndex = 0;

    this.renderModalContent();
    this.showModal();
  }

  renderModalContent() {
    if (!this.currentProject || !this.modalTitle || !this.modalContent) return;

    this.modalTitle.textContent = this.currentProject.title;

    // Add category-specific class to modal
    this.modal.className = `modal project-modal ${this.currentProject.category}`;

    const modalHTML = `
      <div class="project-detail">
        ${this.createGalleryHTML()}
        <div class="project-info ${this.getModalInfoClass()}">
          ${this.createProjectMetaHTML()}
          ${this.createSpecializedContentHTML()}
          ${this.createProjectTechnologiesHTML()}
          ${this.createProjectOutcomesHTML()}
          ${this.createArtifactsHTML()}
          ${this.createProjectLinksHTML()}
        </div>
      </div>
    `;

    this.modalContent.innerHTML = modalHTML;
    this.bindGalleryEvents();

    // Add new gallery images to lazy loading system
    if (window.imageOptimizer) {
      const galleryImages = this.modalContent.querySelectorAll('img[data-src]');
      window.imageOptimizer.addLazyImages(galleryImages);
    }
  }

  getModalInfoClass() {
    const classMap = {
      'ai-product': 'case-study-modal',
      'ml-engineering': 'engineering-modal',
      'research': 'research-modal'
    };
    return classMap[this.currentProject.category] || '';
  }

  createGalleryHTML() {
    if (!this.currentProject.images || this.currentProject.images.length === 0) {
      return `
        <div class="project-gallery">
          <div class="project-gallery-container">
            <div class="project-gallery-placeholder">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21,15 16,10 5,21"/>
              </svg>
              <span>Images Coming Soon</span>
            </div>
          </div>
        </div>
      `;
    }

    const images = this.currentProject.images;
    const imagesHTML = images.map((image, index) => `
      <img ${index === 0 ? 'src' : 'data-src'}="${image}" 
           alt="${this.currentProject.title} - Image ${index + 1}" 
           class="project-gallery-image project-screenshot ${index === 0 ? '' : 'hidden lazy-image'}"
           loading="${index === 0 ? 'eager' : 'lazy'}"
           sizes="(max-width: 768px) 100vw, 80vw">
    `).join('');

    const indicatorsHTML = images.length > 1 ? `
      <div class="project-gallery-indicators" role="tablist" aria-label="Image gallery navigation">
        ${images.map((_, index) => `
          <button class="project-gallery-indicator ${index === 0 ? 'active' : ''}" 
                  data-index="${index}" 
                  role="tab"
                  aria-selected="${index === 0 ? 'true' : 'false'}"
                  aria-label="Go to image ${index + 1} of ${images.length}"
                  type="button"></button>
        `).join('')}
      </div>
    ` : '';

    const navHTML = images.length > 1 ? `
      <button class="project-gallery-nav prev" aria-label="Previous image" type="button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <polyline points="15,18 9,12 15,6"></polyline>
        </svg>
      </button>
      <button class="project-gallery-nav next" aria-label="Next image" type="button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <polyline points="9,18 15,12 9,6"></polyline>
        </svg>
      </button>
    ` : '';

    return `
      <div class="project-gallery">
        <div class="project-gallery-container">
          ${imagesHTML}
          ${navHTML}
          ${indicatorsHTML}
        </div>
      </div>
    `;
  }

  createProjectMetaHTML() {
    const categoryName = this.getCategoryDisplayName(this.currentProject.category);

    return `
      <div class="project-meta">
        <div class="project-meta-item">
          <span class="project-meta-label">Category</span>
          <span class="project-meta-value">${categoryName}</span>
        </div>
        ${this.currentProject.role ? `
        <div class="project-meta-item">
          <span class="project-meta-label">Role</span>
          <span class="project-meta-value">${this.currentProject.role}</span>
        </div>
        ` : ''}
        ${this.currentProject.impact ? `
        <div class="project-meta-item">
          <span class="project-meta-label">Impact</span>
          <span class="project-meta-value">${this.currentProject.impact}</span>
        </div>
        ` : ''}
      </div>
    `;
  }

  createSpecializedContentHTML() {
    const project = this.currentProject;

    if (project.category === 'ai-product') {
      return this.createCaseStudyHTML();
    } else if (project.category === 'ml-engineering') {
      return this.createEngineeringProjectHTML();
    } else if (project.category === 'research') {
      return this.createResearchProjectHTML();
    } else {
      return this.createGenericProjectHTML();
    }
  }

  createCaseStudyHTML() {
    const project = this.currentProject;

    return `
      <div class="case-study-content">
        <div class="case-study-section">
          <h4>Problem Statement</h4>
          <p>${project.problemStatement || 'Problem statement not available.'}</p>
        </div>
        
        <div class="case-study-section">
          <h4>Solution Approach</h4>
          <p>${project.solutionApproach || 'Solution approach not available.'}</p>
        </div>
        
        <div class="case-study-section">
          <h4>Outcomes & Impact</h4>
          <p>${project.impact || 'Impact information not available.'}</p>
        </div>
      </div>
    `;
  }

  createEngineeringProjectHTML() {
    const project = this.currentProject;

    return `
      <div class="engineering-content">
        <div class="project-description">
          <h3>Project Overview</h3>
          <p>${project.description}</p>
        </div>
        
        ${project.technicalApproach ? `
        <div class="case-study-section">
          <h4>Technical Approach</h4>
          <p>${project.technicalApproach}</p>
        </div>
        ` : ''}
        
        ${project.architecture ? `
        <div class="case-study-section">
          <h4>Architecture</h4>
          <p>${project.architecture}</p>
        </div>
        ` : ''}
        
        ${project.deployment ? `
        <div class="case-study-section">
          <h4>Deployment</h4>
          <p>${project.deployment}</p>
        </div>
        ` : ''}
      </div>
    `;
  }

  createResearchProjectHTML() {
    const project = this.currentProject;

    return `
      <div class="research-content">
        ${project.problemStatement ? `
        <div class="research-section">
          <h4>Problem Statement</h4>
          <p>${project.problemStatement}</p>
        </div>
        ` : ''}
        
        ${project.methods ? `
        <div class="research-section">
          <h4>Methods</h4>
          <p>${project.methods}</p>
        </div>
        ` : ''}
        
        ${project.results ? `
        <div class="research-section">
          <h4>Results</h4>
          <p>${project.results}</p>
        </div>
        ` : ''}
        
        ${project.learnings ? `
        <div class="research-section">
          <h4>Key Learnings</h4>
          <p>${project.learnings}</p>
        </div>
        ` : ''}
      </div>
    `;
  }

  createGenericProjectHTML() {
    const project = this.currentProject;

    return `
      <div class="project-description">
        <h3>Project Overview</h3>
        <p>${project.longDescription || project.description}</p>
      </div>
    `;
  }

  createProjectTechnologiesHTML() {
    if (!this.currentProject.technologies || this.currentProject.technologies.length === 0) {
      return '';
    }

    const techTags = this.currentProject.technologies.map(tech =>
      `<span class="project-tech-tag">${tech}</span>`
    ).join('');

    return `
      <div class="project-technologies">
        <h3>Technologies & Tools</h3>
        <div class="project-tech-list">
          ${techTags}
        </div>
      </div>
    `;
  }

  createProjectOutcomesHTML() {
    if (!this.currentProject.outcomes || this.currentProject.outcomes.length === 0) {
      return '';
    }

    const outcomesList = this.currentProject.outcomes.map(outcome =>
      `<li>${outcome}</li>`
    ).join('');

    return `
      <div class="project-outcomes">
        <h3>Key Outcomes</h3>
        <ul class="project-outcomes-list">
          ${outcomesList}
        </ul>
      </div>
    `;
  }

  createArtifactsHTML() {
    const project = this.currentProject;

    if (!project.artifacts) return '';

    if (project.category === 'ai-product') {
      return this.createProductArtifactsHTML();
    } else if (project.category === 'ml-engineering') {
      return this.createEngineeringArtifactsHTML();
    } else if (project.category === 'research') {
      return this.createResearchArtifactsHTML();
    }

    return '';
  }

  createProductArtifactsHTML() {
    const artifacts = this.currentProject.artifacts;
    const artifactItems = [];

    if (artifacts.prd) {
      artifactItems.push(`
        <div class="artifact-item">
          <div class="artifact-header">
            <svg class="artifact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            <h4 class="artifact-title">Product Requirements Document</h4>
          </div>
          <p class="artifact-description">Comprehensive PRD outlining product vision, requirements, and specifications.</p>
          <a href="${artifacts.prd}" class="artifact-link" target="_blank" rel="noopener">
            View PRD
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15,3 21,3 21,9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>
      `);
    }

    if (artifacts.prototype || artifacts.demo) {
      const url = artifacts.prototype || artifacts.demo;
      artifactItems.push(`
        <div class="artifact-item">
          <div class="artifact-header">
            <svg class="artifact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <h4 class="artifact-title">Interactive Prototype</h4>
          </div>
          <p class="artifact-description">Working prototype demonstrating key features and user interactions.</p>
          <a href="${url}" class="artifact-link" target="_blank" rel="noopener">
            View Prototype
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15,3 21,3 21,9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>
      `);
    }

    if (artifacts.wireframes && artifacts.wireframes.length > 0) {
      artifactItems.push(`
        <div class="artifact-item">
          <div class="artifact-header">
            <svg class="artifact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <rect x="7" y="7" width="3" height="3"></rect>
              <rect x="14" y="7" width="3" height="3"></rect>
              <rect x="7" y="14" width="10" height="3"></rect>
            </svg>
            <h4 class="artifact-title">Wireframes & Design</h4>
          </div>
          <p class="artifact-description">User interface wireframes and design mockups.</p>
          <div class="wireframes-preview">
            ${artifacts.wireframes.slice(0, 2).map(wireframe => `
              <img data-src="${wireframe}" alt="Wireframe" class="wireframe-thumb technical-diagram" loading="lazy">
            `).join('')}
          </div>
        </div>
      `);
    }

    if (artifactItems.length === 0) return '';

    return `
      <div class="project-artifacts">
        <h3>Product Artifacts</h3>
        <div class="artifacts-grid">
          ${artifactItems.join('')}
        </div>
      </div>
    `;
  }

  createEngineeringArtifactsHTML() {
    const artifacts = this.currentProject.artifacts;
    const artifactItems = [];

    if (artifacts.repository) {
      artifactItems.push(`
        <div class="artifact-item">
          <div class="artifact-header">
            <svg class="artifact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            <h4 class="artifact-title">Source Code Repository</h4>
          </div>
          <p class="artifact-description">Complete source code with documentation and setup instructions.</p>
          <a href="${artifacts.repository}" class="artifact-link" target="_blank" rel="noopener">
            View Repository
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15,3 21,3 21,9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>
      `);
    }

    if (artifacts.demo) {
      artifactItems.push(`
        <div class="artifact-item">
          <div class="artifact-header">
            <svg class="artifact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
            <h4 class="artifact-title">Live Demo</h4>
          </div>
          <p class="artifact-description">Interactive demonstration of the deployed application.</p>
          <a href="${artifacts.demo}" class="artifact-link" target="_blank" rel="noopener">
            View Demo
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15,3 21,3 21,9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>
      `);
    }

    if (artifacts.architectureDiagram) {
      artifactItems.push(`
        <div class="artifact-item">
          <div class="artifact-header">
            <svg class="artifact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <rect x="7" y="7" width="3" height="9"></rect>
              <rect x="14" y="7" width="3" height="5"></rect>
            </svg>
            <h4 class="artifact-title">Architecture Diagram</h4>
          </div>
          <p class="artifact-description">System architecture and component relationships.</p>
          <img data-src="${artifacts.architectureDiagram}" alt="Architecture Diagram" class="artifact-preview technical-diagram" loading="lazy">
        </div>
      `);
    }

    if (artifactItems.length === 0) return '';

    return `
      <div class="project-artifacts">
        <h3>Technical Artifacts</h3>
        <div class="artifacts-grid">
          ${artifactItems.join('')}
        </div>
      </div>
    `;
  }

  createResearchArtifactsHTML() {
    const artifacts = this.currentProject.artifacts;
    let content = '';

    // Research plots
    if (artifacts.plots && artifacts.plots.length > 0) {
      content += `
        <div class="research-plots">
          <h3>Research Plots & Visualizations</h3>
          <div class="plots-grid">
            ${artifacts.plots.map(plot => `
              <div class="plot-item">
                <img data-src="${plot}" alt="Research Plot" class="plot-image research-plot" loading="lazy">
                <div class="plot-caption">Research visualization and analysis results</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Research paper link
    if (artifacts.paper) {
      content += `
        <div class="research-paper">
          <h3>Research Publication</h3>
          <div class="paper-item">
            <div class="paper-header">
              <svg class="paper-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <h4>Research Paper</h4>
            </div>
            <p>Published research paper with detailed methodology and findings.</p>
            <a href="${artifacts.paper}" class="artifact-link" target="_blank" rel="noopener">
              View Paper
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15,3 21,3 21,9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        </div>
      `;
    }

    return content;
  }

  createProjectLinksHTML() {
    // This method focuses on quick action links only
    const project = this.currentProject;
    const links = [];

    // Fallback for legacy structure
    if (project.liveUrl) {
      links.push(`
        <a href="${project.liveUrl}" class="project-link" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15,3 21,3 21,9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          View Case Study
        </a>
      `);
    }

    if (project.repositoryUrl) {
      links.push(`
        <a href="${project.repositoryUrl}" class="project-link" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
          View Repository
        </a>
      `);
    }

    if (links.length === 0) return '';

    return `
      <div class="project-links">
        ${links.join('')}
      </div>
    `;
  }

  bindGalleryEvents() {
    const prevBtn = this.modal.querySelector('.project-gallery-nav.prev');
    const nextBtn = this.modal.querySelector('.project-gallery-nav.next');
    const indicators = this.modal.querySelectorAll('.project-gallery-indicator');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousImage());
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextImage());
    }

    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        this.currentImageIndex = index;
        this.updateGalleryDisplay();
      });
    });
  }

  previousImage() {
    if (!this.currentProject.images || this.currentProject.images.length <= 1) return;

    this.currentImageIndex = this.currentImageIndex === 0
      ? this.currentProject.images.length - 1
      : this.currentImageIndex - 1;

    this.updateGalleryDisplay();
  }

  nextImage() {
    if (!this.currentProject.images || this.currentProject.images.length <= 1) return;

    this.currentImageIndex = this.currentImageIndex === this.currentProject.images.length - 1
      ? 0
      : this.currentImageIndex + 1;

    this.updateGalleryDisplay();
  }

  updateGalleryDisplay() {
    const images = this.modal.querySelectorAll('.project-gallery-image');
    const indicators = this.modal.querySelectorAll('.project-gallery-indicator');

    // Update images
    images.forEach((img, index) => {
      const isActive = index === this.currentImageIndex;
      img.classList.toggle('hidden', !isActive);

      // Load image if it's becoming active and hasn't been loaded yet
      if (isActive && img.hasAttribute('data-src')) {
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
      }
    });

    // Update indicators
    indicators.forEach((indicator, index) => {
      const isActive = index === this.currentImageIndex;
      indicator.classList.toggle('active', isActive);
      indicator.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  showModal() {
    if (!this.modalBackdrop || !this.modal) return;

    // Store the currently focused element to restore later
    this.previouslyFocusedElement = document.activeElement;

    document.body.style.overflow = 'hidden';
    this.modalBackdrop.classList.add('show');
    this.modal.classList.add('show');
    this.modalBackdrop.setAttribute('aria-hidden', 'false');

    // Focus management - focus the modal container
    setTimeout(() => {
      this.modal.focus();
      this.trapFocus();
    }, 100);
  }

  closeModal() {
    if (!this.modalBackdrop || !this.modal) return;

    document.body.style.overflow = '';
    this.modalBackdrop.classList.remove('show');
    this.modal.classList.remove('show');
    this.modalBackdrop.setAttribute('aria-hidden', 'true');

    // Restore focus to the previously focused element
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
      this.previouslyFocusedElement = null;
    }

    this.currentProject = null;
    this.currentImageIndex = 0;
  }

  isModalOpen() {
    return this.modalBackdrop && this.modalBackdrop.classList.contains('show');
  }

  /**
   * Trap focus within the modal for accessibility
   */
  trapFocus() {
    if (!this.modal) return;

    const focusableElements = this.modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    this.modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
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
    });
  }

  loadFallbackProjects() {
    console.log('Loading fallback projects...');
    
    // Fallback projects data
    this.allProjects = [
      {
        id: 'autodescribe',
        title: 'AutoDescribe',
        category: 'ai-product',
        description: 'RAG + human-in-the-loop product description generator that automates content creation while maintaining quality control.',
        technologies: ['RAG', 'Python', 'OpenAI API', 'Human-in-the-loop', 'NLP'],
        images: ['assets/images/projects/autodescribe/dashboard.svg'],
        featured: true
      },
      {
        id: 'drosophila-neurotoxicity',
        title: 'Neurotoxicity Analysis with Drosophila',
        category: 'research',
        description: 'Understanding the neurotoxic effects of environmental compounds using Drosophila melanogaster as a model organism.',
        technologies: ['Behavioral Analysis', 'Electrophysiology', 'Molecular Biology', 'Statistical Analysis'],
        images: ['assets/images/projects/drosophila/experimental-setup.svg'],
        featured: true
      }
    ];

    this.filteredProjects = [...this.allProjects];
    console.log(`Loaded ${this.allProjects.length} fallback projects`);
  }

  showError(message) {
    if (this.projectsGrid) {
      this.projectsGrid.innerHTML = `
        <div class="error-state col-span-full text-center py-12">
          <div class="error-icon mx-auto mb-4 text-red-500">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Unable to Load Projects</h3>
          <p class="text-gray-600 mb-4">${message}</p>
          <button onclick="location.reload()" class="btn btn-primary">
            Try Again
          </button>
        </div>
      `;
    }
  }

  showLoadingState() {
    if (!this.projectsGrid) return;

    this.projectsGrid.innerHTML = `
      <div class="loading-state col-span-full text-center py-12">
        <div class="loading-spinner mx-auto mb-4"></div>
        <p class="text-gray-600">Loading projects...</p>
      </div>
    `;
  }

  hideLoadingState() {
    // Loading state will be replaced by renderProjects()
  }
}

// Initialize projects manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.projectsManager = new ProjectsManager();
});