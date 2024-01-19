import { UseInkathonProvider, rococo, rococoCoretime } from '@poppyseed/lastic-sdk'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UseInkathonProvider
      appName="React Example App for Lastic"
      defaultChain={rococoCoretime}
      relayChain={rococo}
      connectOnInit={true}
    >
      <App />
    </UseInkathonProvider>
  </React.StrictMode>,
)
