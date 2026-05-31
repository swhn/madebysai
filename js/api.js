/* API Helper Module - Made by Sai */

// In-memory cache of projects once fetched
let cachedProjects = null;

/**
 * Fetches the project list from the JSON file.
 * Caches the response to avoid redundant network requests.
 * @returns {Promise<Array>} Promise resolving to projects array
 */
export async function fetchProjects() {
  if (cachedProjects) {
    return cachedProjects;
  }
  
  try {
    // Add a slight artificial delay (300ms) to showcase the premium shimmer skeleton loaders
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const response = await fetch(`./data/projects.json?v=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    cachedProjects = await response.json();
    return cachedProjects;
  } catch (error) {
    console.error('Failed to fetch projects data:', error);
    return [];
  }
}

/**
 * Retrieves all projects.
 * @returns {Promise<Array>}
 */
export async function getAllProjects() {
  return await fetchProjects();
}

/**
 * Retrieves a single project by its ID slug.
 * @param {string} id Slug of the project
 * @returns {Promise<Object|null>} The project details or null if not found
 */
export async function getProjectById(id) {
  const projects = await fetchProjects();
  return projects.find(project => project.id === id) || null;
}

/**
 * Retrieves featured projects.
 * @returns {Promise<Array>}
 */
export async function getFeaturedProjects() {
  const projects = await fetchProjects();
  return projects.filter(project => project.featured);
}

/**
 * Extracts and returns list of unique categories from all projects.
 * Useful for building home page gallery filters.
 * @returns {Promise<Array<string>>} List of unique category names
 */
export async function getCategories() {
  const projects = await fetchProjects();
  const categories = projects.map(p => p.category);
  return [...new Set(categories)];
}
