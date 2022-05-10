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
	/*try{
		const script = new vm.Script(code);
		const contexts = [{}];
		contexts.forEach((context) => {
		  script.runInNewContext(context);
		});
		return {message:null, error:0, code:'success'};
	}catch(e){
		var fll = e.stack.split('evalmachine.<anonymous>:')[1].split('\n');
		var fallas = [];
		for(var i = 0; i < fll.length; i ++ ){
			fallas.push({linea:i, msg:fll[i]});
		}
		return { message: JSON.stringify(fallas),
			error: 1,
			code: 'field'
		};
	}
	*/
	try{
		await new vm.Script(code);
		return {message:null, error:0, code:'success'};
	}catch(e){
		var fll = e.stack.split('evalmachine.<anonymous>:')[1].split('\n');
		var fallas = [];
		for(var i = 0; i < fll.length; i ++ ){
			fallas.push({linea:i, msg:fll[i]});
		}
		return { message: JSON.stringify(fallas),
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