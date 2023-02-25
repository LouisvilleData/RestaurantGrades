import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />
    }
  ])
  return (
    <div className='bg-gray-200'>
      <RouterProvider router={router} />
    </div>
  )
}

export default App;
