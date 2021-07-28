import { getRepository } from 'typeorm'
import bcrypt from 'bcrypt'
import { Member, MemberRole } from '../models/member'
import { ServiceResponse } from './service-response'

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
      supervisor: boolean
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
         member.role = memberDto.supervisor ? MemberRole.SUPERVISOR : MemberRole.CREATOR

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
   }   
}
