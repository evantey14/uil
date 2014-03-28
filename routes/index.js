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
        var combination = userName+email+grade+firstPassword+secondPassword+firstName+lastName;

        if(!req.body.username||!req.body.useremail||!req.body.usergrade||!req.body.password||!req.body.secondpassword||!req.body.firstname||!req.body.lastname){
        res.render('newuser',{title:"Add New User", prompt:"Please fill out the information below.",error:"You left some of the boxes empty!"});
        }
        else if(email.indexOf("@") === -1) {
            res.render('newuser', {title: 'Add New User',error: "Please use a valid email", prompt:"Please fill out the information below."});
        } 
        else if(firstPassword!=secondPassword){
            res.render('newuser',{title:"Add New User", error:"Make sure the password fields match.",prompt:"Please fill out the information below."});
        }
        else if(combination.indexOf(["%#!^&*()_+=-[]{}\|';:<>/?"]!== -1)){
            res.render('newuser', {title:'Add New User', error:"Do not user punctuation or other odd characters in any of the fields.",prompt:"Please fill out the information below."});
        }
        else if(grade>12){
            res.render('newuser', {title:'Add New User', error:"Please input a valid grade.",prompt:"Please fill out the information below."});
        }
        else {
            var collection = db.get("users");
            var count = collection.count({
                username: userName
            }, function (err, count) {
                if (err) {
                    throw err;
                }
                if (count > 0) {
                    res.render('newuser', {title: 'Add New User',error: "That username is already taken.", prompt:"Please fill out the information below."});
                }
                else {
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
                    res.render('login', {title: 'Login',prompt: 'Input your credentials below!',error: "username"});
                }
                else {
                    var hashed = found['password'];
                    //console.log(hashed);
                    if (passwordHash.verify(password, hashed)) {
                        res.location("home");
                        res.redirect("home");
                    }
                    else {
                        res.render('login', {title: 'Login',prompt: "Input your credentials below!",error: "matching"});
                    }
                }
            });
        }
        else {
            res.render('login', {title: 'Login',prompt: 'Input your credentials below!'});
        }
    }
};

exports.home = function (req, res) {
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
        collection.findOne({"_id": id}, function (err, found) {
            if (err) {
                throw err;
            }
            else {
                var answer = found['key'];
                if (choice == answer) {
                    res.render('grading', {title: "CORRECT!",value: "correct"});
                }
                else {
                    res.render('grading', {title: "Incorrect...",value: "incorrect"});
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
            }
            else if (!found) {
                res.render('error', {title: 'Error',prompt: 'We are having issues with the database. Sorry! \nPlease notify the creators and try again later.'});
            }
            else {
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
        var thing = collection.findOne({'_id': id}, function (err, found) {
            if (err) {
                throw err;
            }
            else if (!found) {
                res.render('error', {title: 'Error',prompt: 'We are having issues with the database. Sorry! \nPlease notify the creators and try again later.'});
            }
            else {
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