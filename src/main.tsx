import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary fallbackTitle="Velneer Storefront Experience">
    <App />
  </ErrorBoundary>
);
