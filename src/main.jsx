import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import Franchise from './Franchise.jsx';
import { BookingProvider } from './booking.jsx';
import './styles.css';

// Tiny path-based routing: / is the home page, /franchise is the franchise page.
const onFranchise = /^\/franchise\/?$/.test(location.pathname);
if (onFranchise) document.documentElement.removeAttribute('data-intro');

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BookingProvider>{onFranchise ? <Franchise /> : <App />}</BookingProvider>
  </React.StrictMode>
);
