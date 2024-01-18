// OrderListItem.js

import styles from './OrderListItem.module.css';

export default function OrderListItem({ order, isSelected, handleSelectOrder, handleEditOrder, handleDeleteOrder }) {
  const handleDeleteClick = (event) => {
    event.stopPropagation(); 
    handleDeleteOrder(order._id);
  };

  const handleEditClick = (event) => {
    event.stopPropagation(); 
    handleEditOrder(order._id);
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
        <button className={styles.editButton} onClick={handleEditClick}>
          Edit
        </button>
        <button className={styles.deleteButton} onClick={handleDeleteClick}>
          Delete
        </button>
      </div>
    </div>
  );
}


