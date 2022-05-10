var config = require(__dirname+'/../configConnection.js');

var fs = require('fs');
//.promises

async function wrfile(name,data){
	fs.writeFileSync('documents/files/'+name+'.json',data);/*.then(()=>{return 'exito';}).catch(err=>{return err;});*/
};

async function gtFile(name,data){
	//console.log("entro a getFile: ", name, data);
	var get = fs.readFileSync('/var/www/html/editor/documents/files/'+name+'.json','binary');/*,(er,data)=>{
		if(er){
			console.log( er );
			return;
		}
		console.log( data );
	});//'binary');*/
	return get;
};

async function udfile(name,data){
	fs.writeFileSync('documents/files/'+name+'.json',data);/*.then(()=>{
		console.log( 'exito' );
		return 'exito';
	}).catch(err=>{
		console.log( 'error' );
		return err;
	});*/
};

exports.setFile=wrfile;
exports.getFile=gtFile;
exports.updateFile=udfile;