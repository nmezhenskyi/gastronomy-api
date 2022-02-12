import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Styles:
import './searchbar.css'

export const Searchbar = () => {
   const [term, setTerm] = useState('')
   const navigate = useNavigate()

   const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      navigate(`/search?q=${term}`)
   }

   return (
      <div className="searchbar">
         <form onSubmit={handleSubmit}>
            <label htmlFor="search">Search:</label>
            <input
               id="search"
               type="text"
               value={term}
               onChange={e => setTerm(e.target.value)}
               required
            />
         </form>
      </div>
   )
}