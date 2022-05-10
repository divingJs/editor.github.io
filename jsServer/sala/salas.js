var config = require(__dirname+'/../configConnection.js');
var salas =[];
async function createSala(io,param,socket){
	var sala = {
		name: param.name,//string
		createdBy: socket.id,
		listeners: params.listeners, //array
		listener_active:[],
		developers:[{autor:socket.id,collaborator:''}]
	};
	var yaCreoSala = false;
	for( var i = 0; i < salas.length; i ++ ){
		if( salas[i].createBy == socket.id ){
			yaCreoSala = true;
		}
	}
	if( !yaCreoSala ){
		salas.push(sala);
	}
}
async function searchListeners(io,param,socket,option){
	var rtn = await config.consulta({q:'roomInfos',dato:['-1',param.email,'-1',option,param.sessionID]});
	return (rtn!=null)?(JSON.parse(rtn)[0]):null;
}
exports.createSala = createSala;
exports.searchListeners = searchListeners;