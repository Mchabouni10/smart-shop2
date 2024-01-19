import styles from './Brand.module.css';

export default function Brand() {
return (
  <div className={styles.Brand}>
    <div>
    <img src={process.env.PUBLIC_URL + '/shoplogo.png'} className={styles.logoimage} alt="Shop Logo" />
    </div>
    
  </div>
);
}