// Admin Panel Configuration and Settings
const ADMIN_CONFIG = {
    // File upload settings
    UPLOAD: {
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        MAX_DIMENSION: 4096, // pixels
        MIN_DIMENSION: 100, // pixels
        MAX_FILENAME_LENGTH: 100
    },
    
    // UI settings
    UI: {
        SCROLL_THRESHOLD: 100, // pixels for lazy loading fallback
        THROTTLE_DELAY: 20, // ms for scroll throttle
        NOTIFICATION_DURATION: 3000, // ms
        PROGRESS_UPDATE_INTERVAL: 200 // ms
    },
    
    // Cache settings
    CACHE: {
        IMAGE_CACHE_KEY: 'missingProductImages',
        PRODUCTS_CACHE_KEY: 'products'
    }
};

// Sample product data (in real implementation, this would come from your products.js)
var products = [
    { id: 1, name: "Fresh Bananas", category: "fresh", image: "assets/images/products/fresh/bananas.jpg" },
    { id: 2, name: "Red Apples", category: "fresh", image: "assets/images/products/fresh/apples.jpg" },
    { id: 6, name: "Fresh Milk", category: "dairy", image: "assets/images/products/dairy/milk.jpg" },
    { id: 10, name: "Chicken Breast", category: "meat", image: "assets/images/products/meat/chicken.jpg" },
    // Add more products as needed
];

// Global variables
var selectedFile = null;
var selectedProductId = null;
var lazyLoadingEnabled = true;

// Canvas memory cleanup function
function cleanupCanvas(canvas) {
    if (canvas && canvas.getContext) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
        }
        canvas.width = 0;
        canvas.height = 0;
    }
}

// Memory cleanup for image processing
function cleanupImageMemory() {
    // Clean up any existing canvases
    const canvases = document.querySelectorAll('canvas[data-temp]');
    canvases.forEach(canvas => {
        cleanupCanvas(canvas);
        canvas.remove();
    });

    // Force garbage collection hint
    if (window.gc) {
        window.gc();
    }
}

// Browser fallback for Intersection Observer
function initializeLazyLoadingWithFallback() {
    if ('IntersectionObserver' in window) {
        // Modern browsers - use Intersection Observer
        return initializeModernLazyLoading();
    } else {
        // Fallback for older browsers
        return initializeFallbackLazyLoading();
    }
}

function initializeModernLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

function initializeFallbackLazyLoading() {
    // Fallback using scroll events for older browsers
    let throttleTimeout;
    
    function lazyLoad() {
        if (throttleTimeout) {
            clearTimeout(throttleTimeout);
        }
        
        throttleTimeout = setTimeout(function() {
            const scrollTop = window.pageYOffset;
            const windowHeight = window.innerHeight;
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                const imgRect = img.getBoundingClientRect();
                if (imgRect.top < windowHeight + ADMIN_CONFIG.UI.SCROLL_THRESHOLD) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    img.classList.remove('lazy');
                }
            });
        }, ADMIN_CONFIG.UI.THROTTLE_DELAY);
    }

    window.addEventListener('scroll', lazyLoad);
    window.addEventListener('resize', lazyLoad);
    window.addEventListener('orientationchange', lazyLoad);
    
    // Initial load
    lazyLoad();
}

// Enhanced file validation with specific error messages
function validateFile(file) {
    const errors = [];
    const config = ADMIN_CONFIG.UPLOAD;

    // Check file size
    if (file.size > config.MAX_FILE_SIZE) {
        errors.push(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed: ${config.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Check file type
    if (!config.ALLOWED_TYPES.includes(file.type)) {
        errors.push(`Invalid file type: ${file.type}. Allowed: ${config.ALLOWED_TYPES.join(', ').replace(/image\//g, '').toUpperCase()}`);
    }

    // Check file name length
    if (file.name.length > config.MAX_FILENAME_LENGTH) {
        errors.push(`Filename too long: ${file.name.length} characters. Maximum: ${config.MAX_FILENAME_LENGTH} characters`);
    }

    // Check for empty file
    if (file.size === 0) {
        errors.push('File is empty or corrupted');
    }

    return new Promise((resolve) => {
        if (errors.length > 0) {
            resolve({ valid: false, errors });
            return;
        }

        // Check image dimensions
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = function() {
            URL.revokeObjectURL(url);
            
            if (this.naturalWidth > config.MAX_DIMENSION || this.naturalHeight > config.MAX_DIMENSION) {
                errors.push(`Image too large: ${this.naturalWidth}x${this.naturalHeight}px. Maximum: ${config.MAX_DIMENSION}x${config.MAX_DIMENSION}px`);
            }
            
            if (this.naturalWidth < config.MIN_DIMENSION || this.naturalHeight < config.MIN_DIMENSION) {
                errors.push(`Image too small: ${this.naturalWidth}x${this.naturalHeight}px. Minimum: ${config.MIN_DIMENSION}x${config.MIN_DIMENSION}px`);
            }
            
            resolve({ valid: errors.length === 0, errors, dimensions: { width: this.naturalWidth, height: this.naturalHeight } });
        };
        
        img.onerror = function() {
            URL.revokeObjectURL(url);
            errors.push('Invalid or corrupted image file');
            resolve({ valid: false, errors });
        };
        
        img.src = url;
    });
}

// Initialize admin interface
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminInterface();
    // Add memory cleanup on page unload
    window.addEventListener('beforeunload', cleanupImageMemory);
});

function initializeAdminInterface() {
    populateProductSelect();
    setupFileUpload();
    renderProductGrid();
    console.log('Admin interface initialized');
}

function populateProductSelect() {
    const select = document.getElementById('productSelect');
    select.innerHTML = '<option value="">Choose a product...</option>';
    
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} (${product.category})`;
        select.appendChild(option);
    });

    select.addEventListener('change', function() {
        selectedProductId = this.value ? parseInt(this.value) : null;
        updateUploadButton();
    });
}

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async function() {
        if (this.files.length > 0) {
            const file = this.files[0];
            
            // Clean up any previous memory usage
            cleanupImageMemory();
            
            // Validate file with specific error messages
            const validation = await validateFile(file);
            
            if (!validation.valid) {
                showNotification(`Upload failed: ${validation.errors.join('. ')}`, 'error');
                this.value = ''; // Clear the input
                resetUploadArea();
                return;
            }
            
            selectedFile = file;
            updateUploadArea(validation.dimensions);
            updateUploadButton();
        }
    });

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function() {
        this.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', async function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            
            // Clean up any previous memory usage
            cleanupImageMemory();
            
            // Validate file with specific error messages
            const validation = await validateFile(file);
            
            if (!validation.valid) {
                showNotification(`Upload failed: ${validation.errors.join('. ')}`, 'error');
                resetUploadArea();
                return;
            }
            
            selectedFile = file;
            updateUploadArea(validation.dimensions);
            updateUploadButton();
        }
    });
}

function updateUploadArea(dimensions) {
    const uploadArea = document.getElementById('uploadArea');
    if (selectedFile) {
        const sizeText = `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`;
        const dimensionText = dimensions ? ` • ${dimensions.width}x${dimensions.height}px` : '';
        
        uploadArea.innerHTML = `
            <div class="upload-icon"></div>
            <p><strong>File selected:</strong> ${selectedFile.name}</p>
            <p>Size: ${sizeText}${dimensionText}</p>
        `;
    }
}

function resetUploadArea() {
    document.getElementById('uploadArea').innerHTML = `
        <div class="upload-icon"></div>
        <p><strong>Click to upload</strong> or drag and drop image here</p>
        <p>Supports JPG, PNG, WebP up to 5MB</p>
    `;
}

function updateUploadButton() {
    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.disabled = !selectedFile || !selectedProductId;
}

function uploadSelectedImage() {
    if (!selectedFile || !selectedProductId) {
        showNotification('Please select both a file and product', 'error');
        return;
    }

    const product = products.find(p => p.id === selectedProductId);
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }

    // Show progress bar
    const progressBar = document.getElementById('progressBar');
    progressBar.style.display = 'block';

    // Use the upload function from the main system
    if (typeof adminUploadProductImage === 'function') {
        adminUploadProductImage(selectedFile, selectedProductId, product.category)
            .then(result => {
                showNotification('Image uploaded successfully!', 'success');
                resetUploadForm();
                renderProductGrid();
            })
            .catch(error => {
                showNotification('Upload failed: ' + error.message, 'error');
            })
            .finally(() => {
                progressBar.style.display = 'none';
                cleanupImageMemory(); // Clean up after upload
            });
    } else {
        // Simulate upload for demo
        simulateUpload();
    }
}

function simulateUpload() {
    const progressFill = document.getElementById('progressFill');
    let progress = 0;
    
    const interval = setInterval(() => {
        progress += 10;
        progressFill.style.width = progress + '%';
        progressFill.textContent = progress + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                showNotification('Image uploaded successfully! (Demo)', 'success');
                resetUploadForm();
                document.getElementById('progressBar').style.display = 'none';
                cleanupImageMemory(); // Clean up after demo upload
            }, 500);
        }
    }, ADMIN_CONFIG.UI.PROGRESS_UPDATE_INTERVAL);
}

function resetUploadForm() {
    selectedFile = null;
    selectedProductId = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('productSelect').value = '';
    resetUploadArea();
    updateUploadButton();
}

function renderProductGrid() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';

    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-preview';
        
        // Check if image exists (simplified check)
        const hasImage = Math.random() > 0.3; // Simulate some missing images
        
        productDiv.innerHTML = `
            ${hasImage ? 
                `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                 <div class="placeholder" style="display: none;">
                     <div>📦</div>
                 </div>` :
                `<div class="placeholder">
                     <div>📦</div>
                     <div style="font-size: 12px; margin-top: 5px;">No Image</div>
                 </div>`
            }
            <div class="product-name">${product.name}</div>
            <div class="product-category">${product.category}</div>
            <div class="status-indicator ${hasImage ? 'status-has-image' : 'status-missing-image'}">
                ${hasImage ? 'Has Image' : 'Missing Image'}
            </div>
        `;
        
        grid.appendChild(productDiv);
    });
}

function refreshProductStatus() {
    showNotification('Refreshing product status...', 'success');
    renderProductGrid();
}

function preloadAllImages() {
    showNotification('Checking all images...', 'success');
    
    if (typeof preloadProductImages === 'function') {
        preloadProductImages(products).then(results => {
            const missing = results.filter(r => !r.imageExists).length;
            showNotification(`Image check complete. ${missing} images missing.`, 'success');
            renderProductGrid();
        });
    } else {
        setTimeout(() => {
            showNotification('Image check complete (Demo)', 'success');
        }, 1000);
    }
}

function toggleLazyLoading() {
    lazyLoadingEnabled = !lazyLoadingEnabled;
    
    if (lazyLoadingEnabled) {
        initializeLazyLoadingWithFallback(); // Use fallback function
        showNotification('Lazy loading enabled', 'success');
    } else {
        showNotification('Lazy loading disabled', 'success');
    }
}

function optimizeAllImages() {
    showNotification('Starting image optimization...', 'success');
    
    // Clean up memory before optimization
    cleanupImageMemory();
    
    // Simulate optimization process
    setTimeout(() => {
        showNotification('All images optimized successfully!', 'success');
        cleanupImageMemory(); // Clean up after optimization
    }, 2000);
}

function showMissingImages() {
    const section = document.getElementById('missingImagesSection');
    const list = document.getElementById('missingImagesList');
    
    // Get missing images from localStorage or simulate
    const missingImages = [
        { productId: 15, category: 'pantry', imagePath: 'assets/images/products/pantry/olive-oil.jpg' },
        { productId: 22, category: 'snacks', imagePath: 'assets/images/products/snacks/coca-cola.jpg' },
        { productId: 28, category: 'household', imagePath: 'assets/images/products/household/dish-soap.jpg' }
    ];
    
    list.innerHTML = '';
    
    if (missingImages.length === 0) {
        list.innerHTML = '<p>No missing images found!</p>';
    } else {
        missingImages.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            const itemDiv = document.createElement('div');
            itemDiv.className = 'missing-item';
            itemDiv.innerHTML = `
                <div>
                    <strong>${product ? product.name : 'Unknown Product'}</strong><br>
                    <small>${item.imagePath}</small>
                </div>
                <button class="btn" onclick="fixMissingImage(${item.productId})">
                    Fix
                </button>
            `;
            list.appendChild(itemDiv);
        });
    }
    
    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth' });
}

function fixMissingImage(productId) {
    // Auto-select the product in the upload form
    document.getElementById('productSelect').value = productId;
    selectedProductId = productId;
    updateUploadButton();
    
    // Scroll to upload section
    document.querySelector('.admin-section').scrollIntoView({ behavior: 'smooth' });
    
    showNotification(`Product ${productId} selected for image upload`, 'success');
}

function clearImageCache() {
    // Clean up memory first
    cleanupImageMemory();
    
    // Clear any cached image data
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(ADMIN_CONFIG.CACHE.IMAGE_CACHE_KEY);
        localStorage.removeItem(ADMIN_CONFIG.CACHE.PRODUCTS_CACHE_KEY);
    }
    
    // Force reload images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (img.src) {
            img.src = img.src + '?v=' + Date.now();
        }
    });
    
    showNotification('Image cache cleared!', 'success');
}

function showNotification(message, type) {
    // Remove existing notifications
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Hide notification after configured duration
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, ADMIN_CONFIG.UI.NOTIFICATION_DURATION);
}

// Update progress for uploads (called by the main system)
function updateUploadProgress(productId, progress) {
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = progress + '%';
        progressFill.textContent = Math.round(progress) + '%';
    }
}