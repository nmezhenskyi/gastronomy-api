import express from 'express'
import { body, validationResult } from 'express-validator'
import CocktailService from '../service/CocktailService'
import { Cocktail } from '../models/Cocktail'

const router = express.Router()

/**
 * @route   GET /cocktails
 */
router.get('/', async (_, res) => {
   const result = await CocktailService.findAll()

   if (!result.success) return res.status(500).json({ message: result.error })

   return res.status(200).json({ body: result.body })
})

/**
 * @route   POST /cocktails
 */
router.post('/',
body('name').notEmpty().isLength({ max: 100 }).trim(),
body('description').notEmpty().isLength({ max: 3500 }).trim(),
body('ingredients').notEmpty().isLength({ max: 1000 }).trim(),
body('method').notEmpty().isLength({ max: 3500 }).trim(),
body('tastingNotes').notEmpty().isLength({ max: 1000 }).trim(),
async (req, res) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Validation error', errors: errors.array() })

   const cocktail = new Cocktail()
   cocktail.name = req.body.name
   cocktail.description = req.body.description
   cocktail.ingredients = req.body.ingredients
   cocktail.method = req.body.method
   cocktail.tastingNotes = req.body.tastingNotes

   const result = await CocktailService.create(cocktail)

   if (!result.success) return res.status(500).json({ message: 'Could not add the cocktail to the database' })

   return res.status(200).json({ message: 'Cocktail added', body: result.body })
})

export default router
