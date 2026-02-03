// In-memory product database with images
const productDatabase = {
    products: [
        { id: 1, name: "Fresh Bananas", category: "fresh", image: null },
        { id: 2, name: "Red Apples", category: "fresh", image: null },
        { id: 3, name: "Fresh Spinach", category: "fresh", image: null },
        { id: 6, name: "Fresh Milk", category: "dairy", image: null },
        { id: 7, name: "Free Range Eggs", category: "dairy", image: null },
        { id: 8, name: "Cheddar Cheese", category: "dairy", image: null },
        { id: 10, name: "Chicken Breast", category: "meat", image: null },
        { id: 11, name: "Ground Beef", category: "meat", image: null },
        { id: 12, name: "Salmon Fillet", category: "meat", image: null },
        { id: 14, name: "Jasmine Rice", category: "pantry", image: null },
        { id: 15, name: "Olive Oil", category: "pantry", image: null },
        { id: 16, name: "Pasta", category: "pantry", image: null },
        { id: 19, name: "Frozen Vegetables", category: "frozen", image: null },
        { id: 20, name: "Ice Cream", category: "frozen", image: null },
        { id: 22, name: "Coca Cola", category: "snacks", image: null },
        { id: 23, name: "Potato Chips", category: "snacks", image: null },
        { id: 24, name: "Chocolate Bar", category: "snacks", image: null },
        { id: 26, name: "Laundry Detergent", category: "household", image: null },
        { id: 27, name: "Toilet Paper", category: "household", image: null },
        { id: 28, name: "Dish Soap", category: "household", image: null },
    ]
};

// Global variables
let selectedFile = null;
let selectedProductId = null;
let currentFilter = 'all';

// Admin Configuration
const ADMIN_CONFIG = {
    UPLOAD: {
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    },
    UI: {
        NOTIFICATION_DURATION: 3000, // ms
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    init();
});

function init() {
    // Initialize SharedImageStore if available
    if (typeof SharedImageStore !== 'undefined') {
        SharedImageStore.init(productDatabase.products);
        
        // Load existing images from the store
        syncImagesFromStore();
        
        // Subscribe to image changes from other pages
        SharedImageStore.subscribe(handleImageChange);
        
        console.log('✅ Admin page connected to SharedImageStore');
    }
    
    populateProductSelect();
    renderProductGrid();
    updateStats();
    setupEventListeners();
}

// Sync images from shared store to local database
function syncImagesFromStore() {
    if (typeof SharedImageStore === 'undefined') return;
    
    productDatabase.products.forEach(product => {
        const storedImage = SharedImageStore.getImage(product.id);
        if (storedImage) {
            product.image = storedImage;
        }
    });
    
    console.log('🔄 Synced images from SharedImageStore');
}

// Handle image changes from other pages
function handleImageChange(event) {
    console.log('📥 Received image change:', event.type, 'for product', event.productId);
    
    const product = productDatabase.products.find(p => p.id === event.productId);
    if (!product) return;
    
    if (event.type === 'image-updated') {
        product.image = event.imageData;
    } else if (event.type === 'image-deleted') {
        product.image = null;
    }
    
    // Update UI
    renderProductGrid();
    updateStats();
}

function setupEventListeners() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    // Click to upload
    uploadArea.addEventListener('click', () => fileInput.click());

    // File selection
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFile(file);
        }
    });

    // Product selection
    document.getElementById('productSelect').addEventListener('change', (e) => {
        selectedProductId = e.target.value ? parseInt(e.target.value) : null;
        updateUploadButton();
    });
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    // Validate file
    if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file', 'error');
        return;
    }

    if (file.size > ADMIN_CONFIG.UPLOAD.MAX_FILE_SIZE) {
        showNotification('File size must be less than 5MB', 'error');
        return;
    }

    if (!ADMIN_CONFIG.UPLOAD.ALLOWED_TYPES.includes(file.type)) {
        showNotification('Only JPG, PNG, and WebP files are allowed', 'error');
        return;
    }

    selectedFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('previewImage');
        preview.src = e.target.result;
        document.getElementById('previewContainer').style.display = 'block';
    };
    reader.readAsDataURL(file);

    // Update upload area
    document.getElementById('uploadArea').innerHTML = `
        <div class="upload-icon">✅</div>
        <p><strong>File selected:</strong> ${file.name}</p>
        <p>Size: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
    `;

    updateUploadButton();
}

function updateUploadButton() {
    const btn = document.getElementById('uploadBtn');
    btn.disabled = !selectedFile || !selectedProductId;
}

function uploadImage() {
    if (!selectedFile || !selectedProductId) return;

    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    
    progressBar.style.display = 'block';
    document.getElementById('uploadBtn').disabled = true;

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        progressFill.style.width = progress + '%';
        progressFill.textContent = progress + '%';

        if (progress >= 100) {
            clearInterval(interval);
            
            // Store image in memory AND shared store
            const reader = new FileReader();
            reader.onload = (e) => {
                const product = productDatabase.products.find(p => p.id === selectedProductId);
                if (product) {
                    const imageData = e.target.result;
                    product.image = imageData;
                    
                    // *** SYNC TO SHARED STORE ***
                    console.log('🔄 Starting image sync for product:', selectedProductId);
                    
                    if (typeof updateProductImage !== 'undefined') {
                        updateProductImage(selectedProductId, imageData);
                        console.log('✅ Image synced to SharedImageStore');
                    } else {
                        console.error('❌ updateProductImage function not found!');
                    }
                    
                    // Also update directly in case helper function failed
                    if (typeof SharedImageStore !== 'undefined') {
                        SharedImageStore.setImage(selectedProductId, imageData);
                        console.log('✅ Image directly added to SharedImageStore');
                        
                        // Force broadcast
                        if (typeof CrossPageSync !== 'undefined') {
                            CrossPageSync.broadcast({
                                type: 'image-updated',
                                productId: selectedProductId,
                                imageData: imageData,
                                timestamp: Date.now()
                            });
                            console.log('📡 Broadcast sent to other pages');
                        }
                    }
                    
                    showNotification(`Image uploaded successfully for ${product.name}!`, 'success');
                    resetUploadForm();
                    renderProductGrid();
                    updateStats();
                }
            };
            reader.readAsDataURL(selectedFile);
        }
    }, 100);
}

function resetUploadForm() {
    selectedFile = null;
    selectedProductId = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('productSelect').value = '';
    document.getElementById('previewContainer').style.display = 'none';
    document.getElementById('progressBar').style.display = 'none';
    document.getElementById('uploadArea').innerHTML = `
        <div class="upload-icon">📁</div>
        <p><strong>Click to upload</strong> or drag and drop image here</p>
        <p>Supports JPG, PNG, WebP up to 5MB</p>
    `;
    updateUploadButton();
}

function populateProductSelect() {
    const select = document.getElementById('productSelect');
    select.innerHTML = '<option value="">Choose a product...</option>';
    
    productDatabase.products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} (${product.category})`;
        select.appendChild(option);
    });
}

function renderProductGrid() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';

    const filteredProducts = currentFilter === 'missing' 
        ? productDatabase.products.filter(p => !p.image)
        : productDatabase.products;

    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-preview';
        
        const hasImage = !!product.image;
        
        card.innerHTML = `
            ${hasImage ? 
                `<img src="${product.image}" alt="${product.name}">` :
                `<div class="placeholder">
                    <div>📦</div>
                    <div style="font-size: 12px; margin-top: 5px;">No Image</div>
                </div>`
            }
            <div class="product-name">${product.name}</div>
            <div class="product-category">${product.category}</div>
            <div class="status-indicator ${hasImage ? 'status-has-image' : 'status-missing-image'}">
                ${hasImage ? '✓ Has Image' : '✗ Missing Image'}
            </div>
            ${hasImage ? `<button class="delete-btn" onclick="deleteImage(${product.id})">Delete Image</button>` : ''}
        `;
        
        grid.appendChild(card);
    });
}

function deleteImage(productId) {
    if (confirm('Are you sure you want to delete this image?')) {
        const product = productDatabase.products.find(p => p.id === productId);
        if (product) {
            product.image = null;
            
            // *** SYNC DELETION TO SHARED STORE ***
            if (typeof deleteProductImage !== 'undefined') {
                deleteProductImage(productId);
                console.log('✅ Image deletion synced to SharedImageStore');
            }
            
            showNotification('Image deleted successfully', 'success');
            renderProductGrid();
            updateStats();
        }
    }
}

function updateStats() {
    const total = productDatabase.products.length;
    const withImages = productDatabase.products.filter(p => p.image).length;
    const missing = total - withImages;

    document.getElementById('totalProducts').textContent = total;
    document.getElementById('withImages').textContent = withImages;
    document.getElementById('missingImages').textContent = missing;
}

function refreshProductStatus() {
    // Re-sync from shared store
    syncImagesFromStore();
    renderProductGrid();
    updateStats();
    showNotification('Status refreshed!', 'success');
}

function filterMissing() {
    currentFilter = 'missing';
    renderProductGrid();
}

function filterAll() {
    currentFilter = 'all';
    renderProductGrid();
}

function showNotification(message, type) {
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, ADMIN_CONFIG.UI.NOTIFICATION_DURATION);
}

// Debug sync function
function debugSync() {
    console.log('=== SYNC DEBUG INFO ===');
    
    if (typeof SharedImageStore === 'undefined') {
        console.error('❌ SharedImageStore not loaded!');
        alert('ERROR: SharedImageStore not loaded!\n\nMake sure shared-image-store.js is loaded before image-management.js');
        return;
    }
    
    const stats = SharedImageStore.getStats();
    console.log('📊 Store Stats:', stats);
    
    if (typeof CrossPageSync === 'undefined') {
        console.error('❌ CrossPageSync not loaded!');
        alert('ERROR: CrossPageSync not loaded!');
        return;
    }
    
    console.log('📡 CrossPageSync:', CrossPageSync);
    
    if (typeof BroadcastChannel === 'undefined') {
        console.warn('⚠️ BroadcastChannel not supported in this browser');
        alert('WARNING: BroadcastChannel not supported!\n\nCross-page sync will not work.\nYou need to manually refresh the main page after uploading images.');
        return;
    }
    
    console.log('✅ All systems operational');
    
    // Send test broadcast
    CrossPageSync.broadcast({
        type: 'test',
        message: 'Test from admin',
        timestamp: Date.now()
    });
    
    const info = `
=== SYNC STATUS ===

✅ SharedImageStore: Loaded
✅ CrossPageSync: Active  
✅ BroadcastChannel: Supported
📊 Images in store: ${stats.totalImages}

Product IDs with images: ${Object.keys(stats.images).join(', ') || 'None'}

Test broadcast sent!
Check the main page console.
    `.trim();
    
    alert(info);
    console.log(info);
}