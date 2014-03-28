//testing2.blah blah blah
var express = require('express'),
    routes = require('./routes'),
    pdf = require('./routes/pdf'),
    http = require('http'),
    path = require('path');

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
app.get('/newuser', routes.newuser);
app.all('/renderquestion', routes.renderquestion);

app.post('/adduser', routes.adduser(db));
app.all('/signin', routes.signin(db));
app.all('/home', routes.home);
app.all('/getquestion', routes.getquestion(db));
app.all('/checkquestion', routes.checkquestion(db));

app.all('/random', routes.getquestion(db));
app.all('/random/:id', routes.viewquestion(db));

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});