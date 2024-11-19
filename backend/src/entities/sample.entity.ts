import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Sample {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;
}