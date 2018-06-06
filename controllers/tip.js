const Sequelize = require("sequelize");
const {models} = require("../models");


// Autoload the tip with id equals to :tipId
exports.load = (req, res, next, tipId) => {

    models.quiz.findById(tipId, {
        include: [
            {model:models.quiz, include:[
                {model: models.user, as: 'author'}] },
            {model: models.user, as: 'author'}
           ]
        })
        .then(tip => {
            if (tip) {
                req.tip = tip;
                next();
            } else {
                throw new Error('There is no tip with the id=' + tipId);
            }
        })
        .catch(error => next(error));
};

exports.adminOrAuthorRequired = (req, res, next) => {

    const isAdmin  = !!req.session.user.isAdmin;
    const isAuthor = req.tip.authorId === req.session.user.id;

    if (isAdmin || isAuthor) {
        next();
    } else {
        console.log('Prohibited operation: The logged in user is not the author of the quiz, nor an administrator.');
        res.send(403);
    }
};

// POST /quizzes/:quizId/tips
exports.create = (req, res, next) => {

    const authorId = req.session.user && req.session.user.id || 0;

    const tip = models.tip.build(
        {
            text: req.body.text,
            quizId: req.quiz.id,
            authorId
        });

    tip.save({fields:["text","quizId","authorId"]})
        .then(tip => {
            req.flash('success', 'Tip created successfully.');
            res.redirect("back");
        })
        .catch(Sequelize.ValidationError, error => {
            req.flash('error', 'There are errors in the form:');
            error.errors.forEach(({message}) => req.flash('error', message));
            res.redirect("back");
        })
        .catch(error => {
            req.flash('error', 'Error creating the new tip: ' + error.message);
            next(error);
        });
};


// GET /quizzes/:quizId/tips/:tipId/accept
exports.accept = (req, res, next) => {

    const {tip} = req;

    tip.accepted = true;

    tip.save(["accepted"])
        .then(tip => {
            req.flash('success', 'Tip accepted successfully.');
            res.redirect('/quizzes/' + req.params.quizId);
        })
        .catch(error => {
            req.flash('error', 'Error accepting the tip: ' + error.message);
            next(error);
        });
};


// DELETE /quizzes/:quizId/tips/:tipId
exports.destroy = (req, res, next) => {

    req.tip.destroy()
        .then(() => {
            req.flash('success', 'tip deleted successfully.');
            res.redirect('/quizzes/' + req.params.quizId);
        })
        .catch(error => next(error));
};

exports.new= (req,res,next)=>{

    const tip = {
        text:""
    };
    const{quiz}=req;
    res.render('tips/new', {tip,quiz});
};

exports.edit = (req, res, next) => {
    const {tip} = req;
    res.render('tips/edit', {tip});
};




exports.update = (req, res, next) => {

    models.tip.findById(req.params.tipId)
       .then(tip => {
           if (tip) {
               tip.text = req.body.text;
               tip.accepted=false;
               tip.save({fields: ["text", "accepted", "authorId"]})
                   .then(quiz => {
                       req.flash('success', 'Quiz edited successfully.');
                       res.redirect('/quizzes/' + req.params.quizId);
                   })
                   .catch(Sequelize.ValidationError, error => {
                       req.flash('error', 'There are errors in the form:');
                       error.errors.forEach(({message}) => req.flash('error', message));
                       res.render('quizzes/edit', {quiz});
                   })
                   .catch(error => {
                       req.flash('error', 'Error editing the Quiz: ' + error.message);
                       next(error);
                   });
           }
       })

       //res.redirect('/quizzes/' + req.params.quizId)
};
