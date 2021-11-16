import { getRepository } from 'typeorm'
import bcrypt from 'bcrypt'
import { User } from '../models/user'
import { TokenService } from './token-service'
import { TokenPair } from '../common/types'
import { CocktailService } from './cocktail-service'
import { MealService } from './meal-service'
import { ApiError } from '../exceptions/api-error'

interface UserWithTokenPair {
   user: User,
   accessToken: string,
   refreshToken: string
}

export const UserService = {
   /**
    * Finds users in the database that match given conditions.
    * 
    * @param searchBy Search condition.
    * @param offset Search offset.
    * @param limit Search limit.
    * @returns Array of found users.
    */
   async find(searchBy?: { location?: string }, offset = 0, limit = 50): Promise<User[]> {
      const repo = getRepository(User)

      const users = await repo.find({
         select: ['id', 'email', 'name', 'location'],
         where: searchBy,
         order: { createdAt: 'DESC' },
         skip: offset,
         take: limit
      })

      if (!users || !users.length) throw ApiError.NotFound('No users were found')

      return users
   },

   /**
    * Finds one user in the database that matches given conditions.
    * 
    * @param searchBy Search condition.
    * @returns Found user.
    */
   async findOne(searchBy?: { id?: string, email?: string }): Promise<User> {
      const repo = getRepository(User)

      const user = await repo.findOne({
         select: ['id', 'email', 'name', 'location' ],
         where: searchBy
      })

      if (!user) throw ApiError.NotFound('User not found')

      return user
   },

   /**
    * Finds user by credetials.  
    * If password doesn't match, throws `ApiError.NotFound`.
    * 
    * @param email User's email.
    * @param rawPassword User's password.
    * @returns Found user.
    */
   async findByCredentials(email: string, rawPassword: string): Promise<User> {
      const repo = getRepository(User)

      const user = await repo.findOne({ where: { email } })

      if (!user) throw ApiError.NotFound('User not found')

      const passwordsMatch = await bcrypt.compare(rawPassword, user.password)

      if (!passwordsMatch) throw ApiError.NotFound('User not found')

      return { ...user, password: '' }
   },

   /**
    * Adds the member to the database.
    * 
    * @param userDto New user information.
    * @returns Created user.
    */
   async create(userDto: {
      email: string,
      password: string,
      name: string
   }): Promise<User> {
      const repository = getRepository(User)

      const found = await repository.findOne({ email: userDto.email })

      if (found) throw ApiError.BadRequest('User account with this email already exists')

      const user = new User()
      user.email = userDto.email
      user.password = await bcrypt.hash(userDto.password, 10)
      user.name = userDto.name

      const created = await repository.save(user)

      return { ...created, password: '' }
   },

   /**
    * Registers a new user account by invoking `create` method and issuing access and refresh tokens for the user.
    * 
    * @param userDto New user information.
    * @returns Created user and a access-refresh token pair.
    */
   async register(userDto: {
      email: string,
      password: string,
      name: string
   }): Promise<UserWithTokenPair> {
      const user = await this.create(userDto)

      const tokenPair = TokenService.generateTokens({ user: { id: user.id } })
      await TokenService.saveUserRefreshToken(user.id, tokenPair.refreshToken)

      return {
         ...tokenPair,
         user: user
      }
   },

   /**
    * Verifies user's credentials and issues a pair of access and refresh tokens.
    * 
    * @param email User's email.
    * @param password User's password.
    * @returns Access-refresh token pair.
    */
   async login(email: string, password: string): Promise<TokenPair> {
      const user = await this.findByCredentials(email, password)

      const tokenPair = TokenService.generateTokens({ user: { id: user.id } })
      await TokenService.saveUserRefreshToken(user.id, tokenPair.refreshToken)

      return tokenPair
   },

   /**
    * Uses user's refresh token to issue a new pair of access and refresh tokens.
    * 
    * @param refreshToken User's refresh token.
    * @returns New access-refresh token pair.
    */
   async refresh(refreshToken: string): Promise<TokenPair> {
      const userPayload = TokenService.validateRefreshToken(refreshToken)
      const tokenFromDb = await TokenService.findUserRefreshToken(refreshToken)

      if (!userPayload || !tokenFromDb.success) throw ApiError.InternalError('Cannot refresh user access')

      await TokenService.removeUserRefreshToken(refreshToken)

      const repository = getRepository(User)
      const user = await repository.findOne(userPayload.id)
      if (!user) throw ApiError.NotFound('User not found')

      const tokenPair = TokenService.generateTokens({ user: { id: user.id } })
      await TokenService.saveUserRefreshToken(user.id, tokenPair.refreshToken)

      return tokenPair
   },

   /**
    * Revokes user's refresh token.
    * 
    * @param refreshToken User's refresh token.
    */
   async logout(refreshToken: string): Promise<void> {
      await TokenService.removeUserRefreshToken(refreshToken)
   },

   /**
    * Updates the user in the database.
    * 
    * @param userDto User id and updated information.
    * @returns Updated user.
    */
   async update(userDto: {
      id: string,
      email?: string,
      password?: string,
      name?: string,
      location?: string,
      photo?: string
   }): Promise<User> {
      const repository = getRepository(User)

      const user = await repository.findOne(userDto.id)

      if (!user) throw ApiError.NotFound('User not found')

      if (userDto.email) user.email = userDto.email
      if (userDto.password) user.password = await bcrypt.hash(userDto.password, 10)
      if (userDto.name) user.name = userDto.name
      if (userDto.location) user.location = userDto.location
      if (userDto.photo) user.photo = userDto.photo

      const updated = await repository.save(user)

      return { ...updated, password: '' }
   },

   /**
    * Removes specified user account from the database.
    * 
    * @param id User id.
    * @returns Removed user.
    */
   async remove(id: string): Promise<User> {
      const repository = getRepository(User)

      const user = await repository.findOne(id)

      if (!user) throw ApiError.NotFound('User not found')

      await repository.remove(user)

      return user
   },

   /**
    * Add the cocktail to the user's list of saved cocktails.
    * 
    * @param userId User id.
    * @param cocktailId Cocktail id.
    * @returns Updated user.
    */
   async saveCocktail(userId: string, cocktailId: string): Promise<User> {
      const userRepository = getRepository(User)
      const user = await userRepository.findOne(userId)
      if (!user) throw ApiError.NotFound('User not found')

      const cocktail = await CocktailService.findOne({ id: cocktailId })

      if (!user.savedCocktails)
         user.savedCocktails = [cocktail]
      else
         user.savedCocktails.push(cocktail)

      const saved = await userRepository.save(user)

      return saved
   },

   /**
    * Finds cocktails from the user's list of saved cocktails.
    * 
    * @param userId User id.
    * @returns User with saved cocktails.
    */
   async findSavedCocktails(userId: string): Promise<User> {
      const userRepository = getRepository(User)
      const user = await userRepository.findOne({
         select: ['savedCocktails'],
         where: { id: userId },
         relations: ['savedCocktails']
      })

      if (!user) throw ApiError.NotFound('User not found')
      if (!user.savedCocktails || !user.savedCocktails.length) throw ApiError.NotFound('No saved cocktails')

      return user
   },

   /**
    * Removes the cocktail from the user's list of saved cocktails.
    * 
    * @param userId User id.
    * @param cocktailId Cocktail id.
    * @returns Updated user.
    */
   async removeSavedCocktail(userId: string, cocktailId: string): Promise<User> {
      const userRepository = getRepository(User)
      const user = await userRepository.findOne(userId)
      if (!user) throw ApiError.NotFound('User not found')

      if (user.savedCocktails && user.savedCocktails.length > 0) {
         user.savedCocktails = user.savedCocktails.filter(cocktail => {
            cocktail.id !== cocktailId
         })
      }

      const saved = await userRepository.save(user)

      return saved
   },

   /**
    * Add meal to user's list of saved meals.
    * 
    * @param userId User id.
    * @param mealId Meal id.
    * @returns Updated user.
    */
   async saveMeal(userId: string, mealId: string): Promise<User> {
      const userRepository = getRepository(User)
      const user = await userRepository.findOne(userId)
      if (!user) throw ApiError.NotFound('User not found')

      const meal = await MealService.findOne({ id: mealId })

      if (!user.savedMeals)
         user.savedMeals = [meal]
      else
         user.savedMeals.push(meal)

      const saved = await userRepository.save(user)

      return saved
   },

   /**
    * Finds meals from user's list of saved meals.
    * 
    * @param userId User id.
    * @returns User with saved meals.
    */
   async findSavedMeals(userId: string): Promise<User> {
      const userRepository = getRepository(User)
      const user = await userRepository.findOne({
         select: ['savedMeals'],
         where: { id: userId },
         relations: ['savedMeals']
      })
      
      if (!user) throw ApiError.NotFound('User not found')
      if (!user.savedMeals || !user.savedMeals.length) throw ApiError.NotFound('No saved meals')

      return user
   },

   /**
    * Removes meal from user's list of saved meals.
    * 
    * @param userId User id.
    * @param mealId Meal id.
    * @returns Updated user.
    */
   async removeSavedMeal(userId: string, mealId: string): Promise<User> {
      const userRepository = getRepository(User)
      const user = await userRepository.findOne(userId)
      if (!user) throw ApiError.NotFound('User not found')

      if (user.savedMeals && user.savedMeals.length > 0) {
         user.savedMeals = user.savedMeals.filter(meal => {
            meal.id !== mealId
         })
      }

      const saved = await userRepository.save(user)

      return saved
   }
}
