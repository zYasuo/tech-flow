import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    Default,
    CreatedAt,
    UpdatedAt,
    ForeignKey,
    BelongsTo,
    Unique,
} from 'sequelize-typescript';
import { Project } from './Project';

@Table({
    tableName: 'github_repositories',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
})
export class GithubRepository extends Model {
    @PrimaryKey
    @Default(() => {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 8);
        return `c${timestamp}${randomPart}`;
    })
    @Column(DataType.STRING)
    id!: string;

    @Unique('github_repository_github_id_unique')
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    githubId!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    fullName!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    description!: string | null;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    htmlUrl!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    language!: string | null;

    @Default(0)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    stargazers!: number;

    @ForeignKey(() => Project)
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    projectId!: string;

    @CreatedAt
    @Column(DataType.DATE)
    createdAt!: Date;

    @UpdatedAt
    @Column(DataType.DATE)
    updatedAt!: Date;

    @BelongsTo(() => Project)
    project!: Project;
}
