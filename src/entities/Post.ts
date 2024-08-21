import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity } from 'typeorm';

import User from './User';

@Entity('PostsTable')
export default class Post extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar' })
    postTitle!: string;

    @Column({ type: 'varchar' })
    postDescription!: string;

    @ManyToOne(() => User, user => user.posts)
    user!: User;
}