import React from 'react';
import ReactDOM from 'react-dom/client';  // 'react-dom/client'에서 ReactDOM을 가져옵니다.
import App from './App';

// React 18 이상에서는 createRoot를 사용합니다.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);

