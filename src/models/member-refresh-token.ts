import {
   Entity,
   PrimaryGeneratedColumn,
   Column,
   CreateDateColumn,
   UpdateDateColumn,
   ManyToOne
} from 'typeorm'
import { Member } from './member'

@Entity()
export class MemberRefreshToken {
   @PrimaryGeneratedColumn('uuid')
   id!: string

   @Column({ unique: true })
   token!: string

   @Column()
   memberId!: string

   @Column('timestamp')
   expiryDate!: Date

   @ManyToOne(() => Member, { onDelete: 'CASCADE' })
   member!: Member

   @CreateDateColumn()
   createdAt!: Date

   @UpdateDateColumn()
   updatedAt!: Date
}
