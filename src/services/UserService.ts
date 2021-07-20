import { getRepository } from 'typeorm'
import bcrypt from 'bcrypt'
import { User } from '../models/User'
import { ServiceResponse } from './ServiceResponse'

const UserService = {
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

export default UserService
