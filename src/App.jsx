import { useEffect, useState } from 'react';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al cargar productos');
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id);
      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>React E-commerce</h1>
          <p>Productos desde una API pública usando solo React.</p>
        </div>
        <div className="cart-summary">Carrito: {totalItems} artículos</div>
      </header>

      {loading && <p className="status-message">Cargando productos...</p>}
      {error && <p className="status-message error">{error}</p>}

      <main className="product-grid">
        {products.map((product) => (
          <article key={product.id} className="product-card">
            <img src={product.image} alt={product.title} />
            <div className="product-info">
              <h2>{product.title}</h2>
              <p>{product.category}</p>
              <strong>${product.price.toFixed(2)}</strong>
              <button onClick={() => addToCart(product)}>Agregar al carrito</button>
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}

export default App;
