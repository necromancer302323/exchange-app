import axios from "axios"
import './App.css'
function App() {
  const socket = new WebSocket("ws://localhost:8080");
  console.log(socket)
  return (
    <>
    <button onClick={async()=>{
      await axios.post("http://localhost:3000/api/v1/order",{
        message:"hello"
      })
    }}>
      click me !
    </button>

    </>
  )
}

export default App
