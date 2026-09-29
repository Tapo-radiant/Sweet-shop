/**
 * Bengal Bekary — Main JavaScript
 */

// ─── Global State ───────────────────────────────────────────────────────────────
const state = {
    products: [],
    cart: JSON.parse(localStorage.getItem('bengalBekaryCart') || '[]'),
    currencySymbol: '₹',
    activeCategory: null,

    // Account data (sidebar features)
    profile:   JSON.parse(localStorage.getItem('bengalBekaryProfile') || 'null') || { name: 'Guest User', email: 'Sign in to view your account' },
    wishlist:  JSON.parse(localStorage.getItem('bengalBekaryWishlist') || '[]'),
    orders:    JSON.parse(localStorage.getItem('bengalBekaryOrders') || '[]'),
    addresses: JSON.parse(localStorage.getItem('bengalBekaryAddresses') || '[]'),
    notifications: JSON.parse(localStorage.getItem('bengalBekaryNotifications') || 'null') || [
        { id: 1, title: 'Welcome to Bengal Bekary!',               body: 'Use code SWEET10 for 10% off your first order.', time: 'Just now' },
        { id: 2, title: 'Your 250 bonus points have landed', body: 'Sign-up reward credited to your account.',       time: 'Just now' },
        { id: 3, title: 'Festive collection is live',        body: 'Diwali mithai boxes are back in stock.',         time: 'Just now' }
    ],
    points: parseInt(localStorage.getItem('bengalBekaryPoints') || '250', 10) || 250,
    notificationsSeen: localStorage.getItem('bengalBekaryNotifsSeen') === 'true',

    // Checkout — coupon applied on the confirm step (session only)
    coupon: null
};

const ACCT_SK = {
    profile:       'bengalBekaryProfile',
    wishlist:      'bengalBekaryWishlist',
    orders:        'bengalBekaryOrders',
    addresses:     'bengalBekaryAddresses',
    notifications: 'bengalBekaryNotifications',
    points:        'bengalBekaryPoints',
    notifsSeen:    'bengalBekaryNotifsSeen'
};

// ─── Helpers ─────────────────────────────────────────────────────────────────────
const $  = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const money = n => `${state.currencySymbol}${Number(n).toFixed(2)}`;
const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

// ─── Category metadata ───────────────────────────────────────────────────────────
const CAT_META = {
    all:             { heading: 'All Sweets',    script: 'Explore' },
    chocolates:      { heading: 'Chocolates',    script: 'Indulge In' },
    macarons:        { heading: 'Macarons',      script: 'Delight In' },
    cupcakes:        { heading: 'Cupcakes',      script: 'Savour Our' },
    'indian-sweets': { heading: 'Indian Sweets', script: 'Celebrate With' },
    cakes:           { heading: 'Cakes',         script: 'Celebrate With' }
};

// ─── Product card HTML builder ──────────────────────────────────────────────────
function buildCard(product, index) {
    const discount = product.originalPrice && product.originalPrice > product.price;
    const wished  = state.wishlist.includes(product.id);
    const delay = (index % 4) * 0.1;
    return `
      <div class="product-card" style="animation:panelCardIn 0.4s ease ${delay}s both;">
        <div class="product-image">
          <img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy">
          ${product.badge ? `<span class="product-badge badge-${product.badge}">${product.badge}</span>` : ''}
          <div class="product-quick-actions">
            <button class="quick-action-btn wish-btn ${wished ? 'wished' : ''}" onclick="toggleWishlist(${product.id})" title="Add to Wishlist">
              <i class="fa-${wished ? 'solid' : 'regular'} fa-heart"></i>
            </button>
            <button class="quick-action-btn" onclick="addToCart(${product.id})" title="Add to Cart">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
        <div class="product-info">
          <div class="product-meta">
            <div class="product-rating"><i class="fa-solid fa-star"></i> <span>${product.rating}</span></div>
            ${product.weight ? `<span class="product-weight">${product.weight}</span>` : ''}
          </div>
          <h3>${escapeHtml(product.name)}</h3>
          <p class="product-description">${product.description}</p>
          <div class="product-meta">
            <div class="product-price">
              <span class="price-current">${money(product.price)}</span>
              ${discount ? `<span class="price-original">${money(product.originalPrice)}</span>` : ''}
            </div>
            <button class="btn btn-cart" onclick="addToCart(${product.id})">Add</button>
          </div>
        </div>
      </div>`;
}

// ─── Reveal Panel (categories) ──────────────────────────────────────────────────
function openPanel(filterValue, clickedCard) {
    const panel   = $('collectionPanel');
    const grid    = $('panelProductsGrid');
    const heading = $('panelHeading');
    const script  = $('panelScript');
    if (!panel || !grid) return;

    const filtered = filterValue === 'all'
        ? state.products
        : state.products.filter(p => p.category === filterValue);

    const meta = CAT_META[filterValue] || { heading: filterValue, script: 'Explore' };
    heading.textContent = meta.heading;
    script.textContent  = meta.script;

    grid.innerHTML = filtered.length
        ? filtered.map(buildCard).join('')
        : `<p style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--color-gray)">No items found.</p>`;

    panel.classList.add('open');

    $$('.category-card').forEach(c => c.classList.remove('active-card'));
    if (clickedCard) clickedCard.classList.add('active-card');

    setTimeout(() => {
        const top = panel.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top, behavior: 'smooth' });
    }, 60);
}

function closePanel() {
    const panel = $('collectionPanel');
    if (panel) panel.classList.remove('open');
    $$('.category-card').forEach(c => c.classList.remove('active-card'));
    state.activeCategory = null;
}

// ─── Fetch Products ──────────────────────────────────────────────────────────────
async function fetchProducts() {
    try {
        const res = await fetch('/api/products');
        state.products = res.ok ? await res.json() : getFallback();
    } catch {
        state.products = getFallback();
    }
    console.log(`Loaded ${state.products.length} products`);
}

function getFallback() {
    return [
      { id:1,  name:'Royal Belgian Chocolates',   description:'Handcrafted assortment of 24 premium Belgian chocolates with rich ganache fillings and edible gold leaf.', price:1299, originalPrice:1599, category:'chocolates',    image:'images/chocolates.jpg',    badge:'bestseller', rating:4.9, weight:'500g' },
      { id:2,  name:'Dark Chocolate Truffles',     description:'Rich, velvety dark chocolate truffles dusted in cocoa, with a hazelnut praline centre.',                   price:749,  originalPrice:null,  category:'chocolates',    image:'images/chocolates.jpg',    badge:'new',        rating:4.6, weight:'300g' },
      { id:3,  name:'Salted Caramel Bark',         description:'Milk chocolate layered with buttery caramel and Himalayan pink salt. Irresistibly addictive.',             price:549,  originalPrice:699,   category:'chocolates',    image:'images/chocolates.jpg',    badge:'popular',    rating:4.7, weight:'200g' },
      { id:4,  name:'Artisan Bonbon Gift Box',     description:'16 hand-painted bonbons — passion fruit, Earl Grey, rose lychee, and pistachio.',                          price:1799, originalPrice:2199,  category:'chocolates',    image:'images/chocolates.jpg',    badge:null,         rating:4.8, weight:'400g' },
      { id:5,  name:'French Macaron Collection',   description:'12 colourful macarons in raspberry, pistachio, vanilla, and salted caramel.',                              price:899,  originalPrice:null,  category:'macarons',      image:'images/macarons.jpg',      badge:'new',        rating:4.8, weight:'250g' },
      { id:6,  name:'Rose & Lychee Macarons',      description:'Rose water shell macarons filled with a lychee buttercream — floral, fruity, perfectly balanced.',         price:799,  originalPrice:949,   category:'macarons',      image:'images/macarons.jpg',      badge:'popular',    rating:4.7, weight:'200g' },
      { id:7,  name:'Seasonal Fruit Tower',        description:'18 macarons filled with fresh fruit curds — mango, passion fruit, blueberry, and strawberry.',             price:1349, originalPrice:1599,  category:'macarons',      image:'images/macarons.jpg',      badge:'bestseller', rating:4.9, weight:'380g' },
      { id:8,  name:'Classic Vanilla & Choc Duo',  description:'Six each of signature vanilla bean and dark chocolate macarons.',                                           price:599,  originalPrice:null,  category:'macarons',      image:'images/macarons.jpg',      badge:null,         rating:4.5, weight:'150g' },
      { id:9,  name:'Garden Blossom Cupcakes',     description:'Six cupcakes with buttercream frosting, edible flowers, and a soft vanilla sponge.',                       price:649,  originalPrice:799,   category:'cupcakes',      image:'images/cupcakes.jpg',      badge:'popular',    rating:4.7, weight:'450g' },
      { id:10, name:'Celebration Cupcake Dozen',   description:'Twelve cupcakes in chocolate fudge, red velvet, lemon zest, and strawberry cream.',                        price:1099, originalPrice:1399,  category:'cupcakes',      image:'images/cupcakes.jpg',      badge:null,         rating:4.7, weight:'900g' },
      { id:11, name:'Red Velvet Royale',            description:'Six red velvet cupcakes topped with cream cheese frosting and crimson sugar.',                             price:749,  originalPrice:null,  category:'cupcakes',      image:'images/cupcakes.jpg',      badge:'new',        rating:4.8, weight:'500g' },
      { id:12, name:'Mini Cupcake Sampler Box',    description:'24 bite-sized mini cupcakes — vanilla, chocolate, lemon, and caramel.',                                    price:899,  originalPrice:1099,  category:'cupcakes',      image:'images/cupcakes.jpg',      badge:'bestseller', rating:4.9, weight:'600g' },
      { id:13, name:'Traditional Mithai Box',       description:'Gulab jamun, rasgulla, kaju barfi, and besan ladoo — made with pure desi ghee.',                          price:999,  originalPrice:1249,  category:'indian-sweets', image:'images/indian-sweets.jpg', badge:'bestseller', rating:4.9, weight:'1kg'  },
      { id:14, name:'Festive Ladoo Assortment',    description:'Motichoor, boondi, coconut, and rava ladoo — perfect for celebrations and gifting.',                        price:599,  originalPrice:null,  category:'indian-sweets', image:'images/indian-sweets.jpg', badge:null,         rating:4.5, weight:'500g' },
      { id:15, name:'Kaju Katli Premium Box',      description:'Melt-in-the-mouth cashew fudge squares wrapped in edible silver leaf.',                                     price:1199, originalPrice:1399,  category:'indian-sweets', image:'images/indian-sweets.jpg', badge:'popular',    rating:4.8, weight:'500g' },
      { id:16, name:'Dry Fruit Barfi Selection',   description:'Almond, pistachio, and walnut barfi layered with aromatic saffron and cardamom.',                          price:1499, originalPrice:1799,  category:'indian-sweets', image:'images/indian-sweets.jpg', badge:'new',        rating:4.7, weight:'750g' },
      { id:17, name:'Rustic Berry Layer Cake',     description:'Two-tier cake with cream cheese frosting, fresh seasonal berries, and hand-piped floral designs.',          price:1499, originalPrice:1799,  category:'cakes',         image:'images/cakes.jpg',         badge:'popular',    rating:4.8, weight:'1.5kg'},
      { id:18, name:'Classic Tiramisu Cake',       description:'Espresso-soaked sponge with mascarpone cream and premium cocoa — an Italian classic, reimagined.',          price:1299, originalPrice:null,  category:'cakes',         image:'images/cakes.jpg',         badge:'new',        rating:4.7, weight:'1.2kg'},
      { id:19, name:'Chocolate Ganache Drip Cake', description:'Dark chocolate sponge in glossy ganache, adorned with gold-dusted macarons and chocolate shards.',          price:1799, originalPrice:2199,  category:'cakes',         image:'images/cakes.jpg',         badge:'bestseller', rating:4.9, weight:'2kg'  },
      { id:20, name:'Mango Passion Cake',          description:'Light vanilla chiffon with mango mousse and passion fruit curd — a tropical celebration.',                  price:1399, originalPrice:1649,  category:'cakes',         image:'images/cakes.jpg',         badge:null,         rating:4.6, weight:'1.5kg'}
    ];
}

// ─── Cart ────────────────────────────────────────────────────────────────────────
window.addToCart = function(id) {
    const product = state.products.find(p => p.id === id);
    if (!product) return;
    const existing = state.cart.find(i => i.id === id);
    if (existing) {
        existing.quantity++;
    } else {
        state.cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 });
    }
    saveCart();
    updateCartUI();
    showToast(`${product.name} added to cart`, 'success');
    const count = $('cartCount');
    if (count) { count.style.animation = 'none'; setTimeout(() => count.style.animation = 'cartPop 0.3s ease', 10); }
};

window.updateQuantity = function(id, delta) {
    const item = state.cart.find(i => i.id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) state.cart = state.cart.filter(i => i.id !== id);
    saveCart(); updateCartUI();
};

window.removeFromCart = function(id) {
    state.cart = state.cart.filter(i => i.id !== id);
    saveCart(); updateCartUI();
};

function saveCart() {
    localStorage.setItem('bengalBekaryCart', JSON.stringify(state.cart));
}

// ─── Account persistence helpers ─────────────────────────────────────────────────
function saveProfile(v)       { localStorage.setItem(ACCT_SK.profile,       JSON.stringify(v)); }
function saveWishlist(v)      { localStorage.setItem(ACCT_SK.wishlist,      JSON.stringify(v)); }
function saveOrders(v)        { localStorage.setItem(ACCT_SK.orders,        JSON.stringify(v)); }
function saveAddresses(v)     { localStorage.setItem(ACCT_SK.addresses,     JSON.stringify(v)); }
function saveNotifications(v) { localStorage.setItem(ACCT_SK.notifications, JSON.stringify(v)); }
function savePoints(v)        { localStorage.setItem(ACCT_SK.points,        String(v)); }
function saveNotifsSeen(v)    { localStorage.setItem(ACCT_SK.notifsSeen,    v ? 'true' : 'false'); }

// ─── Wishlist ────────────────────────────────────────────────────────────────────
window.toggleWishlist = function(id) {
    const product = state.products.find(p => p.id === id);
    if (!product) return;
    const idx = state.wishlist.indexOf(id);
    if (idx >= 0) {
        state.wishlist.splice(idx, 1);
        showToast(`${product.name} removed from wishlist`, 'info');
    } else {
        state.wishlist.push(id);
        showToast(`${product.name} saved to wishlist ❤`, 'success');
    }
    saveWishlist(state.wishlist);
    refreshWishHearts(id);
    updateSidebarStats();
    // Re-render wishlist panel if it's open
    if ($('accountModal')?.classList.contains('active') && currentAcctView === 'wishlist') renderAccount('wishlist');
};

function refreshWishHearts(id) {
    $$('.product-card').forEach(card => {
        const btn = card.querySelector('.wish-btn');
        if (!btn) return;
        const match = btn.getAttribute('onclick') === `toggleWishlist(${id})`;
        if (!match) return;
        const on = state.wishlist.includes(id);
        btn.classList.toggle('wished', on);
        btn.innerHTML = `<i class="fa-${on ? 'solid' : 'regular'} fa-heart"></i>`;
        if (on) {
            const icon = btn.querySelector('i');
            if (icon) { icon.style.animation = 'none'; setTimeout(() => icon.style.animation = 'heartPop 0.35s ease', 10); }
        }
    });
}

// ─── Cart UI ─────────────────────────────────────────────────────────────────────
function updateCartUI() {
    const total = state.cart.reduce((s, i) => s + i.quantity, 0);
    const countEl = $('cartCount');
    if (countEl) countEl.textContent = total;

    const container = $('cartItemsContainer');
    const footer    = $('cartFooter');
    if (!container) return;

    if (state.cart.length === 0) {
        container.innerHTML = `
          <div class="cart-empty">
            <i class="fa-solid fa-basket-shopping empty-icon"></i>
            <p>Your sweet cart is currently empty.</p>
            <button class="btn btn-primary" style="margin-top:1rem" onclick="closeCart();document.getElementById('categories').scrollIntoView()">Browse Sweets</button>
          </div>`;
        if (footer) footer.style.display = 'none';
        return;
    }

    container.innerHTML = state.cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-image"><img src="${item.image}" alt="${escapeHtml(item.name)}"></div>
        <div class="cart-item-details">
          <h4>${escapeHtml(item.name)}</h4>
          <div class="item-price">${money(item.price)}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="updateQuantity(${item.id},-1)">-</button>
            <span>${item.quantity}</span>
            <button class="qty-btn" onclick="updateQuantity(${item.id},1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${item.id})"><i class="fa-solid fa-trash"></i></button>
      </div>`).join('');

    const subtotal = state.cart.reduce((s, i) => s + i.price * i.quantity, 0);
    if ($('cartSubtotal')) $('cartSubtotal').textContent = money(subtotal);
    if ($('cartTotal'))    $('cartTotal').textContent    = money(subtotal);
    if (footer) footer.style.display = 'block';
}

function openCart() {
    $('cartSidebar')?.classList.add('active');
    $('cartOverlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';
}

window.closeCart = function() {
    $('cartSidebar')?.classList.remove('active');
    $('cartOverlay')?.classList.remove('active');
    document.body.style.overflow = '';
};

// ─── Toast ───────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
    const container = $('toastContainer');
    if (!container) return;
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${escapeHtml(msg)}`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

// ─── Menu Sidebar (slides in from the LEFT) ─────────────────────────────────────
function openSidebar() {
    $('menuSidebar')?.classList.add('active');
    $('menuSidebarOverlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';
}

window.closeSidebar = function() {
    $('menuSidebar')?.classList.remove('active');
    $('menuSidebarOverlay')?.classList.remove('active');
    document.body.style.overflow = '';
};

// ─── Account View (modal panels) ─────────────────────────────────────────────────
let currentAcctView = null;

const ACCT_TITLES = {
    profile:       'My Profile',
    orders:        'My Orders',
    wishlist:      'My Wishlist',
    addresses:     'Saved Addresses',
    rewards:       'Loyalty Rewards',
    notifications: 'Notifications',
    settings:      'Settings',
    help:          'Help & Support'
};

function openAccountView(key) {
    closeSidebar();
    const modal = $('accountModal');
    if (!modal) return;
    currentAcctView = key;
    renderAccount(key);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAccount() {
    $('accountModal')?.classList.remove('active');
    document.body.style.overflow = '';
    currentAcctView = null;
    updateSidebarHeader();
    updateSidebarStats();
}

function renderAccount(key) {
    const modal = $('accountModal');
    if (!modal) return;
    if ($('accountModalTitle')) $('accountModalTitle').textContent = ACCT_TITLES[key] || 'Account';
    const body = $('accountModalBody');
    if (!body) return;

    switch (key) {
        case 'profile':       renderProfileView(body);       break;
        case 'orders':        renderOrdersView(body);        break;
        case 'wishlist':      renderWishlistView(body);      break;
        case 'addresses':     renderAddressesView(body);     break;
        case 'rewards':       renderRewardsView(body);       break;
        case 'notifications': renderNotificationsView(body); break;
        case 'settings':      renderSettingsView(body);      break;
        case 'help':          renderHelpView(body);          break;
        default:              renderProfileView(body);
    }
}

// ─── Panel: Profile ──────────────────────────────────────────────────────────────
function renderProfileView(body) {
    const p = state.profile;
    body.innerHTML = `
      <form id="profileForm" class="acct-form">
        <div class="form-group">
          <label for="pfName">Full Name</label>
          <input type="text" id="pfName" required placeholder="Your name" value="${escapeHtml(p.name === 'Guest User' ? '' : p.name)}">
        </div>
        <div class="form-group">
          <label for="pfEmail">Email Address</label>
          <input type="email" id="pfEmail" required placeholder="you@example.com" value="${escapeHtml(p.email.startsWith('Sign in') ? '' : p.email)}">
        </div>
        <div class="form-group">
          <label for="pfPhone">Phone (optional)</label>
          <input type="tel" id="pfPhone" placeholder="+91 98765 43210" value="${escapeHtml(p.phone || '')}">
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%">Save Profile</button>
      </form>
      <div class="acct-danger">
        <h4><i class="fa-solid fa-triangle-exclamation"></i> Danger Zone</h4>
        <button class="acct-mini-btn" id="pfClearProfile">Reset Profile Data</button>
      </div>`;

    $('profileForm')?.addEventListener('submit', e => {
        e.preventDefault();
        state.profile = {
            name:  $('pfName').value.trim()  || 'Guest User',
            email: $('pfEmail').value.trim() || 'Sign in to view your account',
            phone: $('pfPhone').value.trim()
        };
        saveProfile(state.profile);
        updateSidebarHeader();
        showToast('Profile saved!', 'success');
        closeAccount();
    });

    $('pfClearProfile')?.addEventListener('click', () => {
        localStorage.removeItem(ACCT_SK.profile);
        state.profile = { name: 'Guest User', email: 'Sign in to view your account', phone: '' };
        updateSidebarHeader();
        showToast('Profile data cleared', 'info');
        renderAccount('profile');
    });
}

// ─── Panel: Orders ───────────────────────────────────────────────────────────────
function renderOrdersView(body) {
    if (!state.orders.length) {
        body.innerHTML = `
          <div class="acct-empty">
            <i class="fa-solid fa-bag-shopping"></i>
            <p>No orders yet.</p>
            <span>Your completed orders will appear here.</span>
            <button class="acct-mini-btn" style="margin-top:1rem" id="ordersBrowse">Browse Sweets</button>
          </div>`;
        $('ordersBrowse')?.addEventListener('click', () => {
            closeAccount();
            $('categories')?.scrollIntoView({ behavior: 'smooth' });
        });
        return;
    }
    body.innerHTML = [...state.orders].reverse().map(o => `
      <div class="acct-order-card">
        <div class="acct-order-top">
          <span class="acct-order-id">#${escapeHtml(o.id)}</span>
          <span class="acct-status">${escapeHtml(o.status || 'Processing')}</span>
        </div>
        <div class="acct-order-items">${escapeHtml(o.itemsText || '')}</div>
        ${o.payment ? `<div class="acct-order-payment"><i class="fa-solid fa-wallet"></i> ${escapeHtml(o.payment)}${o.coupon ? ` · Coupon ${escapeHtml(o.coupon)}` : ''}</div>` : ''}
        <div class="acct-order-bottom">
          <span>${escapeHtml(o.date)}</span>
          <span class="acct-order-total">${money(o.total)}</span>
        </div>
      </div>`).join('');
}

// ─── Panel: Wishlist ─────────────────────────────────────────────────────────────
function renderWishlistView(body) {
    const items = state.products.filter(p => state.wishlist.includes(p.id));
    if (!items.length) {
        body.innerHTML = `
          <div class="acct-empty">
            <i class="fa-regular fa-heart"></i>
            <p>Your wishlist is empty.</p>
            <span>Tap the ♥ on any sweet to save it here.</span>
            <button class="acct-mini-btn" style="margin-top:1rem" id="wlBrowse">Explore Sweets</button>
          </div>`;
        $('wlBrowse')?.addEventListener('click', () => {
            closeAccount();
            $('categories')?.scrollIntoView({ behavior: 'smooth' });
        });
        return;
    }
    body.innerHTML = items.map(p => `
      <div class="acct-row">
        <img class="acct-row-img" src="${p.image}" alt="${escapeHtml(p.name)}">
        <div class="acct-row-body">
          <h4>${escapeHtml(p.name)}</h4>
          <p>${money(p.price)}</p>
        </div>
        <div class="acct-row-actions">
          <button class="acct-mini-btn" onclick="moveWishlistToCart(${p.id})">Move to Cart</button>
          <button class="acct-icon-btn danger" onclick="removeFromWishlist(${p.id})" title="Remove"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>`).join('');
}

window.moveWishlistToCart = function(id) {
    window.addToCart(id);
    removeFromWishlist(id, true);
};

window.removeFromWishlist = function(id, silent = false) {
    state.wishlist = state.wishlist.filter(w => w !== id);
    saveWishlist(state.wishlist);
    refreshWishHearts(id);
    updateSidebarStats();
    if (!silent) showToast('Removed from wishlist', 'info');
    if (currentAcctView === 'wishlist') renderAccount('wishlist');
};

// ─── Panel: Addresses ────────────────────────────────────────────────────────────
function renderAddressesView(body) {
    body.innerHTML = `
      ${state.addresses.length
        ? state.addresses.map((a, i) => `
          <div class="acct-row">
            <span class="acct-item-icon" style="background:rgba(76,175,80,0.12);color:var(--color-green-dark)"><i class="fa-solid fa-location-dot"></i></span>
            <div class="acct-row-body">
              <h4>${escapeHtml(a.label)}</h4>
              <p>${escapeHtml(a.text)}</p>
            </div>
            <div class="acct-row-actions">
              <button class="acct-icon-btn danger" onclick="removeAddress(${i})" title="Remove"><i class="fa-solid fa-trash"></i></button>
            </div>
          </div>`).join('')
        : `<div class="acct-empty"><i class="fa-solid fa-location-dot"></i><p>No saved addresses yet.</p><span>Add one to speed up checkout.</span></div>`}
      <form id="addrForm" class="acct-form" style="margin-top:1.2rem">
        <div class="form-group">
          <label for="addrLabel">Label</label>
          <input type="text" id="addrLabel" required placeholder="Home, Office, …">
        </div>
        <div class="form-group">
          <label for="addrText">Full Address</label>
          <textarea id="addrText" rows="2" required placeholder="House no, street, city, PIN" style="width:100%;padding:0.75rem 0.9rem;border:1.5px solid var(--color-cream-dark);border-radius:var(--radius-md);font-family:var(--font-body);font-size:0.9rem;color:var(--color-chocolate);resize:vertical"></textarea>
        </div>
        <button type="submit" class="acct-mini-btn" style="width:100%;padding:0.8rem">Save Address</button>
      </form>`;

    $('addrForm')?.addEventListener('submit', e => {
        e.preventDefault();
        state.addresses.push({ label: $('addrLabel').value.trim(), text: $('addrText').value.trim() });
        saveAddresses(state.addresses);
        showToast('Address saved!', 'success');
        renderAccount('addresses');
    });
}

window.removeAddress = function(i) {
    state.addresses.splice(i, 1);
    saveAddresses(state.addresses);
    showToast('Address removed', 'info');
    renderAccount('addresses');
};

// ─── Panel: Rewards ──────────────────────────────────────────────────────────────
function pointsTierLabel(pts) {
    if (pts >= 1000) return 'Platinum Tier';
    if (pts >= 500)  return 'Gold Tier';
    if (pts >= 250)  return 'Silver Tier';
    return 'Bronze Tier';
}

function renderRewardsView(body) {
    body.innerHTML = `
      <div class="acct-points-hero">
        <div class="points-num">${state.points}</div>
        <div class="points-label">Sweet Points</div>
      </div>
      <p style="text-align:center;font-size:0.85rem;color:var(--color-gray);margin-bottom:1rem">You're in the <strong>${pointsTierLabel(state.points)}</strong>. Earn 1 point for every ₹10 spent.</p>
      <div class="acct-perk"><i class="fa-solid fa-candy-cane"></i> Redeem 500 points for a free macaron box</div>
      <div class="acct-perk"><i class="fa-solid fa-gift"></i> Redeem 1000 points for a free celebration cake</div>
      <div class="acct-perk"><i class="fa-solid fa-percent"></i> Silver+ members get early access to festive collections</div>`;
}

// ─── Panel: Notifications ────────────────────────────────────────────────────────
function renderNotificationsView(body) {
    body.innerHTML = state.notifications.length
        ? state.notifications.map(n => `
          <div class="acct-row acct-notif">
            <span class="acct-notif-dot"></span>
            <div class="acct-row-body">
              <h4>${escapeHtml(n.title)}</h4>
              <p>${escapeHtml(n.body)}</p>
              <span class="acct-notif-time">${escapeHtml(n.time)}</span>
            </div>
          </div>`).join('')
        : `<div class="acct-empty"><i class="fa-regular fa-bell"></i><p>You're all caught up!</p></div>`;

    state.notificationsSeen = true;
    saveNotifsSeen(true);
    const badge = $('msbNotifBadge');
    if (badge) badge.style.display = 'none';
}

// ─── Panel: Settings ─────────────────────────────────────────────────────────────
function renderSettingsView(body) {
    body.innerHTML = `
      <h4 style="font-family:var(--font-heading);color:var(--color-chocolate);margin-bottom:0.8rem">Data & Privacy</h4>
      <p style="font-size:0.85rem;color:var(--color-gray);margin-bottom:1rem">Your cart, wishlist, profile, addresses and orders are stored locally on this device only.</p>
      <button class="acct-mini-btn" id="setClearCart"     style="width:100%;margin-bottom:0.6rem">Clear Cart</button>
      <button class="acct-mini-btn" id="setClearWishlist" style="width:100%;margin-bottom:0.6rem;background:var(--color-chocolate-light)">Clear Wishlist</button>
      <div class="acct-danger">
        <h4><i class="fa-solid fa-triangle-exclamation"></i> Danger Zone</h4>
        <button class="acct-mini-btn" id="setClearAll">Clear ALL Local Data</button>
      </div>
      <p style="font-size:0.75rem;color:var(--color-gray-light);margin-top:1.2rem;text-align:center">Bengal Bekary · v1.0</p>`;

    $('setClearCart')?.addEventListener('click', () => {
        state.cart = [];
        saveCart(); updateCartUI();
        showToast('Cart cleared', 'info');
    });
    $('setClearWishlist')?.addEventListener('click', () => {
        state.wishlist = [];
        saveWishlist(state.wishlist); updateSidebarStats();
        refreshAllWishHearts();
        showToast('Wishlist cleared', 'info');
    });
    $('setClearAll')?.addEventListener('click', () => {
        Object.values(ACCT_SK).forEach(k => localStorage.removeItem(k));
        localStorage.removeItem('bengalBekaryCart');
        showToast('All local data cleared. Reloading…', 'success');
        setTimeout(() => location.reload(), 900);
    });
}

function refreshAllWishHearts() {
    $$('.product-card .wish-btn').forEach(btn => {
        btn.classList.remove('wished');
        btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
    });
}

// ─── Panel: Help ─────────────────────────────────────────────────────────────────
function renderHelpView(body) {
    body.innerHTML = `
      <div class="acct-faq-item">
        <h4><i class="fa-solid fa-truck-fast"></i> How fast is delivery?</h4>
        <p>Same-day delivery for orders placed before 2 PM in select zones; standard delivery takes 2–3 business days.</p>
      </div>
      <div class="acct-faq-item">
        <h4><i class="fa-solid fa-rotate-left"></i> What is your refund policy?</h4>
        <p>If any item arrives damaged, contact us within 24 hours with a photo and we'll replace or refund it.</p>
      </div>
      <div class="acct-faq-item">
        <h4><i class="fa-solid fa-cake-candles"></i> Can I order a custom cake?</h4>
        <p>Yes! Use the contact form below or call us at least 48 hours in advance for custom designs.</p>
      </div>
      <div class="acct-faq-item">
        <h4><i class="fa-solid fa-envelope"></i> Still need help?</h4>
        <p>Email us at <strong>hello@bengalbekary.com</strong> or call <strong>+1 (555) 123-4567</strong> (Mon–Sat, 9AM–8PM).</p>
      </div>`;
}

// ─── Sidebar header + stats sync ─────────────────────────────────────────────────
function updateSidebarHeader() {
    const p = state.profile;
    const avatar = $('msbAvatar');
    if (avatar) avatar.textContent = (p.name || 'G').charAt(0).toUpperCase();
    const name = $('msbName');
    if (name) name.textContent = p.name || 'Guest User';
    const email = $('msbEmail');
    if (email) email.textContent = p.email || 'Sign in to view your account';
}

function updateSidebarStats() {
    const orders = $('statOrders');
    if (orders) orders.textContent = state.orders.length;
    const wish = $('statWishlist');
    if (wish) wish.textContent = state.wishlist.length;
    const pts = $('statPoints');
    if (pts) pts.textContent = state.points;
    const badge = $('msbNotifBadge');
    if (badge && state.notificationsSeen) badge.style.display = 'none';
}

// ─── Escape closes everything ────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if ($('accountModal')?.classList.contains('active'))  { closeAccount();    return; }
    if ($('checkoutModal')?.classList.contains('active')) { closeCheckout();  return; }
    if ($('cartSidebar')?.classList.contains('active'))   { closeCart();      return; }
    closeSidebar();
});

// ─── Nav ─────────────────────────────────────────────────────────────────────────
function initNav() {
    const navbar    = $('navbar');
    const toggle    = $('menuToggle');
    const scrollBtn = $('scrollTop');

    // Hamburger → open menu sidebar (from the left)
    if (toggle) toggle.addEventListener('click', openSidebar);

    // Sidebar close
    $('menuSidebarClose')?.addEventListener('click', closeSidebar);
    $('menuSidebarOverlay')?.addEventListener('click', closeSidebar);

    // Sidebar menu items → real account panels
    $('msbProfile')?.addEventListener('click', () => openAccountView('profile'));
    $('msbOrders')?.addEventListener('click', () => openAccountView('orders'));
    $('msbWishlist')?.addEventListener('click', () => openAccountView('wishlist'));
    $('msbAddresses')?.addEventListener('click', () => openAccountView('addresses'));
    $('msbRewards')?.addEventListener('click', () => openAccountView('rewards'));
    $('msbNotifications')?.addEventListener('click', () => openAccountView('notifications'));
    $('msbSettings')?.addEventListener('click', () => openAccountView('settings'));
    $('msbHelp')?.addEventListener('click', () => openAccountView('help'));
    $('msbSignIn')?.addEventListener('click', () => openAccountView('profile'));

    // Stat tiles are clickable shortcuts
    $('statOrders')?.addEventListener('click', () => openAccountView('orders'));
    $('statWishlist')?.addEventListener('click', () => openAccountView('wishlist'));
    $('statPoints')?.addEventListener('click', () => openAccountView('rewards'));

    // Account modal close
    $('closeAccountModal')?.addEventListener('click', closeAccount);
    $('accountModal')?.addEventListener('click', e => {
        if (e.target === $('accountModal')) closeAccount();
    });

    // Scroll top button
    if (scrollBtn) {
        scrollBtn.addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }

    // Scroll effects
    window.addEventListener('scroll', () => {
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
        if (scrollBtn) scrollBtn.classList.toggle('visible', window.scrollY > 500);
        updateActiveLink();
        checkReveal();
    });

    // Smooth anchor scrolling
    $$('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            // A bare "#" is not a valid CSS selector — treat it as "scroll to top"
            // instead of letting querySelector throw.
            if (!href || href === '#') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            let target = null;
            try { target = document.querySelector(href); } catch { target = null; }
            if (!target) return;
            e.preventDefault();
            $$('.nav-links a').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
}

function updateActiveLink() {
    let current = 'home';
    $$('section').forEach(s => {
        if (s.getBoundingClientRect().top <= window.innerHeight / 2) {
            current = s.id === 'products' ? 'categories' : (s.id || current);
        }
    });
    $$('.nav-links a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
}

function checkReveal() {
    $$('.reveal').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 100) {
            el.classList.add('visible');
        }
    });
}

// ─── Checkout ────────────────────────────────────────────────────────────────────
const DELIVERY_OPTIONS = {
    standard: { label: 'Standard Delivery', note: '2–3 business days', fee: 99 },
    express:  { label: 'Express Same Day',  note: 'Order before 2 PM',  fee: 199 }
};

const PAYMENT_LABELS = {
    cod:        'Cash on Delivery',
    upi:        'UPI',
    card:       'Credit / Debit Card',
    paypal:     'PayPal',
    netbanking: 'Net Banking'
};

// Sub-options shown once a payment method is picked. Font Awesome ships no
// glyph for most Indian brands, so each option renders as a brand-coloured
// "logo" badge (brand colour + short brand mark), which stays recognisable
// and never depends on an icon that may not exist in the CDN build.
const UPI_APPS = [
    { id: 'phonepe',    name: 'PhonePe',      mark: 'Pe',     color: '#5F259F', handle: 'ybl'        },
    { id: 'gpay',       name: 'Google Pay',   mark: 'GPay',   color: '#1A73E8', handle: 'okaxis'     },
    { id: 'supermoney', name: 'Super Money',  mark: 'Super',  color: '#12A150', handle: 'superyes'   },
    { id: 'paytm',      name: 'Paytm',        mark: 'Paytm',  color: '#00BAF2', handle: 'paytm'      },
    { id: 'bhim',       name: 'BHIM',         mark: 'BHIM',   color: '#0F6FC5', handle: 'upi'        },
    { id: 'amazonpay',  name: 'Amazon Pay',   mark: 'Amzn',   color: '#FF9900', handle: 'apl'        },
    { id: 'mobikwik',   name: 'MobiKwik',     mark: 'Mobi',   color: '#E02020', handle: 'ikwik'      },
    { id: 'cred',       name: 'CRED',         mark: 'CRED',   color: '#1B1B1B', handle: 'axisb'      },
    { id: 'freecharge', name: 'Freecharge',   mark: 'Free',   color: '#F26522', handle: 'freecharge' },
    { id: 'airtel',     name: 'Airtel Money', mark: 'Airtel', color: '#E40000', handle: 'airtel'     }
];

// `name` is the compact label shown in the picker, `full` the official name
// (kept for the tooltip / screen readers).
const CARD_BANKS = [
    { id: 'sbi',       name: 'State Bank',   full: 'State Bank of India',   mark: 'SBI',    color: '#22409A' },
    { id: 'hdfc',      name: 'HDFC Bank',    full: 'HDFC Bank',             mark: 'HDFC',   color: '#004C8F' },
    { id: 'icici',     name: 'ICICI Bank',   full: 'ICICI Bank',            mark: 'ICICI',  color: '#F37021' },
    { id: 'axis',      name: 'Axis Bank',    full: 'Axis Bank',             mark: 'AXIS',   color: '#97144D' },
    { id: 'kotak',     name: 'Kotak Bank',   full: 'Kotak Mahindra Bank',   mark: 'Kotak',  color: '#ED1C24' },
    { id: 'pnb',       name: 'Punjab NB',    full: 'Punjab National Bank',  mark: 'PNB',    color: '#F7941D' },
    { id: 'bob',       name: 'Baroda Bank',  full: 'Bank of Baroda',        mark: 'BOB',    color: '#F15A22' },
    { id: 'yes',       name: 'Yes Bank',     full: 'Yes Bank',              mark: 'YES',    color: '#00518F' },
    { id: 'indusind',  name: 'IndusInd',     full: 'IndusInd Bank',         mark: 'Indus',  color: '#8B1B3F' },
    { id: 'canara',    name: 'Canara Bank',  full: 'Canara Bank',           mark: 'Canara', color: '#0F4C81' },
    { id: 'union',     name: 'Union Bank',   full: 'Union Bank of India',   mark: 'Union',  color: '#E11B22' },
    { id: 'idbi',      name: 'IDBI Bank',    full: 'IDBI Bank',             mark: 'IDBI',   color: '#0C3B6F' },
    { id: 'federal',   name: 'Federal Bank', full: 'Federal Bank',          mark: 'Fed',    color: '#F7A800' },
    { id: 'idfc',      name: 'IDFC FIRST',   full: 'IDFC FIRST Bank',       mark: 'IDFC',   color: '#9C1D26' },
    { id: 'rbl',       name: 'RBL Bank',     full: 'RBL Bank',              mark: 'RBL',    color: '#0F3D6E' },
    { id: 'boi',       name: 'Bank of India', full: 'Bank of India',        mark: 'BOI',    color: '#0B4EA1' }
];

const PAY_OPTION_GROUPS = {
    upi:  { el: 'upiApps',   list: UPI_APPS },
    card: { el: 'cardBanks', list: CARD_BANKS }
};

// Nothing is pre-selected, so the customer actively chooses their app / bank
const chosenPayOption = { upi: null, card: null };

// Demo coupons. `percent`/`max` apply to the subtotal, `flat` is a fixed
// deduction, `freeShipping` waives the delivery fee and `min` is a minimum
// order value before the code can be used.
const COUPONS = {
    SWEET10:   { label: '10% off your order',           percent: 10, max: 150 },
    FIRSTBITE: { label: '15% off your first order',     percent: 15, max: 200 },
    BENGAL50:  { label: '₹50 off orders over ₹499',     flat: 50, min: 499 },
    FREESHIP:  { label: 'Free delivery on this order',  freeShipping: true }
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CHECKOUT_STEP_COUNT = 3;

function formatCheckoutDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return isNaN(d) ? iso : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function selectedDeliveryKey() {
    return $('checkoutForm')?.querySelector('input[name="deliveryMethod"]:checked')?.value || 'standard';
}

function selectedPaymentKey() {
    return $('paymentForm')?.querySelector('input[name="paymentMethod"]:checked')?.value || 'cod';
}

// ── UPI app / card bank pickers ──────────────────────────────────────────────
function payOption(group, id) {
    return PAY_OPTION_GROUPS[group]?.list.find(o => o.id === id) || null;
}

function selectedPayOptionName(group) {
    return payOption(group, chosenPayOption[group])?.name || '';
}

function renderPayOptions(group) {
    const cfg = PAY_OPTION_GROUPS[group];
    const box = cfg && $(cfg.el);
    if (!box) return;
    box.innerHTML = cfg.list.map(o => {
        const on = chosenPayOption[group] === o.id;
        return `
        <button type="button" class="pay-option${on ? ' selected' : ''}" role="radio"
                aria-checked="${on}" data-group="${group}" data-value="${o.id}"
                title="${escapeHtml(o.full || o.name)}" aria-label="${escapeHtml(o.full || o.name)}">
          <span class="pay-badge" style="background:${o.color}">${escapeHtml(o.mark)}</span>
          <span class="pay-name">${escapeHtml(o.name)}</span>
        </button>`;
    }).join('');
}

function selectPayOption(group, id) {
    const opt = payOption(group, id);
    if (!opt) return;
    chosenPayOption[group] = opt.id;
    renderPayOptions(group);

    // Nudge the UPI ID field with the handle that app actually uses
    if (group === 'upi') {
        const input = $('payUpiId');
        if (input) input.placeholder = `yourname@${opt.handle}`;
        const hint = $('upiHint');
        if (hint) hint.innerHTML = `<i class="fa-solid fa-circle-info"></i> Paying with ${escapeHtml(opt.name)} — enter the UPI ID linked to it.`;
    }
}

function clearPayOptions() {
    ['upi', 'card'].forEach(group => {
        chosenPayOption[group] = null;
        renderPayOptions(group);
    });
    const input = $('payUpiId');
    if (input) input.placeholder = 'yourname@bank';
    const hint = $('upiHint');
    if (hint) hint.innerHTML = '<i class="fa-solid fa-circle-info"></i> Pick your app, then enter the UPI ID linked to it.';
}

// ── Coupons ──────────────────────────────────────────────────────────────────
// Returns { code, label, amount } when the code applies to this order, else null
function couponDiscountFor(code, subtotal, fee) {
    const c = COUPONS[code];
    if (!c) return null;
    if (c.min && subtotal < c.min) return null;
    let amount = 0;
    if (c.percent) amount = subtotal * c.percent / 100;
    if (c.max) amount = Math.min(amount, c.max);
    if (c.flat) amount = c.flat;
    if (c.freeShipping) amount = fee;
    amount = Math.round(Math.min(amount, subtotal + fee) * 100) / 100;
    return amount > 0 ? { code, label: c.label, amount } : null;
}

function renderCouponChips() {
    const box = $('couponChips');
    if (!box) return;
    box.innerHTML = Object.keys(COUPONS).map(code =>
        `<button type="button" class="coupon-chip" data-code="${code}" title="${escapeHtml(COUPONS[code].label)}">${code}</button>`
    ).join('');
}

function couponMessage(text, type) {
    const msg = $('couponMsg');
    if (!msg) return;
    msg.textContent = text;
    msg.className = type ? `coupon-msg ${type}` : 'coupon-msg';
}

function applyCoupon() {
    const input = $('couponInput');
    const code  = (input?.value || '').trim().toUpperCase();

    if (!code) {
        state.coupon = null;
        couponMessage('Enter a coupon code to apply.', 'error');
        renderOrderSummary();
        return;
    }

    const { subtotal, fee } = checkoutTotals();
    const discount = couponDiscountFor(code, subtotal, fee);

    // Not a real code, or a valid code this order does not qualify for
    if (!discount) {
        state.coupon = null;
        const c = COUPONS[code];
        couponMessage(c
            ? `Add ${money(c.min)} of sweets to your cart to use ${code}.`
            : `“${code}” is not a valid coupon code.`, 'error');
        renderOrderSummary();
        return;
    }

    state.coupon = code;
    if (input) input.value = code;
    couponMessage(`${code} applied — ${discount.label} (−${money(discount.amount)}).`, 'success');
    renderOrderSummary();
}

function checkoutTotals() {
    const delivery = DELIVERY_OPTIONS[selectedDeliveryKey()] || DELIVERY_OPTIONS.standard;
    const subtotal = state.cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const fee = delivery.fee;
    const discount = state.coupon ? couponDiscountFor(state.coupon, subtotal, fee) : null;
    const total = Math.max(0, subtotal + fee - (discount ? discount.amount : 0));
    return { subtotal, fee, delivery, discount, total };
}

// Only the selected method's input fields stay visible
function syncPaymentFields() {
    const method = selectedPaymentKey();
    $$('#paymentForm .payment-fields').forEach(box => {
        box.hidden = box.dataset.for !== method;
    });
}

function setCheckoutStep(step) {
    $$('.checkout-panel').forEach(p => {
        p.classList.toggle('active', Number(p.dataset.step) === step);
    });
    $$('#checkoutSteps .checkout-step').forEach(el => {
        const n = Number(el.dataset.step);
        el.classList.toggle('active', n === step);
        el.classList.toggle('done', n < step);
    });
    const steps = $('checkoutSteps');
    if (steps) steps.style.display = '';
    // The confirm step shows a summary of what was chosen in steps 1 and 2
    if (step === 3) renderOrderSummary();
    const body = $('checkoutModal')?.querySelector('.modal-body');
    if (body) body.scrollTop = 0;
}

// Validate step 1 explicitly. The form is `novalidate`, so a hidden or
// mid-animation panel never triggers the browser's "not focusable" errors.
// Returns null when valid, or { field, msg } describing the problem.
function validateDelivery() {
    const required = [
        ['coFirstName', 'Enter your first name.'],
        ['coLastName',  'Enter your last name.'],
        ['coAddress',   'Enter the delivery address.'],
        ['coPhone',     'Enter a contact phone number.'],
        ['coDate',      'Choose a delivery date.']
    ];
    for (const [id, msg] of required) {
        if (!($(id)?.value || '').trim()) return { field: id, msg };
    }
    if (!/^[\d+\-\s()]{6,}$/.test($('coPhone').value.trim())) {
        return { field: 'coPhone', msg: 'Enter a valid phone number (at least 6 digits).' };
    }
    return null;
}

// Validate the fields belonging to the chosen payment method.
// Returns null when valid, or { field, msg } describing the problem.
function validatePayment(method) {
    const val = id => ($(id)?.value || '').trim();

    if (method === 'upi' && !chosenPayOption.upi) {
        return { field: 'upiApps', msg: 'Choose your UPI app to continue.' };
    }
    if (method === 'upi' && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(val('payUpiId'))) {
        return { field: 'payUpiId', msg: 'Enter a valid UPI ID, e.g. yourname@bank.' };
    }
    if (method === 'card' && !chosenPayOption.card) {
        return { field: 'cardBanks', msg: "Select your card's bank to continue." };
    }
    if (method === 'card') {
        if (!/^\d{13,19}$/.test(val('payCardNumber').replace(/[\s-]/g, ''))) {
            return { field: 'payCardNumber', msg: 'Enter a valid card number (13–19 digits).' };
        }
        if (!val('payCardName')) {
            return { field: 'payCardName', msg: 'Enter the name printed on the card.' };
        }
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(val('payCardExpiry'))) {
            return { field: 'payCardExpiry', msg: 'Enter the expiry date as MM/YY.' };
        }
        if (!/^\d{3,4}$/.test(val('payCardCvv'))) {
            return { field: 'payCardCvv', msg: 'Enter the 3 or 4 digit CVV.' };
        }
    }
    if (method === 'paypal' && !EMAIL_RE.test(val('payPaypalEmail'))) {
        return { field: 'payPaypalEmail', msg: 'Enter the email linked to your PayPal account.' };
    }
    if (method === 'netbanking' && !val('payBank')) {
        return { field: 'payBank', msg: 'Choose your bank to continue.' };
    }
    return null;
}

// Short description of what was actually chosen, for the confirm step and the
// order history. Empty for cash on delivery, where there is nothing to add.
function paymentDetailLine() {
    const val = id => ($(id)?.value || '').trim();
    switch (selectedPaymentKey()) {
        case 'upi':        return [selectedPayOptionName('upi'), val('payUpiId')].filter(Boolean).join(' · ');
        case 'card':       return [selectedPayOptionName('card'), `Card ending ${val('payCardNumber').replace(/[\s-]/g, '').slice(-4)}`].filter(Boolean).join(' · ');
        case 'paypal':     return val('payPaypalEmail');
        case 'netbanking': return val('payBank');
        default:           return '';
    }
}

function renderOrderSummary() {
    const box = $('orderSummary');
    if (!box) return;

    const form = $('checkoutForm');
    const field = name => (form?.querySelector(`[name="${name}"]`)?.value || '').trim();
    const { subtotal, fee, total, delivery, discount } = checkoutTotals();
    const payLabel  = PAYMENT_LABELS[selectedPaymentKey()] || 'Cash on Delivery';
    const payDetail = paymentDetailLine();

    const items = state.cart.map(i => `
        <div class="summary-item">
          <span>${i.quantity} × ${escapeHtml(i.name)}</span>
          <span>${money(i.price * i.quantity)}</span>
        </div>`).join('');

    const date = formatCheckoutDate(field('deliveryDate'));

    box.innerHTML = `
      <div class="summary-block">
        <h5>Deliver to</h5>
        <p>${escapeHtml(field('firstName'))} ${escapeHtml(field('lastName'))}<br>
        ${escapeHtml(field('address'))}<br>
        ${escapeHtml(field('phone'))}${date ? ' · ' + escapeHtml(date) : ''}</p>
      </div>
      <div class="summary-block">
        <h5>Delivery method</h5>
        <p>${escapeHtml(delivery.label)} — ${money(delivery.fee)} <span class="summary-muted">(${escapeHtml(delivery.note)})</span></p>
      </div>
      <div class="summary-block">
        <h5>Payment method</h5>
        <p>${escapeHtml(payLabel)}${payDetail ? ' — ' + escapeHtml(payDetail) : ''}</p>
      </div>
      <div class="summary-block">
        <h5>Items (${state.cart.length})</h5>
        ${items}
      </div>
      <div class="summary-totals">
        <div class="summary-total-row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
        <div class="summary-total-row"><span>Delivery</span><span>${money(fee)}</span></div>
        ${discount ? `<div class="summary-total-row discount"><span>Coupon ${escapeHtml(discount.code)}</span><span>−${money(discount.amount)}</span></div>` : ''}
        <div class="summary-total-row grand"><span>Total</span><span>${money(total)}</span></div>
        ${discount ? `<div class="summary-muted summary-coupon-note">${escapeHtml(discount.label)} applied</div>` : ''}
      </div>`;
}

// Put the modal back to step 1 with fresh fields
function resetCheckoutFlow() {
    $('checkoutForm')?.reset();
    $('paymentForm')?.reset();
    state.coupon = null;
    clearPayOptions();
    const couponInput = $('couponInput');
    if (couponInput) couponInput.value = '';
    couponMessage('');
    const success = $('orderSuccess');
    if (success) success.style.display = 'none';
    syncPaymentFields();
    setCheckoutStep(1);
}

function closeCheckout() {
    const modal = $('checkoutModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(resetCheckoutFlow, 400);
}

async function placeOrder() {
    const btn  = $('placeOrderBtn');
    const orig = btn ? btn.innerHTML : '';
    const deliveryKey = selectedDeliveryKey();
    const paymentKey  = selectedPaymentKey();
    const { total } = checkoutTotals();

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Placing order...';
    }

    try {
        const res  = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: state.cart,
                delivery: deliveryKey,
                payment: paymentKey,
                paymentDetail: paymentDetailLine(),
                coupon: state.coupon,
                total
            })
        });
        const data = await res.json();

        // Save to order history
        const orderId = data.orderId || ('BBK' + Math.floor(1000 + Math.random() * 9000));
        const payLabel  = PAYMENT_LABELS[paymentKey] || 'Cash on Delivery';
        const payDetail = paymentDetailLine();
        state.orders.push({
            id: orderId,
            itemsText: state.cart.map(i => `${i.quantity}× ${i.name}`).join(', '),
            total,
            payment: payDetail ? `${payLabel} · ${payDetail}` : payLabel,
            coupon: state.coupon,
            date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            status: data.status || 'Processing'
        });
        saveOrders(state.orders);

        // Award loyalty points (1 per ₹10 spent)
        state.points += Math.floor(total / 10);
        savePoints(state.points);

        // Swap the step panels out for the confirmation
        $$('.checkout-panel').forEach(p => p.classList.remove('active'));
        const steps = $('checkoutSteps');
        if (steps) steps.style.display = 'none';
        const success = $('orderSuccess');
        if (success) success.style.display = 'block';
        const orderIdEl = $('randomOrderId');
        if (orderIdEl) orderIdEl.textContent = orderId.replace(/^[A-Za-z]+/, '');
        const paidEl = $('orderPaidWith');
        if (paidEl) {
            const bits = [payLabel, payDetail, money(total)].filter(Boolean);
            if (state.coupon) bits.push(`Coupon ${state.coupon}`);
            paidEl.textContent = bits.join(' · ');
        }

        state.cart = [];
        saveCart();
        updateCartUI();
        updateSidebarStats();
    } catch {
        showToast('Order processing failed. Please try again.', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = orig;
        }
    }
}

function initCheckout() {
    const checkoutBtn  = $('checkoutBtn');
    const modal        = $('checkoutModal');
    const closeBtn     = $('closeCheckout');
    const successCls   = $('closeSuccessBtn');
    const deliveryForm = $('checkoutForm');
    const paymentForm  = $('paymentForm');

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (!state.cart.length) return;
            closeCart();
            resetCheckoutFlow();
            modal?.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeBtn)   closeBtn.addEventListener('click', closeCheckout);
    if (successCls) successCls.addEventListener('click', closeCheckout);

    // Step 1 → 2
    if (deliveryForm) {
        deliveryForm.addEventListener('submit', e => {
            e.preventDefault();
            const problem = validateDelivery();
            if (problem) {
                showToast(problem.msg, 'error');
                $(problem.field)?.focus();
                return;
            }
            syncPaymentFields();
            setCheckoutStep(2);
        });
    }

    // Swap the visible fields when the payment method changes
    $$('#paymentForm input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', syncPaymentFields);
    });

    // Pick a UPI app / card bank. Delegated, because the options are re-rendered
    // whenever the selection changes.
    $$('.pay-options').forEach(box => {
        box.addEventListener('click', e => {
            const btn = e.target.closest('.pay-option');
            if (btn) selectPayOption(btn.dataset.group, btn.dataset.value);
        });
    });

    // Coupons
    $('couponApplyBtn')?.addEventListener('click', applyCoupon);
    $('couponInput')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); }
    });
    $('couponInput')?.addEventListener('input', () => {
        // Typing a new code invalidates the previous one
        if (state.coupon && ($('couponInput')?.value || '').trim().toUpperCase() !== state.coupon) {
            state.coupon = null;
            couponMessage('');
            renderOrderSummary();
        }
    });
    $('couponChips')?.addEventListener('click', e => {
        const chip = e.target.closest('.coupon-chip');
        if (!chip) return;
        const input = $('couponInput');
        if (input) input.value = chip.dataset.code;
        applyCoupon();
    });

    renderCouponChips();

    // Step 2 → 3, only once the chosen method's details are valid
    if (paymentForm) {
        paymentForm.addEventListener('submit', e => {
            e.preventDefault();
            const problem = validatePayment(selectedPaymentKey());
            if (problem) {
                showToast(problem.msg, 'error');
                $(problem.field)?.focus();
                return;
            }
            setCheckoutStep(3);
        });
    }

    $('paymentBack')?.addEventListener('click', () => setCheckoutStep(1));
    $('confirmBack')?.addEventListener('click', () => setCheckoutStep(2));
    $('placeOrderBtn')?.addEventListener('click', placeOrder);

    renderPayOptions('upi');
    renderPayOptions('card');
    syncPaymentFields();
    setCheckoutStep(1);
}

// ─── Contact & Newsletter ────────────────────────────────────────────────────────
function initForms() {
    const newsletter = $('newsletterForm');
    if (newsletter) {
        newsletter.addEventListener('submit', e => {
            e.preventDefault();
            const input = newsletter.querySelector('input');
            if (input?.value) { showToast('Thanks for subscribing!', 'success'); input.value = ''; }
        });
    }

    const contact = $('contactForm');
    if (contact) {
        contact.addEventListener('submit', e => {
            e.preventDefault();
            const btn  = contact.querySelector('button[type="submit"]');
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
            setTimeout(() => {
                showToast('Message sent! We\'ll get back to you shortly.', 'success');
                contact.reset();
                btn.innerHTML = orig;
            }, 1000);
        });
    }
}

// ─── Boot ────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    await fetchProducts();

    // Category card clicks
    $$('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const filter = card.getAttribute('data-filter');
            if (state.activeCategory === filter && $('collectionPanel')?.classList.contains('open')) {
                closePanel();
            } else {
                state.activeCategory = filter;
                openPanel(filter, card);
            }
        });
    });

    const closeBtn = $('panelCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', closePanel);

    // Cart sidebar
    $('cartToggle')?.addEventListener('click', openCart);
    $('cartClose')?.addEventListener('click', closeCart);
    $('cartOverlay')?.addEventListener('click', closeCart);

    updateCartUI();
    updateSidebarHeader();
    updateSidebarStats();
    initNav();
    initCheckout();
    initForms();
    checkReveal();
});
