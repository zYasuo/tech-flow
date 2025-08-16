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
    Index,
} from 'sequelize-typescript';
import { User } from './User';

@Table({
    tableName: 'token',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'token_user_id_index',
            fields: ['user_id'],
        },
    ],
})
export class Token extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id!: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'user_id',
    })
    userId!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: 'refresh_token',
    })
    refreshToken!: string;

    @Column({
        type: DataType.DATE,
        allowNull: true,
        field: 'expires_at',
    })
    expiresAt!: Date | null;

    @CreatedAt
    @Column({
        type: DataType.DATE,
        field: 'created_at',
    })
    createdAt!: Date;

    @UpdatedAt
    @Column({
        type: DataType.DATE,
        field: 'updated_at',
    })
    updatedAt!: Date;

    @BelongsTo(() => User, { onDelete: 'CASCADE' })
    user!: User;
}
