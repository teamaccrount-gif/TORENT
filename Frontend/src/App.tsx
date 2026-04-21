import { RouterProvider } from 'react-router-dom'
import router from './router/routes'
import './i18n'

const App = () => {
  return (
    <RouterProvider router={router} />
  )
}

export default App
