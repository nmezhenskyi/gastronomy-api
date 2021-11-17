import fs from 'fs/promises'
import path from 'path'
import { MemberService } from '../services/member-service'

interface Supervisor {
   email: string,
   password: string,
   firstName: string,
   lastName: string,
   role: string
}

/**
 * Saves supervisors from the file to the database.
 */
export const setSupervisor = async () => {
   const fileData = await fs.readFile(path.join(__dirname, '../../.deployment/supervisor.json'), 'utf-8')
   const supervisors: Supervisor[] = JSON.parse(fileData)

   if (supervisors.length) {
      for (const supervisor of supervisors) {
         const saved = await MemberService.create({
            email: supervisor.email,
            password: supervisor.password,
            firstName: supervisor.firstName,
            lastName: supervisor.lastName,
            role: 'Supervisor'
         })
         if (!saved) throw Error('Error occurred while saving supervisor to the database')
      }
   }

   await fs.unlink(path.join(__dirname, '../../.deployment/supervisor.json'))
}
