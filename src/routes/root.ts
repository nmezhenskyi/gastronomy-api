import express from 'express'

const router = express.Router()

router.get('/', (_, res) => {
   res.status(200).json({ message: 'Welcome to GastronomyAPI' })
})

export default router
