import styles from './OrderHistoryPage.module.css';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as ordersAPI from '../../../utilities/order-api';
import Brand from '../../Brand/Brand';
import UserLogOut from '../../UserLogOut/UserLogOut';
import OrderList from '../../OrderList/OrderList';
import OrderDetail from '../../OrderDetail/OrderDetail';

export default function OrderHistoryPage({ user, setUser }) {
  /*--- State --- */
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);

  /*--- Side Effects --- */
  useEffect(function () {
    // Load previous orders (paid)
    async function fetchOrderHistory() {
      const orders = await ordersAPI.getOrderHistory();
      setOrders(orders);
      // If no orders, activeOrder will be set to null below
      setActiveOrder(orders[0] || null);
    }
    fetchOrderHistory();
  }, []);

  /*--- Event Handlers --- */
  function handleSelectOrder(order) {
    setActiveOrder(order);
  }

  /*--- Rendered UI --- */
  return (
    <main className={styles.OrderHistoryPage}>
      <aside className={styles.aside}>
        {/* <Brand /> */}
        <Link to="/orders/new" className="button btn-sm">NEW PURCHASE</Link>
        <UserLogOut user={user} setUser={setUser} />
      </aside>
      <OrderList
        orders={orders}
        activeOrder={activeOrder}
        handleSelectOrder={handleSelectOrder}
      />
      <OrderDetail
        order={activeOrder}
      />
    </main>
  );
}