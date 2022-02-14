const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) =>
{
  Product.findAll().then((products) =>
  {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  }).catch(err => console.error(err));
};

exports.getProduct = (req, res, next) =>
{
  const prodId = +req.params.productId;
  Product.findByPk(prodId).then(product =>
  {
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products'
    });
  })
};

exports.getIndex = (req, res, next) =>
{
  Product.findAll().then((products) =>
  {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  }).catch((err) => { console.log(err) })

};

exports.getCart = (req, res, next) =>
{
  req.user.getCart().then((cart) =>
  {
    return cart.getProducts().then((products) =>
    {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    }).catch((err) => console.log(err));
  }).catch(err => console.log(err));
};

exports.postCart = (req, res, next) =>
{

  const prodId = req.body.productId;
  let fetchCart;
  req.user.getCart().then((cart) =>
  {
    fetchCart = cart;
    return cart.getProducts({ where: { id: prodId } }).then((products) =>
    {
      let product
      if (products.length > 0)
      {
        product = products[0];
      }
      let newQuanity = 1
      if (product)
      {
        const oldQuanity = product.cartItem.quantity
        newQuanity = oldQuanity + 1
        return fetchCart.addProduct(product, {
          through: { quantity: newQuanity }
        })

      }
      return Product.findByPk(prodId).then((product) =>
      {
        fetchCart.addProduct(product, { through: { quantity: newQuanity } });
      })
        .catch(err => console.log(err));
    }).catch(err => console.log(err));
  })
    .then(() =>
    {
      res.redirect('/cart')
    })
    .catch(err => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) =>
{
  const prodId = req.body.productId;
  req.user.getCart().then(cart =>
  {
    return cart.getProducts({ where: { id: prodId } })
  }).then(products =>
  {
    const product = products[0]
    return product.cartItem.destroy()
  }).then(result => res.redirect('/cart')).catch(err => console.log(err));
};

exports.postOrder = (req, res, next) =>
{
  let fetchCart;
  req.user.getCart().then(cart =>
  {
    fetchCart = cart
    return cart.getProducts()
  }).then(products =>
  {
    return req.user.createOrder()
      .then(order =>
      {
        return order.addProducts(
          products.map(product =>
          {
            product.orderItem = { quantity: product.cartItem.quantity }
            return product
          })
        )
      }).catch(err => console.log(err));
  }).then(result =>
  {
    return fetchCart.setProducts(null)
  })
    .then(result =>
    {
      res.redirect('/orders')
    }).catch(err => console.log(err));
}

exports.getOrders = (req, res, next) =>
{
  req.user.getOrders({ include: ['products'] }).then(orders =>
  {
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders
    });
  }).catch(err => console.log(err));

};

