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
        var password = req.body.password;
        var checkpassword = req.body.secondpassword;
        
        if(password!==checkpassword){
            res.send("Password fields did not match");
        }
        
        
        //console.log(userName+" "+email+" "+grade+" "+password+" "+checkpassword);
        
        var collection = db.get("users");
        
        var count = collection.count({username:userName}, function(err, count){
            if(err){
                res.send("Call Beck and get the problem fixed");
            }
            if(count>0){
                res.send("That name is already taken...so unoriginal...");
            }
            else{
                collection.insert({"username":userName, "email":email, "grade":grade},function(err,doc){
                    if(err){
                        res.send("another issue");
                    }
                    else{
                        res.location("userlist");
                        res.redirect("userlist");
                    }
                    
                });
            }
        });
    }
}