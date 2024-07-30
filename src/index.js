import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from './App';
import './i18n';
import configureStore from './redux/store';
import './index.css';
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

const store = configureStore();

const stripePromise = loadStripe(window.env.STRIPE_KEY);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <Elements stripe={stripePromise}>
        <App />
      </Elements>
    </Provider>
  </QueryClientProvider>,
);

registerServiceWorker();
