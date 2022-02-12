import { useState, useEffect } from 'react'
import axios from 'axios'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface RequestOptions {
   url?: string
   method?: Method
   headers?: any
   withCredentials?: boolean
   data?: any
}

export const useRequest = (reqOptions?: RequestOptions) => {
   const [response, setResponse] = useState<any>(null)
   const [isPending, setIsPending] = useState(false)
   const [error, setError] = useState<string | null>(null)
   const [options, setOptions] = useState(reqOptions)

   const makeRequest = (reqOptions: RequestOptions) => {
      setOptions(reqOptions)
   }

   useEffect(() => {
      const controller = new AbortController()

      const send = async (request: RequestOptions) => {
         setIsPending(true)
   
         try {
            const res = await axios.request({ ...request, signal: controller.signal })
            setResponse(res.data)
            setError(null)
         }
         catch (err: any) {
            if (err.name === 'AbortError') {
               console.error('The request was aborted')
            }
            else {
               setError('Could not make request')
            }
         }
         finally {
            setIsPending(false)
         }
      }

      if(options) send(options)

      return () => {
         controller.abort()
      }
   }, [options])

   return {
      response,
      isPending,
      error,
      makeRequest
   }
}
