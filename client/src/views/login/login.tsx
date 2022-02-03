import React, { useState } from 'react'

export const Login = () => {
   const [email, setEmail] = useState('')
   const [password, setPassword] = useState('')

   const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
   }

   return (
      <section id="login">
         <form onSubmit={e => handleSubmit(e)}>
            <label htmlFor="email">Email:</label>
            <input
               id="email"
               type="text"
               value={email}
               onChange={e => setEmail(e.target.value)}
            />
            <label htmlFor="Password:">Password:</label>
            <input
               id="password"
               type="password"
               value={password}
               onChange={e => setPassword(e.target.value)}
            />
            <button type="submit">Log in</button>
         </form>
      </section>
   )
}