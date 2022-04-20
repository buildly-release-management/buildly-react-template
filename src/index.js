import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './App';
import './i18n';
import configureStore from './redux/store';

if(window.env.PRODUCTION) {
    const srcUrl = "https://www.googletagmanager.com/gtag/js?id=";
    const id = 'UA-226504961-1';

    const script = document.createElement('script');
    script.src = `${srcUrl}${id}`;
    script.async = true;

    const script2 = document.createElement('script');
    script2.innerHTML = `
                            window.dataLayer = window.dataLayer || [];
                            function gtag() { dataLayer.push(arguments); }
                            gtag('js', new Date());
                            gtag('config', ${id}, { 'send_page_view': false });
                        `;

    document.body.appendChild(script);
    document.body.appendChild(script2);
}

const store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);
