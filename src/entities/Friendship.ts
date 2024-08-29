import {Entity, PrimaryGeneratedColumn, ManyToOne, BaseEntity, CreateDateColumn, Unique} from 'typeorm';
import User from './User';

@Entity("FriendshipsTable")
@Unique(['user1', 'user2'])
export default class Friendship extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.friends)
    user1!: User;

    @ManyToOne(() => User, user => user.friends)
    user2!: User;

    @CreateDateColumn()
    createdAt!: Date;

    static createOrderedFriendship(user1: User, user2: User): Friendship {
        // Ensure user1 always has a smaller ID than user2 to avoid duplication
        if (user1.id > user2.id) {
            [user1, user2] = [user2, user1];
        }

        return Friendship.create({ user1, user2 });
    }
}
