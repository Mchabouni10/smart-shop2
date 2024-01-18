import styles from './LineItem.module.css';

export default function LineItem({ lineItem, isPaid, handleChangeQty }) {
return (
  <div className={styles.LineItem}>
    <div className="flex-ctr-ctr">   <img
          src={lineItem.item.image}  
          alt={lineItem.item.name}   
          className={styles.imageInCart}    
        /></div>
    <div className="shopping-cart">
      <span className="align-ctr">{lineItem.item.name}</span>
      {/* <span>{lineItem.item.price.toFixed(2)}</span> */}
    </div>
    <div className={styles.qty} style={{ justifyContent: isPaid && 'center' }}>
      {!isPaid &&
        <button
          className="btn-xs"
          onClick={() => handleChangeQty(lineItem.item._id, lineItem.qty - 1)}
        >-</button>
      }
      <span>{lineItem.qty}</span>
      {!isPaid &&
        <button
          className="btn-xs"
          onClick={() => handleChangeQty(lineItem.item._id, lineItem.qty + 1)}
        >+</button>
      }
    </div>
    <div className={styles.extPrice}>${lineItem.extPrice.toFixed(2)}</div>
  </div>
);
}