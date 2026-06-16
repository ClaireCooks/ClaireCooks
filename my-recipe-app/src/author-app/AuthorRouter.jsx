import { createHashRouter } from 'react-router-dom'
import AuthorLayout from './AuthorLayout.jsx'
import AuthorHome from './AuthorHome.jsx'
import AuthorEditor from './AuthorEditor.jsx'

export default createHashRouter([
  {
    path: '/',
    element: <AuthorLayout />,
    children: [
      {
        index: true,
        element: <AuthorHome />,
      },
      {
        path: 'new',
        element: <AuthorEditor />,
      },
      {
        path: 'edit/:slug',
        element: <AuthorEditor />,
      },
    ],
  },
])
