import { useState } from "react"
import { EyeIcon, EyeOffIcon } from 'lucide-react';

type Props = {
    placeholder: string,
    field: any
}

export default function PasswordInput({placeholder, field} : Props) {

 const [showPassword,setShowPassword] = useState(false)

  return <div className="relative w-full flex items-center">
  <input {...field} type={showPassword ? 'text' : 'password'} className="input-style w-full" placeholder={placeholder || '••••••••'}/>
  <span onClick={() => setShowPassword(!showPassword)} 
   className="absolute right-5 p-1">{showPassword ? <EyeIcon /> : <EyeOffIcon />}</span>
  </div>     
}