import express, { Request } from 'express'
import { body, validationResult } from 'express-validator'
import IngredientService from '../services/ingredient-service'
import { paramToInt } from '../common/utils'

const router = express.Router()

/**
 * Represents query parameters for the ```GET /ingredients``` request.
 */
 interface GetIngredientsQuery {
   offset: string,
   limit: string
}

/**
 * Retrieve ingredients.
 * 
 * @route   GET /ingredients 
 * @access  Public
 */
router.get('/', async (req: Request<unknown, unknown, unknown, GetIngredientsQuery>, res) => {
   const { offset, limit } = req.query

   const result = await IngredientService.find({}, paramToInt(offset), paramToInt(limit))

   if (result.message === 'FAILED') return res.status(500).json({ message: 'Server Error: Query failed' })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Error: Nothing found' })

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

   if (result.message === 'FAILED') return res.status(500).json({ message: 'Server Error: Query failed' })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Error: Ingredient not found' })

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
      return res.status(400).json({ message: 'Error: Invalid data', errors: errors.array() })

   const result = await IngredientService.create({
      category: req.body.category,
      name: req.body.name,
      description: req.body.description
   })

   if (result.message === 'FAILED') return res.status(500).json({ message: `Server Error: Couldn't create the ingredient` })

   return res.status(200).json(result.body)
})

/**
 * Update the ingredient by id.
 * 
 * @route   PUT /ingredients/:id
 * @access  Public
 */
router.put('/:id',
body('category').isLength({ max: 150 }).trim(),
body('name').isLength({ max: 150 }).trim(),
body('description').isLength({ max: 5000 }).trim(),
async (req, res) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Error: Invalid data', errors: errors.array() })

   if (!req.params || !req.params.id) return res.status(400).json({ message: 'Error: Ingredient id is missing in the request URI' })

   const result = await IngredientService.update({
      id: req.params.id,
      category: req.body.category,
      name: req.body.name,
      description: req.body.description
   })

   if (result.message === 'FAILED') return res.status(500).json({ message: `Server Error: Couldn't update the ingredient` })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Error: Ingredient not found' })

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

   if (result.message === 'FAILED') return res.status(500).json({ message: `Server Error: Couldn't delete the ingredient` })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Error: Ingredient not found' })

   return res.status(200).json({ message: 'Ingredient have been deleted' })
})

export default router
