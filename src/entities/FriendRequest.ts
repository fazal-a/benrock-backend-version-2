import { Entity, PrimaryGeneratedColumn, ManyToOne, BaseEntity, Column, CreateDateColumn } from 'typeorm';
import User from './User';

@Entity("FriendRequestsTable")
export default class FriendRequest extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.sentRequests)
    sender!: User;

    @ManyToOne(() => User, user => user.receivedRequests)
    receiver!: User;

    @Column({ type: 'boolean', default: false })
    isAccepted!: boolean;

    @CreateDateColumn()
    createdAt!: Date;
}
