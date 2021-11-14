import express from 'express'
import { body } from 'express-validator'
import { IngredientController } from '../controllers/ingredient-controller'

export const router = express.Router()

/**
 * Get all ingredients.
 * 
 * @route   GET /ingredients
 * @access  Public
 */
router.get('/', IngredientController.getAll)

/**
 * Get one ingredient by id.
 * 
 * @route   GET /ingredients/:id
 * @access  Public
 */
router.get('/:id', IngredientController.getById)

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
   IngredientController.create)

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
   IngredientController.updateById)

/**
 * Delete the ingredient by id.
 * 
 * @route   DELETE /ingredients/:id
 * @access  Public
 */
router.delete('/:id', IngredientController.deleteById)
