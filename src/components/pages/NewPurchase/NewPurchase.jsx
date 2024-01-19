import { useState, useEffect, useRef } from 'react';
import * as itemsAPI from '../../../utilities/items-api';
import * as ordersAPI from '../../../utilities/order-api';
import styles from './NewPurchase.module.css';
import { Link, useNavigate } from 'react-router-dom';
import MenuList from '../../MenuList/MenuList';
import CategoryList from '../../CategoryList/CategoryList';
import OrderDetail from '../../PurchaseDetail/PurchaseDetail';
import UserLogOut from '../../UserLogOut/UserLogOut';
import Brand from '../../Brand/Brand';

export default function NewPurchase({ user, setUser }) {
  const [menuItems, setMenuItems] = useState([]);
  const [activeCat, setActiveCat] = useState('');
  const [cart, setCart] = useState(null);
  const categoriesRef = useRef([]);
  const navigate = useNavigate();

  useEffect(function () {
    async function getItems() {
      try {
        const items = await itemsAPI.getAll();
        categoriesRef.current = items.reduce((cats, item) => {
          const cat = item.category.name;
          return cats.includes(cat) ? cats : [...cats, cat];
        }, []);
        setMenuItems(items);
        setActiveCat(categoriesRef.current[0]);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    }
  
    async function getCart() {
      try {
        const cart = await ordersAPI.getCart();
        setCart(cart);
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    }
  
    getItems();
    getCart();
  }, []);

  async function handleAddToOrder(itemId) {
    try {
      const updatedCart = await ordersAPI.addItemToCart(itemId);
      console.log('Updated Cart after add:', updatedCart);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  }

  async function handleChangeQty(itemId, newQty) {
    try {
      const updatedCart = await ordersAPI.setItemQtyInCart(itemId, newQty);
      console.log('Updated Cart after qty change:', updatedCart);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error changing item quantity in cart:', error);
    }
  }

  async function handleCheckout() {
    try {
      await ordersAPI.checkout();
      navigate('/orders');
    } catch (error) {
      console.error('Error checking out:', error);
    }
  }

  return (
    <main className={styles.NewOrderPage}>
      <aside>
        <UserLogOut user={user} setUser={setUser} />
        
        {/* <Brand className={styles.BrandInNewOrder} /> */}
        <CategoryList
          categories={categoriesRef.current}
          cart={setCart}
          setActiveCat={setActiveCat}
        />
        <Link to="/orders" className="Login-Out-Button">
          PREVIOUS PURCHASE
        </Link>
      </aside>
      <MenuList
        menuItems={menuItems.filter((item) => item.category.name === activeCat)}
        handleAddToOrder={handleAddToOrder}
      />
      <OrderDetail
        order={cart}
        handleChangeQty={handleChangeQty}
        handleCheckout={handleCheckout}
      />
      {/* <Link to="/products">Go to Products</Link> */}
    </main>
  );
}
