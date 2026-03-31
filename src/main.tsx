import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CorbadoConnectProvider } from '@corbado/connect-react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            {/* @ts-ignore - The Corbado types lag behind the required React props. */}
            <CorbadoConnectProvider 
                {...{
                    projectId: import.meta.env.VITE_CORBADO_PROJECT_ID,
                    frontendApiUrlSuffix: "frontendapi.cloud.corbado.io"
                } as Record<string, any>}
            >
                <App />
            </CorbadoConnectProvider>
        </QueryClientProvider>
    </React.StrictMode>,
)
