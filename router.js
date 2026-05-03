/**
 * Router - Dynamic page routing and navigation management
 * Integrates with routes.json for client-side routing
 */

class Router {
  constructor(routesPath = 'routes.json') {
    this.routes = [];
    this.currentRoute = null;
    this.routesPath = routesPath;
    this.scrollPosition = 0;
    this.init();
  }

  /**
   * Initialize router and load routes configuration
   */
  async init() {
    try {
      const response = await fetch(this.routesPath);
      const config = await response.json();
      this.routes = config.routes;
      this.navigation = config.navigation;
      this.metadata = config.metadata;

      // Setup navigation listeners
      this.setupNavigation();
      // Setup hash-based routing
      this.handleRouteChange();
      window.addEventListener('hashchange', () => this.handleRouteChange());
    } catch (error) {
      console.error('Error loading routes:', error);
    }
  }

  /**
   * Handle route changes based on URL hash
   */
  handleRouteChange() {
    const hash = window.location.hash.slice(1) || '/';
    const route = this.findRoute(hash);

    if (route) {
      this.navigateTo(route);
    }
  }

  /**
   * Find route by path
   */
  findRoute(path) {
    return this.routes.find(r => {
      // Handle both hash paths and regular paths
      const routePath = r.path.replace(/^\//, '');
      const searchPath = path.replace(/^\//, '');
      return routePath === searchPath || `#${routePath}` === path;
    });
  }

  /**
   * Navigate to a route
   */
  navigateTo(route) {
    if (this.currentRoute?.id === route.id) return; // Already on this route

    this.currentRoute = route;

    // Determine which content to show based on layout/type
    if (route.layout === 'case-study-full') {
      this.loadCaseStudyPage(route);
    } else if (route.sections) {
      this.loadMultiSectionPage(route);
    } else {
      this.loadSinglePage(route);
    }

    // Update browser history
    window.history.pushState({ route }, route.title, `#${route.path.slice(1)}`);
    document.title = route.title;

    // Scroll to top
    window.scrollTo(0, 0);
  }

  /**
   * Load multi-section page (home page)
   */
  loadMultiSectionPage(route) {
    // Hide all sections first
    document.querySelectorAll('[data-section]').forEach(el => {
      el.style.display = 'none';
    });

    // Show relevant sections
    route.sections.forEach(sectionId => {
      const section = document.querySelector(`[data-section="${sectionId}"]`);
      if (section) section.style.display = '';
    });

    // Update nav highlighting
    this.updateNavHighlight(route);
  }

  /**
   * Load case study page
   */
  loadCaseStudyPage(route) {
    const caseStudyContainer = document.getElementById('cs01-page');
    if (caseStudyContainer) {
      caseStudyContainer.style.display = '';
      // Load case study content dynamically if needed
      this.loadCaseStudyContent(route);
    }
    this.updateNavHighlight(route);
  }

  /**
   * Load single page
   */
  loadSinglePage(route) {
    // Hide main sections
    document.querySelectorAll('[data-section]').forEach(el => {
      el.style.display = 'none';
    });

    // Show page container for this route
    const pageContainer = document.getElementById(`${route.id}-page`);
    if (pageContainer) {
      pageContainer.style.display = '';
    }

    this.updateNavHighlight(route);
  }

  /**
   * Load case study content dynamically
   */
  loadCaseStudyContent(route) {
    // Extract case study ID from path (e.g., cs01)
    const caseId = route.path.split('/').pop();
    
    // You can fetch case study data from a JSON or build from existing HTML
    console.log('Loading case study:', caseId);
    // Implementation depends on how case study data is structured
  }

  /**
   * Update navigation active state
   */
  updateNavHighlight(route) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.remove('gold');
    });

    // Add active class to matching nav link
    const navLink = document.querySelector(`.nav-links a[href="#${route.path.slice(1)}"]`);
    if (navLink) {
      navLink.classList.add('gold');
    }
  }

  /**
   * Setup navigation event listeners
   */
  setupNavigation() {
    // Navigation links
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && (href.startsWith('#') || href.startsWith('/'))) {
          e.preventDefault();
          const path = href.replace('#', '');
          this.navigateToPath(path);
        }
      });
    });

    // CTA buttons
    document.querySelectorAll('.nav-cta, .btn-navy, .btn-white, .btn-gold-outline').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const href = btn.getAttribute('href');
        if (href && (href.startsWith('#') || href.startsWith('/'))) {
          e.preventDefault();
          const path = href.replace('#', '');
          this.navigateToPath(path);
        }
      });
    });

    // Anchor links (smooth scroll to sections)
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const target = link.getAttribute('href');
        if (target === '#') return;
        
        const element = document.querySelector(target);
        if (element) {
          e.preventDefault();
          element.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /**
   * Navigate to path
   */
  navigateToPath(path) {
    window.location.hash = path;
  }

  /**
   * Get route by ID
   */
  getRoute(id) {
    return this.routes.find(r => r.id === id);
  }

  /**
   * Get all routes
   */
  getAllRoutes() {
    return this.routes;
  }

  /**
   * Get navigation config
   */
  getNavigation() {
    return this.navigation;
  }
}

// Initialize router when DOM is ready
let router;
document.addEventListener('DOMContentLoaded', () => {
  router = new Router('routes.json');
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Router;
}
