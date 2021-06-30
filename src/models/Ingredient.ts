import {
   Entity,
   PrimaryGeneratedColumn,
   Column,
   CreateDateColumn,
   UpdateDateColumn,
   OneToMany
} from 'typeorm'
import { CocktailToIngredient } from './CocktailToIngredient'

@Entity()
export class Ingredient {
   @PrimaryGeneratedColumn('uuid')
   id!: string

   @Column({
      type: 'varchar',
      length: '150'
   })
   type!: string

   @Column({
      type: 'varchar',
      length: '150',
      unique: true
   })
   name!: string

   @Column({
      type: 'text',
      nullable: true
   })
   description: string

   @OneToMany(() => CocktailToIngredient, cocktailToIngredient => cocktailToIngredient.ingredient, { nullable: true })
   ingredientToCoktails: CocktailToIngredient[]

   @CreateDateColumn()
   createdAt!: Date

   @UpdateDateColumn()
   updatedAt!: Date
}
