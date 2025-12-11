/**
 * eJuuz - Main JavaScript
 * Optimized for performance, accessibility, and mobile-first experience
 */

// ============================================
// 1. CONFIGURATION & CONSTANTS
// ============================================
const CONFIG = {
    // Performance settings
    DEBOUNCE_DELAY: 100,
    THROTTLE_DELAY: 200,
    RESIZE_DEBOUNCE: 150,
    
    // Animation settings
    SCROLL_THRESHOLD: 80,
    MOBILE_BREAKPOINT: 768,
    TABLET_BREAKPOINT: 1024,
    
    // Feature toggles
    LAZY_LOAD_ENABLED: true,
    SMOOTH_SCROLL_ENABLED: true,
    ANIMATIONS_ENABLED: true,
    
    // Chat settings
    CHAT_AUTO_CLOSE: 30000, // 30 seconds
    CHAT_MIN_RESPONSE_TIME: 1000, // 1 second
    CHAT_MAX_RESPONSE_TIME: 3000 // 3 seconds
};

// ============================================
// 2. UTILITY FUNCTIONS
// ============================================
const utils = {
    // Debounce function for performance optimization
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function for scroll/resize events
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Check if element is in viewport
    isInViewport(element, offset = 100) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight - offset) &&
            rect.bottom >= offset &&
            rect.left <= (window.innerWidth - offset) &&
            rect.right >= offset
        );
    },

    // Get preferred color scheme
    getColorScheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },

    // Check if user prefers reduced motion
    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    // Format phone number
    formatPhoneNumber(phone) {
        return phone.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '+$1 $2 $3 $4');
    },

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Validate email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    },

    // Add loading state to button
    setButtonLoading(button, isLoading) {
        if (!button) return;
        
        if (isLoading) {
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = '<span class="loading-spinner-small"></span> Loading...';
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
        } else {
            button.innerHTML = button.dataset.originalText || button.innerHTML;
            button.disabled = false;
            button.removeAttribute('aria-busy');
        }
    },

    // Safe query selector
    $(selector, parent = document) {
        return parent.querySelector(selector);
    },

    // Safe query selector all
    $$(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    },

    // Get device type
    getDeviceType() {
        const width = window.innerWidth;
        if (width < CONFIG.MOBILE_BREAKPOINT) return 'mobile';
        if (width < CONFIG.TABLET_BREAKPOINT) return 'tablet';
        return 'desktop';
    }
};

// ============================================
// 3. CORE APPLICATION
// ============================================
class eJuuzApp {
    constructor() {
        this.state = {
            isNavOpen: false,
            isChatOpen: false,
            currentSection: 'home',
            scrollPosition: 0,
            deviceType: utils.getDeviceType()
        };
        
        this.observers = [];
        this.eventListeners = [];
        
        this.init();
    }

    init() {
        console.log('🚀 Initializing eJuuz App...');
        
        // Initialize all modules
        this.cacheElements();
        this.setupEventListeners();
        this.initModules();
        this.setupObservers();
        
        // Set initial states
        this.updateUIStates();
        this.setCurrentYear();
        
        // Performance optimizations
        this.optimizePerformance();
        
        console.log('✅ eJuuz App initialized successfully');
    }

    cacheElements() {
        try {
            this.elements = {
                // Navigation
                nav: utils.$('#nav'),
                navToggle: utils.$('#nav-toggle'),
                navList: utils.$('#nav-list'),
                navLinks: utils.$$('#nav-list a'),
                header: utils.$('header'),
                
                // Chat Widget
                chatToggle: utils.$('#chat-toggle'),
                chatPanel: utils.$('#chat-panel'),
                chatForm: utils.$('.chat-form'),
                chatStatus: utils.$('.chat-status'),
                chatClose: utils.$('.chat-close'),
                chatMessages: utils.$('.chat-messages'),
                
                // Feature Cards
                featureCards: utils.$$('.feature-card'),
                serviceCards: utils.$$('.service-card'),
                actionButtons: utils.$$('[data-action]'),
                
                // Forms
                forms: utils.$$('form:not(.chat-form)'),
                newsletterForm: utils.$('.newsletter-form'),
                
                // Video
                video: utils.$('#site-video'),
                
                // Footer
                currentYear: utils.$('#current-year'),
                
                // Loading states
                loadingSpinner: utils.$('.loading-spinner'),
                
                // Back to top
                backToTop: utils.$('#back-to-top'),
                
                // Sections
                sections: utils.$$('section[id]'),
                
                // Animated elements
                animatedElements: utils.$$('[data-animate]')
            };
            
            // Create back to top button if it doesn't exist
            if (!this.elements.backToTop) {
                this.elements.backToTop = this.createBackToTopButton();
            }
        } catch (error) {
            console.error('Error caching elements:', error);
        }
    }

    setupEventListeners() {
        // Navigation Toggle
        if (this.elements.navToggle) {
            const handler = (e) => this.handleNavToggle(e);
            this.elements.navToggle.addEventListener('click', handler);
            this.eventListeners.push({ element: this.elements.navToggle, type: 'click', handler });
        }
        
        // Navigation Links
        this.elements.navLinks.forEach(link => {
            const handler = (e) => this.handleNavLinkClick(e);
            link.addEventListener('click', handler);
            this.eventListeners.push({ element: link, type: 'click', handler });
        });
        
        // Chat Widget
        if (this.elements.chatToggle) {
            const handler = (e) => this.handleChatToggle(e);
            this.elements.chatToggle.addEventListener('click', handler);
            this.eventListeners.push({ element: this.elements.chatToggle, type: 'click', handler });
        }
        
        if (this.elements.chatClose) {
            const handler = (e) => this.handleChatClose(e);
            this.elements.chatClose.addEventListener('click', handler);
            this.eventListeners.push({ element: this.elements.chatClose, type: 'click', handler });
        }
        
        // Chat Form
        if (this.elements.chatForm) {
            const submitHandler = (e) => this.handleChatSubmit(e);
            this.elements.chatForm.addEventListener('submit', submitHandler);
            this.eventListeners.push({ element: this.elements.chatForm, type: 'submit', handler: submitHandler });
            
            // Real-time validation
            const inputs = utils.$$('input, textarea', this.elements.chatForm);
            inputs.forEach(input => {
                const blurHandler = (e) => this.validateField(e.target);
                const inputHandler = (e) => this.clearFieldError(e.target);
                
                input.addEventListener('blur', blurHandler);
                input.addEventListener('input', inputHandler);
                
                this.eventListeners.push(
                    { element: input, type: 'blur', handler: blurHandler },
                    { element: input, type: 'input', handler: inputHandler }
                );
            });
        }
        
        // Newsletter Form
        if (this.elements.newsletterForm) {
            const handler = (e) => this.handleNewsletterSubmit(e);
            this.elements.newsletterForm.addEventListener('submit', handler);
            this.eventListeners.push({ element: this.elements.newsletterForm, type: 'submit', handler });
        }
        
        // General Forms (skip pages with custom handlers)
        this.elements.forms.forEach(form => {
            const formId = form.id || '';
            if (formId === 'signup-form' || formId === 'login-form') {
                return;
            }
            const handler = (e) => this.handleFormSubmit(e);
            form.addEventListener('submit', handler);
            this.eventListeners.push({ element: form, type: 'submit', handler });
        });
        
        // Back to Top Button
        if (this.elements.backToTop) {
            const handler = () => this.scrollToTop();
            this.elements.backToTop.addEventListener('click', handler);
            this.eventListeners.push({ element: this.elements.backToTop, type: 'click', handler });
        }
        
        // Window Events
        const scrollHandler = utils.throttle(() => this.handleScroll(), CONFIG.THROTTLE_DELAY);
        const resizeHandler = utils.debounce(() => this.handleResize(), CONFIG.RESIZE_DEBOUNCE);
        const loadHandler = () => this.handlePageLoad();
        const keyDownHandler = (e) => this.handleKeyDown(e);
        const clickOutsideHandler = (e) => this.handleClickOutside(e);
        const visibilityHandler = () => this.handleVisibilityChange();
        
        window.addEventListener('scroll', scrollHandler, { passive: true });
        window.addEventListener('resize', resizeHandler);
        window.addEventListener('load', loadHandler);
        document.addEventListener('keydown', keyDownHandler);
        document.addEventListener('click', clickOutsideHandler);
        document.addEventListener('visibilitychange', visibilityHandler);
        
        this.eventListeners.push(
            { element: window, type: 'scroll', handler: scrollHandler },
            { element: window, type: 'resize', handler: resizeHandler },
            { element: window, type: 'load', handler: loadHandler },
            { element: document, type: 'keydown', handler: keyDownHandler },
            { element: document, type: 'click', handler: clickOutsideHandler },
            { element: document, type: 'visibilitychange', handler: visibilityHandler }
        );
    }

    initModules() {
        // Initialize Intersection Observer
        this.initIntersectionObserver();
        
        // Initialize Smooth Scrolling
        this.initSmoothScrolling();
        
        // Initialize Animations
        if (CONFIG.ANIMATIONS_ENABLED && !utils.prefersReducedMotion()) {
            this.initAnimations();
        }
        
        // Initialize Service Worker (if available)
        this.initServiceWorker();
        
        // Initialize Analytics
        this.initAnalytics();
    }

    setupObservers() {
        // Observe system preferences
        this.observeSystemPreferences();
        
        // Observe navigation state
        this.observeNavigationState();
        
        // Observe network status
        this.observeNetworkStatus();
    }

    // ============================================
    // 4. EVENT HANDLERS
    // ============================================
    handleNavToggle(e) {
        e.preventDefault();
        e.stopPropagation();
        
        this.state.isNavOpen = !this.state.isNavOpen;
        this.updateNavState();
        
        // Announce state change for screen readers
        this.announceStateChange(`Navigation menu ${this.state.isNavOpen ? 'opened' : 'closed'}`);
    }

    handleNavLinkClick(e) {
        const target = e.currentTarget.getAttribute('href');
        
        // Close mobile menu on link click
        if (this.state.deviceType === 'mobile' && target?.startsWith('#')) {
            this.state.isNavOpen = false;
            this.updateNavState();
        }
        
        // Smooth scroll to section
        if (target?.startsWith('#')) {
            e.preventDefault();
            const sectionId = target.substring(1);
            this.scrollToSection(sectionId);
        }
    }

    handleChatToggle(e) {
        e.preventDefault();
        e.stopPropagation();
        
        this.state.isChatOpen = !this.state.isChatOpen;
        this.updateChatState();
        
        // Focus on first input when opening
        if (this.state.isChatOpen && this.elements.chatForm) {
            setTimeout(() => {
                const firstInput = utils.$('input', this.elements.chatForm);
                firstInput?.focus();
            }, 100);
        }
        
        // Announce state change
        this.announceStateChange(`Support chat ${this.state.isChatOpen ? 'opened' : 'closed'}`);
    }

    handleChatClose(e) {
        e.preventDefault();
        this.state.isChatOpen = false;
        this.updateChatState();
        this.elements.chatToggle?.focus();
    }

    async handleChatSubmit(e) {
        e.preventDefault();
        
        if (!this.elements.chatForm) return;
        
        const form = e.target;
        const formData = new FormData(form);
        const submitButton = utils.$('button[type="submit"]', form);
        
        // Validate form
        if (!this.validateChatForm(formData)) {
            this.showChatStatus('Please fill in all required fields correctly.', 'error');
            return;
        }
        
        // Show loading state
        utils.setButtonLoading(submitButton, true);
        this.showChatStatus('Sending your message...', 'sending');
        
        try {
            // Simulate API call
            await this.simulateApiCall();
            
            // Success
            this.showChatStatus('Thank you! Our team will respond within 24 hours.', 'success');
            form.reset();
            
            // Add message to chat
            if (this.elements.chatMessages) {
                this.addChatMessage('Your message has been received. We\'ll get back to you soon!', 'bot');
            }
            
            // Auto-close after delay
            setTimeout(() => {
                this.state.isChatOpen = false;
                this.updateChatState();
            }, CONFIG.CHAT_AUTO_CLOSE);
            
        } catch (error) {
            console.error('Chat submission error:', error);
            this.showChatStatus('Sorry, something went wrong. Please try again.', 'error');
        } finally {
            utils.setButtonLoading(submitButton, false);
            
            // Clear status after delay
            setTimeout(() => {
                this.clearChatStatus();
            }, 5000);
        }
    }

    async handleNewsletterSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const emailInput = utils.$('input[type="email"]', form);
        const submitButton = utils.$('button[type="submit"]', form);
        
        if (!emailInput || !utils.validateEmail(emailInput.value)) {
            this.showToast('Please enter a valid email address.', 'error');
            return;
        }
        
        utils.setButtonLoading(submitButton, true);
        
        try {
            await this.simulateApiCall();
            this.showToast('Thanks for subscribing! Check your inbox for confirmation.', 'success');
            form.reset();
        } catch (error) {
            this.showToast('Subscription failed. Please try again.', 'error');
        } finally {
            utils.setButtonLoading(submitButton, false);
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        
        if (!this.validateForm(form)) {
            this.showToast('Please check your form for errors.', 'error');
            return;
        }
        
        this.showToast('Form submitted successfully!', 'success');
        form.reset();
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        this.state.scrollPosition = scrollTop;
        
        // Header scroll effect
        if (this.elements.header) {
            this.elements.header.classList.toggle('scrolled', scrollTop > CONFIG.SCROLL_THRESHOLD);
        }
        
        // Back to top button
        if (this.elements.backToTop) {
            this.elements.backToTop.classList.toggle('visible', scrollTop > 300);
        }
        
        // Update active nav link
        this.updateActiveNavLink();
        
        // Lazy load images
        if (CONFIG.LAZY_LOAD_ENABLED) {
            this.lazyLoadImages();
        }
    }

    handleResize() {
        const newDeviceType = utils.getDeviceType();
        
        // Device type changed
        if (newDeviceType !== this.state.deviceType) {
            this.state.deviceType = newDeviceType;
            
            // Close mobile menu when resizing to desktop
            if (newDeviceType !== 'mobile' && this.state.isNavOpen) {
                this.state.isNavOpen = false;
                this.updateNavState();
            }
        }
        
        this.updateUIStates();
    }

    handlePageLoad() {
        // Hide loading spinner
        if (this.elements.loadingSpinner) {
            setTimeout(() => {
                this.elements.loadingSpinner.style.opacity = '0';
                setTimeout(() => {
                    this.elements.loadingSpinner.style.display = 'none';
                }, 300);
            }, 500);
        }
        
        // Log page view
        this.logPageView();
        
        // Trigger initial scroll to set states
        this.handleScroll();
    }

    handleKeyDown(e) {
        // Escape key closes modals and dropdowns
        if (e.key === 'Escape') {
            if (this.state.isNavOpen) {
                this.state.isNavOpen = false;
                this.updateNavState();
                this.elements.navToggle?.focus();
            }
            
            if (this.state.isChatOpen) {
                this.state.isChatOpen = false;
                this.updateChatState();
                this.elements.chatToggle?.focus();
            }
        }
        
        // Tab key navigation for modal focus trapping
        if (e.key === 'Tab' && this.state.isChatOpen && this.elements.chatPanel) {
            this.trapFocus(e, this.elements.chatPanel);
        }
    }

    handleClickOutside(e) {
        // Close mobile nav if clicking outside
        if (this.state.isNavOpen && 
            this.elements.navList && 
            !this.elements.navList.contains(e.target) &&
            !this.elements.navToggle?.contains(e.target)) {
            this.state.isNavOpen = false;
            this.updateNavState();
        }
        
        // Close chat if clicking outside
        if (this.state.isChatOpen &&
            this.elements.chatPanel &&
            !this.elements.chatPanel.contains(e.target) &&
            !this.elements.chatToggle?.contains(e.target)) {
            this.state.isChatOpen = false;
            this.updateChatState();
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden, pause animations or timers
            console.log('Page hidden');
        } else {
            // Page is visible again
            console.log('Page visible');
        }
    }

    // ============================================
    // 5. STATE MANAGEMENT
    // ============================================
    updateNavState() {
        if (!this.elements.nav || !this.elements.navToggle) return;
        
        // Update classes - use mobile-active for mobile nav
        this.elements.nav.classList.toggle('mobile-active', this.state.isNavOpen);
        this.elements.navToggle.classList.toggle('active', this.state.isNavOpen);
        
        // Update ARIA
        this.elements.navToggle.setAttribute('aria-expanded', this.state.isNavOpen);
        
        // Prevent body scroll on mobile when nav is open
        if (this.state.deviceType === 'mobile') {
            document.body.style.overflow = this.state.isNavOpen ? 'hidden' : '';
        }
    }

    updateChatState() {
        if (!this.elements.chatPanel || !this.elements.chatToggle) return;
        
        // Update ARIA
        this.elements.chatPanel.setAttribute('aria-hidden', !this.state.isChatOpen);
        this.elements.chatToggle.setAttribute('aria-expanded', this.state.isChatOpen);
    }

    updateUIStates() {
        this.updateTouchSupport();
        this.updateOrientation();
    }

    // ============================================
    // 6. UI HELPERS
    // ============================================
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        const headerHeight = this.elements.header?.offsetHeight || 0;
        const offsetTop = section.offsetTop - headerHeight - 20;
        
        if (CONFIG.SMOOTH_SCROLL_ENABLED && !utils.prefersReducedMotion()) {
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        } else {
            window.scrollTo(0, offsetTop);
        }
        
        // Update current section
        this.state.currentSection = sectionId;
    }

    scrollToTop() {
        if (CONFIG.SMOOTH_SCROLL_ENABLED && !utils.prefersReducedMotion()) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            window.scrollTo(0, 0);
        }
    }

    showToast(message, type = 'info') {
        // Remove existing toast
        const existingToast = utils.$('.toast-message');
        if (existingToast) existingToast.remove();
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast-message toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        toast.innerHTML = `
            <span class="toast-content">${message}</span>
            <button class="toast-close" aria-label="Close notification">
                <i class='bx bx-x'></i>
            </button>
        `;
        
        document.body.appendChild(toast);
        
        // Show toast
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // Auto remove
        const hideToast = () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        };
        
        setTimeout(hideToast, 5000);
        
        // Close button
        const closeBtn = utils.$('.toast-close', toast);
        closeBtn?.addEventListener('click', hideToast);
    }

    showChatStatus(message, type = 'info') {
        if (!this.elements.chatStatus) return;
        
        this.elements.chatStatus.textContent = message;
        this.elements.chatStatus.className = `chat-status status-${type}`;
        this.elements.chatStatus.setAttribute('role', 'status');
        this.elements.chatStatus.setAttribute('aria-live', 'polite');
    }

    clearChatStatus() {
        if (!this.elements.chatStatus) return;
        
        this.elements.chatStatus.textContent = '';
        this.elements.chatStatus.className = 'chat-status';
    }

    addChatMessage(message, sender = 'bot') {
        if (!this.elements.chatMessages) return;
        
        const messageEl = document.createElement('div');
        messageEl.className = `chat-message chat-message-${sender}`;
        messageEl.textContent = message;
        
        this.elements.chatMessages.appendChild(messageEl);
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    }

    announceStateChange(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1000);
    }

    createBackToTopButton() {
        const button = document.createElement('button');
        button.id = 'back-to-top';
        button.className = 'back-to-top';
        button.setAttribute('aria-label', 'Back to top');
        button.innerHTML = '<i class="bx bx-up-arrow-alt"></i>';
        document.body.appendChild(button);
        return button;
    }

    // ============================================
    // 7. VALIDATION
    // ============================================
    validateChatForm(formData) {
        const name = formData.get('chat-name')?.toString().trim();
        const email = formData.get('chat-email')?.toString().trim();
        const message = formData.get('chat-message')?.toString().trim();
        
        if (!name || name.length < 2) {
            return false;
        }
        
        if (!email || !utils.validateEmail(email)) {
            return false;
        }
        
        if (!message || message.length < 10) {
            return false;
        }
        
        return true;
    }

    validateForm(form) {
        let isValid = true;
        const requiredFields = utils.$$('[required]', form);
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        
        // Check required
        if (field.hasAttribute('required') && !value) {
            isValid = false;
        }
        
        // Check email
        if (field.type === 'email' && value && !utils.validateEmail(value)) {
            isValid = false;
        }
        
        // Check minlength
        if (field.minLength && value.length < field.minLength) {
            isValid = false;
        }
        
        // Update UI
        field.classList.toggle('error', !isValid);
        field.setAttribute('aria-invalid', !isValid);
        
        return isValid;
    }

    clearFieldError(field) {
        field.classList.remove('error');
        field.removeAttribute('aria-invalid');
    }

    // ============================================
    // 8. PERFORMANCE OPTIMIZATIONS
    // ============================================
    optimizePerformance() {
        this.setupPassiveEventListeners();
        this.preloadCriticalResources();
        
        if (CONFIG.LAZY_LOAD_ENABLED) {
            this.setupLazyLoading();
        }
    }

    setupPassiveEventListeners() {
        const options = { passive: true };
        const noop = () => {};
        document.addEventListener('touchstart', noop, options);
        document.addEventListener('touchmove', noop, options);
    }

    preloadCriticalResources() {
        const criticalImages = [
            'images/ejuuzlogo.png',
            'images/ejuuz.png'
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    setupLazyLoading() {
        if ('loading' in HTMLImageElement.prototype) {
            // Native lazy loading supported
            const images = utils.$$('img[loading="lazy"]');
            images.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
            });
        } else {
            // Use Intersection Observer fallback
            this.setupLazyLoadFallback();
        }
    }

    setupLazyLoadFallback() {
        if (!('IntersectionObserver' in window)) return;
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        const images = utils.$$('img[data-src]');
        images.forEach(img => imageObserver.observe(img));
    }

    lazyLoadImages() {
        const images = utils.$$('img[loading="lazy"]:not(.loaded)');
        
        images.forEach(img => {
            if (utils.isInViewport(img, 200)) {
                img.classList.add('loaded');
            }
        });
    }

    // ============================================
    // 9. INITIALIZATION HELPERS
    // ============================================
    initIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    
                    if (entry.target.dataset.animate && CONFIG.ANIMATIONS_ENABLED) {
                        this.animateElement(entry.target);
                    }
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });
        
        // Observe animated elements
        this.elements.animatedElements.forEach(el => {
            observer.observe(el);
        });
        
        // Observe feature and service cards
        [...this.elements.featureCards, ...this.elements.serviceCards].forEach(card => {
            observer.observe(card);
        });
        
        this.observers.push(observer);
    }

    initSmoothScrolling() {
        if (!CONFIG.SMOOTH_SCROLL_ENABLED || utils.prefersReducedMotion()) return;
        
        // Already handled in handleNavLinkClick
    }

    initAnimations() {
        if (utils.prefersReducedMotion()) return;
        
        // Add initial animation classes
        this.elements.animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
        });
    }

    initServiceWorker() {
        if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('✅ ServiceWorker registered:', reg.scope))
                    .catch(err => console.log('❌ ServiceWorker registration failed:', err));
            });
        }
    }

    initAnalytics() {
        // Initialize analytics if dataLayer exists
        if (typeof window.dataLayer !== 'undefined') {
            console.log('📊 Analytics initialized');
        }
    }

    // ============================================
    // 10. OBSERVERS
    // ============================================
    observeSystemPreferences() {
        // Dark mode
        const darkModeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        const darkModeHandler = (e) => this.updateColorScheme(e.matches);
        darkModeMedia.addListener(darkModeHandler);
        this.observers.push({ media: darkModeMedia, handler: darkModeHandler });
        
        // Reduced motion
        const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
        const motionHandler = (e) => this.updateMotionPreference(e.matches);
        motionMedia.addListener(motionHandler);
        this.observers.push({ media: motionMedia, handler: motionHandler });
    }

    observeNavigationState() {
        // Monitor URL changes for SPA-like behavior
        if (window.history.pushState) {
            const originalPushState = history.pushState;
            const originalReplaceState = history.replaceState;
            
            history.pushState = function(...args) {
                const result = originalPushState.apply(this, args);
                window.dispatchEvent(new Event('locationchange'));
                return result;
            };
            
            history.replaceState = function(...args) {
                const result = originalReplaceState.apply(this, args);
                window.dispatchEvent(new Event('locationchange'));
                return result;
            };
            
            const popStateHandler = () => {
                window.dispatchEvent(new Event('locationchange'));
            };
            
            const locationChangeHandler = () => {
                this.updateActiveNavLink();
            };
            
            window.addEventListener('popstate', popStateHandler);
            window.addEventListener('locationchange', locationChangeHandler);
            
            this.eventListeners.push(
                { element: window, type: 'popstate', handler: popStateHandler },
                { element: window, type: 'locationchange', handler: locationChangeHandler }
            );
        }
    }

    observeNetworkStatus() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            const updateNetworkStatus = () => {
                const isSlow = connection.saveData || 
                              (connection.effectiveType && 
                               ['slow-2g', '2g', '3g'].includes(connection.effectiveType));
                
                document.documentElement.classList.toggle('slow-connection', isSlow);
                
                if (isSlow) {
                    this.showToast('Slow connection detected. Some features may be limited.', 'warning');
                }
            };
            
            if (connection) {
                connection.addEventListener('change', updateNetworkStatus);
                updateNetworkStatus();
            }
        }
    }

    updateColorScheme(isDark) {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        
        // Update any theme-dependent elements
        const themeDependentElements = utils.$$('[data-theme]');
        themeDependentElements.forEach(el => {
            el.setAttribute('data-theme', isDark ? 'dark' : 'light');
        });
    }

    updateMotionPreference(reduceMotion) {
        CONFIG.ANIMATIONS_ENABLED = !reduceMotion;
        
        if (reduceMotion) {
            document.documentElement.classList.add('reduce-motion');
        } else {
            document.documentElement.classList.remove('reduce-motion');
        }
    }

    // ============================================
    // 11. ANIMATION HELPERS
    // ============================================
    animateElement(element) {
        if (!element || !CONFIG.ANIMATIONS_ENABLED || utils.prefersReducedMotion()) {
            return;
        }
        
        const animationType = element.dataset.animate || 'fade-up';
        const delay = element.dataset.delay || 0;
        
        // Apply initial styles based on animation type
        switch(animationType) {
            case 'fade-up':
                element.style.transform = 'translateY(30px)';
                element.style.opacity = '0';
                break;
            case 'fade-left':
                element.style.transform = 'translateX(-30px)';
                element.style.opacity = '0';
                break;
            case 'fade-right':
                element.style.transform = 'translateX(30px)';
                element.style.opacity = '0';
                break;
            case 'scale':
                element.style.transform = 'scale(0.9)';
                element.style.opacity = '0';
                break;
        }
        
        // Animate with delay
        setTimeout(() => {
            element.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
            element.style.transform = '';
            element.style.opacity = '1';
            
            // Clean up after animation
            setTimeout(() => {
                element.style.transition = '';
                element.dataset.animated = 'true';
            }, 600);
        }, parseInt(delay));
    }

    updateActiveNavLink() {
        if (!this.elements.navLinks || this.elements.navLinks.length === 0) return;
        
        const scrollPosition = this.state.scrollPosition + (this.elements.header?.offsetHeight || 0) + 100;
        
        let currentActive = null;
        let minDistance = Infinity;
        
        this.elements.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
                const distance = Math.abs(scrollPosition - sectionTop);
                if (distance < minDistance) {
                    minDistance = distance;
                    currentActive = section.id;
                }
            }
        });
        
        // Update nav links
        this.elements.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const sectionId = href.substring(1);
                if (sectionId === currentActive) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                } else {
                    link.classList.remove('active');
                    link.removeAttribute('aria-current');
                }
            }
        });
        
        this.state.currentSection = currentActive || 'home';
    }

    updateTouchSupport() {
        const isTouch = 'ontouchstart' in window || 
                       navigator.maxTouchPoints > 0 || 
                       navigator.msMaxTouchPoints > 0;
        
        document.documentElement.classList.toggle('touch', isTouch);
        document.documentElement.classList.toggle('no-touch', !isTouch);
    }

    updateOrientation() {
        const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
        document.documentElement.setAttribute('data-orientation', orientation);
    }

    setCurrentYear() {
        if (this.elements.currentYear) {
            this.elements.currentYear.textContent = new Date().getFullYear();
        }
    }

    logPageView() {
        if (window.dataLayer) {
            window.dataLayer.push({
                'event': 'pageview',
                'page': {
                    'path': window.location.pathname,
                    'title': document.title,
                    'device': this.state.deviceType
                }
            });
        }
    }

    trapFocus(event, container) {
        const focusableElements = utils.$$(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            container
        );
        
        if (focusableElements.length === 0) return;
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey) {
            if (document.activeElement === firstFocusable) {
                lastFocusable.focus();
                event.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                firstFocusable.focus();
                event.preventDefault();
            }
        }
    }

    async simulateApiCall() {
        // Simulate network delay
        const delay = Math.random() * 
                     (CONFIG.CHAT_MAX_RESPONSE_TIME - CONFIG.CHAT_MIN_RESPONSE_TIME) + 
                     CONFIG.CHAT_MIN_RESPONSE_TIME;
        
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // ============================================
    // 12. PUBLIC METHODS
    // ============================================
    openNav() {
        this.state.isNavOpen = true;
        this.updateNavState();
    }

    closeNav() {
        this.state.isNavOpen = false;
        this.updateNavState();
    }

    openChat() {
        this.state.isChatOpen = true;
        this.updateChatState();
    }

    closeChat() {
        this.state.isChatOpen = false;
        this.updateChatState();
    }

    refresh() {
        this.handleResize();
        this.handleScroll();
    }

    destroy() {
        // Clean up event listeners
        this.eventListeners.forEach(({ element, type, handler }) => {
            element.removeEventListener(type, handler);
        });
        this.eventListeners = [];
        
        // Clean up observers
        this.observers.forEach(observer => {
            if (observer.disconnect) {
                observer.disconnect();
            } else if (observer.media && observer.handler) {
                observer.media.removeListener(observer.handler);
            }
        });
        this.observers = [];
        
        // Remove any created elements
        if (this.elements.backToTop && this.elements.backToTop.parentNode) {
            this.elements.backToTop.parentNode.removeChild(this.elements.backToTop);
        }
        
        console.log('🧹 eJuuz App cleaned up');
    }

    // ============================================
    // 13. DEBUG & DEVELOPMENT
    // ============================================
    debug() {
        console.group('🔍 eJuuz App Debug Info');
        console.log('State:', this.state);
        console.log('Config:', CONFIG);
        console.log('Device:', this.state.deviceType);
        console.log('Orientation:', document.documentElement.getAttribute('data-orientation'));
        console.log('Touch Support:', document.documentElement.classList.contains('touch'));
        console.log('Reduced Motion:', utils.prefersReducedMotion());
        console.log('Color Scheme:', utils.getColorScheme());
        if (performance.memory) {
            console.log('Memory:', performance.memory);
        }
        console.groupEnd();
    }

    // ============================================
    // 14. ERROR HANDLING
    // ============================================
    handleError(error, context = '') {
        console.error(`❌ Error in ${context}:`, error);
        
        // Send to error tracking service
        if (window.dataLayer) {
            window.dataLayer.push({
                'event': 'error',
                'error': {
                    'message': error.message,
                    'context': context,
                    'stack': error.stack
                }
            });
        }
        
        // Show user-friendly error
        if (!context.includes('chat')) {
            this.showToast('Something went wrong. Please try again.', 'error');
        }
    }
}

// ============================================
// 15. INSTANTIATION & EXPORTS
// ============================================
(function() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        // DOM already loaded
        setTimeout(initApp, 0);
    }
    
    function initApp() {
        // Initialize app (guard to prevent double init)
        if (!window.eJuuzApp) {
            try {
                window.eJuuzApp = new eJuuzApp();
            } catch (error) {
                console.error('Failed to initialize eJuuzApp:', error);
            }
        }
        
        // Make utils available globally for debugging
        window.eJuuzUtils = utils;
        
        // Global error handler
        window.addEventListener('error', (event) => {
            if (window.eJuuzApp) {
                const err = event.error || new Error(event.message || 'Unknown error');
                window.eJuuzApp.handleError(err, 'global');
            }
        });
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            if (window.eJuuzApp) {
                const reason = event.reason instanceof Error 
                    ? event.reason 
                    : new Error(String(event.reason || 'Unknown rejection'));
                window.eJuuzApp.handleError(reason, 'promise');
            }
        });
        
        // Expose public methods
        window.eJuuz = {
            openChat: () => window.eJuuzApp?.openChat(),
            closeChat: () => window.eJuuzApp?.closeChat(),
            openNav: () => window.eJuuzApp?.openNav(),
            closeNav: () => window.eJuuzApp?.closeNav(),
            refresh: () => window.eJuuzApp?.refresh(),
            debug: () => window.eJuuzApp?.debug(),
            scrollToSection: (id) => window.eJuuzApp?.scrollToSection(id)
        };
    }
})();

// ============================================
// 16. POLYFILLS (for older browser support)
// ============================================
(function() {
    // Array.from polyfill
    if (!Array.from) {
        Array.from = (function () {
            var toStr = Object.prototype.toString;
            var isCallable = function (fn) {
                return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
            };
            var toInteger = function (value) {
                var number = Number(value);
                if (isNaN(number)) { return 0; }
                if (number === 0 || !isFinite(number)) { return number; }
                return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
            };
            var maxSafeInteger = Math.pow(2, 53) - 1;
            var toLength = function (value) {
                var len = toInteger(value);
                return Math.min(Math.max(len, 0), maxSafeInteger);
            };
            
            return function from(arrayLike) {
                var C = this;
                var items = Object(arrayLike);
                var len = toLength(items.length);
                var A = isCallable(C) ? Object(new C(len)) : new Array(len);
                for (var k = 0; k < len; k++) {
                    A[k] = items[k];
                }
                return A;
            };
        }());
    }

    // NodeList.forEach polyfill
    if (window.NodeList && !NodeList.prototype.forEach) {
        NodeList.prototype.forEach = Array.prototype.forEach;
    }

    // Object.assign polyfill
    if (typeof Object.assign !== 'function') {
        Object.assign = function(target, varArgs) {
            if (target == null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }
            
            var to = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];
                if (nextSource != null) {
                    for (var nextKey in nextSource) {
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
    }
})();

// ============================================
// 17. ENVIRONMENT DETECTION
// ============================================
(function() {
    // Detect browser features
    const features = {
        intersectionObserver: 'IntersectionObserver' in window,
        serviceWorker: 'serviceWorker' in navigator,
        webP: (function() {
            const canvas = document.createElement('canvas');
            if (canvas.getContext && canvas.getContext('2d')) {
                return canvas.toDataURL('image/webp').indexOf('data:image/webp') == 0;
            }
            return false;
        })(),
        passiveEvents: (function() {
            let supportsPassive = false;
            try {
                const opts = Object.defineProperty({}, 'passive', {
                    get: function() { supportsPassive = true; }
                });
                window.addEventListener('test', null, opts);
                window.removeEventListener('test', null, opts);
            } catch (e) {}
            return supportsPassive;
        })()
    };
    
    // Add feature classes to HTML element
    const html = document.documentElement;
    Object.keys(features).forEach(feature => {
        html.classList.toggle(`has-${feature}`, features[feature]);
        html.classList.toggle(`no-${feature}`, !features[feature]);
    });
    
    // Store features for reference
    window.eJuuzFeatures = features;
})();

// ============================================
// 18. READY STATE HANDLER
// ============================================
(function() {
    const readyStates = {
        loading: document.readyState === 'loading',
        interactive: document.readyState === 'interactive',
        complete: document.readyState === 'complete'
    };
    
    // Already handled in section 15
})();

// ============================================
// 19. PERFORMANCE MONITORING
// ============================================
(function() {
    // Report web vitals (simplified)
    if (window.performance && performance.getEntriesByType) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const paintMetrics = performance.getEntriesByType('paint');
                const navigationMetrics = performance.getEntriesByType('navigation')[0];
                
                if (paintMetrics && navigationMetrics) {
                    const metrics = {
                        firstPaint: paintMetrics.find(m => m.name === 'first-paint')?.startTime || 0,
                        firstContentfulPaint: paintMetrics.find(m => m.name === 'first-contentful-paint')?.startTime || 0,
                        domContentLoaded: navigationMetrics.domContentLoadedEventEnd || 0,
                        loadTime: navigationMetrics.loadEventEnd || 0
                    };
                    
                    if (window.dataLayer) {
                        window.dataLayer.push({
                            'event': 'performance',
                            'metrics': metrics
                        });
                    }
                }
            }, 0);
        });
    }
})();

// ============================================
// 20. FALLBACKS & GRACEFUL DEGRADATION
// ============================================
(function() {
    // Picture element fallback
    const pictures = document.querySelectorAll('picture');
    pictures.forEach(picture => {
        const img = picture.querySelector('img');
        if (img && !window.HTMLPictureElement) {
            // If picture is not supported, use img src
            const source = picture.querySelector('source');
            if (source && source.srcset) {
                const srcset = source.srcset.split(' ')[0];
                img.src = srcset;
            }
        }
    });
    
    // Object-fit fallback for IE
    if (!('objectFit' in document.documentElement.style)) {
        const images = document.querySelectorAll('img[style*="object-fit"]');
        images.forEach(img => {
            const parent = img.parentElement;
            if (parent) {
                parent.style.backgroundImage = `url(${img.src})`;
                parent.style.backgroundSize = img.style.objectFit || 'cover';
                parent.style.backgroundPosition = 'center';
                img.style.display = 'none';
            }
        });
    }
    
    // Add CSS for dynamic elements
    const dynamicStyles = document.createElement('style');
    dynamicStyles.textContent = `
        /* Toast Messages */
        .toast-message {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            transform: translateX(150%);
            transition: transform 0.3s ease-out;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }
        
        .toast-message.show {
            transform: translateX(0);
        }
        
        .toast-info {
            background: #007bff;
        }
        
        .toast-success {
            background: #28a745;
        }
        
        .toast-error {
            background: #dc3545;
        }
        
        .toast-warning {
            background: #ffc107;
            color: #212529;
        }
        
        .toast-close {
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            font-size: 1.2em;
            padding: 0;
            opacity: 0.8;
            transition: opacity 0.2s;
        }
        
        .toast-close:hover {
            opacity: 1;
        }
        
        /* Back to Top Button */
        .back-to-top {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--color-primary);
            color: white;
            border: none;
            cursor: pointer;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5em;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .back-to-top.visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        .back-to-top:hover {
            background: var(--color-dark-pink);
            transform: translateY(-2px);
        }
        
        /* Loading States */
        .loading-spinner-small {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
            margin-right: 8px;
            vertical-align: middle;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* Screen Reader Only */
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0,0,0,0);
            white-space: nowrap;
            border: 0;
        }
        
        /* Chat Status */
        .chat-status {
            margin-top: 10px;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 0.9em;
            display: none;
        }
        
        .chat-status.status-success {
            background: rgba(40, 167, 69, 0.1);
            color: #28a745;
            display: block;
        }
        
        .chat-status.status-error {
            background: rgba(220, 53, 69, 0.1);
            color: #dc3545;
            display: block;
        }
        
        .chat-status.status-sending {
            background: rgba(0, 123, 255, 0.1);
            color: #007bff;
            display: block;
        }
        
        /* Error States */
        .error {
            border-color: #dc3545 !important;
        }
        
        /* Theme Support */
        [data-theme="dark"] {
            color-scheme: dark;
        }
        
        /* Reduce Motion */
        .reduce-motion *,
        .reduce-motion *::before,
        .reduce-motion *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
        }
        
        /* Slow Connection */
        .slow-connection img:not([data-important]),
        .slow-connection video:not([data-important]),
        .slow-connection iframe:not([data-important]) {
            display: none;
        }
        
        /* Lazy Loading */
        img[loading="lazy"] {
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        img[loading="lazy"].loaded {
            opacity: 1;
        }
        
        /* Focus Visible */
        :focus-visible {
            outline: 2px solid var(--color-primary);
            outline-offset: 2px;
        }
        
        /* Scrollbar Styling */
        ::-webkit-scrollbar {
            width: 10px;
        }
        
        ::-webkit-scrollbar-track {
            background: #f1f1f1;
        }
        
        ::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
        
        /* Print Styles */
        @media print {
            .no-print {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(dynamicStyles);
})();

// ============================================
// END OF eJuuz MAIN JAVASCRIPT
// ============================================
