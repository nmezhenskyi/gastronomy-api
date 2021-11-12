import express from 'express'
import ingredientsRouter from './ingredients'
import cocktailsRouter from './cocktails'
import mealsRouter from './meals'
import userRouter from './user'
import memberRouter from './member'
import { MainController } from '../controllers/main-controller'

/**
 * Provides routing for the whole API.
 */
export const router = express.Router()

// Main:
router.get('/', MainController.root)
router.get('/ping', MainController.ping)

router.use('/ingredients', ingredientsRouter)
router.use('/cocktails', cocktailsRouter)
router.use('/meals', mealsRouter)
router.use('/user', userRouter)
router.use('/member', memberRouter)
