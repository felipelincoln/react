import './css/index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './Mvp';
import HomePage from './pages/Home';
import NotFoundPage from './pages/NotFound';
import CollectionPage, { loader as collectionLoader } from './pages/Collection';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: '/collection/:collectionName',
    element: <CollectionPage />,
    loader: collectionLoader,
  },
  {
    path: '/mvp',
    element: <App />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
