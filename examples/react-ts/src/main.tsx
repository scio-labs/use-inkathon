import { UseInkathonProvider, alephzeroTestnet } from '@scio-labs/use-inkathon'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UseInkathonProvider appName="React Example dApp" defaultChain={alephzeroTestnet}>
      <App />
    </UseInkathonProvider>
  </React.StrictMode>,
)
