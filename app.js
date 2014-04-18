var express = require('express'),
    routes = require('./routes/index'),
    newuser = require('./routes/newuser'),
    pdf = require('./routes/pdf'),
    http = require('http'),
    path = require('path');

var verification = require('./verification.js');

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
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.cookieParser('lasacs'));
app.use(express.cookieSession('lasacs'));

app.use(verification());

app.use(app.router);
// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.all('/about', routes.about);
app.get('/pdf', pdf.index);
app.get('/newuser', newuser.newuser);
app.all('/renderquestion', routes.renderquestion);

app.post('/adduser', newuser.adduser(db));
app.all('/signin', routes.signin(db));
app.all('/home', routes.home(db));
app.all('/getquestion', routes.getquestion(db));
app.all('/checkquestion', routes.checkquestion(db));

app.all('/random', routes.getquestion(db));
app.all('/random/:id', routes.viewquestion(db));
app.all('/checkquestion', routes.checkquestion(db));
app.all('/logout', routes.logout);
app.all('/scoreboard', routes.scoreboard(db));
//app.all('/:username', routes.profile(db));

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});