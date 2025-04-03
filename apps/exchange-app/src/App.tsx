import axios from "axios"
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Signup } from "./pages/Signup";
import { Signin } from "./pages/Signin";
function App() {
  const socket = new WebSocket("ws://localhost:8080");
  console.log(socket)
  return (
    <>
    <BrowserRouter>
    <Routes>
    <Route path="/signup" element={<Signup />} />
    <Route path="/signin" element={<Signin />} />
    <Route path="/" element={    <button onClick={async()=>{
      await axios.post("http://localhost:3000/api/v1/order",{
        message:"hello"
      })
    }}>
      click me !
    </button>} />
    </Routes>
    </BrowserRouter>

    </>
  )
}

export default App
