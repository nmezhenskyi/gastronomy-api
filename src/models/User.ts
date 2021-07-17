import {
   Entity,
   PrimaryGeneratedColumn,
   Column,
   CreateDateColumn,
   UpdateDateColumn,
} from 'typeorm'

@Entity()
export class User {
   @PrimaryGeneratedColumn('uuid')
   id!: string

   @Column({ length: 255 })
   name!: string

   @Column({ length: 255 })
   email!: string

   @Column({ length: 50 })
   password!: string

   @Column({
      type: 'varchar',
      length: 100,
      nullable: true
   })
   location: string | null

   @Column({
      type: 'varchar',
      length: 255,
      nullable: true
   })
   photo: string | null

   @CreateDateColumn()
   createdAt!: Date

   @UpdateDateColumn()
   updatedAt!: Date
}
