import React from 'react';
import ReactDOM from 'react-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { QueryClient, QueryClientProvider } from 'react-query';
import { getOptimizedCacheSettings } from '@utils/performanceConfig';
import App from './App';
import './i18n';
import './index.css';
import './styles/modern.css';
import './components/Button/Button.css';
import registerServiceWorker from './serviceWorkerRegistration';

if (window.env.PRODUCTION) {
  const script = document.createElement('script');
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-0DSG4S0NKS';
  script.async = true;

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-0DSG4S0NKS');
  `;

  document.body.appendChild(script);
  document.body.appendChild(script2);
}

const stripePromise = loadStripe(window.env.STRIPE_KEY);

// Production-optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Use centralized performance configuration
      ...getOptimizedCacheSettings(),
    },
    mutations: {
      retry: window.env.PRODUCTION ? 2 : 0, // Retry failed mutations in production
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <Elements stripe={stripePromise}>
      <App />
    </Elements>
  </QueryClientProvider>,
);

registerServiceWorker();
