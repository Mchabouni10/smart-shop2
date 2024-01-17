// OrderListItem.js

import styles from './OrderListItem.module.css';

export default function OrderListItem({ order, isSelected, handleSelectOrder, handleDeleteOrder }) {
  const handleDeleteClick = (event) => {
    event.stopPropagation(); // Prevents the selection when clicking delete
    handleDeleteOrder(order._id);
  };

  return (
    <div className={`${styles.OrderListItem} ${isSelected ? styles.selected : ''}`} onClick={() => handleSelectOrder(order)}>
      <div>
        <div>Order Id: <span className="smaller">{order.orderId}</span></div>
        <div className="smaller">{new Date(order.updatedAt).toLocaleDateString()}</div>
      </div>
      <div className="align-rt">
        <div>${order.orderTotal.toFixed(2)}</div>
        <div className="smaller">{order.totalQty} Item{order.totalQty > 1 ? 's' : ''}</div>
        <button className={styles.deleteButton} onClick={handleDeleteClick}>
          Delete
        </button>
      </div>
    </div>
  );
}

