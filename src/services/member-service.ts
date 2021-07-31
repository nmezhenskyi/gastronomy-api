import { getRepository } from 'typeorm'
import bcrypt from 'bcrypt'
import { Member, MemberRole } from '../models/member'
import { ServiceResponse } from './service-response'
import { TokenService } from './token-service'

export const MemberService = {
   /**
    * Finds members in the database that match given conditions.
    * 
    * @param searchBy Search condition
    * @param offset Search offset
    * @param limit Search limit
    * @returns ServiceResponse object with array of found members
    */
   async find(searchBy?: {
      firstName?: string,
      lastName?: string,
      role?: MemberRole
   }, offset = 0, limit = 10): Promise<ServiceResponse<Member[]>> {
      try {
         const repository = getRepository(Member)

         const members = await repository.find({
            select: ['id', 'firstName', 'lastName', 'email', 'role'],
            where: searchBy,
            order: { createdAt: 'DESC' },
            skip: offset,
            take: limit
         })

         if (!members || members.length === 0) return { success: false, message: 'NOT_FOUND' }

         return {
            success: true,
            message: 'FOUND',
            body: members
         }
      }
      catch (err) {
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Finds one member in the database that matches given conditions.
    * 
    * @param searchBy Search condition
    * @returns ServiceResponse object with found user
    */
   async findOne(searchBy?: { id?: string, email?: string }): Promise<ServiceResponse<Member>> {
      try {
         const repository = getRepository(Member)

         const member = await repository.findOne({
            select: ['id', 'firstName', 'lastName', 'email', 'role'],
            where: searchBy
         })

         if (!member) return { success: false, message: 'NOT_FOUND' }

         return {
            success: true,
            message: 'FOUND',
            body: member
         }
      }
      catch (err) {
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Finds member by credetials. If password doesn't match, returns *NOT_FOUND*.
    * 
    * @param email Member's email
    * @param rawPassword Member's password
    * @returns ServiceResponse object with found member
    */
   async findByCredentials(email: string, rawPassword: string): Promise<ServiceResponse<Member>> {
      try {
         const repository = getRepository(Member)

         const member = await repository.findOne({ where: { email }})

         if (!member) return { success: false, message: 'NOT_FOUND' }

         const passwordsMatch = await bcrypt.compare(rawPassword, member.password)

         if (!passwordsMatch) return { success: false, message: 'NOT_FOUND' }

         return {
            success: true,
            message: 'FOUND',
            body: { ...member, password: '' }
         }
      }
      catch (err) {
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Adds the member to the database.
    * 
    * @param memberDto Information about new member account
    * @returns ServiceResponse object with created member
    */
   async create(memberDto: {
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      role: 'Creator' | 'Supervisor'
   }): Promise<ServiceResponse<Member>> {
      try {
         const repository = getRepository(Member)

         const found = await repository.findOne({ email: memberDto.email })

         if (found) return { success: false, message: 'INVALID' }

         const member = new Member()
         member.email = memberDto.email
         member.password = await bcrypt.hash(memberDto.password, 10)
         member.firstName = memberDto.firstName
         member.lastName = memberDto.lastName
         if (memberDto.role === 'Creator') member.role = MemberRole.CREATOR
         else if (memberDto.role === 'Supervisor') member.role = MemberRole.SUPERVISOR

         const saved = await repository.save(member)

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
    * Verifies member's credentials and issues an access token.
    * 
    * @param email Member's email
    * @param password Member's password
    * @returns ServiceResponse object with access token string
    */
   async login(email: string, password: string): Promise<ServiceResponse<string>> {
      const member = await this.findByCredentials(email, password)

      if (member.message === 'NOT_FOUND') return { success: false, message: 'NOT_FOUND' }
      if (member.message === 'FAILED' || !member.body) return { success: false, message: 'FAILED' }

      const { accessToken } = TokenService.generateTokens({ member: { id: member.body.id, role: member.body.role.toString() } })

      return {
         success: true,
         message: 'FOUND',
         body: accessToken
      }
   },

   /**
    * Updates the member in the database.
    * 
    * @param memberDto Updated member information
    * @returns ServiceResponse object with updated member
    */
   async update(memberDto: {
      id: string,
      email?: string,
      password?: string,
      firstName?: string,
      lastName?: string,
      role?: 'Creator' | 'Supervisor'
   }): Promise<ServiceResponse<Member>> {
      try {
         const repository = getRepository(Member)

         const member = await repository.findOne(memberDto.id)

         if (!member) return { success: false, message: 'NOT_FOUND' }

         if (memberDto.email) member.email = memberDto.email
         if (memberDto.password) member.password = await bcrypt.hash(memberDto.password, 10)
         if (memberDto.firstName) member.firstName = memberDto.firstName
         if (memberDto.lastName) member.lastName = memberDto.lastName
         if (memberDto.role) {
            if (memberDto.role === 'Creator') member.role = MemberRole.CREATOR
            else if (memberDto.role === 'Supervisor') member.role = MemberRole.SUPERVISOR
         }

         const saved = await repository.save(member)

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
    * Removes specified member account from the database.
    * 
    * @param id Member's id
    * @returns ServiceResponse object
    */
   async remove(id: string): Promise<ServiceResponse<null>> {
      try {
         const repository = getRepository(Member)

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
