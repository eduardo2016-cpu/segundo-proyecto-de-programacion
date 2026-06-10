import { useEffect, useState } from 'react';
import carritoIcon from '../carrito.png';
import './index.css';

function App() {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [selectedProductId, setSelectedProductId] = useState(null);

  useEffect(() => {
    function loadProducts() {
      fetch('https://fakestoreapi.com/products')
        .then((response) => {
          if (!response.ok) {
            throw new Error('No se pudieron cargar los productos.');
          }
          return response.json();
        })
        .then(setProducts)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }

    loadProducts();
  }, []);

  const handleLogin = (event) => {
    event.preventDefault();

    if (!credentials.username.trim() || !credentials.password.trim()) {
      setAuthError('Usuario y contraseña son requeridos.');
      return;
    }

    setAuthError(null);
    setLoggedIn(true);
  };

  const handleFieldChange = ({ target }) => {
    const { name, value } = target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const addToCart = (product) => {
    setCartItems((items) => {
      const existingItem = items.find((item) => item.id === product.id);

      if (existingItem) {
        return items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...items, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((items) => {
      const item = items.find((entry) => entry.id === productId);
      if (!item) return items;

      if (item.quantity === 1) {
        return items.filter((entry) => entry.id !== productId);
      }

      return items.map((entry) =>
        entry.id === productId ? { ...entry, quantity: entry.quantity - 1 } : entry
      );
    });
  };

  const clearProduct = (productId) => {
    setCartItems((items) => items.filter((entry) => entry.id !== productId));
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!loggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>Iniciar sesión</h1>
          <p>Accede a la tienda con tu usuario y contraseña.</p>
          <form onSubmit={handleLogin} className="login-form">
            <label>
              Usuario
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleFieldChange}
                className="login-input"
                placeholder="Escribe tu usuario"
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleFieldChange}
                className="login-input"
                placeholder="Escribe tu contraseña"
              />
            </label>
            {authError && <p className="login-error">{authError}</p>}
            <button type="submit" className="login-btn">
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Tienda</h1>
          <p>Productos desde una API pública usando solo React.</p>
        </div>
        <button className="cart-icon-btn" onClick={() => setCartOpen(true)} aria-label="Abrir carrito">
          <img src={carritoIcon} alt="Carrito" className="cart-image-icon" />
          {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </button>
      </header>

      {loading && <p className="status-message">Cargando productos...</p>}
      {error && <p className="status-message error">{error}</p>}

      <main className="product-grid">
        {products.map((product) => {
          const isSelected = selectedProductId === product.id;
          const itemInCart = cartItems.find((item) => item.id === product.id);
          return (
            <article
              key={product.id}
              className={`product-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedProductId(product.id)}
            >
              <img src={product.image} alt={product.title} />
              <div className="product-info">
                <h2>{product.title}</h2>
                <p>{product.category}</p>
                <strong>${product.price.toFixed(2)}</strong>
                <div className="product-actions">
                  {isSelected && (
                    <button
                      className="control-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeFromCart(product.id);
                      }}
                      disabled={!itemInCart}
                    >
                      -
                    </button>
                  )}

                  <button
                    className={`add-to-cart-btn ${itemInCart ? 'active' : ''}`}
                    disabled={!!itemInCart}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedProductId(product.id);
                      addToCart(product);
                    }}
                  >
                    Agregar al carrito
                  </button>

                  {isSelected && (
                    <button
                      className="control-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        addToCart(product);
                      }}
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </main>

      <div className={`cart-sidebar ${cartOpen ? 'open' : ''}`}>
        <div className="cart-sidebar-header">
          <h2>Tu Carrito</h2>
          <button className="close-btn" onClick={() => setCartOpen(false)}>×</button>
        </div>

        <div className="cart-sidebar-content">
          {cartItems.length === 0 ? (
            <p className="empty-cart-msg">El carrito está vacío.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.title} className="cart-item-img" />
                <div className="cart-item-details">
                  <h3>{item.title}</h3>
                  <p className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</p>
                  
                  <div className="cart-item-actions">
                    <div className="quantity-controls">
                      <button onClick={() => removeFromCart(item.id)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => addToCart(item)}>+</button>
                    </div>
                    <button className="delete-btn" onClick={() => clearProduct(item.id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-sidebar-footer">
            <div className="cart-total">
              <span>Total:</span>
              <strong>${totalPrice.toFixed(2)}</strong>
            </div>
            <button className="checkout-btn" onClick={() => alert('¡Gracias por tu compra simulada!')}>
              Proceder al Pago
            </button>
          </div>
        )}
      </div>

      {cartOpen && <div className="cart-overlay" onClick={() => setCartOpen(false)}></div>}
    </div>
  );
}

export default App;