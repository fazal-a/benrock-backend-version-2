// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity } from 'typeorm';
// import User from './User';
//
// @Entity('ChatsTable')
// export default class Chat extends BaseEntity {
//     @PrimaryGeneratedColumn()
//     id!: number;
//
//     @Column({ type: 'text' })
//     message!: string;
//
//     @ManyToOne(() => User, user => user.sentChats)
//     sender!: User;
//
//     @ManyToOne(() => User, user => user.receivedChats)
//     receiver!: User;
// }

