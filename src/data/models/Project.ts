import { Table, Column, Model, DataType, PrimaryKey, Default, CreatedAt, UpdatedAt, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript";
import { User } from "./User";
import { Task } from "./Task";
import { GithubRepository } from "./GithubRepository";

@Table({
    tableName: "projects",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt"
})
export class Project extends Model {
    @PrimaryKey
    @Default(() => {
        // Simples gerador de CUID usando timestamp + random
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 8);
        return `c${timestamp}${randomPart}`;
    })
    @Column(DataType.STRING)
    id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    name!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true
    })
    description!: string | null;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false
    })
    userId!: string;

    @CreatedAt
    @Column(DataType.DATE)
    createdAt!: Date;

    @UpdatedAt
    @Column(DataType.DATE)
    updatedAt!: Date;

    @BelongsTo(() => User)
    user!: User;

    @HasMany(() => GithubRepository)
    repositories!: GithubRepository[];

    @HasMany(() => Task)
    tasks!: Task[];
}
