import express from 'express'
//import { body, validationResult } from 'express-validator'
import CocktailService from '../service/CocktailService'

const router = express.Router()

/**
 * @route   GET /cocktails
 */
router.get('/', async (_, res) => {
   const result = await CocktailService.findAll()

   if (!result.success) return res.status(500).json({ message: result.message })

   return res.status(200).json({ body: result.body })
})

/**
 * @route   POST /cocktails
 */
router.post('/',
async (_, res) => {
   return res.status(200).json({ message: 'POST /cocktails' })
})

export default router
