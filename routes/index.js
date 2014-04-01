var passwordHash = require('password-hash');

exports.index = function (req, res) {
    res.render('index', {
        title: 'LASA UIL Training'
    });
};

exports.newuser = function (req, res) {
    res.render('newuser', {
        title: 'Add New User',
        prompt: 'Please fill out the information below.'
    });
};

exports.adduser = function (db) {
    return function (req, res) {
        var userName = req.body.username;
        var email = req.body.useremail;
        var grade = req.body.usergrade;
        var firstPassword = req.body.password;
        var secondPassword = req.body.secondpassword;
        var firstName = req.body.firstname;
        var lastName = req.body.lastname;
        var password = passwordHash.generate(firstPassword);
        var combination = userName + email + grade + firstPassword + secondPassword + firstName + lastName;

        if (!req.body.username || !req.body.useremail || !req.body.usergrade || !req.body.password || !req.body.secondpassword || !req.body.firstname || !req.body.lastname) {
            boolean empty = true;
            //error: "You left some of the boxes empty!"
        }
        if (email.indexOf("@") === -1) {
            boolean email = true;
            //error: "Please use a valid email",
        }
        if (firstPassword != secondPassword) {
            boolean password = true;
            //error: "Make sure the password fields match.",
        }
        if (combination.indexOf(['']) !== -1) {
            boolean character = true;
            //error: "Do not use punctuation or other odd characters in any of the fields.",
        }
        if (grade > 12) {
            res.render('newuser', {
                title: 'Add New User',
                error: "Please input a valid grade.",
                prompt: "Please fill out the information below."
            });
        } else {
            var collection = db.get("users");
            var count = collection.count({
                username: userName
            }, function (err, count) {
                if (err) {
                    throw err;
                }
                if (count > 0) {
                    res.render('newuser', {
                        title: 'Add New User',
                        error: "That username is already taken.",
                        prompt: "Please fill out the information below."
                    });
                } else {
                    collection.insert({
                        "firstName": firstName,
                        "lastName": lastName,
                        "username": userName,
                        "email": email,
                        "grade": grade,
                        "password": password
                    }, function (err, doc) {
                        if (err) {
                            throw err;
                        } else {
                            res.location("signin");
                            res.redirect("signin");
                        }
                    });
                }
            });
        }

    }
};

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
                        title: 'Login',
                        prompt: 'Input your credentials below!',
                        error: "username"
                    });
                } else {
                    var hashed = found['password'];
                    if (passwordHash.verify(password, hashed)) {
                        req.session = found["_id"];
                        console.log(req.session);
                        req.session.user = found["username"];
                        console.log(req.session.user);
                        res.location("/home");
                        res.redirect("/home");
                    } else {
                        res.render('login', {
                            title: 'Login',
                            prompt: "Input your credentials below!",
                            error: "matching"
                        });
                    }
                }
            });
        } else {
            res.render('login', {
                title: 'Login',
                prompt: 'Input your credentials below!'
            });
        }
    }
};

exports.home = function (req, res) {
    var user = req.session.user;
    console.log(user);
    res.render('uniquelogin', {
        title: "Welcome User!"
    });
};


exports.renderquestion = function (req, res) {
    res.render('renderquestion', {
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
        collection.findOne({
            "_id": id
        }, function (err, found) {
            if (err) {
                throw err;
            } else {
                var answer = found['key'];
                if (choice == answer) {
                    res.render('grading', {
                        title: "CORRECT!",
                        value: "correct"
                    });
                } else {
                    res.render('grading', {
                        title: "Incorrect...",
                        value: "incorrect"
                    });
                }
            }
        });
    }
};


exports.getquestion = function (db) {
    return function (req, res) {
        var collection = db.get('questions');
        var thing = collection.find({}, function (err, found) {
            if (err) {
                throw err;
            } else if (!found) {
                res.render('error', {
                    title: 'Error',
                    prompt: 'We are having issues with the database. Sorry! \nPlease notify the creators and try again later.'
                });
            } else {
                console.log(found);
                var rand = Math.ceil(found.length * Math.random());
                var id = found[rand]['_id'];
                res.redirect('/random/' + id);
            }
        });
    }
};

exports.viewquestion = function (db) {
    return function (req, res) {
        var id = req.params.id;
        console.log(id);
        var collection = db.get('questions');
        var thing = collection.findOne({
            '_id': id
        }, function (err, found) {
            if (err) {
                throw err;
            } else if (!found) {
                res.render('error', {
                    title: 'Error',
                    prompt: 'We are having issues with the database. Sorry! \nPlease notify the creators and try again later.'
                });
            } else {
                //console.log(found);
                var title = 'Random Question';
                var prompt = 'Test: ' + found['test'] + '\nQuestion: ' + found['ques'];
                var answers = found['ans'];
                console.log(answers);
                res.render('renderquestion', {
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

var passwordHash = require('password-hash');

exports.index = function (req, res) {
    res.render('index', {
        title: 'LASA UIL Training'
    });
};

exports.newuser = function (req, res) {
    res.render('newuser', {
        title: 'Add New User',
        prompt: 'Please fill out the information below.',
        error: '',
        fixlist: []
    });
};

exports.adduser = function (db) {
    return function (req, res) {
        var userName = req.body.username;
        var email = req.body.useremail;
        var grade = req.body.usergrade;
        var firstPassword = req.body.password;
        var secondPassword = req.body.secondpassword;
        var firstName = req.body.firstname;
        var lastName = req.body.lastname;
        var password = passwordHash.generate(firstPassword);

        var fixlist = [];
        var title = "Add New User";
        var prompt = "Enter information below.";
        var error = "";
        var problem = false;
        console.log(userName, email, grade, firstPassword, secondPassword, firstName, lastName, password);
        if (!req.body.username || !req.body.useremail || !req.body.usergrade || !req.body.password || !req.body.secondpassword || !req.body.firstname || !req.body.lastname) {
            error = "You left some boxes empty.\n";
        } else if (email.indexOf("@") === -1) {
            error += "Please enter a valid email.\n";
            fixlist['email'] += "Invalid email.";
        } else if (firstPassword != secondPassword) {
            error += "Please make sure your password fields match.\n";
            fixlist['password'] += "Passwords dont match.";
        } else if (userName.indexOf(["/^[a-z][\w\.]{0,24}$/i"] !== 1)) {
            error += "Please enter a username with only letters and numbers.\n";
            fixlist['user'] += "Username has invalid characters";
        }
        /*else if (combination.indexOf(["%#!^&*()_+=-[]{}\|';:<>/?"] !== -1)) {
            error += "Do not user punctuation or other odd characters in any of the fields.\n";
            fixlist
        } */
        else if (grade > 12) {
            error += "Please enter a valid grade.\n";
            fixlist['grade'] = "Grade is over 12";
        }
        if (problem) {
            res.render('newuser', {
                title: title,
                prompt: prompt,
                error: error,
                fixlist: fixlist
            });
        } else {
            var collection = db.get("users");
            var count = collection.count({
                username: userName
            }, function (err, count) {
                if (err) {
                    throw err;
                }
                if (count > 0) {
                    res.render('newuser', {
                        title: 'Add New User',
                        error: "That username is already taken.",
                        prompt: "Please fill out the information below."
                    });
                } else {
                    collection.insert({
                        "firstName": firstName,
                        "lastName": lastName,
                        "username": userName,
                        "email": email,
                        "grade": grade,
                        "password": password
                    }, function (err, doc) {
                        if (err) {
                            throw err;
                        } else {
                            res.location("signin");
                            res.redirect("signin");
                        }
                    });
                }
            });
        }

    }
};

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
                        title: 'Login',
                        prompt: 'Input your credentials below!',
                        error: "username"
                    });
                } else {
                    var hashed = found['password'];
                    //console.log(hashed);
                    if (passwordHash.verify(password, hashed)) { << << << < HEAD
                        res.location("home");
                        res.redirect("home"); === === =
                            req.session = found["_id"];
                        console.log(req.session);
                        req.session.user = found["username"];
                        console.log(req.session.user);
                        res.location("/home");
                        res.redirect("/home"); >>> >>> > 65c161486e4e9f7ecda82b3d5e7014914a5dd314
                    } else {
                        res.render('login', {
                            title: 'Login',
                            prompt: "Input your credentials below!",
                            error: "matching"
                        });
                    }
                }
            });
        } else {
            res.render('login', {
                title: 'Login',
                prompt: 'Input your credentials below!'
            });
        }
    }
};

exports.home = function (req, res) {
    var user = res.session.user;
    console.log(user);
    res.render('uniquelogin', {
        title: "Welcome User!"
    });
};


exports.renderquestion = function (req, res) {
    res.render('renderquestion', {
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
        collection.findOne({
            "_id": id
        }, function (err, found) {
            if (err) {
                throw err;
            } else {
                var answer = found['key'];
                if (choice == answer) {
                    res.render('grading', {
                        title: "CORRECT!",
                        value: "correct"
                    });
                } else {
                    res.render('grading', {
                        title: "Incorrect...",
                        value: "incorrect"
                    });
                }
            }
        });
    }
};


exports.getquestion = function (db) {
    return function (req, res) {
        var collection = db.get('questions');
        var thing = collection.find({}, function (err, found) {
            if (err) {
                throw err;
            } else if (!found) {
                res.render('error', {
                    title: 'Error',
                    prompt: 'We are having issues with the database. Sorry! \nPlease notify the creators and try again later.'
                });
            } else {
                console.log(found);
                var rand = Math.ceil(found.length * Math.random());
                var id = found[rand]['_id'];
                res.redirect('/random/' + id);
            }
        });
    }
};

exports.viewquestion = function (db) {
    return function (req, res) {
        var id = req.params.id;
        console.log(id);
        var collection = db.get('questions');
        var thing = collection.findOne({
            '_id': id
        }, function (err, found) {
            if (err) {
                throw err;
            } else if (!found) {
                res.render('error', {
                    title: 'Error',
                    prompt: 'We are having issues with the database. Sorry! \nPlease notify the creators and try again later.'
                });
            } else {
                //console.log(found);
                var title = 'Random Question';
                var prompt = 'Test: ' + found['test'] + '\nQuestion: ' + found['ques'];
                var answers = found['ans'];
                console.log(answers);
                res.render('renderquestion', {
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
}; >>> >>> > 53b839c57d52f4da2958c8ed5c85963ec95928a5