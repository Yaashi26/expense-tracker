import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TransactionProvider } from "./context/TransactionContext";
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TransactionProvider>
      <App />
    </TransactionProvider>
  </StrictMode>,
)
