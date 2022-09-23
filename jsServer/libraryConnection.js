var dao = require(__dirname + '/configConnection.js');
async function login(user, pass ){
	var rtn = await dao.consulta({q:'login',dato:[user,pass]});
	return (JSON.parse(rtn)[0]);
}
async function createLogin(datosUser){
	var rtn = await dao.consulta({q:'insertUser',dato:[datosUser.user,datosUser.name,datosUser.password,datosUser.email]});
	return (JSON.parse(rtn)[0]);
}
async function updateSessionActive(user,session,option,socket){
	var rtn = await dao.consulta({q:'updateSession',dato:[user,option,session,socket]});
	 return (rtn!=null)?(JSON.parse(rtn)[0]):null;
}
async function logout(user,session,action,socket){
	var rtn = await dao.consulta({q:'updateSession',dato:[user,action,session,socket]});
	return (JSON.parse(rtn)[0]);
}
async function dynamic(prmts){
	var rtn = await dao.qds(prmts);
	delete prmts['q'];
	var nrtn = await dao.qPk({q:rtn,dato:prmts.d});
	return ( JSON.parse(nrtn)[0]);
}
exports.login = login;
exports.createUser = createLogin;
exports.vMultiSession = updateSessionActive;
exports.logout=logout;
exports.dynamic=dynamic;
/*
S7MNPY-2JQHSJ-4A4AD2
*/