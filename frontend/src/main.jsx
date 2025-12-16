import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import Textcontext from './context/Textcontext.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Textcontext>
        <App />
      </Textcontext>
    </BrowserRouter>
  </StrictMode>
)
