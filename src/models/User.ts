import {
   Entity,
   PrimaryGeneratedColumn,
   Column,
   CreateDateColumn,
   UpdateDateColumn
} from 'typeorm'

@Entity()
export class User {
   @PrimaryGeneratedColumn('uuid')
   id!: string

   @Column({ length: 50 })
   name!: string

   @Column()
   email!: string

   @Column()
   password!: string

   @Column({ type: 'date' })
   dateOfBith!: Date

   @CreateDateColumn()
   createdAt!: Date

   @UpdateDateColumn()
   updatedAt!: Date
}
