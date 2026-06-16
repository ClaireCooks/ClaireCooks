import { createHashRouter } from 'react-router-dom'
import Navigation from '../shared/components/Navigation.jsx'
import Home from './Home.jsx'
import Recipes from './Recipes.jsx'
import RecipeDetail from './RecipeDetail.jsx'
import AboutMe from './AboutMe.jsx'

export default createHashRouter([
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
    ],
  },
])
