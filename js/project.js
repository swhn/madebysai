/* Project Details Logic - Made by Sai */

import { getProjectById } from './api.js';
import { initScrollReveal } from './main.js';

// SVG Icon Mapping definitions
const iconMap = {
  'external-link': `
    <svg viewBox="0 0 24 24">
      <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59L8.12 13.41 9.54 14.83 19 5.41V9h2V3h-7z"/>
    </svg>
  `,
  'github': `
    <svg viewBox="0 0 24 24">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.523-10-10-10z"/>
    </svg>
  `,
  'download': `
    <svg viewBox="0 0 24 24">
      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/>
    </svg>
  `,
  'book': `
    <svg viewBox="0 0 24 24">
      <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
    </svg>
  `
};

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id');
  
  if (!projectId) {
    window.location.href = './index.html';
    return;
  }

  // Load container elements
  const pageContainer = document.getElementById('project-details-container');
  if (!pageContainer) return;
  
  // Fetch single project info
  const project = await getProjectById(projectId);
  
  if (!project) {
    renderErrorState(pageContainer);
    return;
  }
  
  // Render project layouts
  renderProjectDetails(pageContainer, project);
  initLightbox();
  initScrollReveal();
});

/**
 * Renders error panel if slug parameter doesn't match database
 */
function renderErrorState(container) {
  container.innerHTML = `
    <div class="container text-center reveal active" style="padding: 10rem 0; text-align: center;">
      <h2 style="font-size: 2rem; margin-bottom: 1rem;">Project Not Found</h2>
      <p style="color: var(--text-secondary); margin-bottom: 2rem;">The project you are looking for does not exist or has been relocated.</p>
      <a href="./index.html" class="btn btn-primary">Back to Directory</a>
    </div>
  `;
}

/**
 * Updates page SEO tags dynamically from JSON properties
 */
function updateSEO(project) {
  const seo = project.seo || {};
  const title = seo.title || `${project.title} | Made by Sai`;
  const description = seo.description || project.subtitle;
  const keywords = seo.keywords || project.tags.join(', ');

  const origin = window.location.origin;
  const canonical = `${origin}/project.html?id=${project.id}`;

  // Resolve an absolute social-share image: project main image > app icon > site OG image
  const rawImg = (project.mainImage && project.mainImage.trim())
    || project.icon
    || 'assets/og-image.png';
  const imageAbs = rawImg.startsWith('http')
    ? rawImg
    : `${origin}/${rawImg.replace(/^\//, '')}`;

  // Page Title
  document.title = title;

  // Helper to create or update meta tags
  const setMeta = (name, content, attrName = 'name') => {
    let el = document.querySelector(`meta[${attrName}="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Canonical link
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonical);

  // Standard meta
  setMeta('description', description);
  setMeta('keywords', keywords);

  // Open Graph
  setMeta('og:site_name', 'Made by Sai', 'property');
  setMeta('og:title', title, 'property');
  setMeta('og:description', description, 'property');
  setMeta('og:url', canonical, 'property');
  setMeta('og:type', 'website', 'property');
  setMeta('og:image', imageAbs, 'property');
  setMeta('og:image:alt', `${project.title} — preview`, 'property');
  setMeta('og:locale', 'en_US', 'property');

  // Twitter Card
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:url', canonical);
  setMeta('twitter:title', title);
  setMeta('twitter:description', description);
  setMeta('twitter:image', imageAbs);

  // Structured data (JSON-LD) describing the project as a software application
  const typeMap = {
    'Web App': 'WebApplication',
    'Desktop App': 'SoftwareApplication',
    'Mobile App': 'MobileApplication'
  };
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': typeMap[project.category] || 'CreativeWork',
    name: project.title,
    description: description,
    url: canonical,
    image: imageAbs,
    applicationCategory: project.category,
    datePublished: project.date,
    author: {
      '@type': 'Person',
      name: 'Sai Wai Hlyan Htun',
      url: `${origin}/`
    }
  };

  let ld = document.getElementById('project-jsonld');
  if (!ld) {
    ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.id = 'project-jsonld';
    document.head.appendChild(ld);
  }
  ld.textContent = JSON.stringify(jsonLd);
}

/**
 * Builds details page DOM structures from loaded JSON properties
 */
function renderProjectDetails(container, project) {
  // Update SEO Meta tags dynamically
  updateSEO(project);

  const themeGradient = project.themeColor;
  
  // Render structure
  container.innerHTML = `
    <!-- Top Nav Back links header -->
    <div class="project-header-section">
      <div class="container">
        <a href="./index.html#gallery-section" class="back-link" id="nav-back">
          <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to Projects
        </a>
        
        <div class="project-intro reveal">
          <div class="project-meta-top">
            <span>${project.category}</span>
            <div class="divider"></div>
            <span>${project.date}</span>
          </div>
          <div class="project-title-container">
            <h1 class="project-detail-title">${project.title}</h1>
            
            <div class="project-actions">
              ${project.buttons.map(btn => `
                <a href="${btn.url}" target="_blank" rel="noopener noreferrer" class="btn btn-${btn.type} btn-magnetic">
                  ${iconMap[btn.icon] || ''}
                  ${btn.label}
                </a>
              `).join('')}
            </div>
          </div>
          <p class="project-detail-subtitle">${project.subtitle}</p>
        </div>
      </div>
    </div>
    
    <!-- Content columns body grid -->
    <div class="container">
      <div class="project-grid-layout">
        
        <!-- Left Content -->
        <main class="project-main-content reveal reveal-delay-1">
          <!-- Main Hero Graphic Mockup -->
          <div class="project-main-banner">
            <div class="project-main-banner-inner">
              ${project.mainImage && project.mainImage.length > 0 && !project.mainImage.endsWith('.svg')
                ? `<img src="${project.mainImage}" alt="${project.title} preview" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`
                : project.icon
                  ? `<div style="background:${themeGradient};width:100%;height:100%;display:flex;align-items:center;justify-content:center;border-radius:12px;position:relative;overflow:hidden;">
                      <div style="position:absolute;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,0.1) 0%,transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%)"></div>
                      <img src="${project.icon}" alt="${project.title} icon" style="width:160px;height:160px;object-fit:contain;border-radius:32px;box-shadow:0 16px 48px rgba(0,0,0,0.4),0 0 0 1px rgba(255,255,255,0.08);position:relative;z-index:1;">
                    </div>`
                  : generateDetailSvg(project.id, 'hero', project.title, themeGradient)}
            </div>
          </div>
          
          <!-- Detailed Description block -->
          <article class="project-description-card">
            <h3>Overview</h3>
            <div class="project-description-text">
              <p>${project.description}</p>
            </div>
          </article>
        </main>
        
        <!-- Right Sidebar Info stats panel -->
        <aside class="project-sidebar reveal reveal-delay-2">
          <div class="sidebar-card">
            <h3 class="sidebar-title">Project Details</h3>
            <div class="meta-info-list">
              <div class="meta-info-item">
                <span class="meta-info-label">Category</span>
                <span class="meta-info-value">${project.category}</span>
              </div>
              <div class="meta-info-item">
                <span class="meta-info-label">Release Date</span>
                <span class="meta-info-value">${project.date}</span>
              </div>
              <div class="meta-info-item">
                <span class="meta-info-label">Role</span>
                <span class="meta-info-value">Sole Creator</span>
              </div>
              <div class="meta-info-item">
                <span class="meta-info-label">Tech Stack</span>
                <div class="sidebar-tags">
                  ${project.tags.map(tag => `<span class="sidebar-tag">${tag}</span>`).join('')}
                </div>
              </div>
            </div>
          </div>
        </aside>
        
      </div>
      
      <!-- Interactive screenshots gallery section -->
      <section class="project-gallery-section reveal">
        <h2 class="gallery-title">Product Interfaces</h2>
        <div class="screenshots-grid">
          ${project.screenshots.map((screen, idx) => {
            const isRealImage = screen && !screen.endsWith('.svg');
            if (isRealImage) {
              return `
                <div class="screenshot-card glass-mockup" data-index="${idx}">
                  <div class="glass-mockup-frame">
                    <div class="glass-mockup-dots">
                      <span></span><span></span><span></span>
                    </div>
                    <div class="glass-mockup-screen">
                      <img src="${screen}" alt="${project.title} screenshot ${idx + 1}">
                    </div>
                  </div>
                </div>
              `;
            }
            return `
              <div class="screenshot-card" data-index="${idx}">
                <div class="screenshot-card-inner">
                  ${generateDetailSvg(project.id, idx, project.title, themeGradient)}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    </div>
  `;
}

/**
 * Initializes visual Lightbox overlays behavior
 */
function initLightbox() {
  const screenshotCards = document.querySelectorAll('.screenshot-card');
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxContent = document.getElementById('lightbox-content-svg');
  const closeBtn = document.getElementById('lightbox-close');
  
  if (!lightbox || !lightboxContent || !closeBtn) return;
  
  screenshotCards.forEach(card => {
    card.addEventListener('click', () => {
      // Extract content from either glass mockup or SVG card
      const glassMockupImg = card.querySelector('.glass-mockup-screen img');
      if (glassMockupImg) {
        lightboxContent.innerHTML = `<img src="${glassMockupImg.src}" alt="${glassMockupImg.alt}" style="width:100%;height:auto;max-height:80vh;border-radius:var(--radius-lg);border:1px solid var(--glass-border);box-shadow:0 24px 60px rgba(0,0,0,0.6);">`;
      } else {
        const innerSvg = card.querySelector('.screenshot-card-inner').innerHTML;
        lightboxContent.innerHTML = innerSvg;
      }

      // Open modal
      lightbox.classList.add('active');
    });
  });
  
  // Close triggers
  const closeModal = () => lightbox.classList.remove('active');
  closeBtn.addEventListener('click', closeModal);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeModal();
  });
  
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

/**
 * Renders full isometric/detailed custom vector graphic views matching specific app screen descriptions
 * @param {string} id ID slug of the project
 * @param {string|number} index Index identifier ('hero' or number 0-2)
 * @param {string} title Name of the project
 * @param {string} gradient Brand gradient colors
 */
function generateDetailSvg(id, index, title, gradient) {
  // Setup color parsing matching base gradients
  let col1 = '#34495e';
  let col2 = '#2c3e50';
  const hexMatches = gradient.match(/#[0-9a-fA-F]{6}/g);
  if (hexMatches && hexMatches.length >= 2) {
    col1 = hexMatches[0];
    col2 = hexMatches[hexMatches.length - 1];
  }
  
  const cleanId = id.replace(/-/g, '');
  const cleanTitle = title.replace(/[^\w\s]/g, '');

  // Base canvas template structures wrapper
  const svgStart = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%" style="display:block;">
    <defs>
      <linearGradient id="detail-grad-${cleanId}-${index}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${col1}" />
        <stop offset="100%" stop-color="${col2}" />
      </linearGradient>
      <filter id="card-shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-opacity="0.3"/>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#detail-grad-${cleanId}-${index})" />
    <circle cx="10%" cy="10%" r="200" fill="white" opacity="0.03" />
    <circle cx="90%" cy="90%" r="250" fill="white" opacity="0.02" />`;
    
  const svgEnd = `</svg>`;

  let svgContent = '';

  // Customize mock drawings depending on slug + screens
  if (id === 'zenith-task') {
    if (index === 'hero') {
      // Main dashboard screen with clock & statistics
      svgContent = `
        <!-- Main browser mockup -->
        <g filter="url(#card-shadow)">
          <rect x="80" y="50" width="640" height="350" rx="16" fill="rgba(10, 15, 20, 0.55)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1.5" />
          <circle cx="105" cy="72" r="5" fill="#ff5f56" /><circle cx="121" cy="72" r="5" fill="#ffbd2e" /><circle cx="137" cy="72" r="5" fill="#27c93f" />
          
          <!-- Mock Pomodoro Timer Circle inside dashboard -->
          <circle cx="280" cy="225" r="90" fill="none" stroke="rgba(255, 255, 255, 0.05)" stroke-width="8" />
          <circle cx="280" cy="225" r="90" fill="none" stroke="var(--accent-primary, #68b9e3)" stroke-width="8" stroke-dasharray="350 560" stroke-linecap="round" />
          <text x="280" y="235" font-family="'Outfit', sans-serif" font-weight="700" font-size="36" fill="white" text-anchor="middle">23:45</text>
          <text x="280" y="260" font-family="'Inter', sans-serif" font-weight="500" font-size="12" fill="var(--accent-secondary, #fdbb2d)" text-anchor="middle">FOCUS INTERVAL</text>
          
          <!-- Board / task stats right sidebar -->
          <rect x="420" y="110" width="260" height="230" rx="8" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255, 255, 255, 0.06)" />
          <text x="440" y="140" font-family="'Outfit', sans-serif" font-weight="600" font-size="16" fill="white">Today's Focus Tasks</text>
          
          <!-- List Items -->
          <rect x="440" y="165" width="220" height="35" rx="6" fill="rgba(255, 255, 255, 0.05)" />
          <circle cx="460" cy="182" r="6" fill="var(--accent-primary)" />
          <rect x="480" y="177" width="120" height="10" rx="2" fill="white" opacity="0.8" />
          
          <rect x="440" y="215" width="220" height="35" rx="6" fill="rgba(255, 255, 255, 0.05)" />
          <circle cx="460" cy="232" r="6" fill="rgba(255, 255, 255, 0.2)" />
          <rect x="480" y="227" width="150" height="10" rx="2" fill="white" opacity="0.5" />
          
          <rect x="440" y="265" width="220" height="35" rx="6" fill="rgba(255, 255, 255, 0.05)" />
          <circle cx="460" cy="282" r="6" fill="rgba(255, 255, 255, 0.2)" />
          <rect x="480" y="277" width="90" height="10" rx="2" fill="white" opacity="0.5" />
        </g>
      `;
    } else if (index === 0) {
      // Screen 0: Kanban board layout
      svgContent = `
        <g filter="url(#card-shadow)">
          <rect x="60" y="40" width="680" height="370" rx="16" fill="rgba(10, 15, 20, 0.6)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1.5" />
          <circle cx="85" cy="62" r="5" fill="#ff5f56" /><circle cx="101" cy="62" r="5" fill="#ffbd2e" /><circle cx="117" cy="62" r="5" fill="#27c93f" />
          <text x="340" y="66" font-family="'Outfit', sans-serif" font-weight="600" font-size="14" fill="white" opacity="0.6">Zenith Board Workspace</text>
          
          <!-- Board Columns -->
          <!-- Col 1: Todo -->
          <rect x="80" y="90" width="180" height="300" rx="8" fill="rgba(255, 255, 255, 0.02)" />
          <text x="95" y="115" font-family="'Outfit', sans-serif" font-weight="600" font-size="14" fill="white" opacity="0.8">Backlog</text>
          <rect x="90" y="130" width="160" height="60" rx="6" fill="rgba(255,255,255,0.05)" />
          <rect x="100" y="145" width="100" height="8" rx="2" fill="white" opacity="0.8" />
          <rect x="100" y="165" width="50" height="18" rx="3" fill="var(--accent-primary)" opacity="0.3" />
          
          <!-- Col 2: Progress -->
          <rect x="280" y="90" width="180" height="300" rx="8" fill="rgba(255, 255, 255, 0.02)" />
          <text x="295" y="115" font-family="'Outfit', sans-serif" font-weight="600" font-size="14" fill="var(--accent-secondary)">Active</text>
          <rect x="290" y="130" width="160" height="60" rx="6" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.1)" />
          <rect x="300" y="145" width="120" height="8" rx="2" fill="white" opacity="0.9" />
          <rect x="300" y="165" width="60" height="18" rx="3" fill="var(--accent-primary)" />
          
          <!-- Col 3: Done -->
          <rect x="480" y="90" width="180" height="300" rx="8" fill="rgba(255, 255, 255, 0.02)" />
          <text x="495" y="115" font-family="'Outfit', sans-serif" font-weight="600" font-size="14" fill="white" opacity="0.8">Completed</text>
          <rect x="490" y="130" width="160" height="50" rx="6" fill="rgba(255,255,255,0.03)" />
          <rect x="500" y="145" width="110" height="8" rx="2" fill="white" opacity="0.4" />
        </g>
      `;
    } else if (index === 1) {
      // Screen 1: Calendar/Time tracking
      svgContent = `
        <g filter="url(#card-shadow)">
          <rect x="60" y="40" width="680" height="370" rx="16" fill="rgba(10, 15, 20, 0.6)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1.5" />
          <text x="100" y="80" font-family="'Outfit', sans-serif" font-weight="700" font-size="20" fill="white">Analytics Dashboard</text>
          
          <!-- Chart visualization bar charts -->
          <rect x="100" y="130" width="540" height="220" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.05)" />
          
          <!-- Chart Grid Lines -->
          <line x1="140" y1="160" x2="600" y2="160" stroke="rgba(255,255,255,0.05)" />
          <line x1="140" y1="210" x2="600" y2="210" stroke="rgba(255,255,255,0.05)" />
          <line x1="140" y1="260" x2="600" y2="260" stroke="rgba(255,255,255,0.05)" />
          <line x1="140" y1="310" x2="600" y2="310" stroke="rgba(255,255,255,0.1)" />
          
          <!-- Bar charts elements representing project progression -->
          <rect x="180" y="240" width="30" height="70" rx="4" fill="rgba(255,255,255,0.2)" />
          <rect x="250" y="180" width="30" height="130" rx="4" fill="rgba(var(--accent-primary-rgb), 0.5)" />
          <rect x="320" y="200" width="30" height="110" rx="4" fill="rgba(255,255,255,0.2)" />
          <rect x="390" y="150" width="30" height="160" rx="4" fill="var(--accent-primary)" />
          <rect x="460" y="220" width="30" height="90" rx="4" fill="rgba(255,255,255,0.2)" />
          <rect x="530" y="170" width="30" height="140" rx="4" fill="var(--accent-secondary)" />
        </g>
      `;
    } else {
      // Screen 2: Text/Markdown editor
      svgContent = `
        <g filter="url(#card-shadow)">
          <rect x="60" y="40" width="680" height="370" rx="16" fill="rgba(10, 15, 20, 0.6)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1.5" />
          <line x1="220" y1="40" x2="220" y2="410" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" />
          
          <!-- Sidebar notebooks -->
          <text x="80" y="80" font-family="'Outfit', sans-serif" font-weight="700" font-size="15" fill="white">My Notebooks</text>
          <rect x="80" y="105" width="120" height="25" rx="4" fill="rgba(255,255,255,0.07)" />
          <rect x="90" y="112" width="60" height="10" rx="2" fill="white" opacity="0.8" />
          <rect x="80" y="140" width="120" height="25" rx="4" fill="transparent" />
          <rect x="90" y="147" width="80" height="10" rx="2" fill="white" opacity="0.4" />
          <rect x="80" y="175" width="120" height="25" rx="4" fill="transparent" />
          <rect x="90" y="182" width="70" height="10" rx="2" fill="white" opacity="0.4" />
          
          <!-- Main Editor writing lines mock -->
          <rect x="250" y="70" width="400" height="25" rx="4" fill="rgba(255,255,255,0.05)" />
          <text x="260" y="87" font-family="'Outfit', sans-serif" font-weight="600" font-size="14" fill="white"># Project Brainstorm ideas</text>
          
          <rect x="250" y="120" width="430" height="8" rx="2" fill="white" opacity="0.7" />
          <rect x="250" y="140" width="400" height="8" rx="2" fill="white" opacity="0.7" />
          <rect x="250" y="160" width="450" height="8" rx="2" fill="white" opacity="0.7" />
          <rect x="250" y="190" width="150" height="14" rx="2" fill="var(--accent-primary)" opacity="0.5" />
          <rect x="250" y="220" width="420" height="8" rx="2" fill="white" opacity="0.4" />
          <rect x="250" y="240" width="440" height="8" rx="2" fill="white" opacity="0.4" />
        </g>
      `;
    }
  } else if (id === 'aura-weather') {
    if (index === 'hero') {
      // Giant particle astronomical climate dials
      svgContent = `
        <g filter="url(#card-shadow)">
          <!-- Mobile view mockup centered -->
          <rect x="270" y="40" width="260" height="380" rx="28" fill="rgba(10, 15, 20, 0.7)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="2" />
          <rect x="360" y="52" width="80" height="15" rx="7.5" fill="black" /> <!-- Dynamic Island notch -->
          
          <!-- Weather Graphic Elements -->
          <circle cx="400" cy="180" r="45" fill="none" stroke="var(--accent-secondary)" stroke-width="2" stroke-dasharray="10, 6" />
          <circle cx="400" cy="180" r="32" fill="var(--accent-secondary)" opacity="0.2" />
          
          <!-- Clouds SVG outline -->
          <path d="M 390 195 A 15 15 0 0 1 405 180 A 20 20 0 0 1 435 185 A 15 15 0 0 1 430 205 Z" fill="white" opacity="0.9" />
          
          <!-- Temperature Text -->
          <text x="400" y="260" font-family="'Outfit', sans-serif" font-weight="800" font-size="44" fill="white" text-anchor="middle">24°</text>
          <text x="400" y="285" font-family="'Inter', sans-serif" font-weight="600" font-size="14" fill="var(--accent-primary)" text-anchor="middle">Stormy Rain</text>
          <text x="400" y="305" font-family="'Inter', sans-serif" font-weight="400" font-size="10" fill="white" opacity="0.5" text-anchor="middle">H: 26°  L: 18°</text>
          
          <!-- 3-day forecast details inside mobile screen -->
          <rect x="290" y="330" width="220" height="60" rx="12" fill="rgba(255,255,255,0.05)" />
          <line x1="363" y1="330" x2="363" y2="390" stroke="rgba(255,255,255,0.05)" />
          <line x1="436" y1="330" x2="436" y2="390" stroke="rgba(255,255,255,0.05)" />
          
          <text x="326" y="352" font-family="'Outfit', sans-serif" font-size="10" fill="white" opacity="0.6" text-anchor="middle">FRI</text>
          <circle cx="326" cy="365" r="5" fill="var(--accent-secondary)" />
          <text x="326" y="382" font-family="'Outfit', sans-serif" font-size="10" fill="white" text-anchor="middle">23°</text>
          
          <text x="400" y="352" font-family="'Outfit', sans-serif" font-size="10" fill="white" opacity="0.6" text-anchor="middle">SAT</text>
          <circle cx="400" cy="365" r="5" fill="#a5b5c1" />
          <text x="400" y="382" font-family="'Outfit', sans-serif" font-size="10" fill="white" text-anchor="middle">19°</text>
          
          <text x="473" y="352" font-family="'Outfit', sans-serif" font-size="10" fill="white" opacity="0.6" text-anchor="middle">SUN</text>
          <circle cx="473" cy="365" r="5" fill="var(--accent-secondary)" />
          <text x="473" y="382" font-family="'Outfit', sans-serif" font-size="10" fill="white" text-anchor="middle">25°</text>
        </g>
      `;
    } else if (index === 0) {
      // Screen 0: Climate graphs
      svgContent = `
        <g filter="url(#card-shadow)">
          <rect x="270" y="40" width="260" height="380" rx="28" fill="rgba(10, 15, 20, 0.7)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="2" />
          <rect x="360" y="52" width="80" height="15" rx="7.5" fill="black" />
          
          <!-- Climate circular radar graph -->
          <text x="400" y="100" font-family="'Outfit', sans-serif" font-weight="700" font-size="16" fill="white" text-anchor="middle">Precipitation Radar</text>
          
          <circle cx="400" cy="210" r="70" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="2" />
          <circle cx="400" cy="210" r="50" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="2" />
          <circle cx="400" cy="210" r="30" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="2" />
          
          <!-- Diagonal cross lines -->
          <line x1="330" y1="140" x2="470" y2="280" stroke="rgba(255,255,255,0.04)" />
          <line x1="470" y1="140" x2="330" y2="280" stroke="rgba(255,255,255,0.04)" />
          
          <!-- Green weather front shape -->
          <path d="M 400 210 Q 430 180 450 200 Q 420 230 400 210" fill="rgba(39, 201, 63, 0.25)" stroke="#27c93f" stroke-width="1.5" />
          <!-- Blue weather front shape -->
          <path d="M 400 210 Q 360 250 350 230 Q 380 200 400 210" fill="rgba(104, 185, 227, 0.25)" stroke="var(--accent-primary)" stroke-width="1.5" />
          
          <circle cx="400" cy="210" r="3" fill="white" />
          
          <!-- Air quality index card -->
          <rect x="290" y="310" width="220" height="80" rx="12" fill="rgba(255,255,255,0.04)" />
          <text x="310" y="335" font-family="'Outfit', sans-serif" font-weight="600" font-size="12" fill="white">Air Quality (AQI)</text>
          <text x="310" y="365" font-family="'Outfit', sans-serif" font-weight="700" font-size="24" fill="var(--accent-primary)">42 - Good</text>
          
          <rect x="430" y="335" width="60" height="6" rx="3" fill="rgba(255,255,255,0.1)" />
          <rect x="430" y="335" width="25" height="6" rx="3" fill="#27c93f" />
        </g>
      `;
    } else if (index === 1) {
      // Screen 1: Astrological card
      svgContent = `
        <g filter="url(#card-shadow)">
          <rect x="270" y="40" width="260" height="380" rx="28" fill="rgba(10, 15, 20, 0.7)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="2" />
          
          <text x="400" y="95" font-family="'Outfit', sans-serif" font-weight="700" font-size="16" fill="white" text-anchor="middle">Sun & Moon</text>
          
          <!-- Golden Arc representation -->
          <path d="M 300 230 A 100 80 0 0 1 500 230" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2" stroke-dasharray="6,4" />
          <path d="M 300 230 A 100 80 0 0 1 380 162" fill="none" stroke="var(--accent-secondary)" stroke-width="3" />
          
          <!-- Horizon line -->
          <line x1="285" y1="230" x2="515" y2="230" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
          
          <!-- Sun icon riding the arc -->
          <circle cx="380" cy="162" r="8" fill="var(--accent-secondary)" />
          <circle cx="380" cy="162" r="14" fill="none" stroke="var(--accent-secondary)" stroke-width="1" opacity="0.3" />
          
          <!-- Stats card details -->
          <rect x="290" y="270" width="220" height="115" rx="12" fill="rgba(255,255,255,0.04)" />
          
          <text x="310" y="300" font-family="'Inter', sans-serif" font-size="10" fill="white" opacity="0.5">SUNRISE</text>
          <text x="310" y="320" font-family="'Outfit', sans-serif" font-weight="600" font-size="16" fill="white">05:42 AM</text>
          
          <text x="420" y="300" font-family="'Inter', sans-serif" font-size="10" fill="white" opacity="0.5">SUNSET</text>
          <text x="420" y="320" font-family="'Outfit', sans-serif" font-weight="600" font-size="16" fill="white">07:15 PM</text>
          
          <line x1="290" y1="335" x2="510" y2="335" stroke="rgba(255,255,255,0.05)" />
          <text x="400" y="362" font-family="'Inter', sans-serif" font-size="12" fill="var(--accent-primary)" text-anchor="middle">Daylight: 13h 33m</text>
        </g>
      `;
    } else {
      // Screen 2: Weather maps
      svgContent = `
        <g filter="url(#card-shadow)">
          <rect x="270" y="40" width="260" height="380" rx="28" fill="rgba(10, 15, 20, 0.7)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="2" />
          
          <!-- Mock map graphics -->
          <path d="M 290 120 Q 320 100 350 140 T 400 130 T 450 160 T 510 110" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" />
          <path d="M 290 200 Q 340 180 380 230 T 470 190 T 510 240" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" />
          
          <!-- Heat contours -->
          <circle cx="370" cy="180" r="40" fill="rgba(var(--accent-primary-rgb), 0.15)" stroke="var(--accent-primary)" stroke-dasharray="5,5" />
          <circle cx="370" cy="180" r="20" fill="rgba(var(--accent-primary-rgb), 0.25)" stroke="var(--accent-primary)" />
          <circle cx="440" cy="270" r="30" fill="rgba(253, 187, 45, 0.1)" stroke="var(--accent-secondary)" stroke-dasharray="5,5" />
          
          <!-- UI Overlay panel -->
          <rect x="290" y="310" width="220" height="80" rx="12" fill="rgba(10, 15, 20, 0.9)" stroke="rgba(255,255,255,0.08)" />
          <text x="310" y="335" font-family="'Outfit', sans-serif" font-weight="600" font-size="12" fill="white">Map Layer: Temperature</text>
          
          <!-- Play slider bar -->
          <circle cx="315" cy="365" r="8" fill="var(--accent-primary)" />
          <line x1="335" y1="365" x2="485" y2="365" stroke="rgba(255,255,255,0.15)" stroke-width="4" stroke-linecap="round" />
          <line x1="335" y1="365" x2="400" y2="365" stroke="var(--accent-primary)" stroke-width="4" stroke-linecap="round" />
          <circle cx="400" cy="365" r="5" fill="white" />
        </g>
      `;
    }
  } else {
    // devsnap
    if (index === 'hero') {
      // Code Snippets main terminal UI
      svgContent = `
        <g filter="url(#card-shadow)">
          <rect x="80" y="60" width="640" height="330" rx="12" fill="#0b0f19" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" />
          <circle cx="105" cy="80" r="5" fill="#ff5f56" /><circle cx="121" cy="80" r="5" fill="#ffbd2e" /><circle cx="137" cy="80" r="5" fill="#27c93f" />
          
          <!-- Left directory structure sidebar -->
          <rect x="80" y="110" width="160" height="280" fill="#070a12" opacity="0.5" />
          <rect x="95" y="130" width="100" height="8" rx="2" fill="white" opacity="0.2" />
          <rect x="95" y="155" width="120" height="8" rx="2" fill="var(--accent-primary)" opacity="0.6" />
          <rect x="110" y="180" width="90" height="8" rx="2" fill="white" opacity="0.3" />
          <rect x="110" y="205" width="80" height="8" rx="2" fill="white" opacity="0.3" />
          
          <!-- Editor Code lines layout with dynamic coloring -->
          <text x="260" y="140" font-family="monospace" font-size="12" fill="#27c93f">const</text>
          <text x="305" y="140" font-family="monospace" font-size="12" fill="var(--accent-primary)">express</text>
          <text x="360" y="140" font-family="monospace" font-size="12" fill="white">=</text>
          <text x="375" y="140" font-family="monospace" font-size="12" fill="var(--accent-secondary)">require</text>
          <text x="430" y="140" font-family="monospace" font-size="12" fill="white">('express');</text>
          
          <text x="260" y="165" font-family="monospace" font-size="12" fill="#27c93f">const</text>
          <text x="305" y="165" font-family="monospace" font-size="12" fill="var(--accent-primary)">app</text>
          <text x="335" y="165" font-family="monospace" font-size="12" fill="white">=</text>
          <text x="350" y="165" font-family="monospace" font-size="12" fill="white">express();</text>
          
          <text x="260" y="200" font-family="monospace" font-size="12" fill="var(--accent-primary)">app</text>
          <text x="280" y="200" font-family="monospace" font-size="12" fill="white">.get('/', (req, res) =&gt; {</text>
          
          <text x="280" y="225" font-family="monospace" font-size="12" fill="var(--accent-primary)">res</text>
          <text x="305" y="225" font-family="monospace" font-size="12" fill="white">.status(200)</text>
          <text x="385" y="225" font-family="monospace" font-size="12" fill="white">.json({ message:</text>
          <text x="495" y="225" font-family="monospace" font-size="12" fill="var(--accent-secondary)">"Made by Sai"</text>
          <text x="590" y="225" font-family="monospace" font-size="12" fill="white">});</text>
          
          <text x="260" y="250" font-family="monospace" font-size="12" fill="white">});</text>
          
          <rect x="255" y="280" width="430" height="90" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.05)" />
          <text x="275" y="305" font-family="'Outfit', sans-serif" font-weight="600" font-size="12" fill="white">Quick Presets</text>
          <rect x="275" y="325" width="90" height="25" rx="4" fill="rgba(var(--accent-primary-rgb), 0.2)" stroke="var(--accent-primary)" stroke-width="1" />
          <text x="320" y="342" font-family="'Outfit', sans-serif" font-weight="600" font-size="10" fill="white" text-anchor="middle">Copy JSON</text>
        </g>
      `;
    } else if (index === 0) {
      // Screen 0: Snippet list drawer
      svgContent = `
        <g filter="url(#card-shadow)">
          <rect x="60" y="40" width="680" height="370" rx="16" fill="rgba(10, 15, 20, 0.6)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1.5" />
          
          <!-- Search field inside dashboard desktop app -->
          <rect x="100" y="70" width="500" height="40" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
          <text x="130" y="94" font-family="'Inter', sans-serif" font-size="13" fill="white" opacity="0.4">Search snippets (e.g. fetch, flexbox, git)...</text>
          
          <!-- Search Shortcut badge -->
          <rect x="550" y="77" width="40" height="26" rx="4" fill="rgba(255,255,255,0.1)" />
          <text x="570" y="94" font-family="monospace" font-size="10" fill="white" opacity="0.8" text-anchor="middle">⌘K</text>
          
          <!-- Snippet grid catalog -->
          <rect x="100" y="140" width="260" height="100" rx="8" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255, 255, 255, 0.08)" />
          <text x="120" y="170" font-family="'Outfit', sans-serif" font-weight="700" font-size="14" fill="white">Git Reset Commands</text>
          <text x="120" y="195" font-family="monospace" font-size="10" fill="var(--accent-primary)">git reset --hard HEAD~1</text>
          
          <rect x="380" y="140" width="260" height="100" rx="8" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255, 255, 255, 0.08)" />
          <text x="400" y="170" font-family="'Outfit', sans-serif" font-weight="700" font-size="14" fill="white">CSS Flex Center</text>
          <text x="400" y="195" font-family="monospace" font-size="10" fill="var(--accent-primary)">display: flex; justify-cont...</text>
          
          <rect x="100" y="260" width="260" height="100" rx="8" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255, 255, 255, 0.08)" />
          <text x="120" y="290" font-family="'Outfit', sans-serif" font-weight="700" font-size="14" fill="white">Bash Script Header</text>
          <text x="120" y="315" font-family="monospace" font-size="10" fill="var(--accent-primary)">#!/usr/bin/env bash</text>
        </g>
      `;
    } else {
      // Screen 1: Key configurations popup
      svgContent = `
        <g filter="url(#card-shadow)">
          <rect x="60" y="40" width="680" height="370" rx="16" fill="rgba(10, 15, 20, 0.6)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1.5" />
          
          <!-- Centered overlay card popup settings window -->
          <rect x="180" y="80" width="440" height="290" rx="12" fill="#0b0f19" stroke="rgba(255,255,255,0.15)" />
          <text x="210" y="120" font-family="'Outfit', sans-serif" font-weight="700" font-size="16" fill="white">Sync Settings</text>
          
          <!-- Sync Form details toggles -->
          <rect x="210" y="150" width="380" height="40" rx="6" fill="rgba(255,255,255,0.02)" />
          <text x="230" y="174" font-family="'Outfit', sans-serif" font-weight="600" font-size="12" fill="white">Auto Sync Cloud database</text>
          <rect x="520" y="160" width="50" height="20" rx="10" fill="var(--accent-primary)" />
          <circle cx="560" cy="170" r="8" fill="white" />
          
          <rect x="210" y="200" width="380" height="40" rx="6" fill="rgba(255,255,255,0.02)" />
          <text x="230" y="224" font-family="'Outfit', sans-serif" font-weight="600" font-size="12" fill="white">System Global Hotkey triggers</text>
          <text x="510" y="224" font-family="monospace" font-size="11" fill="var(--accent-secondary)">Ctrl+Alt+S</text>
          
          <rect x="210" y="270" width="380" height="1" fill="rgba(255,255,255,0.1)" />
          
          <!-- Save / Cancel buttons -->
          <rect x="490" y="295" width="100" height="35" rx="6" fill="var(--accent-primary)" />
          <text x="540" y="316" font-family="'Outfit', sans-serif" font-weight="700" font-size="12" fill="black" text-anchor="middle">Save changes</text>
        </g>
      `;
    }
  }

  return svgStart + svgContent + svgEnd;
}
