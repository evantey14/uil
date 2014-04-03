module.exports = function(){
    return function(req,res,next){
        var accessible = [
            "/signin",
            "/",
            "/newuser",
            "/adduser"
        ];
        console.log(req.session.user);
        if(accessible.indexOf(req.url)>-1){
            next();
        }
        else if(req.session!==undefined){
            next();
        }
        else{
            res.redirect("/signin");
        }
    }
}