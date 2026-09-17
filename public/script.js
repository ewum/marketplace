function getBuyPage() {
    return `
        <h1>Browse products</h1>
        <div id='products'></div>
    `;
}

;function getProductPage() {
    return `
        <h1>view product</h1>
        <div id='product'></div>
    `;
}

function getSellPage() { 
    return `<h1>Sell your stuff</h1>
            <div id='sell'></div>`;
}

function getCartPage() {
    return `<h1>Your cart</h1>
            <div id='cart'></div>`;
}

function getOrdersPage() {
    return `<h1>My orders</h1>
            <div id='orders'></div>`;
}

function getSalesPage() {
    return `<h1>My Sales</h1>
            <div id='sales'></div>`;
}

function getUsersPage() {
    return `<div id='user'></div>`
}

function getAccountPage() {
    return `<h1>My account</h1>
            <div id='account'></div>`;
}

async function loadProducts() {
    const div = document.getElementById('products');

    try {
        const response = await fetch('/api/products');

        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        const products = await response.json();

        div.innerHTML = products.map(product => `
            <div class='product'>
                <h2 class='name'>${product.name}</h2>
                <p class='price'>R$ ${product.price}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error(error);
        div.innerHTML = '<p>failed to load products</p>'
    }
}

async function loadProduct(id) {
    const div = document.getElementById('product');

    try {
        const productRes = await fetch('/api/products/' + id);
        const questionsRes = await fetch('/api/questions/' + id);

        if (!response.ok) {
            throw new Error('failed to fetch products');
        }

        const product = await productRes.json();
        const questions = await questionRes.json();

        div.innerHTML = `
            <h2>${product.name}</h2>
            <p class='description'>${product.description}</p>
            <p class='price'>${product.price}</p>
            <p class='stock'>${product.stock}</p>
            <p class='created_at'>${product.created_at}</p>
            <a class='seller' href='users/${product.seller_id}'>${product.seller_name}</a>
            <h2 class='questions'>Perguntas</h2>
            ${questions.map(question => `
                <h2 class='asker'>${question.asker}</h2>
                <p class='question'>${question.question}</p>
                <p class='answer'>${question.answer} || 'sem resposta'</p>
                <p class='created_at'>${question.created_at}</p>
                <p class='answered_at'>${question.answered_at}</p>
            `).join('')};
        `;
    } catch (error) {
        console.error(error);
        div.innerHTML = '<p>failed to load product</p>';    
    }
}

async function loadOrders() {
    const div = document.getElementById('orders');

    try {
        const response = await fetch('/api/orders');

        if (!response.ok) {
            throw new Error('failed to load orders');
        }

        const orders = await response.json();

        div.innerHTML = orders.map(order => `
            <div class='order'>
                <p class='product_name'>${order.product_name}</p>
                <p class='quantity'>${order.quantity}</p>
                <p class='price'>R$ ${order.total}</p>
            </div>
        `);
    } catch (error) {
        console.error(error);
        div.innerHTML = '<p>failed to load orders</p>';
    }
}

async function loadOrder(id) {
    const div = document.getElementById('order');
    
    try {
        const res = await fetch('/api/order/' + id);

        if (!res.ok) {
            throw new Error('failed to load order');
        }

        const order = await res.json();

        div.innerHTML = `
            <h2 class='order_id'>Pedido ${order.id}</h2>
            <p class='product_name'>${order.product_name}</p>
            <p class='price'>${order.product_price}</p>
            <p class='quantity'>${order.quantity}</p>
            <p class='shipping'>${order.shipping}</p>
            <p class='total'>${order.total}</p>
            <p class='status'>${order.status}</p>
            <p class='created_at'>${order.status}</p>
            <a class='seller' href='users/${order.seller_id}'>${order.seller_name}</a>
        `;
    } catch (error) {
        console.log(error);
        div.innerHTML = '<p>failed to load order</p>';
    }
}

const routes = {
    '/': {page: getBuyPage, init: loadProducts},
    '/buy': {page: getBuyPage, init: loadProducts},
    '/product/:id': {page: getProductPage, init: loadProduct},
    '/sell': {page: getSellPage},
    '/cart': {page: getCartPage},
    '/orders': {page: getOrdersPage},
    '/orders/:id': {page: getOrderPage, init: loadOrder},
    '/sales': {page: getSalesPage},
    '/account': {page: getAccountPage}
};

function matchRoute(path) {
    for (const pattern in routes) {
        const keys = [];
        const regex = new RegExp('^' +
        pattern.replace(/:([^/]+)/g, (_, key) => {
            keys.push(key);
            return '([^/]+)';
        }) + '$');
        const match = path.match(regex);
        if (match) {
            const params = {};
            keys.forEach((key, i) => params[key] = match[i + 1]);
            return {route: routes[pattern], params};
        }
    }
}

async function renderContent() {
    const div = document.getElementById('app');
    const {route, params} = matchRoute(window.location.pathname);

    if (!route) {
        div.innerHTML = '<h1>Page not found</h1>';
        return;
    }

    div.innerHTML = route.page();

    if (route.init) {
        await route.init(params.id);
    }
}

function navigate(path) {
    window.history.pushState({}, '', path);
    renderContent();
}

document.addEventListener('click', (e) => {
    if (e.target.matches('a[data-link]')) {
        e.preventDefault();
        navigate(e.target.getAttribute('href'));
    }
});

window.addEventListener('popstate', renderContent);
window.addEventListener('load', renderContent);

const state = {
    users: [],
    currentPage: 'buy',
    isLoading: false
}

function updateState(newState) {
    Object.assign(state, newState);
    renderContent();
}