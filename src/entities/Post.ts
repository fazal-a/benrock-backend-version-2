import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn, OneToMany
} from 'typeorm';
import User from './User';
import Like from "./Like";

@Entity("PostsTable")
export default class Post extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: 'varchar', default: ''})
    title!: string;

    @Column({type: 'varchar', default: ''})
    description!: string;

    @Column({type: 'varchar'})
    type!: 'photo' | 'video';

    @Column({type: 'varchar'})
    path!: string;

    @Column({type: 'varchar', nullable: true})
    thumbnail?: string;

    @Column({type: 'int', default: 0})
    clicks!: number;

    @OneToMany(() => Like, like => like.post)
    likes!: Like[];

    @Column({type: 'int', default: 0})
    impressions!: number;

    @ManyToOne(() => User, user => user.posts)
    createdBy!: User;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
