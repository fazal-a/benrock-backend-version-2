import { Entity, PrimaryGeneratedColumn, ManyToOne, BaseEntity, CreateDateColumn } from 'typeorm';
import User from './User';

@Entity("FriendshipsTable")
export default class Friendship extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.friends)
    user1!: User;

    @ManyToOne(() => User, user => user.friends)
    user2!: User;

    @CreateDateColumn()
    createdAt!: Date;
}
