import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';
import { srOnlyCss } from './utils/accessibility.ts';

// Inject accessible CSS
const style = document.createElement('style');
style.textContent = srOnlyCss;
document.head.appendChild(style);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
