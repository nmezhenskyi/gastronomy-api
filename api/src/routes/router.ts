import express from 'express'
import { MainController } from '../controllers/main-controller'
import { router as ingredientsRouter } from './ingredients'
import { router as cocktailsRouter } from './cocktails'
import { router as mealsRouter } from './meals'
import { router as userRouter } from './user'
import { router as memberRouter } from './member'

/**
 * Provides routing for the whole API.
 */
export const router = express.Router()

// Main end-points:
router.get('/', MainController.root)
router.get('/ping', MainController.ping)

// Resource end-points:
router.use('/ingredients', ingredientsRouter)
router.use('/cocktails', cocktailsRouter)
router.use('/meals', mealsRouter)
router.use('/user', userRouter)
router.use('/member', memberRouter)
