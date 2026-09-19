function getLoginPage() {
    return `<div class='login'>
                <h1>login</h1>
                <input type='email' id='login_email' placeholder='email'>
                <input type='password' id='login_password' placeholder='password'>
                <button id='loginbtn'>login</button>
                <p id='login_error'></p>
            </div>`
}

function getRegisterPage() {
    return `<div class='register'>
                <h1>register</h1>
                <input type='text' id='register_name' placeholder='name'>
                <input type='email' id='register_email' placeholder='email'>
                <input type='password' id='register_password' placeholder='password'>
                <input type='password' id='register_confirm_password' placeholder='same password'>
                <button id='registerbtn'>register</button>
                <p id='register_error'></p>
            </div>`
}

function getBuyPage() {
    return `<h1>browse products</h1>
            <div id='products'></div>`;
}

function getProductPage() {
    return `<div id='product'></div>`;
}

function getSellPage() { 
    return `<h1>sell something</h1>
            <div id='sell'></div>`;
}

function getCartPage() {
    return `<h1>my cart</h1>
            <div id='cart'></div>`;
}

function getOrdersPage() {
    return `<h1>my orders</h1>
            <div id='orders'></div>`;
}

function getOrderPage() {
    return `<div id='order'></div>`;
}

function getSalesPage() {
    return `<h1>my sales</h1>
            <div id='sales'></div>`;
}

function getAccountPage() {
    return `<h1>my account</h1>
            <div id='account'></div>`;
}

function getUserPage() {
    return `<div id='user'></div>`;
}

async function 

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
            <p class='price'>$ ${product.price}</p>
            <p class='stock'>${product.stock}</p>
            <p class='created_at'>${product.created_at}</p>
            <a class='seller' href='users/${product.seller_id}'>${product.seller_name}</a>
            <h2 class='questions'>questions</h2>
            ${questions.map(question => `
                <a class='asker' href='/users/${question.asker_id}'>${question.asker_name}</a>
                <p class='question'>${question.question}</p>
                <p class='answer'>${question.answer}</p>
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
                <p class='price'>$ ${order.total}</p>
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
            <h2 class='order_id'>order ${order.id}</h2>
            <p class='product_name'>${order.product_name}</p>
            <p class='price'>$ ${order.product_price}</p>
            <p class='quantity'>$ ${order.quantity}</p>
            <p class='shipping'>$ ${order.shipping}</p>
            <p class='total'>$ ${order.total}</p>
            <p class='status'>${order.status}</p>
            <p class='created_at'>${order.status}</p>
            <a class='seller' href='/users/${order.seller_id}'>${order.seller_name}</a>
        `;
    } catch (error) {
        console.log(error);
        div.innerHTML = '<p>failed to load order</p>';
    }
}

const routes = {
    '/': {page: getBuyPage, init: loadProducts},
    '/login': {page: getLoginPage},
    '/register': {page: getRegisterPage},
    '/buy': {page: getBuyPage, init: loadProducts},
    '/product/:id': {page: getProductPage, init: loadProduct},
    '/sell': {page: getSellPage},
    '/cart': {page: getCartPage},
    '/orders': {page: getOrdersPage},
    '/orders/:id': {page: getOrderPage, init: loadOrder},
    '/sales': {page: getSalesPage},
    '/user/:id': {page: getUserPage},
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

document.addEventListener('click', async (e) => {
    if (e.target.matches('a[data-link]')) {
        e.preventDefault();
        navigate(e.target.getAttribute('href'));
    }
    else if (e.target.id == 'loginbtn') {
        const email = document.getElementById('login_email').value;
        const password = document.getElementById('login_password').value;
        const login_error = document.getElementById('login_error');
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });
        const data = await res.json();
        if (!res.ok) {
            login_error.textContent = data.error;
            return;
        }
        navigate('/buy');
    }
    else if (e.target.id == 'registerbtn') {
        const name = document.getElementById('register_name').value;
        const email = document.getElementById('register_email').value;
        const password = document.getElementById('register_password').value;
        const confirm_password = document.getElementById('register_confirm_password').value;
        const register_error = document.getElementById('register_error');
        if (password != confirm_password) {
            register_error.textContent = 'passwords do not match';
            return;
        }
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, email, password, confirm_password}) 
        });
        const data = await res.json();
        if (!res.ok) {
            register_error.textContent = data.error;
            return;
        }
        navigate('/buy');
    }
});

window.addEventListener('popstate', renderContent);
window.addEventListener('load', renderContent);