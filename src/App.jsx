import { useEffect, useState } from 'react';
import carritoIcon from '../carrito.png';

// 1. Importamos las nuevas imágenes para los métodos de pago
// (Asegúrate de que estas rutas coincidan con la ubicación real de tus archivos)
import tarjetaIcon from '../tarjeta.png';
import paypalIcon from '../paypal.png';
import bancoIcon from '../banco.png';
import efectivoIcon from '../efectivo.png';

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

  // estados para el pago y factura
  const [checkoutStep, setCheckoutStep] = useState('cart'); 
  const [paymentMethod, setPaymentMethod] = useState('');
  const [invoice, setInvoice] = useState(null);

  // Carga los productos desde la API cuando se monta el componente.
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

  // Valida el login y permite entrar a la tienda.
  const handleLogin = (event) => {
    event.preventDefault();

    if (!credentials.username.trim() || !credentials.password.trim()) {
      setAuthError('Usuario y contraseña son requeridos.');
      return;
    }

    setAuthError(null);
    setLoggedIn(true);
  };

  // Actualiza los valores del formulario de login.
  const handleFieldChange = ({ target }) => {
    const { name, value } = target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  // Agrega un producto al carrito o aumenta su cantidad si ya existe.
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

  // Reduce la cantidad de un producto en el carrito.
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

  // Quita completamente un producto del carrito.
  const clearProduct = (productId) => {
    setCartItems((items) => items.filter((entry) => entry.id !== productId));
  };

  // Totales mostrados en el carrito.
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // funciones para procesar los pagos
  const handleProccedToPayment = () => {
    setCheckoutStep('payment');
  };

  const handleProcessOrder = () => {
    if (!paymentMethod) {
      alert('Por favor, selecciona un método de pago.');
      return;
    }

    // Guardamos una copia de los datos actuales para la factura fija
    setInvoice({
      items: [...cartItems],
      payment: paymentMethod,
      total: totalPrice,
      date: new Date().toLocaleString(),
      orderNumber: Math.floor(Math.random() * 900000) + 100000
    });

    // Avanzamos al paso de la factura
    setCheckoutStep('invoice');
    
    // Limpiamos el carrito de compras original
    setCartItems([]);
  };

  const handleCloseInvoice = () => {
    // Reseteamos el flujo del checkout para futuras compras
    setCheckoutStep('cart');
    setPaymentMethod('');
    setInvoice(null);
    setCartOpen(false);
  };

  // Mientras no haya sesión iniciada, mostramos el formulario de login.
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

      {/* Panel lateral del carrito / checkout */}
      <div className={`cart-sidebar ${cartOpen ? 'open' : ''}`}>
        <div className="cart-sidebar-header">
          {checkoutStep === 'cart' && <h2>Tu Carrito</h2>}
          {checkoutStep === 'payment' && <h2>Método de Pago</h2>}
          {checkoutStep === 'invoice' && <h2>Factura de Compra</h2>}
          <button className="close-btn" onClick={handleCloseInvoice}>×</button>
        </div>

        <div className="cart-sidebar-content">
          {/* lista del carrito */}
          {checkoutStep === 'cart' && (
            cartItems.length === 0 ? (
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
            )
          )}

         {/* metodo de pagos */}
{checkoutStep === 'payment' && (
  <div className="payment-selection">
    <p>Selecciona cómo deseas abonar tu compra:</p>
    <div className="payment-options">
      
      <label className={`payment-option ${paymentMethod === 'Tarjeta de Crédito / Débito' ? 'selected' : ''}`}>
        <input
          type="radio"
          name="paymentMethod"
          value="Tarjeta de Crédito / Débito"
          checked={paymentMethod === 'Tarjeta de Crédito / Débito'}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="radio-hidden"
        />
        <div className="payment-option-label">
          <img src={tarjetaIcon} alt="Tarjeta" className="payment-icon"  />
          <span>Tarjeta de Crédito / Débito</span>
        </div>
      </label>

      <label className={`payment-option ${paymentMethod === 'PayPal' ? 'selected' : ''}`}>
        <input
          type="radio"
          name="paymentMethod"
          value="PayPal"
          checked={paymentMethod === 'PayPal'}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="radio-hidden"
        />
        <div className="payment-option-label">
          <img src={paypalIcon} alt="PayPal" className="payment-icon" />
          <span>PayPal</span>
        </div>
      </label>

      <label className={`payment-option ${paymentMethod === 'Transferencia Bancaria' ? 'selected' : ''}`}>
        <input
          type="radio"
          name="paymentMethod"
          value="Transferencia Bancaria"
          checked={paymentMethod === 'Transferencia Bancaria'}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="radio-hidden"
        />
        <div className="payment-option-label">
          <img src={bancoIcon} alt="Banco" className="payment-icon" />
          <span>Transferencia Bancaria</span>
        </div>
      </label>

      <label className={`payment-option ${paymentMethod === 'Efectivo / Pago Local' ? 'selected' : ''}`}>
        <input
          type="radio"
          name="paymentMethod"
          value="Efectivo / Pago Local"
          checked={paymentMethod === 'Efectivo / Pago Local'}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="radio-hidden"
        />  
        <div className="payment-option-label">
          <img src={efectivoIcon} alt="Efectivo" className="payment-icon" />
          <span>Efectivo / Pago Local</span>
        </div>
      </label>

    </div>
    <button className="back-btn" onClick={() => setCheckoutStep('cart')}>
      Volver al carrito
    </button>
  </div>
)}

          {/* Factura */}
          {checkoutStep === 'invoice' && invoice && (
            <div className="invoice-container">
              <div className="invoice-success-badge">✓ ¡Pago Exitoso!</div>
              <div className="invoice-details">
                <p><strong>Nro. de Orden:</strong> #{invoice.orderNumber}</p>
                <p><strong>Fecha:</strong> {invoice.date}</p>
                <p><strong>Método de Pago:</strong> {invoice.payment}</p>
              </div>
              
              <hr />
              
              <h3>Productos comprados:</h3>
              <div className="invoice-items-list">
                {invoice.items.map((item) => (
                  <div key={item.id} className="invoice-item-row">
                    <span className="invoice-item-title">
                      {item.title} <strong>(x{item.quantity})</strong>
                    </span>
                    <span className="invoice-item-subtotal">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              
              <hr />
              
              <div className="invoice-total-row">
                <span>Total Pagado:</span>
                <strong>${invoice.total.toFixed(2)}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Footer del panel */}
        {checkoutStep === 'cart' && cartItems.length > 0 && (
          <div className="cart-sidebar-footer">
            <div className="cart-total">
              <span>Total:</span>
              <strong>${totalPrice.toFixed(2)}</strong>
            </div>
            <button className="checkout-btn" onClick={handleProccedToPayment}>
              Proceder al Pago
            </button>
          </div>
        )}

        {checkoutStep === 'payment' && (
          <div className="cart-sidebar-footer">
            <div className="cart-total">
              <span>Total a pagar:</span>
              <strong>${totalPrice.toFixed(2)}</strong>
            </div>
            <button className="checkout-btn finish-btn" onClick={handleProcessOrder}>
              Finalizar Pago
            </button>
          </div>
        )}

        {checkoutStep === 'invoice' && (
          <div className="cart-sidebar-footer">
            <button className="checkout-btn close-invoice-btn" onClick={handleCloseInvoice}>
              Entendido / Cerrar
            </button>
          </div>
        )}
      </div>

      {cartOpen && <div className="cart-overlay" onClick={handleCloseInvoice}></div>}
    </div>
  );
}

export default App;