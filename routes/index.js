var passwordHash = require('password-hash');
var cookie = false;

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
                        error: "username",
                        session: req.session
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
                            error: "matching",
                            session: req.session
                        });
                    }
                }
            });
        } else {
            res.render('login', {
                cookie: cookie,
                title: 'Login',
                prompt: 'Input your credentials below!',
                session: req.session
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
                    var score = found.correct.length * 60 - found.incorrect.length * 20;
                    req.session.score = score;
                    res.render('uniquelogin', {
                        cookie: cookie,
                        loggedin: req.session.loggedin,
                        correct: JSON.stringify(found.correct),
                        incorrect: JSON.stringify(found.incorrect),
                        passed: JSON.stringify(found.passed),
                        correctlength: found.correct.length,
                        incorrectlength: found.incorrect.length,
                        passedlength: found.passed.length,
                        score: req.session.score,
                        session: req.session,
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
        question: 'question',
        session: req.session
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
                            var score = found.score;
                            var streak = found.streak;
                            score += 60;
                            streak++;
                            req.session.streak = streak;
                            otherarray.shift();
                            users.update({
                                '_id': req.session.id
                            }, {
                                $set: {
                                    'questions': otherarray,
                                    'score': score,
                                    'streak': streak
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
                        value: "correct",
                        session: req.session
                    });
                } else if (!choice) {
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

                            var array = found['passed'];
                            var streak = found.streak;
                            streak = 0;
                            req.sessions.strak = streak;
                            array.push({
                                id: id,
                                time: Date.now()
                            });
                            users.update({
                                '_id': req.session.id
                            }, {
                                $set: {
                                    'passed': array,
                                    'streak': streak
                                }
                            });
                        }
                    });
                    res.render('grading', {
                        cookie: cookie,
                        title: "Question Passed",
                        value: "passed",
                        session: req.session
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
                            var score = found.score;
                            score -= 20;
                            users.update({
                                '_id': req.session.id
                            }, {
                                $set: {
                                    'questions': otherarray,
                                    'score': score
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
                        value: "incorrect",
                        session: req.session
                    });
                }
            }
        });
    }
};

exports.viewquestion = function (db) {
    return function (req, res) {
        var id = req.params.id;
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
                    prompt: 'We are having issues with the database. Sorry! \nPlease notify the creators and try again later.',
                    session: req.session
                });
            } else {
                var title = 'Random Question';
                var prompt = 'Test: ' + found['test'] + '\nQuestion: ' + found['ques'];
                var answers = found['ans'];
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
                    url: found["_id"],
                    session: req.session
                });
            }
        });
    }
};

exports.index = function (req, res) {
    res.render('index', {
        cookie: cookie,
        title: 'LASA UIL Training',
        session: req.session
    });
};

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
                var id = found['questions'][0];
                res.redirect('/random/' + id);
            }
        });
    }
}

exports.about = function (req, res) {
    res.render('about', {
        cookie: cookie,
        title: 'LASA UIL Training',
        session: req.session,
        desc: "Lorem ipsum dolor sit amet, ne per solum timeam. Vim ne doctus timeam dolorem, in adhuc delicata maluisset per. Qui essent laoreet et. No eam tota scaevola, choro mollis vituperata te per, ut ius nibh omnium. Ea vel dico duis ridens. Ex sit tempor mandamus ocurreret, populo delectus consectetuer eu vim.",
        profiles: [{
            name: "Evan Tey",
            img: "/images/about/evan.jpg",
            desc: "It was our first week\n At Myrtle Beach\n Where it all began\n\nIt was 102°\nNothin\' to do\nMan it was hot\nSo we jumped in",
            src: "https://github.com/evantey14"
        }, {
            name: "Jonas Wechsler",
            img: "/images/about/jonas.jpg",
            desc: "We were summertime sippin\', sippin\'\nSweet tea kissin\' off of your lips\nT-shirt drippin\', drippin\' wet\nHow could I forget?",
            src: "https://github.com/JonasWechsler"
        }, {
            name: "Beck Goodloe",
            img: "/images/about/beck.jpg",
            desc: "Watchin\' that blonde hair swing\nTo every song I\'d sing\nYou were California beautiful\nI was playin\' everything but cool\nI can still hear that sound\nOf every wave crashin' down",
            src: "https://github.com/beckgoodloe"
        }, {
            name: "Ryan Rice",
            img: "/images/about/ryan.jpg",
            desc: "Like the tears we cried\nThat day we had to leave\nIt was everything we wanted it to be\nThe summer of\n19 you and me",
            src: "https://github.com/ryanr1230"
        }, {
            name: "Clayton Petty",
            img: "/images/about/clayton.jpg",
            desc: "We had our first dance in the sand\nIt was one hell of a a souvenir\nTangled up, so in love\nSo, let\'s just stay right here",
            src: "https://github.com/notyalc"
        }, {
            name: "Keivaun Waugh",
            img: "/images/about/alec.jpg",
            desc: "We had our first dance in the sand\nIt was one hell of a a souvenir\nTangled up, so in love\nSo, let\'s just stay right here",
            src: "https://github.com/notyalc"
        }]
    });
};

exports.scoreboard = function (db) {
    return function (req, res) {
        var users = db.get('users');
        var ranking = [];
        users.find({}, function (err, found) {
            if (err) {
                throw err;
            } else {
                for (var i = 0; i < found.length; i++) {
                    var username = found[i]['username'];
                    var score = found[i]['score'];
                    ranking.push({
                        username: username,
                        score: score
                    });
                }
                //SORTING ALGORITHM BY SCORE
                if (ranking.length > 1) {
                    ranking.sort(function (first, second) {
                        return second.score - first.score;
                    });
                }
            }
            res.render('scoreboard', {
                ranking: ranking,
                cookie: cookie,
                session: req.session
            });
        });
    }
}