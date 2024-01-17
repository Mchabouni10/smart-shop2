// OrderList.js

import OrderListItem from '../OrderListItem/OrderListItem';
import styles from './OrderList.module.css';

export default function OrderList({ orders, activeOrder, handleSelectOrder, handleDeleteOrder }) {
  const orderItems = orders.map(o =>
    <OrderListItem
      order={o}
      isSelected={o === activeOrder}
      handleSelectOrder={handleSelectOrder}
      handleDeleteOrder={handleDeleteOrder}
      key={o._id}
    />
  );

  return (
    <main className={styles.OrderList}>
      {orderItems.length ?
        orderItems
        :
        <span className={styles.noOrders}>No Previous Purchase Made</span>
      }
    </main>
  );
}


