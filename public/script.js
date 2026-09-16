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
    return `<h1>Sell your stuff</h1>`;
}

function getCartPage() {
    return `<h1>Your cart</h1>`;
}

function getOrdersPage() {
    return `<h1>My orders</h1>`;
}

function getSalesPage() {
    return `<h1>My Sales</h1>`;
}

function getAccountPage() {
    return `<h1>Manage account</h1>`;
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
                <h2>${product.name}</h2>
                <p>R$ ${product.price}</p>
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
            <h2 class='questions'>Perguntas</h2>
            ${questions.map(question => `
                <h2 class='asker'>${question.asker}</h2>
                <p class='question'>${question.question}</p>
                <p class='answer'>${question.answer}</p>
                <p class='created_at'>${question.created_at}</p>
                <p class='answered_at'>${question.answered_at}</p>
            `)};
        `;
    }
}

async function loadOrders() {
    const div = document.getElementById('orders');

    try {
        const response = await fetch('/api/orders');

        if (!response.ok) {
            throw new Error('failed to laod orders');
        }

        const orders = await response.json();

        div.innerHTML = orders.map(order => `
            <div class='order'>
                <h1>${order.name}</h1>
                <p class='quantity'>${order.quantity}</p>
                <p class='price'>R$ ${order.price}</p>
            </div>
        `);
    } catch (error) {
        console.error(error);
        div.innerHTML = '<p>failed to load orders</p>'
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

function matchRoute(path) = {
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