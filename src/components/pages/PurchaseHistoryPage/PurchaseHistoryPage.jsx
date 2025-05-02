// PurchaseHistoryPage.jsx
import React, { useState, useEffect } from 'react';
import styles from './PurchaseHistoryPage.module.css';
import { Link, useNavigate } from 'react-router-dom';
import * as ordersAPI from '../../../utilities/order-api';
import UserLogOut from '../../UserLogout/UserLogOut';
import OrderList from '../../PurchaseList/PurchaseList';
import OrderDetail from '../../PurchaseDetail/PurchaseDetail';
import { getToken, refreshToken } from '../../../utilities/users-service';

export default function PurchaseHistoryPage({ user, setUser }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [cart, setCart] = useState({ lineItems: [] });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      let token = await getToken();
      if (!token) {
        const refreshedUser = await refreshToken();
        if (!refreshedUser) {
          setError('Please log in to view your order history');
          navigate('/login');
          return;
        }
        token = await getToken();
      }

      try {
        const orders = await ordersAPI.getOrderHistory();
        setOrders(orders);
        setActiveOrder(orders[0] || null);
      } catch (error) {
        console.error('Error fetching order history:', error);
        setError('Failed to load order history. Please try again.');
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [navigate]);

  const handleEditOrder = async (orderId) => {
    try {
      setError(null);
      const order = orders.find((order) => order._id === orderId);

      if (!order) {
        setError(`Order with ID ${orderId} not found.`);
        return;
      }

      setCart({ lineItems: [] });

      for (const lineItem of order.lineItems) {
        const itemId = lineItem.item._id;
        const existingLineItem = cart.lineItems.find((item) => item.item._id === itemId);

        if (existingLineItem) {
          await ordersAPI.setItemQtyInCart(itemId, existingLineItem.qty + lineItem.qty);
        } else {
          await ordersAPI.addItemToCart(itemId);
        }
      }

      const updatedOrders = await ordersAPI.getOrderHistory();
      setOrders(updatedOrders);

      const updatedOrder = updatedOrders.find((o) => o._id === orderId);
      setActiveOrder(updatedOrder);

      navigate(`/orders/edit/${order._id}`);
    } catch (error) {
      console.error('Error editing order:', error);
      setError('Failed to edit order. Please try again.');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      setError(null);
      const token = await getToken();
      if (!token) {
        setError('Please log in to delete orders');
        navigate('/login');
        return;
      }

      await ordersAPI.deleteOrder(orderId);
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
      if (activeOrder && activeOrder._id === orderId) {
        setActiveOrder(null);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      setError('Failed to delete order. Please try again.');
    }
  };

  function handleSelectOrder(order) {
    setActiveOrder(order);
  }

  return (
    <main className={styles.OrderHistoryPage}>
      {isLoading && <div className={styles.loading}>Loading...</div>}
      {error && <div className={styles.error}>{error}</div>}
      <aside className={styles.aside}>
        <Link to="/orders/new" className="Login-Out-Button">
          NEW PURCHASE
        </Link>
        <UserLogOut user={user} setUser={setUser} />
      </aside>
      {!isLoading && (
        <>
          <OrderList
            orders={orders}
            activeOrder={activeOrder}
            handleSelectOrder={handleSelectOrder}
            handleEditOrder={handleEditOrder}
            handleDeleteOrder={handleDeleteOrder}
          />
          <OrderDetail order={activeOrder} />
        </>
      )}
    </main>
  );
}




