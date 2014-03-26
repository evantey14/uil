var passwordHash = require('password-hash');

exports.index = function (req, res) {
    res.render('index', {
        title: 'LASA UIL Training'
    });
};

/*
exports.userlist = function(db) {
    return function(req, res) {
        var collection = db.get('users');
        collection.find({},{},function(e,docs){
            res.render('userlist', {"userlist" : docs});
        });
    };
};
*/

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

        if (email.indexOf("@") === -1 || firstPassword != secondPassword) {
            res.render('error', {
                title: 'Error',
                prompt: "There is an error"
            });
        } else {
            var collection = db.get("users");
            var count = collection.count({
                username: userName
            }, function (err, count) {
                if (err) {
                    res.send("Call Beck and get the problem fixed");
                }
                if (count > 0) {
                    res.render('error', {
                        title: 'Error',
                        prompt: "That name is already taken...so unoriginal..."
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
                            res.render('error', {
                                title: 'Error'
                            });
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
            /*
            collection.count({"username":username}, function(err,count){
                if(count===0){
                    res.render('login', {title:'Login', prompt:'Input your credentials below!',error:"username"});
                }
            });
        */
            collection.findOne({
                "username": username
            }, function (err, found) {
                //console.log(found);
                if (err) {
                    res.send(err);
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
                    if (passwordHash.verify(password, hashed)) {
                        res.location("home");
                        res.redirect("home");
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
    res.render('uniquelogin', {
        title: "Welcome User!"
    });
}

exports.renderquestion = function (req, res) {
    res.render('renderquestion', {
        title: 'Random Question',
        prompt: 'Please fill out the information below.',
        question: 'question'
    });
};


exports.getquestion = function (db) {
    return function (req, res) {
        if (req.body.id != null) {
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
        } else {
            var collection = db.get('questions');
            var thing = collection.find({}, function (err, found) {
                if (err) {
                    res.render('error', {
                        title: 'Error',
                        prompt: err
                    });
                } else if (!found) {
                    res.render('error', {
                        title: 'Error',
                        prompt: 'null'
                    });
                } else {
                    console.log(found);
                    var rand = Math.ceil(found.length * Math.random());
                    var title = 'Random Question';
                    var prompt = 'Test: ' + found[rand]['test'] + '\nQuestion: ' + found[rand]['ques'];
                    var answers = found[rand]['ans'];

                    res.render('renderquestion', {
                        title: title,
                        prompt: prompt,
                        test: found[rand]['test'],
                        qnum: found[rand]['ques'],
                        question: found[rand]['text'],
                        A: answers[0],
                        B: answers[1],
                        C: answers[2],
                        D: answers[3],
                        E: answers[4],
                        id: found[rand]["_id"],
                        url: found["_id"]
                    });
                }
            });
        }
    }
}
