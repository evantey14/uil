var passwordHash = require('password-hash');
var cookie = false;
var crypto = require('crypto'); //To generate a hash for gravatar
var nodemailer = require('nodemailer');
var teacher = "jacobstephens";

exports.settings = function (db) {
    return function (req, res) {
        res.render('settings', {
            session: req.session,
            cookie: cookie
        });
    }
};
exports.settheme = function (db) {
    return function (req, res) {
        var users = db.get('users');
        var username = req.session.user;
        console.log(req.body.qchoice);
        console.log(req.body.cchoice);
        if (req.body.qchoice !== "Select Theme" && req.body.qchoice) {
            users.update({
                'username': username
            }, {
                $set: {
                    qtheme: req.body.qchoice
                }
            });
            res.render('settings', {
                prompt: "updated",
                session: req.session,
                cookie: cookie
            });
        }
        if (req.body.cchoice !== "Select Theme" && req.body.cchoice) {
            users.update({
                'username': username
            }, {
                $set: {
                    ctheme: req.body.cchoice
                }
            });
            res.render('settings', {
                prompt: "updated",
                session: req.session,
                cookie: cookie
            });
        }
        if (req.body.pass) {
            var newpass = passwordHash.generate(req.body.newpass);
            if (req.body.newpassc !== req.body.newpass) {
                res.render('settings', {
                    cookie: cookie,
                    session: req.session,
                    prompt: "New Passwords Don't Match"
                });
            } else {

                users.findOne({
                    "username": username
                }, function (err, found) {
                    if (err) {
                        throw err.$animate
                    }
                    if (!found) {
                        res.render('settings', {
                            cookie: cookie,
                            prompt: 'Error',
                            session: req.session
                        });
                    } else {
                        var hashed = found['password'];
                        if (passwordHash.verify(req.body.pass, hashed)) {
                            console.log("true");
                            users.update({
                                'username': username
                            }, {
                                $set: {
                                    password: newpass
                                }
                            });
                            res.render('settings', {
                                prompt: "updated",
                                session: req.session,
                                cookie: cookie
                            });
                        } else {
                            console.log("false");
                            res.render('settings', {
                                prompt: "Incorrect Password",
                                cookie: cookie,
                                session: req.session
                            });
                        }
                    }
                });
            }
        }
        if ((req.body.qchoice === "Select Theme") || (req.body.cchoice === "Select Theme")) {
            res.render('settings', {
                prompt: "Select a Theme",
                cookie: cookie,
                session: req.session
            });
        }
        

    }
};
exports.signin = function (db) {
    return function (req, res) {
        if (req.body.username !== null) {
            var username = req.body.username;
            var password = req.body.password;
            var collection = db.get("users");
            collection.findOne({
                "username": username
            }, function (err, found) {
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
            var username = req.session.user;
            var users = db.get('users');
            users.findOne({
                'username': username
            }, function (err, found) {
                if (err) {
                    throw err;
                } else {
                    var hash = crypto.createHash('md5').update(found.email).digest('hex');
                    res.render('profile', {
                        found: found,
                        cookie: cookie,
                        session: req.session,
                        hash: hash
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
                            var longeststreak = found.longeststreak;
                            score += 60;
                            streak++;
                            if (streak > longeststreak) {
                                users.update({
                                    '_id': req.session.id
                                }, {
                                    $set: {
                                        'longeststreak': streak
                                    }
                                });
                            }
                            var index = otherarray.map(function (obj, index) {
                                if (obj.id == id) {
                                    return index;
                                }
                            }).filter(isFinite)
                            otherarray.splice(index, 1);
                            console.log(index);
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
                                time: Date.now(),
                                choice: [choice]
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
                            var index = otherarray.map(function (obj, index) {
                                if (obj.id == id) {
                                    return index;
                                }
                            }).filter(isFinite)
                            otherarray.splice(index, 1);
                            users.update({
                                '_id': req.session.id
                            }, {
                                $set: {
                                    'questions': otherarray
                                }
                            });

                            var array = found['passed'];
                            array.push({
                                id: id,
                                time: Date.now(),
                                choice: [choice]
                            });
                            users.update({
                                '_id': req.session.id
                            }, {
                                $set: {
                                    'passed': array,
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
                            var index = otherarray.map(function (obj, index) {
                                if (obj.id == id) {
                                    return index;
                                }
                            }).filter(isFinite)
                            otherarray.splice(index, 1);
                            var score = found.score;
                            score -= 20;
                            var streak = found.streak;
                            streak = 0;
                            users.update({
                                '_id': req.session.id
                            }, {
                                $set: {
                                    'questions': otherarray,
                                    'score': score,
                                    'streak': streak
                                }
                            });
                            var array = found['incorrect'];
                            array.push({
                                id: id,
                                time: Date.now(),
                                choice: [choice]
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
        var users = db.get('users');

        users.findOne({
            '_id': req.session.id
        }, function (err, found) {
            if (err) {
                throw err;
            } else {
                var questions = found.questions;
                var correct = found.correct;
                var incorrect = found.incorrect
                var passed = found.passed;
                if (JSON.stringify(correct).indexOf(id) > -1) {
                    res.redirect('/tryagain/' + id);
                } else if (JSON.stringify(incorrect).indexOf(id) > -1) {
                    res.redirect('/tryagain/' + id);
                } else if (JSON.stringify(passed).indexOf(id) > -1) {
                    res.redirect('/tryagain/' + id);
                }
                if (JSON.stringify(questions).indexOf(id) > -1) {
                    collection.findOne({
                        '_id': id
                    }, function (err, question) {
                        if (err) {
                            throw err;
                        } else if (!question) {
                            res.render('error', {
                                cookie: cookie,
                                title: 'Error',
                                prompt: 'We are having issues with the database. Sorry! \nPlease notify the creators and try again later.',
                                session: req.session
                            });
                        } else {
                            var title = 'Random Question';
                            var prompt = 'Test: ' + question['test'] + '\nQuestion: ' + question['ques'];
                            var answers = question['ans'];
                            res.render('renderquestion', {
                                cookie: cookie,
                                title: title,
                                prompt: prompt,
                                qnum: question['ques'],
                                test: question['test'],
                                question: question['text'],
                                side: question['code'],
                                A: answers[0],
                                B: answers[1],
                                C: answers[2],
                                D: answers[3],
                                E: answers[4],
                                id: question["_id"],
                                url: question["_id"],
                                session: req.session,
                                themeq: found.qtheme,
                                themec: found.ctheme
                            });
                        }
                    });
                }
            }
        });
    }
};

exports.tryagain = function (db) {
    return function (req, res) {
        var questionid = req.url.substring(10);
        var users = db.get('users');
        var questions = db.get('questions');
        users.findOne({
            '_id': req.session.id
        }, function (err, found) {
            if (err) {
                throw err;
            } else {
                var index = 0;
                var incorrect = false;
                found.incorrect.forEach(function (obj, ind) {
                    if (obj.id === questionid) {
                        incorrect = true;
                        index = ind;
                    }
                });
                var correct = false;
                found.correct.forEach(function (obj, ind) {
                    if (obj.id === questionid) {
                        correct = true;
                        index = ind;
                    }
                });
                var passed = false;
                found.passed.forEach(function (obj, ind) {
                    if (obj.id === questionid) {
                        passed = true;
                        index = ind;
                    }
                });
                if (correct) {
                    var questions = db.get('questions');
                    questions.findOne({
                        '_id': questionid
                    }, function (err, question) {
                        var choices = question.key;
                        console.log(choices);
                        var answers = question.ans;
                        var title = "Random Question";
                        var prompt = 'Test: ' + question['test'] + '\nQuestion: ' + question['ques'];
                        res.render('tryagainquestion', {
                            cookie: cookie,
                            title: title,
                            prompt: prompt,
                            qnum: question['ques'],
                            test: question['test'],
                            question: question['text'],
                            side: question['code'],
                            A: answers[0],
                            B: answers[1],
                            C: answers[2],
                            D: answers[3],
                            E: answers[4],
                            id: question["_id"],
                            url: question["_id"],
                            session: req.session,
                            type: "correct",
                            choices: choices,
                            themeq: found.qtheme,
                            themec: found.ctheme
                        });
                    });
                } else if (incorrect) {
                    var questions = db.get('questions');
                    questions.findOne({
                        '_id': questionid
                    }, function (err, question) {
                        var choices = found.incorrect[index].choice;
                        console.log(choices);
                        var answers = question.ans;
                        var title = "Random Question";
                        var prompt = 'Test: ' + question['test'] + '\nQuestion: ' + question['ques'];
                        res.render('tryagainquestion', {
                            cookie: cookie,
                            title: title,
                            prompt: prompt,
                            qnum: question['ques'],
                            test: question['test'],
                            question: question['text'],
                            side: question['code'],
                            A: answers[0],
                            B: answers[1],
                            C: answers[2],
                            D: answers[3],
                            E: answers[4],
                            id: question["_id"],
                            url: question["_id"],
                            session: req.session,
                            type: "incorrect",
                            choices: choices,
                            themeq: found.qtheme,
                            themec: found.ctheme
                        });
                    });
                } else if (passed) {
                    var questions = db.get('questions');
                    questions.findOne({
                        '_id': questionid
                    }, function (err, question) {
                        console.log(index);
                        var answers = question.ans;
                        var title = "Random Question";
                        var prompt = 'Test: ' + question['test'] + '\nQuestion: ' + question['ques'];
                        res.render('tryagainquestion', {
                            cookie: cookie,
                            title: title,
                            prompt: prompt,
                            qnum: question['ques'],
                            test: question['test'],
                            question: question['text'],
                            side: question['code'],
                            A: answers[0],
                            B: answers[1],
                            C: answers[2],
                            D: answers[3],
                            E: answers[4],
                            id: question["_id"],
                            url: question["_id"],
                            session: req.session,
                            type: "passed",
                            themeq: found.qtheme,
                            themec: found.ctheme
                        });
                    });
                }
            }
        })

    }
};

exports.tryagaincheck = function (db) {
    return function (req, res) {
        var qid = req.body.id;
        var questions = db.get('questions');
        var users = db.get('users');
        questions.findOne({'_id':qid}, function(err, found){
            if(err){
                throw err;
            }
            else{
                var answer = found.key;
                var userselection = req.body.choice;
                var type = req.body.typer;
                if(!userselection){
                    res.render('tryagaincheck', {title:"PASSED"});
                }
                else if(type === 'correct'){
                    if(userselection===answer){
                        res.render('tryagaincheck',{title:"Correct"});
                    }
                    else{
                        res.render('tryagaincheck',{title:"Incorrect"});
                    }
                }
                else if(type === 'passed'){
                    users.findOne({'_id':req.session.id},function(err,user){
                        if(err){
                            throw err;
                        }
                        else{
                            if(userselection===answer){
                                var passedarray = user.passed;
                                var score = user.score;
                                score+=60;
                                var index = -1;
                                passedarray.forEach(function(obj,ind){
                                    if(obj.id===qid){
                                        index = ind;
                                    }
                                });
                                passedarray.splice(index,1);
                                var correctarray = user.correct;
                                correctarray.push({
                                    id:qid,
                                    time: Date.now(),
                                    choice: [userselection]
                                });
                                users.update({
                                    '_id': req.session.id
                                }, {
                                    $set: {
                                        'passed': passedarray,
                                        'correct':correctarray,
                                        'score':score
                                    }
                                });
                                res.render('tryagaincheck', {title:"CORRECT"});
                            }
                            else{
                                var score = user.score;
                                score-=20;
                                //console.log("score is: "+score);
                                var passedarray = user.passed;
                                var index = -1;
                                passedarray.forEach(function(obj,ind){
                                    if(obj.id===qid){
                                        index = ind;
                                    }
                                });
                                passedarray.splice(index,1);
                                var incorrectarray = user.incorrect;
                                incorrectarray.push({
                                    id:qid,
                                    time:Date.now(),
                                    choice: [userselection]
                                });
                                users.update({
                                    '_id': req.session.id
                                }, {
                                    $set: {
                                        'passed': passedarray,
                                        'incorrect':incorrectarray,
                                        'score':score
                                    }
                                });
                                res.render('tryagaincheck',{title:"INCORRECT"});
                            }
                        }
                    });
                }
                //incorrectly answered questions
                else{
                    users.findOne({'_id':req.session.id}, function(err,user){
                        if(err){
                            throw err;
                        }
                        else{
                            var incorrectarray = user.incorrect;
                            var index = -1;
                            incorrectarray.forEach(function(obj,ind){
                                if(obj.id===qid){
                                    index = ind;
                                }
                            })
                            var thing = incorrectarray[index];
                            console.log(thing);
                            incorrectarray.splice(index,1);
                            if(userselection===answer){
                                correctedarray = user.corrected;
                                correctedarray.push(thing);
                                var score = user.score;
                                score+=20;
                                users.update({
                                    '_id': req.session.id
                                }, {
                                    $set: {
                                        'incorrect': incorrectarray,
                                        'corrected':correctedarray,
                                        'score':score
                                    }
                                });
                                res.render('tryagaincheck', {title:'CORRECT'});
                            }
                            //question was answered incorrectly again
                            else{
                                thing.choice.push(userselection);
                                incorrectarray.push(thing);
                                console.log(incorrectarray);
                                users.update({'_id':req.session.id},{$set:{'incorrect':incorrectarray}});
                                res.render('tryagaincheck',{title:'INCORRECT'});
                            }
                        }
                    });
                }
            }
        });
    }
}

exports.index = function (db) {
    return function (req, res) {
        if (req.session.user) {
            var username = req.session.user;
            var users = db.get('users');
            users.findOne({
                'username': username
            }, function (err, found) {
                if (err) {
                    throw err;
                } else {
                    var hash = crypto.createHash('md5').update(found.email).digest('hex');
                    res.render('profile', {
                        found: found,
                        cookie: cookie,
                        session: req.session,
                        hash: hash
                    });
                }
            });
        } else {
            res.render('index', {
                cookie: cookie,
                title: 'LASA UIL Training',
                session: req.session
            });
        }
    };
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
            } else if (!found) {
                res.redirect("/signin");
            } else if (found.questions.length === 0) {
                res.send("You answered all of the questions...all bajillion of them...go read a book or something...or answer some of the questions you missed or passed!");
            } else {
                var arrayofquestions = found.questions;

                var temporary = arrayofquestions.shift();
                arrayofquestions.push(temporary);
                users.update({
                    '_id': req.session.id
                }, {
                    $set: {
                        'questions': arrayofquestions
                    }
                });
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
};

exports.getfeedback = function () {
    return function (req, res) {
        res.render('feedback', {
            cookie: cookie,
            session: req.session
        });
    }
};

exports.sendfeedback = function () {
    return function (req, res) {
        var name = req.body.name;
        var subject = req.body.subject;
        var text = req.body.text;
        var email = req.body.email;
        var smtpTransport = nodemailer.createTransport("SMTP", {
            service: "Gmail",
            auth: {
                user: "lasauiltraining@gmail.com",
                pass: teacher
            }
        });
        console.log("smtp made");
        var mailOptions = {
            to: "lasauiltraining@gmail.com",
            from: name,
            subject: subject,
            text: text + "\n\nRespond to this person at: " + email
        }
        //console.log("mail options set");
        smtpTransport.sendMail(mailOptions, function (err, response) {
            if (err) {
                throw err;
            } else {
                //console.log("message sending");
                res.redirect("/");
                //console.log("message sent");
            }
        });
    }
};

exports.user = function (db) {
    return function (req, res) {
        username = req.url;
        console.log(req.url.username);
        username = username.substring(6);
        var users = db.get('users');
        users.findOne({
            'username': username
        }, function (err, found) {
            if (err) {
                throw err;
            } else {
                var hash = crypto.createHash('md5').update(found.email).digest('hex');
                res.render('profile', {
                    found: found,
                    cookie: cookie,
                    session: req.session,
                    hash: hash
                });
            }
        });
    }
};

exports.listofcorrects = function (db) {
    return function (req, res) {
        var username = req.url.substring(req.url.indexOf('/') + 1, req.url.lastIndexOf('/'));
        var users = db.get('users');
        users.findOne({
            'username': username
        }, function (err, found) {
            if (err) {
                throw err;
            } else {
                console.log(found);
                res.render('listofcorrects', {
                    found: found,
                    session: req.session,
                    cookie: cookie
                });
            }
        });
    }
};

exports.listofincorrects = function (db) {
    return function (req, res) {
        var username = req.url.substring(req.url.indexOf('/') + 1, req.url.lastIndexOf('/'));
        var users = db.get('users');
        users.findOne({
            'username': username
        }, function (err, found) {
            if (err) {
                throw err;
            } else {
                console.log(found);
                res.render('listofincorrects', {
                    found: found,
                    session: req.session,
                    cookie: cookie
                });
            }
        });
    }
};

exports.listofpassed = function (db) {
    return function (req, res) {
        var username = req.url.substring(req.url.indexOf('/') + 1, req.url.lastIndexOf('/'));
        var users = db.get('users');
        users.findOne({
            'username': username
        }, function (err, found) {
            if (err) {
                throw err;
            } else {
                console.log(found);
                res.render('listofpassed', {
                    found: found,
                    session: req.session,
                    cookie: cookie
                });
            }
        });
    }
}