import express, { Request } from 'express'
import { body, validationResult } from 'express-validator'
import { IngredientService } from '../services/ingredient-service'
import { paramToInt } from '../common/utils'
import { Pagination } from '../common/types'

const router = express.Router()

/**
 * Retrieve ingredients.
 * 
 * @route   GET /ingredients 
 * @access  Public
 */
router.get('/', async (req: Request<unknown, unknown, unknown, Pagination>, res) => {
   const { offset, limit } = req.query

   const result = await IngredientService.find({}, paramToInt(offset), paramToInt(limit))
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'No ingredients were found' })
   if (result.message === 'FAILED') return res.status(500).json({ message: 'Server failed to find ingredients' })

   return res.status(200).json(result.body)
})

/**
 * Retrieve the ingredient by id.
 * 
 * @route   GET /ingredients/:id
 * @access  Public
 */
router.get('/:id', async (req, res) => {
   const result = await IngredientService.findOne({ id: req.params.id })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Ingredient not found' })
   if (result.message === 'FAILED') return res.status(500).json({ message: 'Server failed to find ingredient' })

   return res.status(200).json(result.body)
})

/**
 * Create new ingredient.
 * 
 * @route   POST /ingredients
 * @access  Public
 */
router.post('/',
body('category').notEmpty().isLength({ max: 150 }).trim(),
body('name').notEmpty().isLength({ max: 150 }).trim(),
body('description').isLength({ max: 5000 }).trim(),
async (req, res) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Invalid data in the request body', errors: errors.array() })

   const result = await IngredientService.create({
      category: req.body.category,
      name: req.body.name,
      description: req.body.description
   })
   if (result.message === 'FAILED') return res.status(500).json({ message: 'Server failed to create ingredient' })

   return res.status(200).json(result.body)
})

/**
 * Update the ingredient by id.
 * 
 * @route   PUT /ingredients/:id
 * @access  Public
 */
router.put('/:id',
body('category').optional().isLength({ max: 150 }).trim(),
body('name').optional().isLength({ max: 150 }).trim(),
body('description').optional().isLength({ max: 5000 }).trim(),
async (req, res) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Invalid data in the request body', errors: errors.array() })

   if (!req.params || !req.params.id) return res.status(400).json({ message: 'Ingredient id is missing in the request URI' })

   const result = await IngredientService.update({
      id: req.params.id,
      category: req.body.category,
      name: req.body.name,
      description: req.body.description
   })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Ingredient not found' })
   if (result.message === 'FAILED') return res.status(500).json({ message: 'Server failed to update ingredient' })
   
   return res.status(200).json(result)
})

/**
 * Delete the ingredient by id.
 * 
 * @route   DELETE /ingredients/:id
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
   const result = await IngredientService.remove(req.params.id)
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Ingredient not found' })
   if (result.message === 'FAILED') return res.status(500).json({ message: 'Server failed to delete ingredient' })

   return res.status(200).json({ message: 'Ingredient has been deleted' })
})

export default router
