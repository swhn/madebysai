/* Homepage Logic - Made by Sai */

import { getAllProjects, getCategories } from './api.js';
import { initScrollReveal } from './main.js';

// Local state for filtering and search
let allProjects = [];
let activeCategory = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', async () => {
  const gridContainer = document.getElementById('projects-grid');
  const tabsContainer = document.getElementById('filter-tabs');
  const searchInput = document.getElementById('search-input');
  
  if (!gridContainer) return;
  
  // 1. Render Skeleton Shimmers
  renderSkeletons(gridContainer, 3);
  
  // 2. Fetch Projects Data
  allProjects = await getAllProjects();
  
  // 3. Render Filter Tabs
  const categories = await getCategories();
  renderFilterTabs(categories, tabsContainer);
  
  // 4. Render Initial Grid
  filterAndRenderGrid(gridContainer);
  
  // 5. Setup Search Event Listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      filterAndRenderGrid(gridContainer);
    });
  }
});

/**
 * Creates and renders loading skeleton shimmers
 * @param {HTMLElement} container Parent wrapper
 * @param {number} count Number of skeletons to render
 */
function renderSkeletons(container, count) {
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'project-card skeleton-card';
    skeleton.innerHTML = `
      <div class="skeleton-img skeleton"></div>
      <div class="project-card-content">
        <div class="skeleton-title skeleton"></div>
        <div class="skeleton-text skeleton"></div>
        <div class="skeleton-text skeleton" style="width: 85%;"></div>
        <div class="skeleton-tags">
          <div class="skeleton-tag skeleton"></div>
          <div class="skeleton-tag skeleton"></div>
          <div class="skeleton-tag skeleton"></div>
        </div>
      </div>
    `;
    container.appendChild(skeleton);
  }
}

/**
 * Renders filter tabs dynamically based on categories in the data
 * @param {Array<string>} categories List of category names
 * @param {HTMLElement} container Navigation wrapper for tabs
 */
function renderFilterTabs(categories, container) {
  if (!container) return;
  container.innerHTML = '';
  
  // Add "All" tab first
  const allTab = document.createElement('button');
  allTab.className = 'filter-tab active';
  allTab.textContent = 'All Projects';
  allTab.setAttribute('data-category', 'all');
  container.appendChild(allTab);
  
  // Add dynamic categories
  categories.forEach(category => {
    const tab = document.createElement('button');
    tab.className = 'filter-tab';
    tab.textContent = category;
    tab.setAttribute('data-category', category);
    container.appendChild(tab);
  });
  
  // Attach filter event handlers
  container.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      container.querySelector('.filter-tab.active').classList.remove('active');
      tab.classList.add('active');
      activeCategory = tab.getAttribute('data-category');
      
      const gridContainer = document.getElementById('projects-grid');
      filterAndRenderGrid(gridContainer);
    });
  });
}

/**
 * Filters the project list and renders cards into grid container
 * @param {HTMLElement} container Grid layout wrapper
 */
function filterAndRenderGrid(container) {
  // Apply category filter & search queries
  const filtered = allProjects.filter(project => {
    const matchesCategory = activeCategory === 'all' || project.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      project.title.toLowerCase().includes(searchQuery) ||
      project.subtitle.toLowerCase().includes(searchQuery) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery));
      
    return matchesCategory && matchesSearch;
  });
  
  // Render cards
  container.innerHTML = '';
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="no-results reveal active">
        <svg viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <h3>No projects found</h3>
        <p>Try adjusting your search keywords or filter settings.</p>
      </div>
    `;
    return;
  }
  
  filtered.forEach((project, index) => {
    const card = document.createElement('a');
    card.href = `./project.html?id=${project.id}`;
    card.className = `project-card reveal`;
    // Add staggered delay class for entrance animation
    card.classList.add(`reveal-delay-${(index % 4) + 1}`);
    
    // Generate beautiful dynamic SVG mockup background
    const svgBackground = generateDynamicSvg(project.title, project.category, project.themeColor);
    
    const hasRealImage = project.mainImage && project.mainImage.length > 0 && !project.mainImage.endsWith('.svg');
    const hasIcon = project.icon && project.icon.length > 0;

    let cardImageContent;
    if (hasRealImage) {
      // Web apps: OG image as full card background
      cardImageContent = `<img src="${project.mainImage}" alt="${project.title}" style="width:100%;height:100%;object-fit:cover;">`;
    } else if (hasIcon) {
      // Desktop/Mobile apps: icon centered on gradient background
      cardImageContent = `
        <div class="icon-gradient-bg" style="background:${project.themeColor};width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative;">
          <div class="icon-glow"></div>
          <img src="${project.icon}" alt="${project.title} icon" class="card-app-icon">
        </div>
      `;
    } else {
      cardImageContent = svgBackground;
    }

    card.innerHTML = `
      <div class="project-card-image-wrapper">
        <div class="project-card-placeholder">
          ${cardImageContent}
        </div>
        <span class="project-card-category">${project.category}</span>
      </div>
      <div class="project-card-content">
        <h3 class="project-card-title">${project.title}</h3>
        <p class="project-card-subtitle">${project.subtitle}</p>
        <div class="project-card-tags">
          ${project.tags.slice(0, 3).map(tag => `<span class="project-card-tag">${tag}</span>`).join('')}
          ${project.tags.length > 3 ? `<span class="project-card-tag">+${project.tags.length - 3}</span>` : ''}
        </div>
      </div>
    `;
    
    container.appendChild(card);
  });
  
  // Re-run animation observer
  initScrollReveal();
}

/**
 * Generates an SVG code string mimicking a modern mockup app template using project gradients
 * @param {string} title Name of the project
 * @param {string} category Type of project (Web, Mobile, etc.)
 * @param {string} gradient CSS Linear gradient definition
 * @returns {string} Fully responsive inline SVG
 */
function generateDynamicSvg(title, category, gradient) {
  // Parse colors from the CSS linear gradient string
  // Defaults in case regex fails
  let col1 = '#34495e';
  let col2 = '#2c3e50';
  
  const hexMatches = gradient.match(/#[0-9a-fA-F]{6}/g);
  if (hexMatches && hexMatches.length >= 2) {
    col1 = hexMatches[0];
    col2 = hexMatches[hexMatches.length - 1];
  }

  const cleanTitle = title.replace(/[^\w\s-]/g, '');
  const firstLetter = cleanTitle.charAt(0).toUpperCase();

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="svg-grad-${cleanTitle.replace(/\s+/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${col1}" />
          <stop offset="100%" stop-color="${col2}" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="16" stdDeviation="20" flood-opacity="0.35"/>
        </filter>
        <filter id="blur-effect">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      
      <!-- Base Gradient background -->
      <rect width="100%" height="100%" fill="url(#svg-grad-${cleanTitle.replace(/\s+/g, '')})" />
      
      <!-- Abstract Background Graphics -->
      <circle cx="150" cy="120" r="280" fill="white" opacity="0.04" />
      <path d="M -50,300 L 400,50 L 850,300" stroke="white" stroke-width="1" fill="none" opacity="0.08" />
      
      <!-- Big Giant Initial Letter in background -->
      <text x="650" y="380" font-family="'Outfit', sans-serif" font-weight="900" font-size="340" fill="white" opacity="0.07" text-anchor="middle">${firstLetter}</text>

      <!-- Glass Mockup Dashboard Frame -->
      <g filter="url(#shadow)">
        <rect x="100" y="70" width="600" height="340" rx="16" fill="rgba(10, 15, 22, 0.4)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1.5" />
        
        <!-- Window Mockup Controls (Mac-style dots) -->
        <circle cx="130" cy="95" r="5" fill="#ff5f56" />
        <circle cx="146" cy="95" r="5" fill="#ffbd2e" />
        <circle cx="162" cy="95" r="5" fill="#27c93f" />
        
        <!-- Dashboard Sidebar line -->
        <line x1="200" y1="120" x2="200" y2="380" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1.5" />
        
        <!-- Sidebar items -->
        <rect x="120" y="140" width="60" height="10" rx="3" fill="rgba(255, 255, 255, 0.2)" />
        <rect x="120" y="170" width="60" height="10" rx="3" fill="rgba(255, 255, 255, 0.1)" />
        <rect x="120" y="200" width="60" height="10" rx="3" fill="rgba(255, 255, 255, 0.1)" />
        
        <!-- Dashboard Main Panel Items -->
        <rect x="230" y="140" width="440" height="120" rx="8" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255, 255, 255, 0.05)" stroke-width="1" />
        
        <!-- Grid Items -->
        <rect x="230" y="280" width="205" height="90" rx="8" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255, 255, 255, 0.05)" stroke-width="1" />
        <rect x="465" y="280" width="205" height="90" rx="8" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255, 255, 255, 0.05)" stroke-width="1" />
        
        <!-- Small charts/bars inside mockup -->
        <rect x="250" y="165" width="200" height="15" rx="3" fill="white" opacity="0.6" />
        <rect x="250" y="195" width="300" height="10" rx="3" fill="white" opacity="0.3" />
        <rect x="250" y="215" width="120" height="10" rx="3" fill="white" opacity="0.3" />
        
        <circle cx="610" cy="200" r="30" fill="none" stroke="rgba(255, 255, 255, 0.1)" stroke-width="8" />
        <circle cx="610" cy="200" r="30" fill="none" stroke="var(--accent-primary, #68b9e3)" stroke-width="8" stroke-dasharray="130, 200" stroke-linecap="round" />
      </g>
    </svg>
  `;
}
