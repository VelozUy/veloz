/**
 * Gallery Layout Generator - Build Time
 * 
 * Pre-calculates optimal gallery layouts for all screen sizes during build time.
 * This eliminates client-side layout calculations and improves SEO/performance.
 */

/**
 * Calculate optimal gallery layout for given images and container width
 */
function calculateOptimalLayout(images, containerWidth, config = {}) {
  const {
    targetRowHeight = 300,
    maxRowHeight = 400,
    gap = 8,
    columns = 3,
  } = config;

  if (!images.length) {
    return {
      rows: [],
      tiles: [],
      totalHeight: 0,
      containerWidth,
      metadata: { imageCount: 0, rowCount: 0 }
    };
  }

  const rows = [];
  const tiles = [];
  let currentRow = [];
  let yOffset = 0;

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    currentRow.push(image);

    // Calculate if this row should be finalized
    const shouldFinalize = shouldFinalizeRow(currentRow, containerWidth, targetRowHeight) || 
                          i === images.length - 1;

    if (shouldFinalize) {
      const rowLayout = calculateRowLayout(currentRow, containerWidth, targetRowHeight, gap, yOffset);
      rows.push(rowLayout);
      
      // Add tiles to global collection
      rowLayout.tiles.forEach(tile => {
        tiles.push({
          ...tile,
          id: `tile-${tile.image.id}`,
          row: rows.length - 1,
          animationDelay: tiles.length * 0.05, // Stagger animation
        });
      });

      yOffset += rowLayout.actualHeight + gap;
      currentRow = [];
    }
  }

  return {
    rows,
    tiles,
    totalHeight: yOffset - gap, // Remove last gap
    containerWidth,
    metadata: {
      imageCount: images.length,
      rowCount: rows.length,
      averageAspectRatio: images.reduce((sum, img) => 
        sum + ((img.width || 1) / (img.height || 1)), 0) / images.length,
    }
  };
}

/**
 * Calculate layout for a single row of images
 */
function calculateRowLayout(images, containerWidth, targetHeight, gap, yOffset) {
  const totalGaps = (images.length - 1) * gap;
  const availableWidth = containerWidth - totalGaps;
  
  // Calculate total aspect ratio for the row
  const totalAspectRatio = images.reduce((sum, img) => 
    sum + ((img.width || 1) / (img.height || 1)), 0);
  
  // Calculate actual row height
  const actualHeight = Math.min(availableWidth / totalAspectRatio, targetHeight);
  
  // Calculate individual tile dimensions
  const tiles = [];
  let xOffset = 0;
  
  images.forEach((image, index) => {
    const aspectRatio = (image.width || 1) / (image.height || 1);
    const tileWidth = actualHeight * aspectRatio;
    
    tiles.push({
      image,
      width: tileWidth,
      height: actualHeight,
      x: xOffset,
      y: yOffset,
      aspectRatio,
      cssStyles: {
        width: `${tileWidth}px`,
        height: `${actualHeight}px`,
        aspectRatio: `${image.width || 1} / ${image.height || 1}`,
      }
    });
    
    xOffset += tileWidth + gap;
  });

  return {
    id: `row-${yOffset}`,
    tiles,
    actualHeight,
    targetHeight,
    totalWidth: availableWidth,
    aspectRatioSum: totalAspectRatio,
  };
}

/**
 * Determine if a row should be finalized
 */
function shouldFinalizeRow(images, containerWidth, targetHeight) {
  if (images.length === 0) return false;
  if (images.length >= 4) return true; // Max 4 images per row
  
  // Calculate potential row width
  const totalAspectRatio = images.reduce((sum, img) => 
    sum + ((img.width || 1) / (img.height || 1)), 0);
  const potentialWidth = targetHeight * totalAspectRatio;
  
  // Finalize if row would be too wide or we have enough content
  return potentialWidth > containerWidth * 1.2 || images.length >= 3;
}

/**
 * Generate responsive layouts for common screen sizes
 */
function generateResponsiveLayouts(images) {
  const breakpoints = {
    mobile: { width: 375, targetRowHeight: 200, gap: 4, columns: 1 },
    tablet: { width: 768, targetRowHeight: 250, gap: 6, columns: 2 },
    desktop: { width: 1200, targetRowHeight: 300, gap: 8, columns: 3 },
    large: { width: 1600, targetRowHeight: 350, gap: 12, columns: 4 },
  };

  const layouts = {};
  
  Object.entries(breakpoints).forEach(([breakpoint, config]) => {
    layouts[breakpoint] = calculateOptimalLayout(images, config.width, config);
  });

  return layouts;
}

/**
 * Generate layouts for all categories and projects
 */
function generateAllGalleryLayouts(projects, categories) {
  const galleryLayouts = {
    categories: {},
    projects: {},
    metadata: {
      generatedAt: new Date().toISOString(),
      totalLayouts: 0,
    }
  };

  // Generate layouts for each category
  categories.forEach(category => {
    const categoryProjects = projects.filter(project => 
      category.eventTypes.includes('*') || 
      category.eventTypes.includes(project.eventType || '')
    );

    // Get featured media from category projects
    const featuredMedia = categoryProjects.flatMap(project => 
      (project.media || [])
        .filter(media => media.featured)
        .map(media => ({
          id: media.id,
          url: media.url,
          src: media.url,
          alt: `${typeof project.title === 'string' ? project.title : (project.title?.es || project.title?.en || project.title?.pt || 'Project')} - ${media.type}`,
          width: media.width || 800,
          height: media.height || 600,
          type: media.type,
          aspectRatio: media.aspectRatio,
          projectId: project.id,
          projectTitle: typeof project.title === 'string' ? project.title : (project.title?.es || project.title?.en || project.title?.pt || 'Project'),
          featured: true,
        }))
    );

    if (featuredMedia.length > 0) {
      galleryLayouts.categories[category.id] = {
        ...generateResponsiveLayouts(featuredMedia),
        metadata: {
          imageCount: featuredMedia.length,
          projectCount: categoryProjects.length,
        }
      };
      galleryLayouts.metadata.totalLayouts += 4; // 4 breakpoints
    }
  });

  // Generate layouts for individual projects (all media, not just featured)
  projects.forEach(project => {
    if (project.media && project.media.length > 0) {
      const projectMedia = project.media.map(media => ({
        id: media.id,
        url: media.url,
        src: media.url,
                 alt: `${typeof project.title === 'string' ? project.title : (project.title?.es || project.title?.en || project.title?.pt || 'Project')} - ${media.type}`,
        width: media.width || 800,
        height: media.height || 600,
        type: media.type,
        aspectRatio: media.aspectRatio,
                 projectId: project.id,
         projectTitle: typeof project.title === 'string' ? project.title : (project.title?.es || project.title?.en || project.title?.pt || 'Project'),
         featured: media.featured || false,
      }));

      galleryLayouts.projects[project.id] = {
        ...generateResponsiveLayouts(projectMedia),
        metadata: {
          imageCount: projectMedia.length,
          featuredCount: projectMedia.filter(m => m.featured).length,
        }
      };
      galleryLayouts.metadata.totalLayouts += 4; // 4 breakpoints
    }
  });

  console.log(`✅ Generated ${galleryLayouts.metadata.totalLayouts} gallery layouts`);
  return galleryLayouts;
}

module.exports = {
  generateAllGalleryLayouts,
  generateResponsiveLayouts,
  calculateOptimalLayout,
}; 