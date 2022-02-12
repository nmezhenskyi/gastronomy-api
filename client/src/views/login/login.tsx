import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../../common/constants'

// Styles:
import './login.css'

type Role = 'USER' | 'MEMBER'

export const Login = () => {
   const [role, setRole] = useState<Role>('USER')
   const [email, setEmail] = useState('')
   const [password, setPassword] = useState('')

   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      try {
         if (role === 'USER') {
            const res = await axios.post(`${API_URL}/user/login`,
               { email, password })
            console.log(res)
         }
         else {
            const res = await axios.post(`${API_URL}/member/login`,
               { email, password })
            console.log(res)
         }
      }
      catch (err: unknown) {
         console.error(err)
      }
   }

   return (
      <section id="login">
         <div className="container">
            <form onSubmit={e => handleSubmit(e)}>
               <h3>Log In</h3>
               <div className="role-toggle">
                  <label htmlFor="user">User</label>
                  <input
                     id="user"
                     type="radio"
                     name="role"
                     checked={role === 'USER'}
                     value={'USER'}
                     onChange={e => setRole(e.target.value as Role)}
                  />
                  <label htmlFor="member">Member</label>
                  <input
                     id="member"
                     type="radio"
                     name="role"
                     checked={role === 'MEMBER'}
                     value={'MEMBER'}
                     onChange={e => setRole(e.target.value as Role)}
                  />
               </div>
               <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                     id="email"
                     type="email"
                     value={email}
                     onChange={e => setEmail(e.target.value)}
                     placeholder="Enter your email"
                  />
               </div>
               <div className="form-group">
                  <label htmlFor="Password:">Password</label>
                  <input
                     id="password"
                     type="password"
                     value={password}
                     onChange={e => setPassword(e.target.value)}
                     placeholder="Enter your password"
                  />
               </div>
               <button className="btn" type="submit">Log in</button>
            </form>
            <p className="hint">
               Don't have an account yet?&nbsp;
               <Link to="/register">Register</Link>
            </p>
         </div>
      </section>
   )
}