import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import Footer from '@components/Footer';
import Home from './pages/Home';
import Restaurant from './pages/Restaurant';

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />
    },
    {
      path: "/restaurant/:restaurantID",
      element: <Restaurant />
    }
  ])
  return (
    <div className='bg-gray-200'>
      <RouterProvider router={router} />
      <Footer />
    </div>
  )
}

export default App;
