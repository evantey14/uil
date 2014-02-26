var passwordHash = require('password-hash');

exports.index = function(req, res){
  res.render('index', { title: 'LASA UIL Training'});
};

exports.userlist = function(db) {
    return function(req, res) {
        var collection = db.get('users');
        collection.find({},{},function(e,docs){
            res.render('userlist', {"userlist" : docs});
        });
    };
};

exports.newuser = function(req,res)
{
    res.render('newuser', {title: 'Add New User',prompt:'Please fill out the information below.' });
};

exports.adduser = function(db){
    return function(req,res){
        var userName = req.body.username;
        var email = req.body.useremail;
        var grade = req.body.usergrade;
        var firstPassword = req.body.password;
        var secondPassword = req.body.secondpassword;
        
        if(firstPassword!==secondPassword){
            res.render('error', {title:'Error', prompt:"Password fields did not match"});
        }
        
        var password = passwordHash.generate(firstPassword);
        
        if(email.indexOf("@")===-1){
            res.render('error', {title:'Error', prompt:"That is not a valid email."});
        }
        
        var collection = db.get("users");
        
        var count = collection.count({username:userName}, function(err, count){
            if(err){
                res.send("Call Beck and get the problem fixed");
            }
            if(count>0){
                res.render('error', {title:'Error', prompt:"That name is already taken...so unoriginal..."});
            }
            else{
                collection.insert({"username":userName, "email":email, "grade":grade, "password":password},function(err,doc){
                    if(err){
                        res.render('error', {title:'Error'});
                    }
                    else{
                        res.location("login");
                        res.redirect("login");
                    }
                    
                });
            }
        });
    }
};

exports.login = function(req,res)
{
    res.render('login', {title: 'Login', prompt:'Input your credentials below!' });
};

exports.signin = function(db){
    return function(req,res){
        var username = req.body.username;
        var password = req.body.password;
        var collection = db.get("users");
        
        collection.count({"username":username}, function(err,count){
            if(count===0){
                res.render('error', {title:'Error', prompt:'We do not recognize that username'});
            }
        });

        collection.findOne({"username":username}, function(err, found){
            console.log(found);  
            var hashed = found["password"];
            console.log(hashed);
            if(passwordHash.verify(password,hashed)){
                res.render('uniquelogin',{title: username+","});
            }
            else{
                res.render('error', {title:'Error', prompt:"We do not recognize that username/password combination"});
            }
        });
    }
};

exports.renderquestion = function(req,res){
    res.render('renderquestion', {title: 'Random Question',prompt:'Please fill out the information below.' , question: 'question'});
};


exports.getquestion = function(db){
    return function(req,res){
        var collection=db.get('questions');
        collection.findOne({"ques":"20"},function(err,found){
            if(err){
                res.render('error', {title:'Error', prompt:err});
            }
            if(!found){
                res.render('error', {title:'Error', prompt:"null"});
            }
            var answers = found['ans'];
            res.render('renderquestion', {title:'Random Question',prompt:'Select an answer', question:found['text'],A:answers[0],B:answers[1],C:answers[2],D:answers[3],E:answers[4],id:found["_id"]});
        });   
    }
}

exports.submit = function(){
    return function(req,res){
        console.log(req.body.choice);
        console.log(req.body.id);
    }
}
