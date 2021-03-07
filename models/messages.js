const { Model, DataTypes } = require("sequelize");

const sequelize = require("../lib/sequelize");

class Message extends Model { }

Message.init(
    {
        message: {
            type: DataTypes.STRING,
            allowNull: false
        },
        author: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ts: {
            type: DataTypes.NUMBER,
            primaryKey: true,
            allowNull: false, 
            unique: true
        }
    },
    {
        sequelize,
        modelName: "Message", 
        timestamps: false
    }
);

Message.sync();

module.exports = Message;