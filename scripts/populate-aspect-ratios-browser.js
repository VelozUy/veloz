// Browser-compatible script to populate missing aspect ratios
// Run this in the browser console on your admin page

// Function to detect aspect ratio from image dimensions
function detectAspectRatio(width, height) {
  const ratio = width / height;

  if (ratio > 1.3) {
    return '16:9'; // Landscape
  } else if (ratio < 0.75) {
    return '9:16'; // Portrait
  } else {
    return '1:1'; // Square-ish
  }
}

// Function to get image dimensions from URL
async function getImageDimensions(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Handle CORS issues
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: detectAspectRatio(img.naturalWidth, img.naturalHeight),
      });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

// Function to get video dimensions from URL
async function getVideoDimensions(url) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous'; // Handle CORS issues
    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        aspectRatio: detectAspectRatio(video.videoWidth, video.videoHeight),
      });
      URL.revokeObjectURL(video.src);
    };
    video.onerror = () => {
      reject(new Error('Failed to load video'));
      URL.revokeObjectURL(video.src);
    };
    video.src = url;
  });
}

// Main function to populate missing aspect ratios
async function populateAspectRatios() {
  try {
    console.log('Starting aspect ratio population...');

    // Get all project media from the current page context
    // This assumes you're running this on a page that has access to the media data
    const projectMedia = window.projectMedia || [];

    if (!projectMedia.length) {
      console.log(
        "No project media found. Make sure you're on a page with media data."
      );
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;

    for (const media of projectMedia) {
      // Skip if aspect ratio already exists
      if (media.aspectRatio) {
        console.log(
          `Skipping ${media.fileName} - aspect ratio already exists: ${media.aspectRatio}`
        );
        skippedCount++;
        continue;
      }

      try {
        console.log(`Processing ${media.fileName}...`);

        let dimensions;

        if (media.type === 'video') {
          dimensions = await getVideoDimensions(media.url);
        } else {
          dimensions = await getImageDimensions(media.url);
        }

        console.log(
          `Detected aspect ratio for ${media.fileName}: ${dimensions.aspectRatio} (${dimensions.width}x${dimensions.height})`
        );

        // Note: This script only detects the aspect ratio
        // You'll need to manually update the database or create an API endpoint
        // to actually save the detected aspect ratios

        updatedCount++;

        // Add a small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error processing ${media.fileName}:`, error);

        console.log(
          `Could not detect aspect ratio for ${media.fileName}, defaulting to 16:9`
        );
        updatedCount++;
      }
    }

    console.log(`\nAspect ratio detection completed!`);
    console.log(`Processed: ${updatedCount} media items`);
    console.log(
      `Skipped: ${skippedCount} media items (already had aspect ratio)`
    );
    console.log(
      '\nNote: This script only detects aspect ratios. You need to manually update the database or create an API endpoint to save them.'
    );
  } catch (error) {
    console.error('Error in populateAspectRatios:', error);
  }
}

// Export for use in browser console
window.populateAspectRatios = populateAspectRatios;

console.log(
  'Aspect ratio population script loaded. Run populateAspectRatios() to start.'
);
