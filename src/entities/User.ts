import {Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity} from 'typeorm';
import Post from './Post';

@Entity("UsersTable")
export default class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: 'varchar'})
    firstName!: string;

    @Column({type: 'varchar'})
    lastName!: string;

    @Column({type: 'varchar', unique: true})
    userName!: string;

    @Column({type: 'varchar', unique: true})
    email!: string;

    @Column({type: 'varchar'})
    password!: string;

    @Column({type: 'varchar', nullable: true})
    gender?: string;

    @Column({type: 'varchar', nullable: true})
    profileImage?: string;

    @OneToMany(() => Post, post => post.createdBy)
    posts!: Post[];
}
