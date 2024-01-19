import { UseInkathonProvider, development } from '@poppyseed/lastic-sdk'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UseInkathonProvider
      appName="React Example dApp"
      defaultChain={development}
      relayChain={development}
      connectOnInit={false}
    >
      <App />
    </UseInkathonProvider>
  </React.StrictMode>,
)
