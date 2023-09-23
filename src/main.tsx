import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Collection from './pages/Collection.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // TODO: old app, replace with a landing page
    errorElement: (
      <main>
        <h1>404</h1>
        <h1>Not Found</h1>
      </main>
    ),
  },
  {
    path: '/collection/:collectionName',
    element: <Collection />,
    loader: ({ params }) => {
      return { collectionName: params.collectionName };
    },
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
