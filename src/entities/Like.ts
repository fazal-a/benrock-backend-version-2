import {Entity, PrimaryGeneratedColumn, ManyToOne, BaseEntity, CreateDateColumn, Unique} from 'typeorm';
import User from './User';
import Post from './Post';

@Entity("LikesTable")
@Unique(['user', 'post'])
export default class Like extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.likes)
    user!: User;

    @ManyToOne(() => Post, post => post.likes)
    post!: Post;

    @CreateDateColumn()
    createdAt!: Date;
}
