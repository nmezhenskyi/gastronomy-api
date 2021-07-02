import express from 'express'
import { body, validationResult } from 'express-validator'
import CocktailService from '../services/CocktailService'

const router = express.Router()

/**
 * Retrieve cocktails.
 * 
 * @route   GET /cocktails
 * @access  Public
 */
router.get('/', async (_, res) => {
   const result = await CocktailService.find()

   if (result.message === 'FAILED') return res.status(500).json({ message: result.message })

   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: result.message })

   return res.status(200).json(result.body)
})

/**
 * Retrieve the cocktail by id.
 * 
 * @route   GET /cocktails/:id
 * @access  Public
 */
router.get('/:id', async (req, res) => {
   const result = await CocktailService.findOne({ id: req.params.id })

   if (result.message === 'FAILED') return res.status(500).json({ message: result.message })

   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: result.message })

   return res.status(200).json(result.body)
})

/**
 * Create new cocktail.
 * 
 * @route   POST /cocktails
 * @access  Public
 */
router.post('/',
body('name').notEmpty().isLength({ max: 100 }).trim(),
body('description').isLength({ max: 5000 }).trim(),
body('method').notEmpty().isLength({ max: 3000 }).trim(),
body('notesOnIngredients').isLength({ max: 2000 }).trim(),
body('notesOnExecution').isLength({ max: 2000 }).trim(),
body('notesOnTaste').isLength({ max: 1000 }).trim(),
async (req, res) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Invalid data', errors: errors.array() })

   const result = await CocktailService.create({
      name: req.body.name,
      description: req.body.description,
      method: req.body.method,
      notesOnIngredients: req.body.notesOnIngredients,
      notesOnExecution: req.body.notesOnExecution,
      notesOnTaste: req.body.notesOnTaste
   })

   if (result.message === 'FAILED') return res.status(500).json({ message: `Server Error: Couldn't create cocktail` })

   return res.status(200).json(result.body)
})

export default router
