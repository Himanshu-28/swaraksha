import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import awsConfig from './aws-exports';
import './index.css';
import '@aws-amplify/ui-react/styles.css';
import App from './App.tsx';

Amplify.configure(awsConfig);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
