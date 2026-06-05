import { useEffect, useState } from 'react';
import './index.css'; // Asegúrate de tener tus estilos aquí

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // NUEVO: Estado para abrir y cerrar la vista del carrito
  const [isCartOpen, setIsCartOpen] = useState(false);

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

  // 1. FUNCIÓN: Agregar al carrito (La tuya, ¡está perfecta!)
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

  // 2. NUEVA FUNCIÓN: Restar cantidad o eliminar si llega a 0
  const removeFromCart = (productId) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === productId);
      if (existingItem.quantity === 1) {
        return currentCart.filter((item) => item.id !== productId);
      }
      return currentCart.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  // 3. NUEVA FUNCIÓN: Eliminar por completo un producto del carrito
  const clearProduct = (productId) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId));
  };

  // CÁLCULOS: Totales dinámicos
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Tienda</h1>
          <p>Productos desde una API pública usando solo React.</p>
        </div>
        {/* MODIFICADO: Ahora el botón del carrito es interactivo y abre el menú */}
        <button className="cart-summary-btn" onClick={() => setIsCartOpen(true)}>
          Carrito: <strong>{totalItems}</strong> artículos
        </button>
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

      {/* ================= COMPONENTE DE CARRITO LATERAL ================= */}
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-sidebar-header">
          <h2>Tu Carrito</h2>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}>×</button>
        </div>

        <div className="cart-sidebar-content">
          {cart.length === 0 ? (
            <p className="empty-cart-msg">El carrito está vacío.</p>
          ) : (
            cart.map((item) => (
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

        {cart.length > 0 && (
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

      {/* Fondo oscuro traslúcido cuando el carrito está abierto */}
      {isCartOpen && <div className="cart-overlay" onClick={() => setIsCartOpen(false)}></div>}
    </div>
  );
}

export default App;