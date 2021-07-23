import {
   Entity,
   PrimaryGeneratedColumn,
   Column,
   CreateDateColumn,
   UpdateDateColumn
} from 'typeorm'

export enum MemberRole {
   SUPERVISOR = 'Supervisor',
   CREATOR = 'Creator'
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

   @Column({ length: 50 })
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
