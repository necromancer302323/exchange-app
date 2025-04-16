import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Signup } from "./pages/Signup";
import { Signin } from "./pages/Signin";
import { Homepage } from "./pages/HomePage";
function App() {

  return (
    <BrowserRouter>
    <Routes>
    <Route path="/signup" element={<Signup />} />
    <Route path="/signin" element={<Signin />} />
    <Route path="/" element={<Homepage/>} />
    </Routes>
    </BrowserRouter>
  )
}

export default App
