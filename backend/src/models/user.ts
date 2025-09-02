import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/connection';
import bcrypt from 'bcryptjs';

export interface UserAttributes {
  id?: number;
  nombre: string;
  ruta: string;
  contraseña: string;
  apellidos: string;
}

export interface UserCreationAttributes extends Omit<UserAttributes, 'id'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public nombre!: string;
  public ruta!: string;
  public contraseña!: string;
  public apellidos!: string;

  // Método para verificar la contraseña
  public async checkPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.contraseña);
  }

  // Hook para hashear la contraseña antes de crear el usuario
  public static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    ruta: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    contraseña: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    apellidos: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users', // Using the existing 'users' table
    timestamps: false,
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.contraseña) {
          user.contraseña = await User.hashPassword(user.contraseña);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('contraseña')) {
          user.contraseña = await User.hashPassword(user.contraseña);
        }
      },
    },
  }
);

export default User;
