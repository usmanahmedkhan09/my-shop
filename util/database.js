const Sequelize = require('sequelize')

const sequelize = new Sequelize('my-shop', 'root', '#password09', {
    host: 'localhost',
    dialect: 'mysql'
})

module.exports = sequelize