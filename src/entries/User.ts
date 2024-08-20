import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity } from 'typeorm';
import Post from './Post';
import Friend from './Friend';
import Chat from './Chat';

@Entity("UsersTable")
export default class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar' })
    name!: string;

    @Column({ type: 'varchar', unique: true })
    email!: string;

    @Column({ type: 'varchar' })
    password!: string;

    @OneToMany(() => Post, post => post.user)
    posts!: Post[];

    @OneToMany(() => Friend, friend => friend.user)
    friends!: Friend[];

    @OneToMany(() => Chat, chat => chat.sender)
    sentChats!: Chat[];

    @OneToMany(() => Chat, chat => chat.receiver)
    receivedChats!: Chat[];
}
