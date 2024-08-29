import {Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity, CreateDateColumn} from 'typeorm';
import Post from './Post';
import FriendRequest from "./FriendRequest";
import Friendship from "./Friendship";
import Like from "./Like";

@Entity("UsersTable")
export default class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: 'varchar', unique: true})
    userName!: string;

    @Column({type: 'varchar', unique: true})
    email!: string;

    @Column({type: 'varchar'})
    password!: string;

    @Column({type: 'varchar'})
    firstName!: string;

    @Column({type: 'varchar'})
    lastName!: string;

    @Column({type: 'varchar', nullable: true})
    gender?: string;

    @Column({type: 'varchar', nullable: true})
    profileImage?: string;

    @Column({type: 'boolean', nullable: true, default: false})
    emailVerified?: boolean;

    @Column({type: 'varchar', nullable: true, default: null})
    otp?: string;

    @Column({type: 'varchar', nullable: true, default: null})
    otpExpires?: string;

    @OneToMany(() => Post, post => post.createdBy)
    posts!: Post[];

    @OneToMany(() => FriendRequest, friendRequest => friendRequest.sender)
    sentRequests!: FriendRequest[];

    @OneToMany(() => FriendRequest, friendRequest => friendRequest.receiver)
    receivedRequests!: FriendRequest[];

    @OneToMany(() => Friendship, friendship => {
        return friendship.user1 || friendship.user2
    })
    friends!: Friendship[];

    @OneToMany(() => Like, like => like.user)
    likes!: Like[];

    @CreateDateColumn()
    createdAt!: Date;
}
