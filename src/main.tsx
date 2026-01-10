import React from 'react';
import ReactDOM from 'react-dom/client';
import { MathJaxContext } from 'better-react-mathjax';
import App from './App';
import { LanguageProvider } from './i18n';
import './index.css';

const mathJaxConfig = {
  tex: {
    inlineMath: [['\\(', '\\)']],
    displayMath: [['\\[', '\\]']],
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MathJaxContext config={mathJaxConfig}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </MathJaxContext>
  </React.StrictMode>
);
