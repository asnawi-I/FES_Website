// Product Image Management System for First Emporium Supermarket
// Admin functions for handling product images

// ============================================================================
// 1. IMAGE UPLOAD FUNCTION FOR ADMIN
// ============================================================================

/**
 * Handle image upload for admin interface
 * @param {File} file - The image file to upload
 * @param {number} productId - Product ID to associate the image with
 * @param {string} category - Product category for folder organization
 * @returns {Promise} Upload result
 */
function adminUploadProductImage(file, productId, category) {
    return new Promise((resolve, reject) => {
        // Validate file
        if (!validateImageFile(file)) {
            reject(new Error('Invalid image file. Please upload JPG, PNG, or WebP files under 5MB.'));
            return;
        }

        // Create FormData for upload
        const formData = new FormData();
        formData.append('image', file);
        formData.append('productId', productId);
        formData.append('category', category);

        // Show upload progress
        const progressCallback = (progress) => {
            updateUploadProgress(productId, progress);
        };

        // Process and upload image
        processAndUploadImage(file, productId, category, progressCallback)
            .then(result => {
                // Update product data with new image path
                updateProductImagePath(productId, result.imagePath);
                
                // Refresh product display
                refreshProductDisplay(productId);
                
                // Show success message
                showUploadSuccess(productId, result.imagePath);
                
                resolve(result);
            })
            .catch(error => {
                showUploadError(productId, error.message);
                reject(error);
            });
    });
}

/**
 * Validate uploaded image file
 * @param {File} file - File to validate
 * @returns {boolean} True if valid
 */
function validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
        return false;
    }

    if (file.size > maxSize) {
        return false;
    }

    return true;
}

/**
 * Process image upload with proper naming and storage
 * @param {File} file - Image file
 * @param {number} productId - Product ID
 * @param {string} category - Product category
 * @param {Function} progressCallback - Progress update callback
 * @returns {Promise} Processing result
 */
async function processAndUploadImage(file, productId, category, progressCallback) {
    try {
        // Generate filename
        const filename = generateImageFilename(productId, category, file.name);
        const imagePath = `assets/images/products/${category}/${filename}`;

        // Create optimized version of the image
        const optimizedFile = await optimizeImage(file, progressCallback);

        // Simulate upload process (replace with actual upload to server)
        const uploadResult = await simulateImageUpload(optimizedFile, imagePath, progressCallback);

        return {
            imagePath: imagePath,
            filename: filename,
            originalSize: file.size,
            optimizedSize: optimizedFile.size,
            uploadResult: uploadResult
        };

    } catch (error) {
        throw new Error(`Image processing failed: ${error.message}`);
    }
}

/**
 * Generate consistent image filename
 * @param {number} productId - Product ID
 * @param {string} category - Product category
 * @param {string} originalName - Original filename
 * @returns {string} Generated filename
 */
function generateImageFilename(productId, category, originalName) {
    const extension = originalName.split('.').pop().toLowerCase();
    const timestamp = Date.now();
    return `product_${productId}_${category}_${timestamp}.${extension}`;
}

// ============================================================================
// 2. IMAGE OPTIMIZATION AND RESIZING FUNCTION
// ============================================================================

/**
 * Optimize and resize uploaded images
 * @param {File} file - Original image file
 * @param {Function} progressCallback - Progress callback
 * @returns {Promise<File>} Optimized image file
 */
function optimizeImage(file, progressCallback) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = function() {
            try {
                progressCallback(30);

                // Calculate optimal dimensions
                const dimensions = calculateOptimalDimensions(img.width, img.height);
                
                // Set canvas size
                canvas.width = dimensions.width;
                canvas.height = dimensions.height;

                progressCallback(50);

                // Draw and resize image
                ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);

                progressCallback(70);

                // Convert to optimized blob
                canvas.toBlob((blob) => {
                    if (blob) {
                        // Create optimized file
                        const optimizedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });

                        progressCallback(90);
                        resolve(optimizedFile);
                    } else {
                        reject(new Error('Image optimization failed'));
                    }
                }, 'image/jpeg', 0.85); // 85% quality

            } catch (error) {
                reject(new Error(`Image processing error: ${error.message}`));
            }
        };

        img.onerror = () => {
            reject(new Error('Failed to load image for optimization'));
        };

        // Load image
        img.src = URL.createObjectURL(file);
        progressCallback(10);
    });
}

/**
 * Calculate optimal image dimensions for web display
 * @param {number} originalWidth - Original width
 * @param {number} originalHeight - Original height
 * @returns {Object} Optimal dimensions
 */
function calculateOptimalDimensions(originalWidth, originalHeight) {
    const maxWidth = 800;
    const maxHeight = 600;
    const aspectRatio = originalWidth / originalHeight;

    let newWidth = originalWidth;
    let newHeight = originalHeight;

    // Resize if larger than max dimensions
    if (originalWidth > maxWidth || originalHeight > maxHeight) {
        if (aspectRatio > 1) {
            // Landscape
            newWidth = maxWidth;
            newHeight = maxWidth / aspectRatio;
        } else {
            // Portrait
            newHeight = maxHeight;
            newWidth = maxHeight * aspectRatio;
        }
    }

    return {
        width: Math.round(newWidth),
        height: Math.round(newHeight),
        aspectRatio: aspectRatio
    };
}

/**
 * Apply additional image filters and enhancements
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Image width
 * @param {number} height - Image height
 */
function applyImageEnhancements(ctx, width, height) {
    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Apply subtle sharpening and contrast enhancement
    for (let i = 0; i < data.length; i += 4) {
        // Increase contrast slightly
        data[i] = Math.min(255, data[i] * 1.1);     // Red
        data[i + 1] = Math.min(255, data[i + 1] * 1.1); // Green
        data[i + 2] = Math.min(255, data[i + 2] * 1.1); // Blue
    }

    // Put enhanced image data back
    ctx.putImageData(imageData, 0, 0);
}

// ============================================================================
// 3. FALLBACK TO PLACEHOLDER FUNCTION
// ============================================================================

/**
 * Handle missing product images with fallback system
 * @param {HTMLImageElement} imgElement - Image element that failed to load
 * @param {number} productId - Product ID
 * @param {string} category - Product category
 */
function handleImageFallback(imgElement, productId, category) {
    // Hide the broken image
    imgElement.style.display = 'none';
    
    // Show placeholder
    const placeholder = imgElement.nextElementSibling;
    if (placeholder && placeholder.classList.contains('placeholder')) {
        placeholder.style.display = 'flex';
        
        // Update placeholder with category-specific icon
        updatePlaceholderIcon(placeholder, category);
        
        // Log missing image for admin tracking
        logMissingImage(productId, category, imgElement.src);
        
        // Add retry mechanism
        addImageRetryMechanism(imgElement, productId);
    }
}

/**
 * Update placeholder with category-specific icon
 * @param {HTMLElement} placeholder - Placeholder element
 * @param {string} category - Product category
 */
function updatePlaceholderIcon(placeholder, category) {
    const categoryIcons = {
        'fresh': '🥬',
        'dairy': '🥛',
        'meat': '🥩',
        'pantry': '🍚',
        'frozen': '🧊',
        'snacks': '🍿',
        'household': '🧽'
    };

    const iconElement = placeholder.querySelector('div:first-child');
    if (iconElement) {
        iconElement.textContent = categoryIcons[category] || '📦';
    }
}

/**
 * Check if product image exists before loading
 * @param {string} imagePath - Path to image
 * @returns {Promise<boolean>} True if image exists
 */
function checkImageExists(imagePath) {
    return new Promise((resolve) => {
        const img = new Image();
        
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        
        // Set timeout for check
        setTimeout(() => resolve(false), 3000);
        
        img.src = imagePath;
    });
}

/**
 * Preload product images and handle fallbacks
 * @param {Array} products - Array of product objects
 */
async function preloadProductImages(products) {
    const preloadPromises = products.map(async (product) => {
        const exists = await checkImageExists(product.image);
        
        if (!exists) {
            // Mark product as needing fallback
            product.needsFallback = true;
            
            // Generate placeholder path
            product.placeholderPath = generatePlaceholderPath(product.category);
            
            // Log for admin
            logMissingImage(product.id, product.category, product.image);
        }
        
        return { productId: product.id, imageExists: exists };
    });

    try {
        const results = await Promise.all(preloadPromises);
        console.log('Image preload completed:', results);
        return results;
    } catch (error) {
        console.error('Error preloading images:', error);
        return [];
    }
}

/**
 * Generate fallback placeholder path
 * @param {string} category - Product category
 * @returns {string} Placeholder image path
 */
function generatePlaceholderPath(category) {
    return `assets/images/placeholders/${category}-placeholder.svg`;
}

/**
 * Add retry mechanism for failed images
 * @param {HTMLImageElement} imgElement - Image element
 * @param {number} productId - Product ID
 */
function addImageRetryMechanism(imgElement, productId) {
    // Add retry button to placeholder
    const placeholder = imgElement.nextElementSibling;
    if (placeholder) {
        const retryButton = document.createElement('button');
        retryButton.textContent = 'Retry';
        retryButton.className = 'image-retry-btn';
        retryButton.style.cssText = `
            margin-top: 8px;
            padding: 4px 8px;
            background: #86BE4E;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 11px;
            cursor: pointer;
        `;
        
        retryButton.onclick = () => retryImageLoad(imgElement, productId);
        placeholder.appendChild(retryButton);
    }
}

/**
 * Retry loading failed image
 * @param {HTMLImageElement} imgElement - Image element
 * @param {number} productId - Product ID
 */
function retryImageLoad(imgElement, productId) {
    const originalSrc = imgElement.src;
    
    // Add cache buster
    const cacheBuster = '?v=' + Date.now();
    imgElement.src = originalSrc + cacheBuster;
    
    // Show loading state
    const placeholder = imgElement.nextElementSibling;
    if (placeholder) {
        placeholder.innerHTML = '<div>🔄</div><div class="placeholder-text">Loading...</div>';
    }
}

// ============================================================================
// 4. LAZY LOADING FUNCTION
// ============================================================================

/**
 * Initialize lazy loading for product images
 */
function initializeLazyLoading() {
    // Create intersection observer for lazy loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                loadLazyImage(img);
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.1
    });

    // Observe all lazy images
    observeLazyImages(imageObserver);
}

/**
 * Set up lazy loading for images
 * @param {IntersectionObserver} observer - Intersection observer
 */
function observeLazyImages(observer) {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    lazyImages.forEach(img => {
        observer.observe(img);
    });
}

/**
 * Load lazy image when it enters viewport
 * @param {HTMLImageElement} img - Image element
 */
function loadLazyImage(img) {
    const src = img.getAttribute('data-src');
    const productId = img.getAttribute('data-product-id');
    const category = img.getAttribute('data-category');
    
    if (!src) return;

    // Add loading class
    img.classList.add('lazy-loading');

    // Create new image to test loading
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
        // Image loaded successfully
        img.src = src;
        img.classList.remove('lazy-loading');
        img.classList.add('lazy-loaded');
        
        // Remove data-src attribute
        img.removeAttribute('data-src');
        
        // Fade in animation
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
            img.style.opacity = '1';
        }, 10);
    };
    
    imageLoader.onerror = () => {
        // Image failed to load, use fallback
        img.classList.remove('lazy-loading');
        handleImageFallback(img, parseInt(productId), category);
    };
    
    // Start loading
    imageLoader.src = src;
}

/**
 * Convert regular images to lazy loading format
 * @param {string} containerId - Container ID to convert images in
 */
function convertToLazyLoading(containerId = 'productsGrid') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const images = container.querySelectorAll('img');
    
    images.forEach(img => {
        if (img.src && !img.hasAttribute('data-src')) {
            // Convert to lazy loading
            img.setAttribute('data-src', img.src);
            img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="100%25" height="100%25" fill="%23f0f0f0"/%3E%3C/svg%3E';
            
            // Add product info attributes
            const productCard = img.closest('.product-card');
            if (productCard) {
                const productId = extractProductIdFromCard(productCard);
                const category = extractCategoryFromCard(productCard);
                
                img.setAttribute('data-product-id', productId);
                img.setAttribute('data-category', category);
            }
        }
    });

    // Reinitialize lazy loading observer
    initializeLazyLoading();
}

/**
 * Create optimized loading placeholder
 * @returns {string} SVG placeholder data URL
 */
function createLoadingPlaceholder() {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
            <rect width="100%" height="100%" fill="#f0f0f0"/>
            <circle cx="200" cy="150" r="20" fill="#ccc">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>
            </circle>
        </svg>
    `;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Update upload progress display
 * @param {number} productId - Product ID
 * @param {number} progress - Progress percentage
 */
function updateUploadProgress(productId, progress) {
    const progressBar = document.getElementById(`upload-progress-${productId}`);
    if (progressBar) {
        progressBar.style.width = progress + '%';
        progressBar.textContent = Math.round(progress) + '%';
    }
}

/**
 * Show upload success message
 * @param {number} productId - Product ID
 * @param {string} imagePath - New image path
 */
function showUploadSuccess(productId, imagePath) {
    console.log(`✅ Image uploaded successfully for product ${productId}: ${imagePath}`);
    
    // Could add toast notification
    showNotification(`Image uploaded successfully for product ${productId}`, 'success');
}

/**
 * Show upload error message
 * @param {number} productId - Product ID
 * @param {string} error - Error message
 */
function showUploadError(productId, error) {
    console.error(`❌ Upload failed for product ${productId}:`, error);
    
    // Could add toast notification
    showNotification(`Upload failed: ${error}`, 'error');
}

/**
 * Update product image path in products array
 * @param {number} productId - Product ID
 * @param {string} newImagePath - New image path
 */
function updateProductImagePath(productId, newImagePath) {
    const product = findProductById(productId);
    if (product) {
        product.image = newImagePath;
        product.needsFallback = false;
        
        // Save to localStorage if needed
        try {
            localStorage.setItem('products', JSON.stringify(products));
        } catch (error) {
            console.warn('Could not save products to localStorage:', error);
        }
    }
}

/**
 * Refresh product display after image update
 * @param {number} productId - Product ID
 */
function refreshProductDisplay(productId) {
    const productCard = document.querySelector(`[data-product-id="${productId}"]`);
    if (productCard) {
        const img = productCard.querySelector('img');
        const product = findProductById(productId);
        
        if (img && product) {
            img.src = product.image;
            img.style.display = 'block';
            
            // Hide placeholder
            const placeholder = img.nextElementSibling;
            if (placeholder && placeholder.classList.contains('placeholder')) {
                placeholder.style.display = 'none';
            }
        }
    }
}

/**
 * Log missing image for admin tracking
 * @param {number} productId - Product ID
 * @param {string} category - Product category
 * @param {string} imagePath - Failed image path
 */
function logMissingImage(productId, category, imagePath) {
    const logEntry = {
        productId: productId,
        category: category,
        imagePath: imagePath,
        timestamp: new Date().toISOString()
    };
    
    // Store in localStorage for admin review
    try {
        const missingImages = JSON.parse(localStorage.getItem('missingProductImages') || '[]');
        missingImages.push(logEntry);
        
        // Keep only last 100 entries
        if (missingImages.length > 100) {
            missingImages.splice(0, missingImages.length - 100);
        }
        
        localStorage.setItem('missingProductImages', JSON.stringify(missingImages));
    } catch (error) {
        console.warn('Could not log missing image:', error);
    }
    
    console.warn('Missing product image:', logEntry);
}

/**
 * Show notification to user
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info)
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1001;
        transition: all 0.3s ease;
        transform: translateX(100%);
    `;
    
    // Set background color based on type
    const colors = {
        success: '#86BE4E',
        error: '#EA3B52',
        info: '#3498db'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

/**
 * Simulate image upload (replace with actual server upload)
 * @param {File} file - Image file
 * @param {string} imagePath - Target image path
 * @param {Function} progressCallback - Progress callback
 * @returns {Promise} Upload result
 */
function simulateImageUpload(file, imagePath, progressCallback) {
    return new Promise((resolve) => {
        // Simulate upload progress
        let progress = 90;
        const interval = setInterval(() => {
            progress += 2;
            progressCallback(progress);
            
            if (progress >= 100) {
                clearInterval(interval);
                resolve({
                    success: true,
                    path: imagePath,
                    size: file.size
                });
            }
        }, 100);
    });
}

/**
 * Extract product ID from product card element
 * @param {HTMLElement} productCard - Product card element
 * @returns {number} Product ID
 */
function extractProductIdFromCard(productCard) {
    // This would depend on how you structure your product cards
    // For now, assume it's in a data attribute or can be extracted from button onclick
    const addButton = productCard.querySelector('.add-to-cart');
    if (addButton && addButton.onclick) {
        const onclickStr = addButton.onclick.toString();
        const match = onclickStr.match(/addToCart\((\d+)\)/);
        return match ? parseInt(match[1]) : null;
    }
    return null;
}

/**
 * Extract category from product card element
 * @param {HTMLElement} productCard - Product card element
 * @returns {string} Product category
 */
function extractCategoryFromCard(productCard) {
    // This would need to be implemented based on your card structure
    // For now, return a default or extract from data attributes
    return productCard.getAttribute('data-category') || 'general';
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the Product Image Management System
 */
function initializeProductImageSystem() {
    console.log('🖼️ Initializing Product Image Management System...');
    
    // Initialize lazy loading
    initializeLazyLoading();
    
    // Preload and check existing images
    if (typeof products !== 'undefined') {
        preloadProductImages(products);
    }
    
    // Convert existing images to lazy loading if needed
    convertToLazyLoading();
    
    console.log('✅ Product Image Management System initialized');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProductImageSystem);
} else {
    initializeProductImageSystem();
}

// Export functions for global access
window.ProductImageSystem = {
    adminUploadProductImage,
    optimizeImage,
    handleImageFallback,
    initializeLazyLoading,
    convertToLazyLoading,
    preloadProductImages
};