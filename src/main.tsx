import './css/index.css';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import HomePage from './pages/Home';
import NotFoundPage from './pages/NotFound';
import ItemsPage, { loader as itemsLoader } from './pages/Items';
import ActivityPage, { loader as activityLoader } from './pages/Activity';
import OrderFulfillPage, { loader as orderFulfillLoader } from './pages/Order/fulfill';
import CreateOrderPage, { loader as createOrderLoader } from './pages/Order/createOrder';
import CollectionLayout, { TestPage, collectionLoader } from './pages/CollectionLayout';

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
      <CollectionLayout>
        <TestPage></TestPage>
      </CollectionLayout>
    ),
    loader: collectionLoader,
  },
  {
    path: '/collection/:collectionName/items',
    element: <ItemsPage />,
    loader: itemsLoader,
  },
  {
    path: '/collection/:collectionName/activity',
    element: <ActivityPage />,
    loader: activityLoader,
  },
  {
    path: '/collection/:collectionName/order/fulfill/:orderId',
    element: <OrderFulfillPage />,
    loader: orderFulfillLoader,
  },
  {
    path: '/collection/:collectionName/order/create/:tokenId',
    element: <CreateOrderPage />,
    loader: createOrderLoader,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />);
