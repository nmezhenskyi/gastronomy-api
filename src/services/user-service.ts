import { getRepository } from 'typeorm'
import bcrypt from 'bcrypt'
import { User } from '../models/user'
import { ServiceResponse } from './service-response'
import { TokenService } from './token-service'
import { TokenPair } from '../common/types'
import { CocktailService } from './cocktail-service'

interface UserWithTokenPair {
   user: User,
   accessToken: string,
   refreshToken: string
}

export const UserService = {
   /**
    * Finds users in the database that match given conditions.
    * 
    * @param searchBy Search condition
    * @param offset Search offset
    * @param limit Search limit
    * @returns ServiceResponse object with array of found users
    */
   async find(searchBy?: { location?: string }, offset = 0, limit = 10): Promise<ServiceResponse<User[]>> {
      try {
         const repository = getRepository(User)

         const users = await repository.find({
            select: ['id', 'email', 'name', 'location'],
            where: searchBy,
            order: { createdAt: 'DESC' },
            skip: offset,
            take: limit
         })

         if (!users || users.length === 0) return { success: false, message: 'NOT_FOUND' }

         return {
            success: true,
            message: 'FOUND',
            body: users
         }
      }
      catch (err) {
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Finds one user in the database that matches given conditions.
    * 
    * @param searchBy Search condition
    * @returns ServiceResponse object with found user
    */
   async findOne(searchBy?: { id?: string, email?: string }): Promise<ServiceResponse<User>> {
      try {
         const repository = getRepository(User)

         const user = await repository.findOne({
            select: ['id', 'email', 'name', 'location' ],
            where: searchBy
         })

         if (!user) return { success: false, message: 'NOT_FOUND' }

         return {
            success: true,
            message: 'FOUND',
            body: user
         }
      }
      catch (err) {
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Finds user by credetials. If password doesn't match, returns *NOT_FOUND*.
    * 
    * @param email Member's email
    * @param rawPassword Member's password
    * @returns ServiceResponse object with found member
    */
   async findByCredentials(email: string, rawPassword: string): Promise<ServiceResponse<User>> {
      try {
         const repository = getRepository(User)

         const user = await repository.findOne({ where: { email } })

         if (!user) return { success: false, message: 'NOT_FOUND' }

         const passwordsMatch = await bcrypt.compare(rawPassword, user.password)

         if (!passwordsMatch) return { success: false, message: 'NOT_FOUND' }

         return {
            success: true,
            message: 'FOUND',
            body: { ...user, password: '' }
         }
      }
      catch (err) {
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Adds the member to the database.
    * 
    * @param userDto Information about new user account
    * @returns ServiceResponse object with created user
    */
   async create(userDto: {
      email: string,
      password: string,
      name: string
   }): Promise<ServiceResponse<User>> {
      try {
         const repository = getRepository(User)

         const found = await repository.findOne({ email: userDto.email })

         if (found) return { success: false, message: 'INVALID' }

         const user = new User()
         user.email = userDto.email
         user.password = await bcrypt.hash(userDto.password, 10)
         user.name = userDto.name

         const saved = await repository.save(user)

         return {
            success: true,
            message: 'CREATED',
            body: { ...saved, password: '' }
         }
      }
      catch (err) {
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Registers a new user account by invoking ```create``` method and issuing access and refresh tokens for the user.
    * 
    * @param userDto Information about new user account
    * @returns ServiceResponse object with created user and a token pair
    */
   async register(userDto: {
      email: string,
      password: string,
      name: string
   }): Promise<ServiceResponse<UserWithTokenPair>> {
      const user = await this.create(userDto)

      if (user.message === 'INVALID') return { success: false, message: 'INVALID' }
      if (user.message === 'FAILED' || !user.body) return { success: false, message: 'FAILED' }

      const tokenPair = TokenService.generateTokens({ user: { id: user.body.id } })
      await TokenService.saveUserRefreshToken(user.body.id, tokenPair.refreshToken)

      return {
         success: true,
         message: 'CREATED',
         body: {
            ...tokenPair,
            user: user.body
         }
      }
   },

   /**
    * Verifies user's credentials and issues a pair of access and refresh tokens.
    * 
    * @param email User's email
    * @param password User's password
    * @returns ServiceResponse object with an access and refresh tokens pair
    */
   async login(email: string, password: string): Promise<ServiceResponse<TokenPair>> {
      const user = await this.findByCredentials(email, password)

      if (user.message === 'NOT_FOUND') return { success: false, message: 'NOT_FOUND' }
      if (user.message === 'FAILED' || !user.body) return { success: false, message: 'FAILED' }

      const tokenPair = TokenService.generateTokens({ user: { id: user.body.id } })
      await TokenService.saveUserRefreshToken(user.body.id, tokenPair.refreshToken)

      return {
         success: true,
         message: 'FOUND',
         body: tokenPair
      }
   },

   /**
    * Uses user's refresh token to issue a new pair of access and refresh tokens.
    * 
    * @param refreshToken User's refresh token
    * @returns ServiceResponse object with a new pair of access and refresh tokens
    */
   async refresh(refreshToken: string): Promise<ServiceResponse<TokenPair>> {
      try {
         const userPayload = TokenService.validateRefreshToken(refreshToken)
         const tokenFromDb = await TokenService.findUserRefreshToken(refreshToken)

         if (!userPayload || !tokenFromDb.success) return { success: false, message: 'FAILED' }

         await TokenService.removeUserRefreshToken(refreshToken)

         const repository = getRepository(User)
         const user = await repository.findOne(userPayload.id)
         if (!user) return { success: false, message: 'FAILED' }

         const tokenPair = TokenService.generateTokens({ user: { id: user.id } })
         await TokenService.saveUserRefreshToken(user.id, tokenPair.refreshToken)

         return {
            success: true,
            message: 'UPDATED',
            body: tokenPair
         }
      }
      catch (err) {
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Revokes user's refresh token.
    * 
    * @param refreshToken User's refresh token
    * @returns ServiceResponse object
    */
   async logout(refreshToken: string): Promise<ServiceResponse<null>> {
      const result = await TokenService.removeUserRefreshToken(refreshToken)

      if (result.message === 'FAILED') return { success: false, message: 'FAILED' }

      return {
         success: true,
         message: 'REMOVED',
         body: null
      }
   },

   /**
    * Updates the user in the database.
    * 
    * @param userDto Updated user information
    * @returns ServiceResponse object with updated member
    */
   async update(userDto: {
      id: string,
      email?: string,
      password?: string,
      name?: string,
      location?: string,
      photo?: string
   }): Promise<ServiceResponse<User>> {
      try {
         const repository = getRepository(User)

         const user = await repository.findOne(userDto.id)

         if (!user) return { success: false, message: 'NOT_FOUND' }

         if (userDto.email) user.email = userDto.email
         if (userDto.password) user.password = await bcrypt.hash(userDto.password, 10)
         if (userDto.name) user.name = userDto.name
         if (userDto.location) user.location = userDto.location
         if (userDto.photo) user.photo = userDto.photo

         const saved = await repository.save(user)

         return {
            success: true,
            message: 'UPDATED',
            body: { ...saved, password: '' }
         }
      }
      catch (err) {
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Removes specified user account from the database.
    * 
    * @param id User's id
    * @returns ServiceResponse object
    */
   async remove(id: string): Promise<ServiceResponse<null>> {
      try {
         const repository = getRepository(User)

         const user = await repository.findOne(id)

         if (!user) return { success: false, message: 'NOT_FOUND' }

         await repository.remove(user)

         return {
            success: true,
            message: 'REMOVED',
            body: null
         }
      }
      catch (err) {
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Add the cocktail to the user's list of saved cocktails.
    * 
    * @param userId User's id
    * @param cocktailId Cocktail id
    * @returns ServiceResponse object with updated user account
    */
   async saveCocktail(userId: string, cocktailId: string): Promise<ServiceResponse<User>> {
      try {
         const userRepository = getRepository(User)
         const user = await userRepository.findOne(userId)
         if (!user) return { success: false, message: 'NOT_FOUND' }

         const cocktail = await CocktailService.findOne({ id: cocktailId })
         if (cocktail.message === 'NOT_FOUND') return { success: false, message: 'NOT_FOUND' }
         if (cocktail.message === 'FAILED' || !cocktail.body) return { success: false, message: 'FAILED' }

         if (!user.savedCocktails)
            user.savedCocktails = [cocktail.body]
         else
            user.savedCocktails.push(cocktail.body)

         const saved = await userRepository.save(user)

         return {
            success: true,
            message: 'UPDATED',
            body: saved
         }
      }
      catch (err) {
         console.error(err)
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Finds cocktails from the user's list of saved cocktails.
    * 
    * @param userId User's id
    * @returns ServiceResponse object
    */
   async findSavedCocktails(userId: string): Promise<ServiceResponse<User>> {
      try {
         const userRepository = getRepository(User)
         const user = await userRepository.findOne({ where: { id: userId }, relations: ['savedCocktails']})
         if (!user) return { success: false, message: 'NOT_FOUND' }

         return {
            success: true,
            message: 'FOUND',
            body: user
         }
      }
      catch (err) {
         console.error(err)
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Removes the cocktail from the user's list of saved cocktails.
    * 
    * @param userId User's id
    * @param cocktailId Cocktail id
    * @returns ServiceResponse object with updated user account
    */
   async removeCocktail(userId: string, cocktailId: string): Promise<ServiceResponse<User>> {
      try {
         const userRepository = getRepository(User)
         const user = await userRepository.findOne(userId)
         if (!user) return { success: false, message: 'NOT_FOUND' }

         if (user.savedCocktails && user.savedCocktails.length > 0) {
            user.savedCocktails = user.savedCocktails.filter(cocktail => {
               cocktail.id !== cocktailId
            })
         }

         const saved = await userRepository.save(user)

         return {
            success: true,
            message: 'UPDATED',
            body: saved
         }
      }
      catch (err) {
         return { success: false, message: 'FAILED' }
      }
   }
}
