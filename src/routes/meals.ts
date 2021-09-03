import express, { Request } from 'express'
import { MealService } from '../services/meal-service'
import { paramToInt } from '../common/utils'

const router = express.Router()

interface GetMealsQuery {
   offset?: string,
   limit?: string,
   name?: string
}

/**
 * Find meals.
 * 
 * @route   GET /meals
 * @access  Public
 */
router.get('/', async (req: Request<unknown, unknown, unknown, GetMealsQuery>, res) => {
   const { offset, limit } = req.query

   const result = await MealService.find({}, paramToInt(offset), paramToInt(limit))

   if (result.message === 'FAILED') return res.status(500).json({ message: 'Query failed' })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Nothing found' })

   return res.status(200).json(result.body)
})

export default router
