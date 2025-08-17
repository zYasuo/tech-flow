import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    Default,
    ForeignKey,
    BelongsTo,
} from 'sequelize-typescript';
import { User } from './User';
import { Project } from './Project';
import { TaskStatus, TaskPriority } from './enums';

@Table({
    tableName: 'tasks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'task_project_id_index',
            fields: ['projectId'],
        },
        {
            name: 'task_user_id_index',
            fields: ['userId'],
        },
    ],
})
export class Task extends Model {
    @PrimaryKey
    @Default(() => {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 8);
        return `c${timestamp}${randomPart}`;
    })
    @Column(DataType.STRING)
    id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    title!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    description!: string | null;

    @Default(TaskStatus.PENDING)
    @Column({
        type: DataType.ENUM(...Object.values(TaskStatus)),
        allowNull: false,
    })
    status!: TaskStatus;

    @Default(TaskPriority.MEDIUM)
    @Column({
        type: DataType.ENUM(...Object.values(TaskPriority)),
        allowNull: false,
    })
    priority!: TaskPriority;

    @ForeignKey(() => Project)
    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: 'project_id',
    })
    projectId!: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'user_id',
    })
    userId!: string;

    @BelongsTo(() => Project, { onDelete: 'CASCADE' })
    project!: Project;

    @BelongsTo(() => User, { onDelete: 'CASCADE' })
    user!: User;
}
