// src/api/api.js
const dummyProducts = [
  { id: 1, name: 'Product 1', price: 100, description: 'This is product 1', image: 'https://via.placeholder.com/150' },
  { id: 2, name: 'Product 2', price: 150, description: 'This is product 2', image: 'https://via.placeholder.com/150' },
  { id: 3, name: 'Product 3', price: 200, description: 'This is product 3', image: 'https://via.placeholder.com/150' },
];

export const fetchProducts = () => {
  return Promise.resolve(dummyProducts);
};

export const fetchProductById = (id) => {
  const product = dummyProducts.find(p => p.id === parseInt(id));
  return Promise.resolve(product);
};
