import {
   Entity,
   PrimaryGeneratedColumn,
   Column,
   CreateDateColumn,
   UpdateDateColumn
} from 'typeorm'
import { Role } from '../common/types'

export enum MemberRole {
   SUPERVISOR = Role.SUPERVISOR,
   CREATOR = Role.CREATOR
}

@Entity()
export class Member {
   @PrimaryGeneratedColumn('uuid')
   id!: string

   @Column({ length: 50 })
   firstName!: string

   @Column({ length: 50 })
   lastName!: string

   @Column({
      type: 'varchar',
      length: 255,
      unique: true
   })
   email!: string

   @Column({ length: 255 })
   password!: string

   @Column({
      type: 'enum',
      enum: MemberRole,
      default: MemberRole.CREATOR
   })
   role!: MemberRole

   @CreateDateColumn()
   createdAt!: Date

   @UpdateDateColumn()
   updatedAt!: Date
}
