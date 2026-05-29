const FoodHubBackend = (() => {
    const DB_KEY = 'foodhub360.db.v1';

    function uid(prefix) {
        const value = crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        return `${prefix}-${value}`;
    }

    function now() {
        return new Date().toISOString();
    }

    function seed() {
        const restaurantId = uid('restaurant');
        const customerId = uid('customer');
        const productIds = [uid('product'), uid('product'), uid('product'), uid('product')];
        return {
            users: [
                { id: uid('user'), customerId, name: 'Ana Cliente', email: 'ana.cliente@foodhub360.com', password: '123456', role: 'CUSTOMER' },
                { id: uid('user'), customerId: null, name: 'Rafael Admin', email: 'admin@foodhub360.com', password: 'admin123', role: 'ADMIN' },
                { id: uid('user'), customerId: null, name: 'Bianca Atendente', email: 'atendente@foodhub360.com', password: '123456', role: 'ATTENDANT' },
                { id: uid('user'), customerId: null, name: 'Diego Entregador', email: 'entregador@foodhub360.com', password: '123456', role: 'COURIER' }
            ],
            customers: [
                { id: customerId, name: 'Ana Cliente', email: 'ana.cliente@foodhub360.com', phone: '+55 11 90000-1111', address: 'Rua Central, 10 - Sao Paulo' }
            ],
            restaurants: [
                { id: restaurantId, name: 'FoodHub360 Burger', document: '99.888.777/0001-66', category: 'Hamburgueria', address: 'Av. Brasil, 500 - Sao Paulo', open: true }
            ],
            products: [
                { id: productIds[0], restaurantId, restaurantName: 'FoodHub360 Burger', name: 'X-Cheese Americano', description: 'Hamburguer, queijo, tomate e molho da casa', price: 34.90, cost: 18.40, available: true, stockQuantity: 50, image: 'assets/combo-burger.jpg' },
                { id: productIds[1], restaurantId, restaurantName: 'FoodHub360 Burger', name: 'Batata frita + molho especial', description: 'Porcao individual crocante', price: 12.50, cost: 5.10, available: true, stockQuantity: 80, image: 'assets/combo-burger.jpg' },
                { id: productIds[2], restaurantId, restaurantName: 'FoodHub360 Burger', name: 'Pizza de queijo especial', description: 'Massa crocante com queijo gratinado', price: 42.90, cost: 21.80, available: true, stockQuantity: 35, image: 'assets/pizza-queijo.png' },
                { id: productIds[3], restaurantId, restaurantName: 'FoodHub360 Burger', name: 'Combo Classico', description: 'Hamburguer, batata e bebida', price: 39.90, cost: 20.60, available: true, stockQuantity: 45, image: 'assets/combo-burger.jpg' }
            ],
            orders: [],
            deliveries: []
        };
    }

    function readDb() {
        const raw = localStorage.getItem(DB_KEY);
        if (!raw) {
            const initial = seed();
            writeDb(initial);
            return initial;
        }
        try {
            return JSON.parse(raw);
        } catch (_) {
            const initial = seed();
            writeDb(initial);
            return initial;
        }
    }

    function writeDb(db) {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    }

    function publicUser(user, db) {
        const customer = db.customers.find(item => item.email === user.email);
        return { userId: user.id, customerId: user.customerId || customer?.id || null, name: user.name, email: user.email, role: user.role };
    }

    function assertEmailAvailable(db, email) {
        if (db.users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
            throw new Error('E-mail ja cadastrado');
        }
    }

    function enrichOrder(db, order) {
        const customer = db.customers.find(item => item.id === order.customerId) || {};
        const restaurant = db.restaurants.find(item => item.id === order.restaurantId) || {};
        return {
            ...order,
            customerName: customer.name || 'Cliente',
            restaurantName: restaurant.name || 'Restaurante'
        };
    }

    function createOrder(db, payload) {
        const customer = db.customers.find(item => item.id === payload.customerId);
        const restaurant = db.restaurants.find(item => item.id === payload.restaurantId);
        if (!customer || !restaurant) throw new Error('Cliente ou restaurante nao encontrado');
        const items = payload.items.map(item => {
            const product = db.products.find(productItem => productItem.id === item.productId);
            if (!product) throw new Error('Produto nao encontrado');
            const quantity = Number(item.quantity || 1);
            const unitPrice = Number(product.price);
            const unitCost = Number(product.cost || product.price * 0.55);
            const subtotal = unitPrice * quantity;
            const subtotalCost = unitCost * quantity;
            return { productId: product.id, productName: product.name, productImage: product.image || 'assets/combo-burger.jpg', quantity, unitPrice, unitCost, subtotal, subtotalCost, profit: subtotal - subtotalCost };
        });
        const total = items.reduce((sum, item) => sum + item.subtotal, 0);
        const order = {
            id: uid('order'),
            customerId: customer.id,
            restaurantId: restaurant.id,
            status: 'WAITING_PAYMENT',
            deliveryAddress: payload.deliveryAddress,
            total,
            createdAt: now(),
            items
        };
        db.orders.push(order);
        writeDb(db);
        return enrichOrder(db, order);
    }

    function dashboard(db) {
        const delivered = db.orders.filter(order => order.status === 'DELIVERED');
        return {
            customers: db.customers.length,
            restaurants: db.restaurants.length,
            products: db.products.length,
            orders: db.orders.length,
            payments: delivered.length,
            deliveries: db.deliveries.length,
            revenue: delivered.reduce((sum, order) => sum + Number(order.total || 0), 0)
        };
    }

    async function request(path, options = {}) {
        await Promise.resolve();
        const method = (options.method || 'GET').toUpperCase();
        const body = options.body ? JSON.parse(options.body) : null;
        const db = readDb();

        if (method === 'POST' && path === '/auth/login') {
            const user = db.users.find(item => item.email.toLowerCase() === body.email.toLowerCase() && item.password === body.password);
            if (!user) throw new Error('Credenciais invalidas');
            return publicUser(user, db);
        }

        if (method === 'POST' && path === '/auth/register/customer') {
            assertEmailAvailable(db, body.email);
            const customer = { id: uid('customer'), name: body.name, email: body.email, phone: body.phone || '', address: body.address };
            const user = { id: uid('user'), customerId: customer.id, name: body.name, email: body.email, password: body.password, role: 'CUSTOMER' };
            db.customers.push(customer);
            db.users.push(user);
            writeDb(db);
            return publicUser(user, db);
        }

        if (method === 'POST' && path === '/auth/register/staff') {
            if (body.role === 'CUSTOMER') throw new Error('Use o cadastro de cliente para perfis CUSTOMER');
            assertEmailAvailable(db, body.email);
            const user = { id: uid('user'), customerId: null, name: body.name, email: body.email, password: body.password, role: body.role };
            db.users.push(user);
            writeDb(db);
            return publicUser(user, db);
        }

        if (method === 'GET' && path === '/customers') return db.customers;
        if (method === 'POST' && path === '/customers') {
            const customer = { id: uid('customer'), name: body.name, email: body.email, phone: body.phone || '', address: body.address };
            db.customers.push(customer);
            writeDb(db);
            return customer;
        }

        if (method === 'GET' && path === '/restaurants') return db.restaurants;
        if (method === 'GET' && path === '/products') return db.products;
        if (method === 'GET' && path === '/orders') return db.orders.map(order => enrichOrder(db, order));
        if (method === 'POST' && path === '/orders') return createOrder(db, body);

        const orderStatusMatch = path.match(/^\/orders\/([^/]+)\/status$/);
        if (method === 'PUT' && orderStatusMatch) {
            const order = db.orders.find(item => item.id === orderStatusMatch[1]);
            if (!order) throw new Error('Pedido nao encontrado');
            order.status = body.status;
            writeDb(db);
            return enrichOrder(db, order);
        }

        if (method === 'GET' && path === '/deliveries') return db.deliveries;
        if (method === 'POST' && path === '/deliveries') {
            const order = db.orders.find(item => item.id === body.orderId);
            if (!order) throw new Error('Pedido nao encontrado');
            let delivery = db.deliveries.find(item => item.orderId === body.orderId);
            if (!delivery) {
                delivery = { id: uid('delivery'), orderId: body.orderId, courierName: body.courierName, trackingCode: body.trackingCode, status: 'CREATED', updatedAt: now() };
                db.deliveries.push(delivery);
            }
            writeDb(db);
            return delivery;
        }

        const deliveryStatusMatch = path.match(/^\/deliveries\/([^/]+)\/status$/);
        if (method === 'PUT' && deliveryStatusMatch) {
            const delivery = db.deliveries.find(item => item.id === deliveryStatusMatch[1]);
            if (!delivery) throw new Error('Entrega nao encontrada');
            delivery.status = body.status;
            delivery.updatedAt = now();
            if (body.status === 'DELIVERED') {
                const order = db.orders.find(item => item.id === delivery.orderId);
                if (order) order.status = 'DELIVERED';
            }
            writeDb(db);
            return delivery;
        }

        if (method === 'GET' && path === '/analytics/dashboard') return dashboard(db);

        throw new Error(`Rota local nao implementada: ${method} ${path}`);
    }

    function reset() {
        const initial = seed();
        writeDb(initial);
        return initial;
    }

    return { request, reset };
})();
