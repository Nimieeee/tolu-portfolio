/**
 * Main JavaScript file for portfolio site
 * Handles navigation functionality and smooth scrolling
 */

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeSmoothScrolling();
    initializeScrollSpy();
    initializeDynamicTyping();
    initializeLoadingStates();
    initializeMicroInteractions();
    initializeCrossBrowserSupport();
});

/**
 * Initialize navigation functionality
 */
function initializeNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.querySelector('.header');

    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            const isOpen = navMenu.classList.contains('mobile-open');
            
            if (isOpen) {
                closeNavMenu();
            } else {
                openNavMenu();
            }
        });
    }

    // Close mobile menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeNavMenu();
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navToggle.contains(event.target) || navMenu.contains(event.target);
        
        if (!isClickInsideNav && navMenu.classList.contains('mobile-open')) {
            closeNavMenu();
        }
    });

    // Handle escape key to close mobile menu
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && navMenu.classList.contains('mobile-open')) {
            closeNavMenu();
            // Return focus to toggle button
            navToggle.focus();
        }
    });

    // Header scroll effect
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add scrolled class for styling
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });

    /**
     * Open mobile navigation menu
     */
    function openNavMenu() {
        navMenu.classList.add('mobile-open');
        navToggle.classList.add('active');
        navToggle.setAttribute('aria-expanded', 'true');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = 'hidden';
        
        // Focus first menu item for keyboard navigation
        const firstNavLink = navMenu.querySelector('.nav-link');
        if (firstNavLink) {
            setTimeout(() => firstNavLink.focus(), 100);
        }
    }

    /**
     * Close mobile navigation menu
     */
    function closeNavMenu() {
        navMenu.classList.remove('mobile-open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
}

/**
 * Initialize smooth scrolling for navigation links
 */
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Initialize scroll spy for active section highlighting
 */
function initializeScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    
    if (sections.length === 0 || navLinks.length === 0) {
        return;
    }

    // Throttle scroll events for better performance
    let ticking = false;
    
    function updateActiveSection() {
        const scrollPosition = window.pageYOffset + 100; // Offset for header
        let activeSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                activeSection = sectionId;
            }
        });
        
        // Update active nav link
        navLinks.forEach(link => {
            const linkSection = link.getAttribute('data-section');
            
            if (linkSection === activeSection) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateActiveSection);
            ticking = true;
        }
    }
    
    // Initial call to set active section on page load
    updateActiveSection();
    
    // Listen for scroll events
    window.addEventListener('scroll', requestTick);
}

/**
 * Initialize dynamic typing effect for hero title
 */
function initializeDynamicTyping() {
    const dynamicTitle = document.getElementById('dynamic-title');
    const cursor = document.querySelector('.hero-cursor');
    
    if (!dynamicTitle) {
        return;
    }
    
    // Array of titles to cycle through
    const titles = [
        'AI/ML Engineer',
        'AI Product Manager',
        'Researcher',
        'Team Leader',
        'Strategic Planner',
        'Problem Solver',
        'Innovation Driver'
    ];
    
    let currentTitleIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100; // Typing speed in milliseconds
    let deleteSpeed = 50; // Deleting speed in milliseconds
    let pauseTime = 2000; // Pause time between words
    
    function typeEffect() {
        const currentTitle = titles[currentTitleIndex];
        
        if (isDeleting) {
            // Remove characters
            dynamicTitle.textContent = currentTitle.substring(0, currentCharIndex - 1);
            currentCharIndex--;
            
            if (currentCharIndex === 0) {
                isDeleting = false;
                currentTitleIndex = (currentTitleIndex + 1) % titles.length;
                setTimeout(typeEffect, 500); // Short pause before typing next word
                return;
            }
            
            setTimeout(typeEffect, deleteSpeed);
        } else {
            // Add characters
            dynamicTitle.textContent = currentTitle.substring(0, currentCharIndex + 1);
            currentCharIndex++;
            
            if (currentCharIndex === currentTitle.length) {
                isDeleting = true;
                setTimeout(typeEffect, pauseTime); // Pause before deleting
                return;
            }
            
            setTimeout(typeEffect, typeSpeed);
        }
    }
    
    // Start the typing effect after a short delay
    setTimeout(typeEffect, 1000);
    
    // Handle cursor blinking
    if (cursor) {
        // The cursor blinking is handled by CSS animation
        // We can add additional logic here if needed
    }
}

/**
 * Initialize loading states for better user experience
 */
function initializeLoadingStates() {
    // Add loading state to page
    document.body.classList.add('page-loading');
    
    // Remove loading state after page is fully loaded
    window.addEventListener('load', function() {
        setTimeout(() => {
            document.body.classList.remove('page-loading');
            document.body.classList.add('page-loaded');
        }, 100);
    });
    
    // Add loading states to forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.classList.add('loading');
                submitButton.disabled = true;
            }
        });
    });
    
    // Add loading states to navigation links
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Add brief loading state for smooth scroll
            this.classList.add('navigating');
            setTimeout(() => {
                this.classList.remove('navigating');
            }, 800);
        });
    });
}

/**
 * Initialize micro-interactions for enhanced user experience
 */
function initializeMicroInteractions() {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', createRippleEffect);
    });
    
    // Add hover effects to cards
    const cards = document.querySelectorAll('.card, .project-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add focus indicators for keyboard navigation
    const focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]');
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.classList.add('keyboard-focused');
        });
        
        element.addEventListener('blur', function() {
            this.classList.remove('keyboard-focused');
        });
        
        element.addEventListener('mousedown', function() {
            this.classList.remove('keyboard-focused');
        });
    });
    
    // Add scroll-triggered animations
    initializeScrollAnimations();
}

/**
 * Create ripple effect for button clicks
 */
function createRippleEffect(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

/**
 * Initialize scroll-triggered animations
 */
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements that should animate on scroll
    const animateElements = document.querySelectorAll('.project-card, .skill-item, .timeline-item');
    animateElements.forEach(element => {
        element.classList.add('animate-on-scroll');
        observer.observe(element);
    });
}

/**
 * Initialize cross-browser support enhancements
 */
function initializeCrossBrowserSupport() {
    // Polyfill for smooth scrolling in older browsers
    if (!('scrollBehavior' in document.documentElement.style)) {
        loadSmoothScrollPolyfill();
    }
    
    // Polyfill for IntersectionObserver
    if (!window.IntersectionObserver) {
        loadIntersectionObserverPolyfill();
    }
    
    // Add browser-specific classes
    addBrowserClasses();
    
    // Handle iOS Safari viewport height issues
    handleIOSViewportHeight();
    
    // Add touch device detection
    addTouchDeviceSupport();
}

/**
 * Load smooth scroll polyfill for older browsers
 */
function loadSmoothScrollPolyfill() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                // Smooth scroll polyfill
                smoothScrollTo(targetPosition, 800);
            }
        });
    });
}

/**
 * Smooth scroll polyfill function
 */
function smoothScrollTo(targetPosition, duration) {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }
    
    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
    
    requestAnimationFrame(animation);
}

/**
 * Load IntersectionObserver polyfill
 */
function loadIntersectionObserverPolyfill() {
    // Simple fallback for scroll animations without IntersectionObserver
    let ticking = false;
    
    function checkScrollAnimations() {
        const animateElements = document.querySelectorAll('.animate-on-scroll:not(.animate-in)');
        const windowHeight = window.innerHeight;
        
        animateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < windowHeight - 50) {
                element.classList.add('animate-in');
            }
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(checkScrollAnimations);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
    checkScrollAnimations(); // Initial check
}

/**
 * Add browser-specific classes for targeted styling
 */
function addBrowserClasses() {
    const userAgent = navigator.userAgent;
    const body = document.body;
    
    // Detect browser
    if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) {
        body.classList.add('browser-chrome');
    } else if (userAgent.includes('Firefox')) {
        body.classList.add('browser-firefox');
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        body.classList.add('browser-safari');
    } else if (userAgent.includes('Edge')) {
        body.classList.add('browser-edge');
    }
    
    // Detect OS
    if (userAgent.includes('Mac')) {
        body.classList.add('os-mac');
    } else if (userAgent.includes('Windows')) {
        body.classList.add('os-windows');
    } else if (userAgent.includes('Linux')) {
        body.classList.add('os-linux');
    }
}

/**
 * Handle iOS Safari viewport height issues
 */
function handleIOSViewportHeight() {
    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setViewportHeight();
    window.addEventListener('resize', debounce(setViewportHeight, 100));
    window.addEventListener('orientationchange', () => {
        setTimeout(setViewportHeight, 100);
    });
}

/**
 * Add touch device support
 */
function addTouchDeviceSupport() {
    let isTouch = false;
    
    function addTouchClass() {
        if (!isTouch) {
            isTouch = true;
            document.body.classList.add('touch-device');
        }
    }
    
    function addMouseClass() {
        if (isTouch) {
            isTouch = false;
            document.body.classList.remove('touch-device');
        }
    }
    
    document.addEventListener('touchstart', addTouchClass, { passive: true });
    document.addEventListener('mousemove', addMouseClass);
    
    // Initial detection
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        addTouchClass();
    }
}

/**
 * Utility function to debounce function calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}/*
*
 * Multi-page navigation utilities
 */
function initializeMultiPageNavigation() {
    // Handle navigation highlighting based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Remove active class from all links
        link.classList.remove('active');
        
        // Add active class to current page link
        if (href === currentPage || 
            (currentPage === 'index.html' && href === '#hero') ||
            (currentPage === '' && href === '#hero')) {
            link.classList.add('active');
        }
        
        if (href === 'ai-engineering.html' && currentPage === 'ai-engineering.html') {
            link.classList.add('active');
        }
        
        if (href === 'product-management.html' && currentPage === 'product-management.html') {
            link.classList.add('active');
        }
    });
}

/**
 * Handle smooth transitions between pages
 */
function initializePageTransitions() {
    const pageLinks = document.querySelectorAll('a[href$=".html"]');
    
    pageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's an external link or has target="_blank"
            if (this.hostname !== window.location.hostname || this.target === '_blank') {
                return;
            }
            
            // Add loading state
            document.body.classList.add('page-transitioning');
            
            // Small delay for visual feedback
            setTimeout(() => {
                window.location.href = href;
            }, 150);
        });
    });
}

/**
 * Initialize back-to-top functionality for all pages
 */
function initializeBackToTop() {
    // Create back to top button if it doesn't exist
    let backToTopBtn = document.getElementById('back-to-top');
    
    if (!backToTopBtn) {
        backToTopBtn = document.createElement('button');
        backToTopBtn.id = 'back-to-top';
        backToTopBtn.innerHTML = '↑';
        backToTopBtn.setAttribute('aria-label', 'Back to top');
        backToTopBtn.className = 'back-to-top-btn';
        document.body.appendChild(backToTopBtn);
    }
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    // Smooth scroll to top when clicked
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Handle breadcrumb navigation for project pages
 */
function initializeBreadcrumbs() {
    const currentPage = window.location.pathname.split('/').pop();
    let breadcrumbHTML = '<a href="index.html">Home</a>';
    
    if (currentPage === 'ai-engineering.html') {
        breadcrumbHTML += ' / <span>AI Engineering Projects</span>';
    } else if (currentPage === 'product-management.html') {
        breadcrumbHTML += ' / <span>Product Management Projects</span>';
    }
    
    // Add breadcrumb container if it exists
    const breadcrumbContainer = document.querySelector('.breadcrumb');
    if (breadcrumbContainer) {
        breadcrumbContainer.innerHTML = breadcrumbHTML;
    }
}

// Initialize multi-page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeMultiPageNavigation();
    initializePageTransitions();
    initializeBackToTop();
    initializeBreadcrumbs();
});

// Add CSS for page transitions and back-to-top button
const additionalStyles = `
    .page-transitioning {
        opacity: 0.8;
        pointer-events: none;
        transition: opacity 150ms ease-out;
    }
    
    .back-to-top-btn {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 3rem;
        height: 3rem;
        background: var(--color-primary, #2563eb);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 1.2rem;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px);
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .back-to-top-btn.visible {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }
    
    .back-to-top-btn:hover {
        background: var(--color-primary-dark, #1d4ed8);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }
    
    .breadcrumb {
        padding: 1rem 0;
        font-size: 0.875rem;
        color: var(--color-gray-600, #6b7280);
    }
    
    .breadcrumb a {
        color: var(--color-primary, #2563eb);
        text-decoration: none;
    }
    
    .breadcrumb a:hover {
        text-decoration: underline;
    }
    
    @media (max-width: 768px) {
        .back-to-top-btn {
            bottom: 1rem;
            right: 1rem;
            width: 2.5rem;
            height: 2.5rem;
            font-size: 1rem;
        }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);