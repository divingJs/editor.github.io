const util =require('util');
const mysql=require('mysql');
const config={host:'localhost',user:'3d1t0r_Div1ng',password:'dvn_3d1t0r',database:"editor_db"};
var sql={
	login: 'call sp_isLogin(?,?)',
	insertUser: 'call sp_create_user(?,?,?,?)',
	updateSession:'call sp_act_desc_user(?,?,?,?)',
	roomInfos:'call sp_get_info_user(?,?,?,?,?)'
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
exports.consulta = consultaMenu;