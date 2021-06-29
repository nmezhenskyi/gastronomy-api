import {
   Entity,
   PrimaryGeneratedColumn,
   Column,
   CreateDateColumn,
   UpdateDateColumn
} from 'typeorm'

@Entity()
export class Cocktail {
   @PrimaryGeneratedColumn()
   id: number

   @Column({ length: 100 })
   name: string

   @Column('text')
   description: string

   @Column('text')
   ingredients: string

   @Column('text')
   method: string

   @Column()
   tastingNotes: string

   @CreateDateColumn()
   createdAt: Date

   @UpdateDateColumn()
   updatedAt: Date
}
