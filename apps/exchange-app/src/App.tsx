import axios from "axios"
import './App.css'
function App() {
  return (
    <>
    <button onClick={async()=>{
      await axios.post("http://api-server:3000/api/v1/order",{
        message:"hello"
      })
    }}>
      click me !
    </button>

    </>
  )
}

export default App
