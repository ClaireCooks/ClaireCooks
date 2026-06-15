import { createBrowserRouter } from 'react-router-dom'
import Navigation from './components/Navigation.jsx'
import AuthorHome from './pages/AuthorHome.jsx'
import Home from './pages/Home.jsx'
import Recipes from './pages/Recipes.jsx'
import RecipeDetail from './pages/RecipeDetail.jsx'
import AboutMe from './pages/AboutMe.jsx'
import AuthorEditor from './author/AuthorEditor.jsx'

export default createBrowserRouter([
  {
    path: '/',
    element: <Navigation />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'recipes',
        element: <Recipes />,
      },
      {
        path: 'recipes/:slug',
        element: <RecipeDetail />,
      },
      {
        path: 'about',
        element: <AboutMe />,
      },
      {
        path: 'author',
        element: <AuthorHome />,
      },
      {
        path: 'author/new',
        element: <AuthorEditor />,
      },
      {
        path: 'author/edit/:slug',
        element: <AuthorEditor />,
      },
    ],
  },
])
