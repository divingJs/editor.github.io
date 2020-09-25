var apps = require(__dirname+'/app.js');
var express = apps.express;
var app = apps.app;
var http = apps.http;
var io = apps.io;
var cookieParse = apps.cookieParse;
var passport = apps.passport;
var passportInit = apps.passportInit;
var passportSession = apps.passportSession;
var session = apps.session;
var MySQLStore = apps.MySQLStore;
var path = apps.path;

var ctrServer = require(__dirname+"/jsServer/controlServer.js");
var libConn = require(__dirname+'/jsServer/libraryConnection.js');
var salas = require(__dirname+'/jsServer/sala/salas.js');
var compart = require(__dirname+'/jsServer/compartCode/compartCode.js');

var sessionStore = new MySQLStore({host:'localhost',user:'3d1t0r_Div1ng',password:'dvn_3d1t0r',database:"editor_db"});
var sessionMiddleWare = session({
	key:'divingEditor',
	secret:'cv98-1fd5-6AF54D6',
	resave:false,
	saveUninitialized:false,
	store:sessionStore,
	maxAge: Date.now() + 1800
});
app.use(sessionMiddleWare);

var publicDir = path.join(__dirname,'/');
app.use(express.static(publicDir));

/***********************************
 * compartir session con socket.io *
 ***********************************/
io = io(http);

io.use(function(socket, next){
	socket.client.request.originalUrl = socket.client.request.url;
	cookieParse(socket.client.request, socket.client.request.res, next );
});
io.use(function(socket,next){
	socket.client.request.originalUrl = socket.client.request.url;
	sessionMiddleWare(socket.client.request, socket.client.request.res, next);
});
io.use(function(socket, next){
  passportInit(socket.client.request, socket.client.request.res, next);
});
io.use(function(socket, next){
  passportSession(socket.client.request, socket.client.request.res, next);
});
app.get('/auth',async (req,res)=>{
	if(!req.query.user || !req.query.pass){res.send('login failed');}else{
		var rtn = await libConn.login(req.query.user,req.query.pass);
		if(rtn[0].is_login == 1){
			req.session.user = rtn[0].user_str;
			req.session.admin = true;
			var rtSession = await libConn.vMultiSession(rtn[0].user_str,req.sessionID,2,null);
			res.send([{
					user_str:rtn[0].user_str,
					email_str:rtn[0].email_str,
					nombre_str:rtn[0].nombre_str,
					isLogin:rtn[0].is_login
				}]);
		}else{
			res.send([{msg:rtn[0].msg,isLogin:rtn[0].is_login}]);
		}
	}
});
app.get('/',function(req,res){
	res.sendFile(__dirname+"/pages/index.html");
});
app.get('/dashboard',function(req,res){
	if(!req.session.hasOwnProperty('admin')){
		res.sendFile(__dirname+'/pages/dashboard/dashboard.html');
	}else{
		res.sendFile(__dirname+'/pages/dashboard/dashLogin.html');
	}
});
app.get('/logout',async (req,res)=>{
	var rtn = await libConn.logout(req.session.user,req.sessionID,-1,null);
	req.session.destroy();
	res.sendFile(__dirname+'/pages/dashboard/dashboard.html');
});
app.get('/login',function(req,res){
	res.sendFile(__dirname+'/pages/login/login.html');
});
io.on('connection',function(socket){
	libConn.vMultiSession(null,socket.client.request.sessionID,4,socket.id);
	socket.on('disconnect',function(){});
	socket.on('consulta',async (accion,retorno,parametro,peticion)=>{
		var rtn;
		peticion = (peticion != null )?peticion:"-1";
		switch(peticion){
			case 'libConn':
				rtn = await libConn[accion](parametro);
				socket.emit(retorno,rtn);
			break;
			default:
				rtn=await ctrServer[accion](parametro);
				socket.emit(retorno,rtn);
			break;
		}
	});
	socket.on('lgn',async(user, rtn)=>{
		var rt = await libConn.vMultiSession(user,null,3,socket.id);
		rtn(rt);
	});
	socket.on('sala', async (retorno,accion,parametro)=>{
		var rtn = await salas[accion](io,parametro,socket);
		socket.emit(retorno,rtn);
	});
	socket.on('dataUser',async(retorno)=>{
		var rtn = await salas.searchListeners(io,{enail:null,sessionID:socket.client.request.sessionID},socket,3);
		socket.emit(retorno,rtn);
	});
	socket.on('compartCode',async(rtn,accion,param)=>{
		var rtorn = await compart[accion](param,rtn);
		if( rtorn != null ){
			io.to(rtorn[0].socketid).emit(rtn,{script:param.code,from:param.from,cve:rtorn[0].cve,email:param.email});
		}else{
			socket.emit(rtn,{script:'the user is not connect',cve:-1});
		}
	});
	socket.on('collback',async(dir,action,param,callback)=>{
		switch(dir){
			case 'compart':
				var rtn = await compart[action](param);
				callback(rtn);
			break;
		}
	});
});
http.listen(8420,function(){
	console.log( http._connectionKey );
});