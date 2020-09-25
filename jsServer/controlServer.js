var dao = require(__dirname+'/configConnection.js');
var security = require(__dirname+'/security.js');
var vm = require('vm');
var conexion = {};
async function saludolocal(opcion){
	switch(opcion){
		case 'dashboard':return {content:'/dashboard'};break;
		case 'login': return {content:'/login'}; break;
		default: return {content: '/404'}; break;
	}
}

async function validateJs(code){
	try{
		await new vm.Script(code);
		return {message:null, error:0, code:'success'};
	}catch(e){
		return { message:'Error at line :'+(e.stack.split('evalmachine.<anonymous>:')[1].substring(0, 1)),
			error: 1,
			code: 'field'
		};
	}
}
async function encriptado(clave){
	var rtn = await security.encripta(clave);
	return rtn;
}
async function desencriptado(clave){
	var rtn = await security.desencripta(clave);
	return rtn;
}
exports.saludo = saludolocal;
exports.evalJs = validateJs;
exports.encriptado = encriptado;
exports.desencriptado = desencriptado;