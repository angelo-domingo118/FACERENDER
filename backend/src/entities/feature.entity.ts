import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('features')
export class Feature {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  publicId!: string;

  @Column()
  secureUrl!: string;

  @Column()
  category!: string;

  @Column()
  type!: number;

  @Column('jsonb')
  metadata!: Record<string, any>;

  @Column('text', { array: true })
  tags!: string[];
} 