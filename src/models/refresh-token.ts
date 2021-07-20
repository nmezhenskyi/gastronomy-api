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
export class RefreshToken {
   @PrimaryGeneratedColumn('uuid')
   id!: string

   @Column()
   token!: string

   @ManyToOne(() => User)
   user!: User

   @CreateDateColumn()
   createdAt!: Date

   @UpdateDateColumn()
   updatedAt!: Date
}
