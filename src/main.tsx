import './css/index.css';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import HomePage from './pages/Home';
import NotFoundPage from './pages/NotFound';
import OrderFulfillPage, { loader as orderFulfillLoader } from './pages/Order/fulfill';
import App, { collectionLoader } from './pages/App';
import { CollectionPage } from './pages/CollectionPage';
import { Navbar } from './pages/components/Navbar';
import { CreateOrderPage, createOrderLoader } from './pages/CreateOrderPage';

if (!['dark', 'light'].includes(localStorage.theme)) {
  const preferedColor = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

  localStorage.setItem('theme', preferedColor);
}
document.documentElement.classList.add(localStorage.theme);

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: '/c/:collectionName',
    element: (
      <App>
        <Navbar></Navbar>
        <CollectionPage></CollectionPage>
      </App>
    ),
    loader: collectionLoader,
  },
  {
    path: '/c/:collectionName/order/create/:tokenId',
    element: (
      <App>
        <Navbar></Navbar>
        <CreateOrderPage></CreateOrderPage>
      </App>
    ),
    loader: createOrderLoader,
  },
  {
    path: '/order/fulfill/:orderId',
    element: <OrderFulfillPage />,
    loader: orderFulfillLoader,
  },
  {
    path: '/order/create/:tokenId',
    element: <CreateOrderPage />,
    loader: createOrderLoader,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />);
