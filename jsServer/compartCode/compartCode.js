var config = require(__dirname+'/../configConnection.js');
async function saludo(param){
	var rtns = await config.consulta({q:'roomInfos',dato:['-1',param.to,'-1',1,null]});
	var jsRtn = (JSON.parse(rtns)[0]);
	
	if( jsRtn.length>0){
		return [{socketid:jsRtn[0].socket_id,cve:1}];
	}
	return null;
}

async function rechaza(param){
	var rtns = await config.consulta({q:'roomInfos',dato:['-1',param.to,'-1',1,null]});
	var jsRtn = (JSON.parse(rtns)[0]);
	return [{socketid:jsRtn[0].socket_id,cve:param.desicion}];
}
async function consultaDatos(param){
	var rtns = await config.consulta({q:'roomInfos',dato:['-1',param.to,'-1',1,null]});
	return (JSON.parse(rtns)[0]);
}
exports.saludo = saludo;
exports.decision = rechaza;
exports.consultaDatos = consultaDatos;