import {
   Entity,
   PrimaryGeneratedColumn,
   Column,
   CreateDateColumn,
   UpdateDateColumn,
   ManyToOne
} from 'typeorm'
import { User } from './user'

@Entity()
export class UserRefreshToken {
   @PrimaryGeneratedColumn('uuid')
   id!: string

   @Column({ unique: true })
   token!: string

   @Column()
   userId!: string

   @Column('timestamp')
   expiryDate!: Date

   @ManyToOne(() => User, { onDelete: 'CASCADE' })
   user!: User

   @CreateDateColumn()
   createdAt!: Date

   @UpdateDateColumn()
   updatedAt!: Date
}
