import { Table, Column, Model, DataType, PrimaryKey, Default, Unique, HasMany } from "sequelize-typescript";
import { Token } from "./Token";
import { Project } from "./Project";
import { Task } from "./Task";

@Table({
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})
export class User extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    name!: string;

    @Unique("user_email_unique")
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    email!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    password!: string;

    @HasMany(() => Token)
    tokens!: Token[];

    @HasMany(() => Project)
    projects!: Project[];

    @HasMany(() => Task)
    tasks!: Task[];
}
