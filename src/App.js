import { createBrowserRouter, Router, RouterProvider, Routes } from 'react-router-dom';
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
    <div>
      <RouterProvider router={router} />
    </div>
  )
}

export default App;
