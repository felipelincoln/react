import './css/index.css';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './Mvp';
import HomePage from './pages/Home';
import NotFoundPage from './pages/NotFound';
import CollectionItemsPage, { loader as collectionItemLoader } from './pages/Collection/Items';
import CollectionActivityPage, {
  loader as collectionActivityLoader,
} from './pages/Collection/Activity';

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
    path: '/collection/:collectionName/items',
    element: <CollectionItemsPage />,
    loader: collectionItemLoader,
  },
  {
    path: '/collection/:collectionName/activity',
    element: <CollectionActivityPage />,
    loader: collectionActivityLoader,
  },
  {
    path: '/mvp',
    element: <App />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />);
