var time = require('time');
var passwordHash = require('password-hash');
var cookie = false;

var shuffle = function (array) {
    var currentIndex = array.length;
    var temp;
    var randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temp = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temp;
    }
    return array;
}

exports.signin = function (db) {
    return function (req, res) {
        if (req.body.username != null) {
            var username = req.body.username;
            var password = req.body.password;
            var collection = db.get("users");
            collection.findOne({
                "username": username
            }, function (err, found) {
                //console.log(found);
                if (err) {
                    throw err.$animate
                }
                if (!found) {
                    res.render('login', {
                        cookie: cookie,
                        title: 'Login',
                        prompt: 'Input your credentials below!',
                        error: "username"
                    });
                } else {
                    var hashed = found['password'];
                    if (passwordHash.verify(password, hashed)) {
                        req.session.id = found["_id"];
                        req.session.user = found["username"];
                        req.session.loggedin = true;
                        cookie = true;
                        res.redirect("/home");
                    } else {
                        res.render('login', {
                            cookie: cookie,
                            title: 'Login',
                            prompt: "Input your credentials below!",
                            error: "matching"
                        });
                    }
                }
            });
        } else {
            res.render('login', {
                cookie: cookie,
                title: 'Login',
                prompt: 'Input your credentials below!'
            });
        }
    }
};

exports.home = function (db) {
    return function (req, res) {
        if (req.session.user) {
            var id = req.session.id;
            var users = db.get('users');
            users.findOne({
                "_id": id
            }, function (err, found) {
                if (err) {
                    throw err;
                } else {
                    res.render('uniquelogin', {
                        cookie: cookie,
                        title: "Welcome " + req.session.user,
                        loggedin: req.session.loggedin,
                        correct: JSON.stringify(found.correct),
                        incorrect: JSON.stringify(found.incorrect)
                    });
                }
            });
        } else {
            res.redirect("/");
        }
    };
};

exports.logout = function (req, res) {
    if (req.session === undefined) {
        res.redirect("/");
    } else {
        cookie = false;
        req.session.destroy;
        req.session = null;
        res.redirect("/");
    }
};


exports.renderquestion = function (req, res) {
    res.render('renderquestion', {
        cookie: cookie,
        title: 'Random Question',
        prompt: 'Please fill out the information below.',
        question: 'question'
    });
};


exports.checkquestion = function (db) {
    return function (req, res) {
        var choice = req.body.choice;
        var id = req.body.id;
        var collection = db.get('questions');
        var users = db.get('users');
        collection.findOne({
            "_id": id
        }, function (err, found) {
            if (err) {
                throw err;
            } else {
                var answer = found['key'];
                if (choice == answer) {
                    users.findOne({
                        '_id': req.session.id
                    }, function (err, found) {
                        if (err) {
                            throw err;
                        } else {
                            var array = found['correct'];
                            var otherarray = found['questions'];
                            otherarray.shift();
                            users.update({
                                '_id': req.session.id
                            }, {
                                $set: {
                                    'questions': otherarray
                                }
                            });
                            array.push({
                                id: id,
                                time: Date.now()
                            });
                            users.update({
                                '_id': req.session.id
                            }, {
                                $set: {
                                    'correct': array
                                }
                            });
                        }
                    });
                    res.render('grading', {
                        cookie: cookie,
                        title: "CORRECT!",
                        value: "correct"
                    });
                } else {
                    users.findOne({
                        '_id': req.session.id
                    }, function (err, found) {
                        if (err) {
                            throw err;
                        } else {
                            var otherarray = found['questions'];
                            otherarray.shift();
                            users.update({
                                '_id': req.session.id
                            }, {
                                $set: {
                                    'questions': otherarray
                                }
                            });
                            var array = found['incorrect'];
                            array.push({
                                id: id,
                                time: Date.now()
                            });
                            users.update({
                                '_id': req.session.id
                            }, {
                                $set: {
                                    'incorrect': array
                                }
                            });
                        }
                    });
                    res.render('grading', {
                        cookie: cookie,
                        title: "Incorrect...",
                        value: "incorrect"
                    });
                }
            }
        });
    }
};

exports.viewquestion = function (db) {
    return function (req, res) {
        var id = req.params.id;
        //console.log(id);
        var collection = db.get('questions');
        var thing = collection.findOne({
            '_id': id
        }, function (err, found) {
            if (err) {
                throw err;
            } else if (!found) {
                res.render('error', {
                    cookie: cookie,
                    title: 'Error',
                    prompt: 'We are having issues with the database. Sorry! \nPlease notify the creators and try again later.'
                });
            } else {
                //console.log(found);
                var title = 'Random Question';
                var prompt = 'Test: ' + found['test'] + '\nQuestion: ' + found['ques'];
                var answers = found['ans'];
                //console.log(answers);
                res.render('renderquestion', {
                    cookie: cookie,
                    title: title,
                    prompt: prompt,
                    qnum: found['ques'],
                    test: found['test'],
                    question: found['text'],
                    A: answers[0],
                    B: answers[1],
                    C: answers[2],
                    D: answers[3],
                    E: answers[4],
                    id: found["_id"],
                    url: found["_id"]
                });
            }
        });
    }
};

exports.index = function (req, res) {
    res.render('index', {
        cookie: cookie,
        title: 'LASA UIL Training'
    });
};
/*
exports.getquestion = function (db) {
    return function (req, res) {
        var collection = db.get('questions');
        var thing = collection.find({}, function (err, found) {
            if (err) {
                throw err;
            } else if (!found) {
                res.render('error', {
                    cookie:cookie,
                    title: 'Error',
                    prompt: 'We are having issues with the database. Sorry! \nPlease notify the creators and try again later.'
                });
            } else {
                //console.log(found);
                var rand = Math.ceil(found.length * Math.random());
                var id = found[rand]['_id'];
                res.redirect('/random/' + id);
            }
        });
    }
};
*/
exports.getquestion = function (db) {
    return function (req, res) {
        var questions = db.get('questions');
        var users = db.get('users');
        users.findOne({
            '_id': req.session.id
        }, function (err, found) {
            if (err) {
                throw err;
            } else {
                console.log(found);
                var id = found['questions'][0];
                res.redirect('/random/' + id);
            }
        });
    }
}
