// OrderList.js
import React from 'react';
import OrderListItem from '../PurchaseListItem/PurchaseListItem';
import styles from './PurchaseList.module.css';

export default function OrderList({ orders, activeOrder, handleSelectOrder, handleDeleteOrder, handleEditOrder }) {
  const orderItems = orders.map((o) => (
    <OrderListItem
      order={o}
      isSelected={o === activeOrder}
      handleSelectOrder={handleSelectOrder}
      handleDeleteOrder={handleDeleteOrder}
      handleEditOrder={handleEditOrder}   
      key={o._id}
    />
  ));

  return (
    <main className={styles.OrderList}>
      {orderItems.length ? (
        orderItems
      ) : (
        <span className={styles.noOrders}>No Previous Purchase Made</span>
      )}
    </main>
  );
}



