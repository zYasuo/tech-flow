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

@Table({
    tableName: 'tokens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'token_user_id_index',
            fields: ['userId'],
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



    @BelongsTo(() => User, { onDelete: 'CASCADE' })
    user!: User;
}
