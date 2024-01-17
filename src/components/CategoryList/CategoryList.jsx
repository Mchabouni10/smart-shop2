import styles from './CategoryList.module.css';



export default function CategoryList({ categories, activeCat, setActiveCat }) {
  const cats = categories.map(cat =>
    <li
      key={cat}
      className={cat === activeCat ? styles.active : ''}
      onClick={() => setActiveCat(cat)}
    >
      {cat}
    </li>
  );
  return (
    <ul className={styles.CategoryList}>
      {cats}
    </ul>
  );
}