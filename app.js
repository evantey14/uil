//testing2.blah blah blah
var express = require('express')
  , routes = require('./routes')
  , pdf = require('./routes/pdf')
  , http = require('http')
  , path = require('path');

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/nodetest1');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/pdf', pdf.index);
//app.get('/userlist',routes.userlist(db));
app.get('/newuser',routes.newuser);
app.get('/renderquestion',routes.renderquestion);

app.post('/adduser', routes.adduser(db));
app.all('/signin', routes.signin(db));
app.all('/home',routes.home);
app.all('/getquestion', routes.getquestion(db));
/*
app.get('/:id',function(req,res){
    return db.get('questions').findOne({id:req.params.id},function(err,found){
        if(err){
            throw err
        }
        else{
            var prompt = 'Test: '+found[rand]['test']+'\nQuestion: '+found[rand]['ques'];
            return res.render('renderquestion', {title:"Requested Question",prompt:prompt,question:found[rand]['text'],A:answers[0],B:answers[1],C:answers[2],D:answers[3],E:answers[4],id:found[rand]["_id"],url:found["_id"]});
        }
    });
}
*/

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
