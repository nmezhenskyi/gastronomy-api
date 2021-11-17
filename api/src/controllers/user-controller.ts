import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { UserService } from '../services/user-service'
import { ReviewService } from '../services/review-service'
import { AuthRequest } from '../common/types'
import { COOKIE_MAX_AGE } from '../common/constants'
import { ApiError } from '../exceptions/api-error'

/**
 * Handles `User` operations.
 */
export const UserController = {
   /**
    * Create new user account.
    */
   async register(req: Request, res: Response, next: NextFunction) {
      try {
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
            throw ApiError.BadRequest('Invalid data in the request body', errors.array())
         }

         const user = await UserService.register({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
         })
         res.cookie('userRefreshToken', user.refreshToken, { maxAge: COOKIE_MAX_AGE, httpOnly: true })
         
         return res.status(200).json(user)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Log in and get access token.
    */
   async login(req: Request, res: Response, next: NextFunction) {
      try {
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
            throw ApiError.BadRequest('Invalid data in the request body', errors.array())
         }

         const tokenPair = await UserService.login(req.body.email, req.body.password)
         res.cookie('userRefreshToken', tokenPair.refreshToken, { maxAge: COOKIE_MAX_AGE, httpOnly: true })

         return res.status(200).json(tokenPair)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Log out and remove refresh token.
    */
   async logout(req: Request, res: Response, next: NextFunction) {
      try {
         if (!req.cookies?.userRefreshToken) return res.status(200).send()

         const { userRefreshToken } = req.cookies
         await UserService.logout(userRefreshToken)
         res.clearCookie('userRefreshToken')

         return res.status(200).send()
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Get new access token by using refresh token.
    */
   async refreshAccess(req: Request, res: Response, next: NextFunction) {
      try {
         if (!req.cookies?.userRefreshToken) throw ApiError.BadRequest('Refresh token is missing')

         const { userRefreshToken } = req.cookies
         const tokenPair = await UserService.refresh(userRefreshToken)
         res.cookie('userRefreshToken', tokenPair.refreshToken, { maxAge: COOKIE_MAX_AGE, httpOnly: true })

         return res.status(200).json(tokenPair)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Find current user's profile.
    */
   async getSelf(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         const user = await UserService.findOne({ id: req.user!.id })

         return res.status(200).json(user)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Update current user's profile.
    */
   async updateSelf(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
            throw ApiError.BadRequest('Invalid data in the request body', errors.array())
         }

         const user = await UserService.update({
            id: req.user!.id,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            location: req.body.location,
            photo: req.body.photo
         })

         return res.status(200).json(user)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Delete current user's profile.
    */
   async deleteSelf(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         const user = await UserService.remove(req.user!.id)

         return res.status(200).json({ message: `User ${user.id} has been deleted` })
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Find current user's saved cocktails.
    */
   async getSavedCocktails(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         const user = await UserService.findSavedCocktails(req.user!.id)

         return res.status(200).json(user)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Add cocktail to the list of saved cocktails.
    */
   async saveCocktail(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
            throw ApiError.BadRequest('Invalid data in the request body', errors.array())
         }

         const user = await UserService.saveCocktail(req.user!.id, req.body.cocktailId)

         return res.status(200).json(user)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Remove cocktail from the list of saved cocktails.
    */
   async unsaveCocktail(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         if (!req.params.cocktailId) {
            throw ApiError.BadRequest('Cocktail id is missing in request URI')
         }

         await UserService.removeSavedCocktail(req.user!.id, req.params.cocktailId)

         return res.status(200).json({ message: `Cocktail ${req.params.cocktailId} has been removed from saved cocktails` })
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Find current user's saved meals.
    */
   async getSavedMeals(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         const user = await UserService.findSavedMeals(req.user!.id)

         return res.status(200).json(user)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Add meal to the list of saved meals.
    */
   async saveMeal(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
            throw ApiError.BadRequest('Invalid data in the request body', errors.array())
         }

         const user = await UserService.saveMeal(req.user!.id, req.body.mealId)

         return res.status(200).json(user)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Remove meal from the list of saved meals.
    */
   async unsaveMeal(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         if (!req.params.mealId) {
            throw ApiError.BadRequest('Meal id is missing in request URI')
         }

         await UserService.removeSavedMeal(req.user!.id, req.params.mealId)

         return res.status(200).json({ message: `Meal ${req.params.mealId} has been removed from saved meals` })
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Find current user's cocktail reviews.
    */
   async getCocktailReviews(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         const reviews = await ReviewService.findCocktailReviews({ userId: req.user!.id })

         return res.status(200).json(reviews)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Find current user's meal reviews.
    */
   async getMealReviews(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         const reviews = await ReviewService.findMealReviews({ userId: req.user!.id })

         return res.status(200).json(reviews)
      }
      catch (err: unknown) {
         return next(err)
      }
   }
}
