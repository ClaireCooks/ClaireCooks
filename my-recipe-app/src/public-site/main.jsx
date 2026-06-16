import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './PublicRouter.jsx'
import { restoreGitHubPagesRoute } from '../shared/utils/restoreGitHubPagesRoute'
import '../index.css'

restoreGitHubPagesRoute()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
