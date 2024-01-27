import './css/index.css';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import HomePage from './pages/Home';
import NotFoundPage from './pages/NotFound';
import ItemsPage, { loader as itemsLoader } from './pages/Items';
import ActivityPage, { loader as activityLoader } from './pages/Activity';
import OrderFulfillPage, { loader as orderFulfillLoader } from './pages/Order/fulfill';
import CreateOrderPage, { loader as createOrderLoader } from './pages/Order/createOrder';
import App, { collectionLoader } from './pages/App';
import { CollectionPage } from './pages/CollectionPage';

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
        <CollectionPage></CollectionPage>
      </App>
    ),
    loader: collectionLoader,
  },
  {
    path: '/c/:collectionName/order/create/:tokenId',
    element: (
      <App>
        <CreateOrderPage></CreateOrderPage>
      </App>
    ),
    loader: collectionLoader,
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
