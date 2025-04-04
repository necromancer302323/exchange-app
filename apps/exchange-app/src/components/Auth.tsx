import axios from "axios";
import { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {SignupInput} from "@repo/common"

export const Auth = ({ type }: { type: "signup" | "signin" }) => {
  const [postInput, setPostInputs] = useState<SignupInput>({
    email: "",
    password: "",
  });
  async function sendRequest() {
    try {
      const res = await axios.post(
        `http://localhost:3000/${type == "signup" ? "signup" : "signin"}`,
        postInput
      );
      const jwt: any = res.data;
      localStorage.setItem("token", jwt);
      console.log(jwt)
    } catch (e) {
      alert("an error has happend");
    }
  }
  return (
    <div className="h-screen  flex justify-center flex-col">
      <div className="flex justify-center">
        <div className="px-10 flex flex-col gap-3">
          <div>
            <div className="text-3xl font-extrabold">
              {type == "signup" ? "Create an account" : "Login to your account"}
            </div>
            <div className="text-slate-400 ">
              {type == "signin"
                ? "Don't have an account?"
                : "Already have an account?"}
              <Link
                className="px-5"
                to={type == "signin" ? "/signup" : "/signin"}
              >
                {type == "signin" ? "Sign up" : "Sign in"}
              </Link>
            </div>
          </div>

          <LabbledInput
            Label="Email"
            Placeholder="example@gmail.com"
            type=""
            onChange={(e) => {
              setPostInputs({
                ...postInput,
                email: e.target.value,
              });
            }}
          />
          <LabbledInput
            Label="password"
            Placeholder="password"
            type="password"
            onChange={(e) => {
              setPostInputs({
                ...postInput,
                password: e.target.value,
              });
            }}
          />
          <button
            onClick={sendRequest}
            type="button"
            className="mt-5 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 
            focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700
             dark:border-gray-700"
          >
            {type == "signup" ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

interface LablledInputType {
  Label: string;
  Placeholder: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type: string;
}

function LabbledInput({
  Label,
  Placeholder,
  onChange,
  type,
}: LablledInputType) {
  return (
    <div>
      <label className="block mb-2 text-sm font-bold text-gray-900 ">
        {Label}
      </label>
      <input
        onChange={onChange}
        type={type || "text"}
        id="first_name"
        className=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        placeholder={Placeholder}
        required
      />
    </div>
  );
}