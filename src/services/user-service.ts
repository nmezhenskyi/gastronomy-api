import { getRepository } from 'typeorm'
import bcrypt from 'bcrypt'
import { User } from '../models/user'
import { ServiceResponse } from './service-response'
import { TokenService } from './token-service'

interface UserWithTokenPair {
   user: User,
   accessToken: string,
   refreshToken: string
}

interface TokenPair {
   accessToken: string,
   refreshToken: string
}

export const UserService = {
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

   async findOne(searchBy?: { id?: string, email?: string }): Promise<ServiceResponse<User>> {
      try {
         const repository = getRepository(User)

         const user = await repository.findOne({
            select: ['id', 'email', 'name', 'location'],
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

   async findByCredentials(email: string, rawPassword: string): Promise<ServiceResponse<User>> {
      try {
         const repository = getRepository(User)

         const user = await repository.findOne({
            select: ['id', 'email', 'name', 'location'],
            where: { email }
         })

         if (!user) return { success: false, message: 'NOT_FOUND' }

         const passwordsMatch = await bcrypt.compare(rawPassword, user.password)

         if (!passwordsMatch) return { success: false, message: 'NOT_FOUND' }

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

   async create(userDto: {
      email: string,
      password: string,
      name: string
   }): Promise<ServiceResponse<User>> {
      try {
         const repository = getRepository(User)

         const found = await repository.findOne({ email: userDto.email })

         if (found) return { success: false, message: 'INVALID_DATA' }

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

   async register(userDto: {
      email: string,
      password: string,
      name: string
   }): Promise<ServiceResponse<UserWithTokenPair>> {
      const user = await this.create(userDto)

      if (user.message === 'INVALID_DATA') return { success: false, message: 'INVALID_DATA' }
      if (user.message === 'FAILED' || !user.body) return { success: false, message: 'FAILED' }

      const tokenPair = TokenService.generateTokens({ user: { id: user.body.id } })
      await TokenService.saveRefreshToken(user.body.id, tokenPair.refreshToken)

      return {
         success: true,
         message: 'CREATED',
         body: {
            ...tokenPair,
            user: user.body
         }
      }
   },

   async login(email: string, password: string): Promise<ServiceResponse<TokenPair>> {
      const user = await this.findByCredentials(email, password)

      if (user.message === 'NOT_FOUND') return { success: false, message: 'NOT_FOUND' }
      if (user.message === 'FAILED' || !user.body) return { success: false, message: 'FAILED' }

      const tokenPair = TokenService.generateTokens({ user: { id: user.body.id } })
      await TokenService.saveRefreshToken(user.body.id, tokenPair.refreshToken)

      return {
         success: true,
         message: 'FOUND',
         body: tokenPair
      }
   },

   // async refresh(refreshToken: string): Promise<ServiceResponse<TokenPair>> {
   //    const userPayload = TokenService.validateRefreshToken(refreshToken)
   //    const tokenFromDb = await TokenService.findRefreshToken(refreshToken)

      
   // },

   async logout(refreshToken: string): Promise<ServiceResponse<null>> {
      const result = await TokenService.removeRefreshToken(refreshToken)

      if (result.message === 'FAILED') return { success: false, message: 'FAILED' }

      return {
         success: true,
         message: 'REMOVED',
         body: null
      }
   },

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
   }
}
