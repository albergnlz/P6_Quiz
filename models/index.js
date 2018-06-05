const path = require('path');

// Load ORM
const Sequelize = require('sequelize');


// To use SQLite data base:
//    DATABASE_URL = sqlite:quiz.sqlite
// To use  Heroku Postgres data base:
//    DATABASE_URL = postgres://user:passwd@host:port/database

const url = process.env.DATABASE_URL || "sqlite:quiz.sqlite";

const sequelize = new Sequelize(url);

// Import the definition of the Quiz Table from quiz.js
sequelize.import(path.join(__dirname, 'quiz'));

// Import the definition of the Tips Table from tip.js
sequelize.import(path.join(__dirname,'tip'));

// Import the definition of the Users Table from user.js
sequelize.import(path.join(__dirname,'user'));

// Session
sequelize.import(path.join(__dirname,'session'));

//Creacion quizzes
sequelize.sync()
    .then(()=>
        sequelize.models.quiz.count()

    )
    .then(count=>{
        if(!count){
            return sequelize.models.quiz.bulkCreate([
                {question: "Capital de Italia", answer:"Roma"},
                {question: "Capital de Francia", answer:"París"},
                {question: "Capital de España", answer:"Madrid"},
                {question: "Capital de Portugal", answer:"Lisboa"}
            ])
        }
    })
    .catch(error=>{
        console.log(error);
    });


// Create tables
sequelize.sync()
    .then(() => console.log('Data Bases created successfully'))
    .catch(error => {
        console.log("Error creating the data base tables:", error);
        process.exit(1);
    });


// Relation between models

const {quiz, tip, user} = sequelize.models;

tip.belongsTo(quiz);
quiz.hasMany(tip);

// Relation 1-to-N between User and Quiz:
user.hasMany(quiz, {foreignKey: 'authorId'});
quiz.belongsTo(user, {as: 'author', foreignKey: 'authorId'});

// Relation 1-to-N between User and Tip:
user.hasMany(tip,{foreignKey:'authorId'});
tip.belongsTo(user,{as:'author',foreignKey:'authorId'});

module.exports = sequelize;
