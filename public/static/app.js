// Global state
let cart = [];
let currentUser = null;

// Algolia configuration
const ALGOLIA_CONFIG = {
    appId: '64RBY11HKZ',
    apiKey: '2581cbcad24bee1434196b09b98ce5c4',
    indexName: 'dev_ecommerce'
};

let searchClient;
let search;

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initializeAlgolia();
});

function initializeApp() {
    loadCart();
    updateCartUI();
    checkAuthStatus();
}

// Initialize Algolia InstantSearch
function initializeAlgolia() {
    if (typeof algoliasearch === 'undefined' || typeof instantsearch === 'undefined') {
        console.error('Algolia libraries not loaded');
        setTimeout(() => {
            showMessage('Search service not available. Please refresh the page.', 'error');
        }, 2000);
        return;
    }

    try {
        // Initialize Algolia client
        searchClient = algoliasearch(ALGOLIA_CONFIG.appId, ALGOLIA_CONFIG.apiKey);
        console.log('Algolia search client initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Algolia client:', error);
        showMessage('Failed to initialize search service.', 'error');
        return;
    }
    
    // Initialize InstantSearch
    search = instantsearch({
        indexName: ALGOLIA_CONFIG.indexName,
        searchClient,
        routing: false
    });

    // Initialize page-specific searches
    const currentPath = window.location.pathname;
    
    if (currentPath === '/') {
        initializeHomePage();
    } else if (currentPath.startsWith('/collections/')) {
        const category = currentPath.split('/').pop();
        initializeCollectionPage(category);
    }
}

// Initialize home page Algolia search
function initializeHomePage() {
    // Featured Products Search Instance
    const featuredSearch = instantsearch({
        indexName: ALGOLIA_CONFIG.indexName,
        searchClient,
        routing: false
    });

    featuredSearch.addWidgets([
        instantsearch.widgets.configure({
            query: '',
            hitsPerPage: 8,
            facetFilters: []
        }),
        instantsearch.widgets.hits({
            container: '#featured-products',
            cssClasses: {
                root: 'ais-Hits',
                list: 'ais-Hits-list',
                item: 'ais-Hits-item'
            },
            templates: {
                item: (hit) => createAlgoliaProductCard(hit),
                empty: '<div class="col-span-full text-center py-8"><p class="text-gray-500">No products found.</p></div>'
            },
            transformItems(items) {
                // Clear loading indicator on first render
                if (items.length > 0) {
                    clearLoadingIndicator('#featured-products');
                }
                return items;
            }
        })
    ]);

    // New Arrivals Search Instance  
    const newArrivalsSearch = instantsearch({
        indexName: ALGOLIA_CONFIG.indexName,
        searchClient,
        routing: false
    });

    newArrivalsSearch.addWidgets([
        instantsearch.widgets.configure({
            query: '',
            hitsPerPage: 8,
            facetFilters: ['isNewProduct:true']
        }),
        instantsearch.widgets.hits({
            container: '#new-arrivals',
            cssClasses: {
                root: 'ais-Hits',
                list: 'ais-Hits-list',
                item: 'ais-Hits-item'
            },
            templates: {
                item: (hit) => createAlgoliaProductCard(hit),
                empty: '<div class="col-span-full text-center py-8"><p class="text-gray-500">No new arrivals found.</p></div>'
            },
            transformItems(items) {
                // Clear loading indicator on first render
                if (items.length > 0) {
                    clearLoadingIndicator('#new-arrivals');
                }
                return items;
            }
        })
    ]);

    featuredSearch.start();
    newArrivalsSearch.start();
}

// Initialize collection page Algolia search
function initializeCollectionPage(category) {
    const categoryFilters = {
        'men': ['category:men'],
        'women': ['category:women'],
        'shoes': ['type:shoes'],
        'apparel': ['type:clothing'],
        'new-arrivals': ['isNewProduct:true']
    };

    const filters = categoryFilters[category] || [];
    const containerId = `#collection-products-${category}`;
    
    if (!document.querySelector(containerId)) {
        console.warn(`Container ${containerId} not found`);
        return;
    }

    const collectionSearch = instantsearch({
        indexName: ALGOLIA_CONFIG.indexName,
        searchClient,
        routing: false
    });

    collectionSearch.addWidgets([
        instantsearch.widgets.configure({
            query: '',
            hitsPerPage: 12, // Reduced for better pagination
            facetFilters: filters
        }),
        instantsearch.widgets.hits({
            container: containerId,
            cssClasses: {
                root: 'ais-Hits',
                list: 'ais-Hits-list',
                item: 'ais-Hits-item'
            },
            templates: {
                item: (hit) => createAlgoliaProductCard(hit),
                empty: '<div class="col-span-full text-center py-12"><p class="text-gray-500 text-lg">No products found in this category.</p></div>'
            },
            transformItems(items) {
                // Clear loading indicator on first render
                if (items.length > 0) {
                    clearLoadingIndicator(containerId);
                }
                return items;
            }
        }),
        // Add stats widget to show product count
        instantsearch.widgets.stats({
            container: '#results-count',
            templates: {
                text: (data) => `${data.nbHits} products found`
            }
        }),
        // Add pagination widget
        instantsearch.widgets.pagination({
            container: `#pagination-${category}`,
            cssClasses: {
                root: 'ais-Pagination',
                list: 'flex justify-center items-center space-x-2 mt-8',
                item: 'ais-Pagination-item',
                link: 'px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors',
                selectedItem: 'ais-Pagination-item--selected',
                disabledItem: 'ais-Pagination-item--disabled opacity-50 cursor-not-allowed',
                firstPageItem: 'ais-Pagination-item--firstPage',
                lastPageItem: 'ais-Pagination-item--lastPage',
                previousPageItem: 'ais-Pagination-item--previousPage',
                nextPageItem: 'ais-Pagination-item--nextPage'
            },
            templates: {
                first: '«',
                previous: '‹',
                next: '›',
                last: '»'
            }
        })
    ]);

    collectionSearch.start();
}

// Store product data for cart access
window.algoliaProductCache = window.algoliaProductCache || {};

// Create Algolia product card HTML
function createAlgoliaProductCard(product) {
    // Cache the product data for cart functionality
    window.algoliaProductCache[product.objectID] = product;
    const mainImage = product.images && product.images[0] ? product.images[0].url : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop';
    const hasDiscount = product.originalPrice && product.originalPrice.value > product.price.value;
    const style = product.baseOptions && product.baseOptions[0] && product.baseOptions[0].selected ? product.baseOptions[0].selected.style : '';
    
    const newBadge = product.badges && product.badges.isNewProduct ? 
        '<span class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded">New</span>' : '';
    
    const saleBadge = product.badges && product.badges.isSale ? 
        '<span class="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 text-xs font-medium rounded">Sale</span>' : '';
    
    const originalPriceHtml = hasDiscount ? 
        `<span class="text-sm text-gray-500 line-through">${product.originalPrice.formattedValue}</span>` : '';

    const styleHtml = style ? 
        `<p class="text-gray-600 text-sm mb-3 line-clamp-1">${style}</p>` : '';

    return `
        <div class="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div class="relative">
                <img 
                    src="${mainImage}" 
                    alt="${product.name}"
                    class="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />
                ${newBadge}
                ${saleBadge}
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
                    <button 
                        onclick="quickViewAlgolia('${product.objectID}')"
                        class="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-4 py-2 rounded-md font-medium transition-opacity duration-300 hover:bg-gray-100"
                    >
                        Quick View
                    </button>
                </div>
            </div>
            
            <div class="p-4">
                <div class="mb-2">
                    <span class="text-xs text-gray-500 uppercase tracking-wide">${product.brand || 'Lawson Reinhardt'}</span>
                </div>
                <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">${product.name}</h3>
                ${styleHtml}
                
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-2">
                        <span class="text-lg font-bold text-gray-900">${product.price.formattedValue}</span>
                        ${originalPriceHtml}
                    </div>
                    
                    <div class="flex items-center space-x-1">
                        <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            ${product.category || product.type}
                        </span>
                    </div>
                </div>
                
                <button 
                    onclick="addAlgoliaToCart('${product.objectID}', '${product.sku}')"
                    class="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors font-medium"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    `;
}

// Authentication Functions
async function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    try {
        const response = await axios.post('/api/login', { email, password });
        if (response.data.success) {
            currentUser = response.data.user;
            
            // Save user data to localStorage
            if (currentUser.phone) {
                localStorage.setItem('user_phone', currentUser.phone);
            }
            
            // 🎯 Segment Identify Call - User Signs In
            if (typeof analytics !== 'undefined') {
                console.log('🎯 Tracking: User Signed In - Identify Call', { user_id: email });
                analytics.identify(email, {
                    email: email,
                    name: currentUser.name || null,
                    phone: currentUser.phone || null,
                    signed_in_at: new Date().toISOString()
                });
            }
            
            showMessage('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        }
    } catch (error) {
        showMessage('Invalid credentials. Please try again.', 'error');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match!', 'error');
        return;
    }
    
    try {
        const response = await axios.post('/api/register', { name, email, password });
        if (response.data.success) {
            currentUser = response.data.user;
            
            // Save account creation timestamp
            const createdAt = new Date().toISOString();
            localStorage.setItem('user_created_at', createdAt);
            
            // 🎯 Segment Identify Call - User Creates Account
            if (typeof analytics !== 'undefined') {
                console.log('🎯 Tracking: User Created Account - Identify Call', { 
                    user_id: email, 
                    traits: { full_name: name, email: email } 
                });
                analytics.identify(email, {
                    full_name: name,
                    email: email,
                    created_at: createdAt,
                    account_type: 'registered'
                });
            }
            
            showMessage('Account created successfully!', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        }
    } catch (error) {
        showMessage(error.response?.data?.message || 'Registration failed!', 'error');
    }
}

async function logout() {
    try {
        // 🎯 Track sign out event before clearing user data
        if (typeof analytics !== 'undefined' && currentUser) {
            console.log('🎯 Tracking: User Signed Out', { user_email: currentUser.email });
            analytics.track('User Signed Out', {
                user_email: currentUser.email,
                signed_out_at: new Date().toISOString()
            });
        }
        
        await axios.post('/api/logout');
        currentUser = null;
        cart = [];
        updateCartUI();
        showMessage('Logged out successfully!', 'success');
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
    } catch (error) {
        showMessage('Logout failed!', 'error');
    }
}

function checkAuthStatus() {
    // This would normally check with the server, but for demo purposes,
    // we'll just check if we have user data
    const userMenuButton = document.querySelector('[onclick="toggleUserMenu()"]');
    const userMenu = document.getElementById('userMenu');
    
    if (currentUser && userMenuButton && userMenu) {
        userMenuButton.style.display = 'block';
    }
}

// Cart Functions
function loadCart() {
    const savedCart = localStorage.getItem('fashionstore_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

function saveCart() {
    localStorage.setItem('fashionstore_cart', JSON.stringify(cart));
}

async function addToCart(productId) {
    try {
        // For demo purposes, we'll use default size and color
        const response = await axios.get(`/api/products/${productId}`);
        const product = response.data.product;
        
        if (!product) {
            showMessage('Product not found!', 'error');
            return;
        }
        
        // Check if product already exists in cart
        const existingItem = cart.find(item => 
            item.productId === productId && 
            item.size === product.sizes[0] && 
            item.color === product.colors[0]
        );
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                productId: productId,
                quantity: 1,
                size: product.sizes[0],
                color: product.colors[0],
                product: product
            });
        }
        
        saveCart();
        updateCartUI();
        showMessage(`${product.name} added to cart!`, 'success');
        
        // Segment Analytics: Track Product Added (legacy cart)
        if (typeof analytics !== 'undefined') {
            analytics.track('Product Added', {
                product_id: productId,
                name: product.name,
                price: product.price,
                size: product.sizes[0],
                color: product.colors[0]
            });
        }
        
        // Also update server cart if user is logged in
        if (currentUser) {
            await axios.post('/api/cart', {
                productId: productId,
                quantity: 1,
                size: product.sizes[0],
                color: product.colors[0]
            });
        }
    } catch (error) {
        showMessage('Failed to add item to cart!', 'error');
    }
}

function removeFromCart(productId) {
    // Find the item to track before removing
    const itemToRemove = cart.find(item => item.productId === productId);
    
    if (itemToRemove && typeof analytics !== 'undefined') {
        console.log('🎯 Tracking: Product Removed From Cart', {
            product_id: productId,
            name: itemToRemove.product.name,
            price: itemToRemove.product.price,
            quantity: itemToRemove.quantity,
            size: itemToRemove.size,
            color: itemToRemove.color
        });
        
        analytics.track('Product Removed From Cart', {
            product_id: productId,
            name: itemToRemove.product.name,
            price: itemToRemove.product.price,
            quantity: itemToRemove.quantity,
            size: itemToRemove.size,
            color: itemToRemove.color,
            sku: itemToRemove.product.sku
        });
    }
    
    cart = cart.filter(item => item.productId !== productId);
    saveCart();
    updateCartUI();
    showMessage('Item removed from cart!', 'success');
}

function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.productId === productId);
    if (item) {
        const oldQuantity = item.quantity;
        
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            saveCart();
            updateCartUI();
            
            // Track quantity change (if analytics is available)
            if (typeof analytics !== 'undefined' && newQuantity !== oldQuantity) {
                analytics.track('Cart Item Quantity Changed', {
                    product_id: productId,
                    name: item.product.name,
                    price: item.product.price,
                    old_quantity: oldQuantity,
                    new_quantity: newQuantity,
                    size: item.size,
                    color: item.color,
                    sku: item.product.sku
                });
            }
        }
    }
}

function updateCartUI() {
    const cartBadge = document.getElementById('cartBadge');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cartBadge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems > 0) {
            cartBadge.textContent = totalItems;
            cartBadge.classList.remove('hidden');
        } else {
            cartBadge.classList.add('hidden');
        }
    }
    
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="text-gray-500 text-center py-4">Your cart is empty</p>';
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="flex items-center space-x-3 p-3 border-b">
                    <img src="${item.product.image}" alt="${item.product.name}" class="w-16 h-16 object-cover rounded">
                    <div class="flex-1">
                        <h4 class="font-medium text-sm">${item.product.name}</h4>
                        <p class="text-xs text-gray-500">${item.size}, ${item.color}</p>
                        <div class="flex items-center mt-1 space-x-2">
                            <button onclick="updateCartQuantity('${item.productId}', ${item.quantity - 1})" 
                                class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300">-</button>
                            <span class="text-sm">${item.quantity}</span>
                            <button onclick="updateCartQuantity('${item.productId}', ${item.quantity + 1})" 
                                class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300">+</button>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-medium text-sm">$${(item.product.price * item.quantity).toFixed(2)}</p>
                        <button onclick="removeFromCart('${item.productId}')" 
                            class="text-red-500 hover:text-red-700 text-xs mt-1">Remove</button>
                    </div>
                </div>
            `).join('');
        }
    }
    
    if (cartTotal) {
        const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        cartTotal.textContent = `$${total.toFixed(2)}`;
    }
}

// UI Functions
function toggleCart() {
    const cartOverlay = document.getElementById('cartOverlay');
    const cartSidebar = document.getElementById('cartSidebar');
    
    if (cartOverlay && cartSidebar) {
        const isHidden = cartOverlay.classList.contains('hidden');
        
        if (isHidden) {
            cartOverlay.classList.remove('hidden');
            cartSidebar.classList.remove('translate-x-full');
        } else {
            cartOverlay.classList.add('hidden');
            cartSidebar.classList.add('translate-x-full');
        }
    }
}

function toggleUserMenu() {
    const userMenu = document.getElementById('userMenu');
    if (userMenu) {
        userMenu.classList.toggle('hidden');
    }
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}

function quickView(productId) {
    // For demo purposes, just redirect to the collection page
    showMessage('Quick view feature coming soon!', 'info');
}

// Quick View Modal Functions
function quickViewAlgolia(objectID) {
    const product = window.algoliaProductCache[objectID];
    if (!product) {
        showMessage('Product details not available!', 'error');
        return;
    }
    
    // Segment Analytics: Track Product Viewed
    if (typeof analytics !== "undefined") {
        const eventData = {
            product_id: objectID,
            sku: product.sku,
            name: product.name,
            price: product.price.value,
            category: product.category,
            brand: product.brand || "Lawson Reinhardt"
        };
        console.log("🎯 Tracking: Product Viewed", eventData);
        analytics.track("Product Viewed", eventData);
    }

    openQuickView(product);
}

function openQuickView(product) {
    const modal = document.getElementById('quickViewModal');
    const overlay = document.getElementById('quickViewOverlay');
    const content = document.getElementById('quickViewContent');
    
    if (!modal || !overlay || !content) {
        showMessage('Quick view not available!', 'error');
        return;
    }
    
    // Generate the product detail HTML
    content.innerHTML = createQuickViewContent(product);
    
    // Show modal with animation
    overlay.classList.remove('hidden');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeQuickView() {
    const modal = document.getElementById('quickViewModal');
    const overlay = document.getElementById('quickViewOverlay');
    
    if (modal && overlay) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.classList.add('hidden');
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    }
}

function createQuickViewContent(product) {
    const mainImage = product.images && product.images[0] ? product.images[0].url : '';
    const hasDiscount = product.originalPrice && product.originalPrice.value > product.price.value;
    const style = product.baseOptions && product.baseOptions[0] && product.baseOptions[0].selected 
        ? product.baseOptions[0].selected.style 
        : '';
    
    // Generate size options (mock data for demo)
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const sizeOptions = sizes.map(size => 
        `<button class="size-option px-3 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100" 
                 onclick="selectSize('${size}')" data-size="${size}">${size}</button>`
    ).join('');
    
    return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Product Images -->
            <div class="space-y-4">
                <div class="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img id="mainProductImage" 
                         src="${mainImage}" 
                         alt="${product.name}"
                         class="product-image-main w-full h-full object-cover" />
                </div>
                
                <!-- Additional images (if available) -->
                ${product.images && product.images.length > 1 ? `
                    <div class="grid grid-cols-4 gap-2">
                        ${product.images.slice(0, 4).map((img, index) => `
                            <button class="product-image-thumbnail aspect-square rounded-md overflow-hidden bg-gray-100 border-2 border-transparent ${index === 0 ? 'active' : ''}"
                                    onclick="changeMainImage('${img.url}', this)">
                                <img src="${img.url}" alt="${product.name}" class="w-full h-full object-cover" />
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            
            <!-- Product Details -->
            <div class="space-y-6">
                <!-- Brand and Name -->
                <div>
                    <p class="text-sm font-medium text-gray-500 uppercase tracking-wide">${product.brand || 'Lawson Reinhardt'}</p>
                    <h1 class="text-2xl font-bold text-gray-900 mt-1">${product.name}</h1>
                    ${style ? `<p class="text-gray-600 mt-1">${style}</p>` : ''}
                </div>
                
                <!-- Badges -->
                <div class="flex space-x-2">
                    ${product.isNewProduct ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">New Arrival</span>' : ''}
                    ${product.isSaleProduct ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Sale</span>' : ''}
                </div>
                
                <!-- Price -->
                <div class="flex items-center space-x-3">
                    <span class="text-3xl font-bold text-gray-900">${product.price.formattedValue}</span>
                    ${hasDiscount ? `<span class="text-xl text-gray-500 line-through">${product.originalPrice.formattedValue}</span>` : ''}
                    ${hasDiscount ? `<span class="text-sm font-medium text-green-600">Save $${(product.originalPrice.value - product.price.value).toFixed(2)}</span>` : ''}
                </div>
                
                <!-- Product Type & Category -->
                <div class="flex space-x-4 text-sm text-gray-600">
                    <span><strong>Category:</strong> ${product.category}</span>
                    <span><strong>Type:</strong> ${product.type}</span>
                </div>
                
                <!-- Size Selection -->
                <div class="space-y-3">
                    <h3 class="text-sm font-medium text-gray-900">Size</h3>
                    <div class="grid grid-cols-6 gap-2" id="sizeSelection">
                        ${sizeOptions}
                    </div>
                </div>
                
                <!-- Quantity Selection -->
                <div class="space-y-3">
                    <h3 class="text-sm font-medium text-gray-900">Quantity</h3>
                    <div class="flex items-center space-x-3 quantity-selector">
                        <button onclick="updateQuickViewQuantity(-1)" 
                                class="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md hover:bg-gray-100">
                            <i class="fas fa-minus text-sm"></i>
                        </button>
                        <span id="quickViewQuantity" class="px-3 py-1 text-lg font-medium">1</span>
                        <button onclick="updateQuickViewQuantity(1)" 
                                class="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md hover:bg-gray-100">
                            <i class="fas fa-plus text-sm"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Add to Cart Button -->
                <div class="space-y-3">
                    <button onclick="addToCartFromQuickView('${product.objectID}', '${product.sku}')" 
                            class="w-full bg-black text-white py-3 px-6 rounded-md font-medium hover:bg-gray-800 transition-colors">
                        <i class="fas fa-shopping-cart mr-2"></i>
                        Add to Cart
                    </button>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <button class="border border-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors">
                            <i class="fas fa-heart mr-2"></i>
                            Wishlist
                        </button>
                        <button class="border border-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors">
                            <i class="fas fa-share-alt mr-2"></i>
                            Share
                        </button>
                    </div>
                </div>
                
                <!-- Product Info -->
                <div class="border-t pt-6 space-y-4">
                    <div class="text-sm">
                        <h4 class="font-medium text-gray-900 mb-2">Product Details</h4>
                        <ul class="space-y-1 text-gray-600">
                            <li><strong>SKU:</strong> ${product.sku}</li>
                            <li><strong>Product ID:</strong> ${product.objectID}</li>
                            ${product.baseProduct ? `<li><strong>Base Product:</strong> ${product.baseProduct}</li>` : ''}
                        </ul>
                    </div>
                    
                    <div class="text-sm">
                        <h4 class="font-medium text-gray-900 mb-2">Shipping & Returns</h4>
                        <ul class="space-y-1 text-gray-600">
                            <li>• Free shipping on orders over $50</li>
                            <li>• 30-day return policy</li>
                            <li>• Express delivery available</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Quick View Helper Functions
function changeMainImage(imageUrl, thumbnail) {
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) {
        mainImage.src = imageUrl;
    }
    
    // Update active thumbnail
    const thumbnails = document.querySelectorAll('.product-image-thumbnail');
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    thumbnail.classList.add('active');
}

function selectSize(size) {
    const sizeOptions = document.querySelectorAll('.size-option');
    sizeOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.size === size) {
            option.classList.add('selected');
        }
    });
}

function updateQuickViewQuantity(change) {
    const quantityElement = document.getElementById('quickViewQuantity');
    if (quantityElement) {
        let currentQuantity = parseInt(quantityElement.textContent);
        currentQuantity = Math.max(1, currentQuantity + change);
        quantityElement.textContent = currentQuantity;
    }
}

function addToCartFromQuickView(objectID, sku) {
    const selectedSize = document.querySelector('.size-option.selected');
    const quantity = parseInt(document.getElementById('quickViewQuantity').textContent) || 1;
    
    if (!selectedSize) {
        showMessage('Please select a size first!', 'error');
        return;
    }
    
    // Add to cart with selected options
    addAlgoliaToCartWithOptions(objectID, sku, {
        size: selectedSize.dataset.size,
        quantity: quantity
    });
    
    // Close modal after adding to cart
    setTimeout(() => {
        closeQuickView();
    }, 1000);
}

function addAlgoliaToCartWithOptions(objectID, sku, options = {}) {
    const product = window.algoliaProductCache[objectID];
    if (!product) {
        showMessage('Product not found!', 'error');
        return;
    }
    
    const size = options.size || 'One Size';
    const quantity = options.quantity || 1;
    
    // Check if product already exists in cart with same size
    const existingItem = cart.find(item => 
        item.productId === objectID && item.size === size
    );
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            productId: objectID,
            quantity: quantity,
            size: size,
            color: product.baseOptions && product.baseOptions[0] && product.baseOptions[0].selected 
                ? product.baseOptions[0].selected.style 
                : 'Default',
            product: {
                id: objectID,
                name: product.name,
                price: product.price.value,
                image: product.images && product.images[0] ? product.images[0].url : '',
                sku: sku
            }
        });
    }
    
    saveCart();
    updateCartUI();
    showMessage(`${product.name} (${size}) added to cart!`, 'success');
    
    // Segment Analytics: Track Product Added from Quick View
    if (typeof analytics !== 'undefined') {
        analytics.track('Product Added', {
            product_id: objectID,
            sku: sku,
            name: product.name,
            price: product.price.value,
            quantity: quantity,
            size: size,
            category: product.category,
            brand: product.brand || 'Lawson Reinhardt',
            from_quick_view: true
        });
    }
}

// Close modal on Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeQuickView();
    }
});

async function addAlgoliaToCart(objectID, sku) {
    try {
        let result;
        
        // First try to get from cache
        if (window.algoliaProductCache && window.algoliaProductCache[objectID]) {
            result = window.algoliaProductCache[objectID];
            console.log('Using cached product data for', objectID);
        } 
        // Fallback to Algolia API if cache miss and client is available
        else if (searchClient && typeof searchClient.initIndex === 'function') {
            console.log('Fetching product from Algolia API for', objectID);
            const index = searchClient.initIndex(ALGOLIA_CONFIG.indexName);
            result = await index.getObject(objectID);
        } 
        // If neither cache nor API available, show error
        else {
            console.error('No product data available for', objectID);
            showMessage('Product data not available. Please refresh the page.', 'error');
            return;
        }
        
        if (!result) {
            showMessage('Product not found!', 'error');
            return;
        }
        
        // Check if product already exists in cart
        const existingItem = cart.find(item => 
            item.productId === objectID
        );
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                productId: objectID,
                quantity: 1,
                size: 'One Size', // Default size for Algolia products
                color: result.baseOptions && result.baseOptions[0] && result.baseOptions[0].selected 
                    ? result.baseOptions[0].selected.style 
                    : 'Default',
                product: {
                    id: objectID,
                    name: result.name,
                    price: result.price.value,
                    image: result.images && result.images[0] ? result.images[0].url : '',
                    sku: sku
                }
            });
        }
        
        saveCart();
        updateCartUI();
        showMessage(`${result.name} added to cart!`, 'success');
        
        // Segment Analytics: Track Product Added
        if (typeof analytics !== 'undefined') {
            analytics.track('Product Added', {
                product_id: objectID,
                sku: sku,
                name: result.name,
                price: result.price.value,
                category: result.category,
                brand: result.brand || 'Lawson Reinhardt'
            });
        }
        
    } catch (error) {
        console.error('Error adding Algolia product to cart:', error);
        console.error('ObjectID:', objectID);
        console.error('SKU:', sku);
        console.error('SearchClient status:', !!searchClient);
        
        // Provide more specific error messages
        if (error.message && error.message.includes('Cannot read properties')) {
            showMessage('Search service initialization error. Please refresh the page.', 'error');
        } else if (error.status === 404) {
            showMessage('Product not found in catalog.', 'error');
        } else if (error.status === 403) {
            showMessage('Access denied. Please check API key.', 'error');
        } else {
            showMessage(`Failed to add item to cart: ${error.message || 'Unknown error'}`, 'error');
        }
    }
}

function goToCheckout() {
    if (cart.length === 0) {
        showMessage('Your cart is empty!', 'error');
        return;
    }
    window.location.href = '/checkout';
}

// Checkout Functions
async function handleCheckout(event) {
    event.preventDefault();
    
    if (cart.length === 0) {
        showMessage('Your cart is empty!', 'error');
        return;
    }
    
    const formData = new FormData(event.target);
    const orderData = {
        shipping: {
            name: formData.get('name'),
            address: formData.get('address'),
            city: formData.get('city'),
            zipCode: formData.get('zipCode'),
            country: formData.get('country')
        },
        payment: {
            cardNumber: formData.get('cardNumber'),
            expiry: formData.get('expiry'),
            cvv: formData.get('cvv'),
            cardName: formData.get('cardName')
        },
        items: cart
    };
    
    try {
        const response = await axios.post('/api/checkout', orderData);
        if (response.data.success) {
            cart = [];
            saveCart();
            updateCartUI();
            showMessage(`Order #${response.data.orderId} placed successfully!`, 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        }
    } catch (error) {
        showMessage('Checkout failed. Please try again.', 'error');
    }
}

// Utility Functions
function showMessage(message, type = 'info') {
    // Remove any existing message
    const existingMessage = document.getElementById('flashMessage');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageEl = document.createElement('div');
    messageEl.id = 'flashMessage';
    messageEl.className = `fixed top-4 right-4 px-6 py-3 rounded-md shadow-lg z-50 transform transition-transform duration-300 ${getMessageClasses(type)}`;
    messageEl.textContent = message;
    
    document.body.appendChild(messageEl);
    
    // Animate in
    setTimeout(() => {
        messageEl.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        messageEl.classList.add('translate-x-full');
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 300);
    }, 3000);
}

function getMessageClasses(type) {
    const baseClasses = 'translate-x-full';
    switch (type) {
        case 'success':
            return `${baseClasses} bg-green-500 text-white`;
        case 'error':
            return `${baseClasses} bg-red-500 text-white`;
        case 'warning':
            return `${baseClasses} bg-yellow-500 text-white`;
        case 'info':
        default:
            return `${baseClasses} bg-blue-500 text-white`;
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    const userMenu = document.getElementById('userMenu');
    const userButton = document.querySelector('[onclick="toggleUserMenu()"]');
    
    if (userMenu && !userMenu.contains(event.target) && !userButton.contains(event.target)) {
        userMenu.classList.add('hidden');
    }
});

// Initialize cart on page load
window.addEventListener('load', function() {
    updateCartUI();
});
// Track navigation link clicks
function trackHeaderNavigation(linkText, url) {
    if (typeof analytics !== 'undefined') {
        const eventData = {
            link_text: linkText,
            link_url: url
        };
        console.log('🎯 Tracking: Header Navigation Link Clicked', eventData);
        analytics.track('Header Navigation Link Clicked', eventData);
    }
}

// Test analytics function
function testAnalytics() {
    console.log('🧪 Testing Segment Analytics...');
    console.log('Analytics object:', typeof analytics);
    console.log('Analytics methods:', analytics);
    
    if (typeof analytics !== 'undefined' && analytics.track) {
        console.log('🎯 Sending test track event...');
        analytics.track('Test Event', {
            test_property: 'test_value',
            timestamp: new Date().toISOString()
        });
        console.log('✅ Test event sent');
    } else {
        console.log('❌ Analytics not available');
    }
}

// Make function globally available
window.testAnalytics = testAnalytics;

// Helper function to clear loading indicators
function clearLoadingIndicator(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (container) {
        // Find and remove loading indicators
        const loadingElements = container.querySelectorAll('.animate-spin, [class*="Loading"], [class*="loading"]');
        loadingElements.forEach(el => {
            const parent = el.closest('.col-span-full, .text-center');
            if (parent && parent.textContent.includes('Loading')) {
                parent.remove();
            }
        });
    }
}

// Checkout Functions
async function handleShippingSubmit(event) {
    event.preventDefault();
    
    // Validate cart before proceeding
    if (cart.length === 0) {
        showMessage('Your cart is empty!', 'error');
        window.location.href = '/';
        return;
    }
    
    const formData = new FormData(event.target);
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'country'];
    const missingFields = [];
    
    for (const field of requiredFields) {
        if (!formData.get(field)) {
            missingFields.push(field);
        }
    }
    
    if (missingFields.length > 0) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    // Store shipping information in localStorage
    const shippingData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        address2: formData.get('address2') || '',
        city: formData.get('city'),
        state: formData.get('state'),
        zipCode: formData.get('zipCode'),
        country: formData.get('country')
    };
    
    localStorage.setItem('fashionstore_shipping', JSON.stringify(shippingData));
    
    // 🎯 Segment Identify Call - Continue to Payment with all user input fields
    if (typeof analytics !== 'undefined') {
        const fullName = `${shippingData.firstName} ${shippingData.lastName}`.trim();
        
        console.log('🎯 Tracking: Continue to Payment - Identify Call', {
            user_id: shippingData.email,
            traits: {
                full_name: fullName,
                email: shippingData.email,
                phone: shippingData.phone,
                address: {
                    street: `${shippingData.address}${shippingData.address2 ? ' ' + shippingData.address2 : ''}`.trim(),
                    city: shippingData.city,
                    state: shippingData.state,
                    zip: shippingData.zipCode,
                    country: shippingData.country
                }
            }
        });
        
        analytics.identify(shippingData.email, {
            full_name: fullName,
            first_name: shippingData.firstName,
            last_name: shippingData.lastName,
            email: shippingData.email,
            phone: shippingData.phone,
            address: {
                street: `${shippingData.address}${shippingData.address2 ? ' ' + shippingData.address2 : ''}`.trim(),
                city: shippingData.city,
                state: shippingData.state,
                zip: shippingData.zipCode,
                country: shippingData.country
            },
            shipping_completed_at: new Date().toISOString()
        });
    }
    
    // Track checkout step with Segment
    if (typeof analytics !== 'undefined') {
        analytics.track('Checkout Step Completed', {
            step: 1,
            step_name: 'Shipping Information',
            cart_total: cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
            cart_items: cart.length
        });
    }
    
    showMessage('Shipping information saved!', 'success');
    
    // Redirect to payment page
    setTimeout(() => {
        window.location.href = '/checkout/payment';
    }, 1000);
}

async function handlePaymentSubmit(event) {
    event.preventDefault();
    
    // Validate cart before proceeding
    if (cart.length === 0) {
        showMessage('Your cart is empty!', 'error');
        window.location.href = '/';
        return;
    }
    
    const formData = new FormData(event.target);
    
    // Validate required payment fields
    const requiredFields = ['cardNumber', 'cardName', 'expiry', 'cvv'];
    const missingFields = [];
    
    for (const field of requiredFields) {
        if (!formData.get(field)) {
            missingFields.push(field);
        }
    }
    
    if (missingFields.length > 0) {
        showMessage('Please fill in all payment information', 'error');
        return;
    }
    
    // Get shipping information
    const shippingData = localStorage.getItem('fashionstore_shipping');
    if (!shippingData) {
        showMessage('Shipping information missing. Please go back and complete shipping step.', 'error');
        window.location.href = '/checkout/shipping';
        return;
    }
    
    // Create order data
    const orderData = {
        shipping: JSON.parse(shippingData),
        payment: {
            cardNumber: formData.get('cardNumber'),
            cardName: formData.get('cardName'),
            expiry: formData.get('expiry'),
            cvv: formData.get('cvv'),
            sameAsShipping: formData.get('sameAsShipping') === 'on'
        },
        items: cart,
        totals: {
            subtotal: cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
            tax: cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) * 0.09,
            total: cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) * 1.09
        }
    };
    
    try {
        showMessage('Processing your order...', 'info');
        
        // Submit order to server
        const response = await axios.post('/api/checkout', orderData);
        
        if (response.data.success) {
            // Track successful order with Segment
            if (typeof analytics !== 'undefined') {
                analytics.track('Order Completed', {
                    order_id: response.data.orderId,
                    total: orderData.totals.total,
                    subtotal: orderData.totals.subtotal,
                    tax: orderData.totals.tax,
                    products: cart.map(item => ({
                        product_id: item.productId,
                        name: item.product.name,
                        price: item.product.price,
                        quantity: item.quantity,
                        sku: item.product.sku
                    }))
                });
            }
            
            // Store order information for confirmation page
            localStorage.setItem('fashionstore_order', JSON.stringify({
                orderId: response.data.orderId,
                ...orderData,
                orderDate: new Date().toISOString()
            }));
            
            // Clear cart and shipping data
            cart = [];
            saveCart();
            localStorage.removeItem('fashionstore_shipping');
            
            showMessage('Order placed successfully!', 'success');
            
            // Redirect to order confirmation
            setTimeout(() => {
                window.location.href = `/checkout/confirmation?order=${response.data.orderId}`;
            }, 1500);
        }
    } catch (error) {
        console.error('Checkout error:', error);
        showMessage('Failed to process your order. Please try again.', 'error');
        
        // Track failed order with Segment
        if (typeof analytics !== 'undefined') {
            analytics.track('Order Failed', {
                error: error.message,
                total: orderData.totals.total,
                cart_items: cart.length
            });
        }
    }
}

// Profile Panel Functions
function toggleProfilePanel() {
    const overlay = document.getElementById('profileOverlay');
    const panel = document.getElementById('profilePanel');
    
    if (!overlay || !panel) return;
    
    const isHidden = overlay.classList.contains('hidden');
    
    if (isHidden) {
        // Show panel
        overlay.classList.remove('hidden');
        setTimeout(() => {
            panel.classList.remove('translate-y-full', 'opacity-0');
        }, 10);
        
        // Load profile data if not already loaded
        if (!panel.dataset.loaded) {
            loadSegmentProfile();
        }
    } else {
        // Hide panel
        panel.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 300);
    }
}

function switchProfileTab(tabName) {
    // Update tab buttons
    const tabs = document.querySelectorAll('.profile-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active', 'text-blue-600', 'border-blue-600');
        tab.classList.add('text-gray-500', 'border-transparent');
    });
    
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('active', 'text-blue-600', 'border-blue-600');
        activeTab.classList.remove('text-gray-500', 'border-transparent');
    }
    
    // Show/hide content
    const contents = document.querySelectorAll('.profile-content');
    contents.forEach(content => content.classList.add('hidden'));
    
    const activeContent = document.getElementById(`${tabName}Content`);
    if (activeContent) {
        activeContent.classList.remove('hidden');
    }
}

// Segment Profile API Integration (using server proxy)
const SEGMENT_CONFIG = {
    PROXY_BASE_URL: '/api/profile'
};

async function loadSegmentProfile() {
    const panel = document.getElementById('profilePanel');
    const loading = document.getElementById('profileLoading');
    const tabs = document.getElementById('profileTabs');
    const error = document.getElementById('profileError');
    
    if (!panel) return;
    
    // Show loading state
    loading.classList.remove('hidden');
    tabs.classList.add('hidden');
    error.classList.add('hidden');
    
    try {
        // Get anonymous_id from localStorage with key 'ajs_anonymous_id'
        let anonymousId = localStorage.getItem('ajs_anonymous_id');
        
        // Remove quotes if present (Segment stores with quotes)
        if (anonymousId) {
            anonymousId = anonymousId.replace(/"/g, '');
        }
        
        // If not in localStorage, try to get from analytics object
        if (!anonymousId && typeof analytics !== 'undefined' && analytics.user) {
            try {
                anonymousId = analytics.user().anonymousId();
            } catch (e) {
                console.warn('Could not get anonymous_id from analytics:', e);
            }
        }
        
        // If still no anonymous_id, generate a temporary one
        if (!anonymousId) {
            anonymousId = generateAnonymousId();
            localStorage.setItem('ajs_anonymous_id', `"${anonymousId}"`); // Store with quotes like Segment does
            console.warn('No existing anonymous_id found, generated new one:', anonymousId);
        }
        
        console.log('Loading profile for anonymous_id:', anonymousId);
        
        // Show debug info
        const debugElement = document.getElementById('debugAnonymousId');
        if (debugElement) {
            debugElement.textContent = anonymousId;
        }
        
        // Fetch profile data from Segment Profile API
        const profileData = await fetchSegmentProfile(anonymousId);
        
        // Populate the tabs with data
        populateProfileData(profileData);
        
        // Show tabs and hide loading
        loading.classList.add('hidden');
        tabs.classList.remove('hidden');
        
        // Mark as loaded
        panel.dataset.loaded = 'true';
        
        // Track profile view
        if (typeof analytics !== 'undefined') {
            analytics.track('Profile Panel Viewed', {
                anonymous_id: anonymousId,
                has_traits: !!profileData.traits && Object.keys(profileData.traits).length > 0,
                has_events: !!profileData.events && profileData.events.length > 0
            });
        }
        
    } catch (err) {
        console.error('Failed to load Segment profile:', err);
        
        // Show error state
        loading.classList.add('hidden');
        error.classList.remove('hidden');
        
        // Show error details
        const errorDetails = document.getElementById('errorDetails');
        if (errorDetails) {
            errorDetails.textContent = err.message;
        }
        
        // Track error
        if (typeof analytics !== 'undefined') {
            analytics.track('Profile Load Error', {
                error: err.message
            });
        }
    }
}

function generateAnonymousId() {
    return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }) + '-' + Date.now().toString(36);
}

async function fetchSegmentProfile(anonymousId) {
    const traitsUrl = `${SEGMENT_CONFIG.PROXY_BASE_URL}/${anonymousId}/traits`;
    const eventsUrl = `${SEGMENT_CONFIG.PROXY_BASE_URL}/${anonymousId}/events`;
    const identitiesUrl = `${SEGMENT_CONFIG.PROXY_BASE_URL}/${anonymousId}/identities`;
    
    console.log('Fetching profile from proxy:', traitsUrl);
    console.log('Using anonymousId:', anonymousId);
    
    try {
        // Fetch traits data
        const traitsResponse = await fetch(traitsUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Traits response status:', traitsResponse.status);
        
        if (!traitsResponse.ok) {
            const errorData = await traitsResponse.json();
            console.error('Traits API Error:', traitsResponse.status, errorData);
            throw new Error(errorData.error || `Profile API error: ${traitsResponse.status}`);
        }
        
        const traitsData = await traitsResponse.json();
        console.log('Traits API Response:', traitsData);
        
        // Fetch events data
        let eventsData = { data: [] };
        try {
            const eventsResponse = await fetch(eventsUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Events response status:', eventsResponse.status);
            
            if (eventsResponse.ok) {
                eventsData = await eventsResponse.json();
                console.log('Events API Response:', eventsData);
            } else {
                console.warn('Events API Error:', eventsResponse.status);
            }
        } catch (eventsError) {
            console.warn('Could not fetch events:', eventsError);
        }
        
        // Fetch identities data
        let identitiesData = { external_ids: [] };
        try {
            const identitiesResponse = await fetch(identitiesUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Identities response status:', identitiesResponse.status);
            
            if (identitiesResponse.ok) {
                identitiesData = await identitiesResponse.json();
                console.log('Identities API Response:', identitiesData);
            } else {
                console.warn('Identities API Error:', identitiesResponse.status);
            }
        } catch (identitiesError) {
            console.warn('Could not fetch identities:', identitiesError);
        }
        
        // Combine the data
        const profileData = {
            ...traitsData,
            events: eventsData.data || [],
            external_ids: identitiesData.external_ids || []
        };
        
        return profileData;
        
    } catch (error) {
        console.error('Profile fetch error:', error);
        throw error;
    }
}

function populateProfileData(profileData) {
    // Update profile panel title with user's full name if available
    const profileTitle = document.getElementById('profileTitle');
    if (profileTitle) {
        const traits = profileData.traits || {};
        if (traits.full_name) {
            profileTitle.textContent = `${traits.full_name}'s Profile`;
        } else if (traits.name) {
            profileTitle.textContent = `${traits.name}'s Profile`;
        } else {
            profileTitle.textContent = 'Segment Profile';
        }
    }
    
    populateTraits(profileData.traits || {});
    populateEvents(profileData.events || []);
    populateIdentities(profileData);
}

function populateTraits(traits) {
    const traitsContent = document.getElementById('traitsContent');
    if (!traitsContent) return;
    
    if (Object.keys(traits).length === 0) {
        traitsContent.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">No traits found</p>';
        return;
    }
    
    const traitsHtml = Object.entries(traits)
        .map(([key, value]) => {
            let displayValue = value;
            if (typeof value === 'object') {
                displayValue = JSON.stringify(value, null, 2);
            } else if (typeof value === 'boolean') {
                displayValue = value ? 'true' : 'false';
            }
            
            return `
                <div class="bg-gray-50 rounded p-3">
                    <div class="flex justify-between items-start">
                        <span class="text-sm font-medium text-gray-700 capitalize">${key.replace(/_/g, ' ')}</span>
                        <span class="text-sm text-gray-900 ml-2 break-all">${displayValue}</span>
                    </div>
                </div>
            `;
        })
        .join('');
    
    traitsContent.innerHTML = traitsHtml;
}

function populateEvents(events) {
    const eventsContent = document.getElementById('eventsContent');
    if (!eventsContent) return;
    
    if (events.length === 0) {
        eventsContent.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">No recent events found</p>';
        return;
    }
    
    // Sort events by timestamp (most recent first)
    const sortedEvents = events
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 20); // Show only recent 20 events
    
    const eventsHtml = sortedEvents
        .map(event => {
            const timestamp = new Date(event.timestamp).toLocaleString();
            const properties = event.properties || {};
            
            return `
                <div class="border border-gray-200 rounded p-3">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-sm font-medium text-gray-900">${event.event}</span>
                        <span class="text-xs text-gray-500">${timestamp}</span>
                    </div>
                    ${Object.keys(properties).length > 0 ? `
                        <div class="text-xs text-gray-600">
                            <details class="cursor-pointer">
                                <summary class="hover:text-gray-800">Properties (${Object.keys(properties).length})</summary>
                                <pre class="mt-1 bg-gray-50 p-2 rounded text-xs overflow-auto">${JSON.stringify(properties, null, 2)}</pre>
                            </details>
                        </div>
                    ` : ''}
                </div>
            `;
        })
        .join('');
    
    eventsContent.innerHTML = eventsHtml;
}

function populateIdentities(profileData) {
    const identitiesContent = document.getElementById('identitiesContent');
    if (!identitiesContent) return;
    
    const identities = [];
    
    // Add anonymous_id
    if (profileData.anonymous_id) {
        identities.push({
            type: 'Anonymous ID',
            value: profileData.anonymous_id,
            source: 'Segment'
        });
    }
    
    // Add user_id if available
    if (profileData.user_id) {
        identities.push({
            type: 'User ID',
            value: profileData.user_id,
            source: 'Segment'
        });
    }
    
    // Add external_ids from the identities endpoint
    if (profileData.external_ids && Array.isArray(profileData.external_ids)) {
        profileData.external_ids.forEach(id => {
            identities.push({
                type: `External ID (${id.type || 'Unknown'})`,
                value: id.id || id.value || id,
                source: 'External'
            });
        });
    }
    
    // Add email from traits if available
    if (profileData.traits && profileData.traits.email) {
        identities.push({
            type: 'Email',
            value: profileData.traits.email,
            source: 'Traits'
        });
    }
    
    if (identities.length === 0) {
        identitiesContent.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">No identities found</p>';
        return;
    }
    
    const identitiesHtml = identities
        .map(identity => `
            <div class="bg-gray-50 rounded p-3">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <span class="text-sm font-medium text-gray-700">${identity.type}</span>
                        <span class="text-xs text-gray-500 block">${identity.source}</span>
                    </div>
                    <span class="text-sm text-gray-900 ml-2 break-all font-mono">${identity.value}</span>
                </div>
            </div>
        `)
        .join('');
    
    identitiesContent.innerHTML = identitiesHtml;
}

// Test function for demo purposes removed since button was removed

