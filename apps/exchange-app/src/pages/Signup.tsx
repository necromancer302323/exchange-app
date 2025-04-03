import { Auth } from "../components/Auth"
import { Quote } from "../components/Quote"

export const Signup=()=>{
    return <div className="grid grid-cols-2 lg:grid-cols-2">
        <div>
            <Auth type="signup"/>
        </div>
       <div className=" lg:block">
        <Quote/>
       </div>
      
    </div>
}