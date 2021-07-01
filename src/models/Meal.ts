import {
   Entity,
   PrimaryGeneratedColumn,
   Column,
   CreateDateColumn,
   UpdateDateColumn,
   OneToMany
} from 'typeorm'
import { MealToIngredient } from './MealToIngredient'

@Entity()
export class Meal {
   @PrimaryGeneratedColumn()
   id!: string

   @Column({
      length: 100,
      unique: true
   })
   name!: string

   @Column({
      type: 'text',
      nullable: true
   })
   description: string | null

   @Column({
      type: 'varchar',
      length: 20,
      nullable: true
   })
   cuisine: string | null

   @Column('text')
   cookingInstructions!: string

   @OneToMany(() => MealToIngredient, mealToIngredient => mealToIngredient.meal, { eager: true })
   mealToIngredients!: MealToIngredient[]

   @CreateDateColumn()
   createdAt!: Date

   @UpdateDateColumn()
   updatedAt!: Date
}
