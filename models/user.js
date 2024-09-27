'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {}

  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Username is required',
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: 'This email already exists!',
        },
        validate: {
          isEmail: {
            msg: 'Please provide a valid email address',
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [6, 100],
            msg: 'Password must be at least 6 characters long',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'User',
      indexes: [
        {
          unique: true,
          fields: ['email'],
        },
      ],
      hooks: {
        beforeCreate: async (user) => {
          user.password = await bcrypt.hash(user.password, 10);
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
    }
  );

  return User;
};