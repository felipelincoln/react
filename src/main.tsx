import './css/index.css';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import HomePage from './pages/Home';
import NotFoundPage from './pages/NotFound';
import App, { collectionLoader } from './pages/App';
import { Navbar } from './pages/components/Navbar';
import { CreateOrderPage, createOrderLoader } from './pages/CreateOrderPage';
import { CollectionHeader } from './pages/CollectionPage/CollectionHeader';
import { CollectionItems } from './pages/CollectionPage/CollectionItems';
import { CollectionActivity } from './pages/CollectionPage/CollectionActivity';
import { BuyOrderPage, buyOrderLoader } from './pages/BuyOrderPage';
import { Components } from './pages/Components';

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
        <CollectionHeader></CollectionHeader>
        <CollectionItems></CollectionItems>
      </App>
    ),
    loader: collectionLoader,
  },
  {
    path: '/c/:collectionName/activity',
    element: (
      <App>
        <Navbar></Navbar>
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
        <Navbar></Navbar>
        <CreateOrderPage></CreateOrderPage>
      </App>
    ),
    loader: createOrderLoader,
  },
  {
    path: '/c/:collectionName/order/fulfill/:tokenId',
    element: (
      <App>
        <Navbar></Navbar>
        <BuyOrderPage></BuyOrderPage>
      </App>
    ),
    loader: buyOrderLoader,
  },
  {
    path: '/components',
    element: <Components></Components>,
    loader: buyOrderLoader,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />);
