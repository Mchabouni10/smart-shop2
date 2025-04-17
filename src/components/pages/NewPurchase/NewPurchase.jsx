//src/components/pages/NewPurchase/NewPurchase.jsx

import { useState, useEffect, useRef } from 'react';
import * as itemsAPI from '../../../utilities/items-api';
import * as ordersAPI from '../../../utilities/order-api';
import styles from './NewPurchase.module.css';
import { Link, useNavigate } from 'react-router-dom';
import MenuList from '../../MenuList/MenuList';
import CategoryList from '../../CategoryList/CategoryList';
import OrderDetail from '../../PurchaseDetail/PurchaseDetail';
import UserLogOut from '../../UserLogout/UserLogOut';
import { getToken } from '../../../utilities/users-service';

export default function NewPurchase({ user, setUser }) {
  const [menuItems, setMenuItems] = useState([]);
  const [activeCat, setActiveCat] = useState('');
  const [cart, setCart] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const categoriesRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      const token = await getToken();
      if (!token) {
        setError('Please log in to continue');
        navigate('/login');
        return;
      }

      async function getItems() {
        try {
          const items = await itemsAPI.getAll();
          categoriesRef.current = items.reduce((cats, item) => {
            const cat = item.category.name;
            return cats.includes(cat) ? cats : [...cats, cat];
          }, []);
          setMenuItems(items);
          setActiveCat(categoriesRef.current[0] || '');
        } catch (error) {
          console.error('Error fetching menu items:', error);
          setError('Failed to load menu items. Please try again.');
          setMenuItems([]);
        }
      }

      async function getCart() {
        try {
          const cart = await ordersAPI.getCart();
          setCart(cart);
        } catch (error) {
          console.error('Error fetching cart:', error);
          setError('Failed to load cart. Please try again.');
          setCart(null);
        }
      }

      setIsLoading(true);
      Promise.all([getItems(), getCart()])
        .then(() => setIsLoading(false))
        .catch(() => setIsLoading(false));
    }

    checkAuth();
  }, [navigate]);

  async function handleAddToOrder(itemId) {
    try {
      setError(null);
      const updatedCart = await ordersAPI.addItemToCart(itemId);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      setError('Failed to add item to cart. Please try again.');
    }
  }

  async function handleChangeQty(itemId, newQty) {
    try {
      setError(null);
      const updatedCart = await ordersAPI.setItemQtyInCart(itemId, newQty);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error changing item quantity in cart:', error);
      setError('Failed to change item quantity. Please try again.');
    }
  }

  async function handleCheckout() {
    try {
      setError(null);
      await ordersAPI.checkout();
      navigate('/orders');
    } catch (error) {
      console.error('Error checking out:', error);
      setError('Failed to complete checkout. Please try again.');
    }
  }

  return (
    <main className={styles.NewOrderPage}>
      {isLoading && <div className={styles.loading}>Loading...</div>}
      {error && <div className={styles.error}>{error}</div>}
      <aside>
        <UserLogOut user={user} setUser={setUser} />
        <CategoryList
          categories={categoriesRef.current}
          setCart={setCart}
          setActiveCat={setActiveCat}
        />
        <Link to="/orders" className="Login-Out-Button">
          PREVIOUS PURCHASE
        </Link>
      </aside>
      {!isLoading && (
        <>
          <MenuList
            menuItems={menuItems.filter((item) => item.category.name === activeCat)}
            handleAddToOrder={handleAddToOrder}
          />
          <OrderDetail
            order={cart}
            handleChangeQty={handleChangeQty}
            handleCheckout={handleCheckout}
          />
        </>
      )}
    </main>
  );
}
