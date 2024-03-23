import './css/index.css';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import NotFoundPage from './pages/NotFound';
import App, { collectionLoader } from './pages/App';
import { CreateOrderPage, createOrderLoader } from './pages/CreateOrderPage';
import { CollectionHeader } from './pages/CollectionPage/CollectionHeader';
import { CollectionActivity } from './pages/CollectionPage/CollectionActivity';
import { BuyOrderPage, buyOrderLoader } from './pages/BuyOrderPage';
import { Components } from './pages/Components';
import { ListedItems } from './pages/CollectionPage/CollectionItems/ListedItems';
import { CollectionItems } from './pages/CollectionItems';
import { OrderFulfill, OrderFulfillLoader } from './pages/OrderFulfill';
import { OrderCreate, OrderCreateLoader } from './pages/OrderCreate';

if (!['dark', 'light'].includes(localStorage.theme)) {
  const preferedColor = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

  localStorage.setItem('theme', preferedColor);
}
document.documentElement.classList.add(localStorage.theme);

const router = createBrowserRouter([
  {
    errorElement: <NotFoundPage />,
  },
  {
    path: '/c/:collectionName',
    element: (
      <App>
        <CollectionItems></CollectionItems>
      </App>
    ),
    loader: collectionLoader,
  },
  {
    path: '/c/:collectionName/activity',
    element: (
      <App>
        <CollectionHeader></CollectionHeader>
        <CollectionActivity></CollectionActivity>
      </App>
    ),
    loader: collectionLoader,
  },
  {
    path: '/c/:collectionName/order/create/:tokenId',
    element: (
      <App>
        <OrderCreate></OrderCreate>
      </App>
    ),
    loader: OrderCreateLoader,
  },
  {
    path: '/c/:collectionName/order/fulfill/:tokenId',
    element: (
      <App>
        <OrderFulfill></OrderFulfill>
      </App>
    ),
    loader: OrderFulfillLoader,
  },
  {
    path: '/components',
    element: <Components></Components>,
    loader: buyOrderLoader,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />);
