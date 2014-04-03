module.exports = function(){
    return function(req,res,next){
        var accessible = [
            "/signin",
            "/",
            "/newuser",
        ];
        else if(req.session!==undefined){
            next();
        }
        else{
            console.log(req.url);
            res.redirect("/signin");
        }
    }
}