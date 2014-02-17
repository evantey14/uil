exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.userlist = function(db) {
    return function(req, res) {
        var collection = db.get('usercollection');
        collection.find({},{},function(e,docs){
            res.render('userlist', {
                "userlist" : docs
            });
        });
    };
};

exports.newuser = function(req,res)
{
    res.render('newuser', {title: 'Add New User' });
};

exports.adduser = function(db)
{
    return function(req,res){
        var userName = req.body.username;
        var email = req.body.useremail;
    
        var collection = db.get('usercollection');
    
        collection.insert({
            "username":userName,
            "email" : email
        }, function(err,doc){
            if(err){
                res.send("There was an issue...FIX IT GODDAMNIT!");
            }
            else{
                res.location("userlist");
                res.redirect("userlist");
            }
        });
    }
}
