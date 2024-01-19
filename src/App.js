import React, { useState } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import styles from './App.module.css';
import { getUser } from './utilities/users-service';
import AuthPage from './components/pages/AuthPage/AuthPage';
import NewPurchase from './components/pages/NewPurchase/NewPurchase';
import PurchaseHistoryPage from './components/pages/PurchaseHistoryPage/PurchaseHistoryPage';

export default function App() {
  const [user, setUser] = useState(getUser());
  return (
    <main className={styles.App}>
      { user ?
        <>
          <Routes>
            {/* client-side route that renders the component instance if the path matches the url in the address bar */}
            <Route path="/orders/new" element={<NewPurchase user={user} setUser={setUser} />} />
            <Route path="/orders" element={<PurchaseHistoryPage user={user} setUser={setUser} />} />
            {/* redirect to /orders/new if path in address bar hasn't matched a <Route> above */}
            <Route path="/*" element={<Navigate to="/orders/new" />} />
            {/* <Route path="/products/*" element={<Navigate to="/index.ejs" />} /> */}
          </Routes>
          {/* <Link to="/products">Products</Link> */}
        </>
        :
        <AuthPage setUser={setUser} />
      }
    </main>
  );
}