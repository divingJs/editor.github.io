const util =require('util');
const mysql=require('mysql');
//const config={host:'localhost',user:'editor_db',password:'3d170&_d474b453',database:"editor_db"};
//const config={host:'192.168.0.5',user:'usr_dvn_data',password:'d474b453',database:"divingjs"};
const config={host:'localhost',user:'d1vin6',password:'D4748453',database:"divingjs"};
var sql={
	login: 'call sp_isLogin(?,?)',
	insertUser: 'call sp_create_user(?,?,?,?)',
	updateSession:'call sp_act_desc_user(?,?,?,?)',
	roomInfos:'call sp_get_info_user(?,?,?,?,?)',
	dinamic:'call sp_configure_dynamic(?)'
};
async function consultaMenu(datos){
	var conn = mysql.createConnection(config);
	var query = util.promisify(conn.query).bind(conn);
	try{
		if(!conn)
			conn = mysql.createConnection(config);
	}catch(e){
		console.log(e);
	}
	try{
		const rows = await query(sql[datos.q],datos.dato);
		return JSON.stringify(rows);
	}finally{
		conn.end();
	}
}


async function consultaPackage(dts){
	var conn = mysql.createConnection(config);
	var query = util.promisify(conn.query).bind(conn);
	try{
		if(!conn)
			conn=mysql.createConnection(config);
	}catch(e){
		console.log(e);
	}
	try{
		const rows = await query(dts.q,dts.dato);
		return JSON.stringify(rows);
	}finally{
		conn.end();
	}
}


async function queryDataSp(dts){
	var conn = mysql.createConnection(config);
	var query = util.promisify(conn.query).bind(conn);
	try{
		if(!conn)
			conn = mysql.createConnection(config);
	}catch(e){
		console.log(e);
	}
	try{
		const rows = await query(sql.dinamic,dts.q);
		var rtn = 'call ';
		if(rows[0].length>0){
			rtn += rows[0][0].routine_name+'(';
			for( var i = 0; i < rows[0].length; i ++ ){
				rtn+='?'+((i<rows[0].length-1)?',':'');
			}
		}
		rtn+=')';
		return rtn;
	}finally{
		conn.end();
	}
}




exports.consulta = consultaMenu;
exports.qds = queryDataSp;
exports.qPk = consultaPackage;