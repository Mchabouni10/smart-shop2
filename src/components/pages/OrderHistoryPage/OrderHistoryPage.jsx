// OrderHistoryPage.jsx

import styles from './OrderHistoryPage.module.css';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as ordersAPI from '../../../utilities/order-api';
import Brand from '../../Brand/Brand';
import UserLogOut from '../../UserLogOut/UserLogOut';
import OrderList from '../../OrderList/OrderList';
import OrderDetail from '../../OrderDetail/OrderDetail';
import { getToken } from '../../../utilities/users-service';

export default function OrderHistoryPage({ user, setUser }) {
  const navigate = useNavigate();

  /*--- State --- */
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);

  /*--- Side Effects --- */
  useEffect(() => {
    async function fetchOrderHistory() {
      const orders = await ordersAPI.getOrderHistory();
      setOrders(orders);
      setActiveOrder(orders[0] || null);
    }
    fetchOrderHistory();
  }, []);

  const handleEditOrder = async (orderId) => {
    try {
      console.log(`Edit order with ID ${orderId}`);
      const order = orders.find((order) => order._id === orderId);
      console.log('Selected order:', order);
  
      // Pass the items to the NewOrderPage using query parameters
      const itemsParam = encodeURIComponent(JSON.stringify(order.items));
      navigate(`/orders/new?items=${itemsParam}`);
    } catch (error) {
      console.error('An error occurred while editing the order:', error);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const token = getToken();

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));

        if (activeOrder && activeOrder._id === orderId) {
          setActiveOrder(null);
        }

        console.log(`Order with ID ${orderId} deleted successfully.`);
      } else {
        console.error(`Failed to delete order with ID ${orderId}. Status: ${response.status}`);
        const responseBody = await response.text();
        console.error('Response body:', responseBody);
      }
    } catch (error) {
      console.error('An error occurred while deleting the order:', error);
    }
  };

  /*--- Event Handlers --- */
  function handleSelectOrder(order) {
    setActiveOrder(order);
  }

  /*--- Rendered UI --- */
  return (
    <main className={styles.OrderHistoryPage}>
      <aside className={styles.aside}>
        <Link to="/orders/new" className="Login-Out-Button">NEW PURCHASE</Link>
        <UserLogOut user={user} setUser={setUser} />
      </aside>
      <OrderList
        orders={orders}
        activeOrder={activeOrder}
        handleSelectOrder={handleSelectOrder}
        handleEditOrder={handleEditOrder}
        handleDeleteOrder={handleDeleteOrder}
      />
      <OrderDetail
        order={activeOrder}
      />
    </main>
  );
}

