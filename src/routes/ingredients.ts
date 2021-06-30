import express from 'express'
import { body, validationResult } from 'express-validator'
import IngredientService from '../service/IngredientService'

const router = express.Router()

/**
 * @route   GET /ingredients
 * @desc    
 * @access  Public
 */
router.get('/', async (_, res) => {
   const result = await IngredientService.find()

   if (!result.success) return res.status(500).json({ message: result.message })

   if (result.body == null) return res.status(404).json({ message: result.message })

   return res.status(200).json(result.body)
})

/**
 * @route   POST /ingredients
 * @desc
 * @access  Public (temporary)
 */
router.post('/',
body('type').notEmpty().isLength({ max: 150 }).trim(),
body('name').notEmpty().isLength({ max: 150 }).trim(),
body('description').isLength({ max: 5000 }).trim(),
async (req, res) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Validation error', errors: errors.array() })

   const result = await IngredientService.create({
      type: req.body.type,
      name: req.body.name,
      description: req.body.description
   })

   if (!result.success) return res.status(500).json({ message: result.message })

   return res.status(200).json({ message: result.message, body: result.body })
})

// /**
//  * @route   DELETE /ingredients/:id
//  * @desc
//  * @access  Public (temporary)
//  */
// router.delete('/:id', async (req, res) => {

// })

export default router
