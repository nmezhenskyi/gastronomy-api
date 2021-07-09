import express, { Request } from 'express'
import { body, validationResult } from 'express-validator'
import CocktailService from '../services/CocktailService'
import { paramToInt } from '../common/utils'

const router = express.Router()

/**
 * Represents query parameters for the ```GET /cocktails``` request.
 */
interface GetCocktailsQuery {
   offset: string,
   limit: string,
   name: string
}

/**
 * Retrieve cocktails.
 * 
 * @route   GET /cocktails
 * @access  Public
 */
router.get('/', async (req: Request<unknown, unknown, unknown, GetCocktailsQuery>, res) => {
   const { offset, limit } = req.query

   const result = await CocktailService.find({}, paramToInt(offset), paramToInt(limit))

   if (result.message === 'FAILED') return res.status(500).json({ message: 'Server Error: Query failed' })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Error: Nothing found' })

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

   if (result.message === 'FAILED') return res.status(500).json({ message: `Server Error: Query failed` })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Error: Cocktail not found' })

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
      return res.status(400).json({ message: 'Error: Invalid data', errors: errors.array() })

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

/**
 * Update the cocktail by id.
 * 
 * @route   PUT /cocktails/:id
 * @access  Public
 */
router.put('/:id',
body('name').isLength({ max: 100 }).trim(),
body('description').isLength({ max: 5000 }).trim(),
body('method').isLength({ max: 3000 }).trim(),
body('notesOnIngredients').isLength({ max: 2000 }).trim(),
body('notesOnExecution').isLength({ max: 2000 }).trim(),
body('notesOnTaste').isLength({ max: 1000 }).trim(),
async (req, res) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Error: Invalid data', errors: errors.array() })

   if (!req.params || !req.params.id) return res.status(400).json({ message: 'Error: Cocktail id is missing in the request URI' })

   const result = await CocktailService.update({
      id: req.params.id,
      name: req.body.name,
      description: req.body.description,
      method: req.body.method,
      notesOnIngredients: req.body.notesOnIngredients,
      notesOnExecution: req.body.notesOnExecution,
      notesOnTaste: req.body.notesOnTaste
   })

   if (result.message === 'FAILED') return res.status(500).json({ message: `Server Error: Couldn't update the cocktail` })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Error: Not found' })

   return res.status(200).json(result)
})

/**
 * Add ingredient to the cocktail.
 * 
 * @route   PUT /cocktails/:id/ingredients
 * @access  Public
 */
router.put('/:id/ingredients',
body('ingredientId').isLength({ max: 36 }),
body('type').isLength({ max: 150 }).trim(),
body('name').isLength({ max: 150 }).trim(),
body('description').isLength({ max: 5000 }).trim(),
body('amount').notEmpty().isLength({ max: 20 }).trim(),
async (req, res) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Error: Invalid data', errors: errors.array() })

   if (!req.params || !req.params.id) return res.status(400).json({ message: 'Error: Cocktail id is missing in the request URI' })

   let result
   if (req.body.ingredientId){
      result = await CocktailService.addIngredient(req.params.id, req.body.ingredientId, req.body.amount)
   }
   else if (req.body.type && req.body.name) {
      result = await CocktailService.addIngredient(req.params.id, {
         type: req.body.type,
         name: req.body.name,
         description: req.body.description
      }, req.body.amount)
   }
   else {
      return res.status(400).json({ message: 'Error: Ingredient id, type, and name are missing in the request body' })
   }
   
   if (result.message === 'FAILED') return res.status(500).json({ message: `Server Error: Couldn't add the ingredient to the cocktail` })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Error: Resource not found' })

   return res.status(200).json(result)
})

/**
 * Remove ingredient from the cocktail.
 * 
 * @route   DELETE /cocktails/:id/ingredients/:ingredientId
 * @access  Public
 */
router.delete('/:id/ingredients/:ingredientId', async (req, res) => {
   const result = await CocktailService.removeIngredient(req.params.id, req.params.ingredientId)

   if (result.message === 'FAILED') return res.status(500).json({ message: `Server Error: Couldn't remove the ingredient from the cocktail` })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Error: Resource not found' })

   return res.status(200).json({ message: 'Ingredient have been removed from the cocktail' })
})

/**
 * Delete the cocktail by id.
 * 
 * @route   DELETE /cocktails/:id
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
   const result = await CocktailService.remove(req.params.id)

   if (result.message === 'FAILED') return res.status(500).json({ message: `Server Error: Couldn't delete the cocktail` })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Error: Cocktail not found' })

   return res.status(200).json({ message: 'Cocktail have been deleted' })
})

export default router
