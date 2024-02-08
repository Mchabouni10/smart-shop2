// PurchaseHistoryPage.jsx

import styles from './PurchaseHistoryPage.module.css';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as ordersAPI from '../../../utilities/order-api';
import UserLogOut from '../../UserLogOut/UserLogOut'
import OrderList from '../../PurchaseList/PurchaseList';
import OrderDetail from '../../PurchaseDetail/PurchaseDetail';
import { getToken } from '../../../utilities/users-service';

export default function PurchaseHistoryPage({ user, setUser }) {
  const navigate = useNavigate();

  /*--- State --- */
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [cart, setCart] = useState({ lineItems: [] }); // Initialize cart state

  /*--- Side Effects --- */
  useEffect(() => {
    async function fetchData() {
      const orders = await ordersAPI.getOrderHistory();
      setOrders(orders);
      setActiveOrder(orders[0] || null);
    }

    fetchData();
  }, []);

  const handleEditOrder = async (orderId) => {
    try {
      console.log(`Edit order with ID ${orderId}`);
      const order = orders.find((order) => order._id === orderId);

      if (!order) {
        console.error(`Order with ID ${orderId} not found.`);
        return;
      }

      console.log('Selected order:', order);

      // Ensure cart is properly initialized
      setCart({ lineItems: [] });

      // Add or remove items as needed using addItemToCart and setItemQtyInCart
      for (const lineItem of order.lineItems) {
        const itemId = lineItem.item._id;
        const existingLineItem = cart.lineItems.find(item => item.item._id === itemId);

        if (existingLineItem) {
          // Item already in the cart, update quantity if needed
          await ordersAPI.setItemQtyInCart(itemId, existingLineItem.qty + lineItem.qty);
        } else {
          // Item not in the cart, add it
          await ordersAPI.addItemToCart(itemId);
        }
      }

      // Refresh the order history to reflect the changes
      const updatedOrders = await ordersAPI.getOrderHistory();
      setOrders(updatedOrders);

      // Find the updated order in the new order history
      const updatedOrder = updatedOrders.find((o) => o._id === orderId);

      setActiveOrder(updatedOrder);

      // Navigate to the edit route with the order ID
      navigate(`/orders/edit/${order._id}`);
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




