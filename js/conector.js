var socket = io();
async function call(url, clb){await fetch(url).then(function(response){return response.text();}).then(function(data){clb(data);}).catch(function(err){clb(err);});}
function dashboard(retorno,consulta){
	socket.emit('consulta','saludo',retorno,consulta);
}
function removeDashboard(){
	dvn('#dashboard').remove();
}
async function clearDashboard(){
	if(dvn('#dashboard').length>0){dvn('#dashboard').remove();}
	dvn('body').append(dvn('<div>',{id:'dashboard',class:'d-dashboard'}));
	return true;
}
socket.on('rtn_dashboard', async (rtn)=>{
	await clearDashboard();
	loadHref(dvn('#dashboard'),window.location.origin+rtn.content);
	socket.emit('dataUser','loadDataUser');
});
socket.on('loadDataUser',async (rtn)=>{
	if(rtn.length>0 ){
		controlEditor.datosUser = rtn;
	}
});
socket.on( 'rtn_login', async (rtn)=>{
	if(dvn('#loadLogin').length>0){dvn('#loadLogin').remove();}
	dvn('body').prepend(dvn('<div>',{id:'loadLogin'}));
	loadHref( dvn('#loadLogin'), window.location.origin=rtn.content );
});
async function encripta(clave){
	await socket.emit('consulta','encriptado','rtnEncripta',clave);
}
socket.on('rtnEncripta',async (response)=>{
	var usr = dvn('input[name=user]')[0].value;
	call('/auth?user='+usr+'&pass='+response, function(rtn){
		var arr = JSON.parse( rtn );
		if( arr[0].isLogin == 1 ){
			controlEditor.datosUser=arr;
			lgn( arr[0].user_str );
			dvn('#loadLogin').remove();
			dashboard('rtn_dashboard','dashboard');
		}else{
			dvn('#errorLogin').attr('style','color:red;opacity:1;');
			dvn('#errorLogin').append(dvn('<div>',{text: arr[0].msg}));
			setTimeout(function(){
				var xi = 1, opc;
				function opacitis(){
					xi = xi - 0.1;
					dvn('#errorLogin').attr('style','opacity:'+(xi)+';');
					if(xi<=0){
						clearTimeout(opc);
						dvn('#errorLogin').empty();
					}else{
						opc = setTimeout(opacitis,100);
					}
				}
				opc = setTimeout(opacitis,100);
			},5000);
		}
	});
});
async function createUser(pass){
	await socket.emit('consulta','encriptado','rtnCreateuser',pass);
}
socket.on('rtnCreateuser',async (response)=>{
	var usr_f   = dvn('input[name=usr_form]')[0].value;
	var name_f  = dvn('input[name=name_form]')[0].value;
	var email_f = dvn('input[name=email_form]')[0].value;
	await socket.emit('consulta','createUser','rtnSendMail',{user:usr_f,name:name_f,password:response,email:email_f},'libConn')
});
socket.on('rtnSendMail',async (response)=>{
	if( response[0].err == 0){
		dvn('input[name=user]')[0].value = dvn('input[name=usr_form]')[0].value;
		encripta(dvn('input[name=pass_form]')[0].value);
	}else{
		console.log( response[0].msg);
	}
});
function createHTML(param,excJs){
	var ifrm = dvn('#salida')[0].contentWindow;
	var doc = ifrm.document;
	var head='',body='';
	if(param.hasOwnProperty("header") && excJs){
		if(param.header.length>0){
			doc.head.innerHTML = param.header;
		}
	}
	if(param.hasOwnProperty("css")){
		if(param.css.length>0){
			if(!doc.querySelector('style[d-role=d-editor-style]')){
				var css = dvn('<style>',{
					type:'text/css','d-role':'d-editor-style',
					text:param.css
				});
				doc.head.append(css[0]);
			}else{
				var s = doc.querySelector('style[d-role=d-editor-style]');
				s.innerHTML = param.css;
			}
		}
	}
	doc.body.innerHTML = (param.html)?(param.html.length>0)?param.html:'':'';
	if(excJs){
		socket.emit('consulta','evalJs','executeJs',((param.js)?(param.js.length>0)?param.js:'':''));
		setTimeout(function(){
			dvn.each(editorText.files,function(i,v){
				if(v.type=="text/javascript"){
					dvn('#salida')[0].contentWindow.eval(v.data);
				/*}else if(v.type=="text/css"){
					var css = dvn('<style>',{
						type:'text/css','d-role':'d-editor-style',
						text:v.data
					});
					dvn('#salida')[0].contentWindow.document.head.append(css[0]);
					*/
				}
			});
			dvn('#salida')[0].contentWindow.eval(editorText.js)
		},500);
	}
}
socket.on('executeJs',async (dt)=>{
	if( dt.error == 0 ){
		var ifrm = dvn('#salida')[0].contentWindow;
		var doc = ifrm.document;
		var head='',body='';
		head = doc.head.innerHTML||'';
		body = doc.body.innerHTML || '';
		dvn('#salida').remove();
		var nifrm = dvn('#area').append(dvn('<iframe>',{
			id:'salida',
			class:'iframe-salida',
			style:'height: '+window.innerHeight+'px'
		}));
		var difrm = dvn('#salida')[0].contentWindow; 
		var frm = difrm.document;
		frm.open();
		frm.write(head);
		frm.write(body);
		frm.close();
	}else{
		generaAlerta(dt.message);

	}
});
async function logout(){
	await clearDashboard();
	loadHref(dvn('#dashboard'),window.location.origin+'/logout');
	delete controlEditor.datosUser;
}
function lgn(user){
	socket.emit('lgn',user,function(rtn){
		console.log( 'Bienvenido' );//<<<<---- si se recibe error se debe mandar el mensaje
	});
}
function callback(params,callback){
	socket.emit('collback','compart','consultaDatos',params,async(rtn)=>{callback(rtn);});
}


/*
se envia el codigo de todas las pestañas y se evalua que codigo es: 
-2 el usuario amigo rechazo la peticion de codificar en grupo.
-1 el usuario no esta logeado
1  peticion al usuario amigo para codificar con el 
2  el usuario acepta el codificar con tigo
3  se recibe actualizacion de codigo de su lado



nota: ver por que al actualizar la pagina se pierde el socketid
*/

async function compartCode(dato){
	datoCompartCode.email = dato.params.to;
	await socket.emit(
		'compartCode',
		'rtnCompartCode',
		dato.invite,
		dato.params
	);
}

socket.on('rtnCompartCode', async(dts)=>{
	switch(dts.cve){
		case -2:
			alert( dts.script );
		break;
		case -1:
			alert( dts.script );
		break;
		default:
			compartirCodigoFrame({	clave:dts.cve,
									msg:dts.script,
									from:dts.from,
									email:dts.email
								});
		break;
	}
});

async function saveFile(dato){
	await socket.emit(
		'collback',
		'file',
		'setFile',
		dato,
		async(rtn)=>{
			if(rtn==null){
				window.location = window.location+"?q="+dato.name
				editorText = JSON.parse( dato.data );
          		createHTML(editorText,true);
			}
		}
		);
}

async function updateFile(dato){
	await socket.emit(
		'collback',
		'file',
		'updateFile',
		dato,
		async(rtn)=>{
			console.log( rtn );
		}
		);
}

async function getFile(name,callback){
	//console.log( name );
	await socket.emit(
	'collback',
	'file',
	'getFile',
	name,
	async(rtn)=>{
		callback( rtn );
	}
	);
};



function generaAlerta(mensaje){
	var alertas = {
		espera:null,
		init:function(msg){
			var al = document.getElementById('alertas');
			if(al == null ){
				al = document.createElement('DIV');
				al.id='alertas';
				al.classList='d-alertas';
				al.setAttribute('role','d-message-alert');
				document.body.append(al);
			}
			var msgs = JSON.parse(msg);
			al.innerHTML="<div>Error at line: "+msgs[0].msg+
						 "</div><div>"+msgs[1].msg+
						 "</div><div>"+msgs[2].msg.replaceAll(' ','-')+"</div>";
			var x = document.createElement('EM');
			x.classList='d-close icon-clearclose';
			x.onclick = function(){
				document.body.removeChild(al);
				clearTimeout(alertas.espera);
			}
			al.prepend( x );
			alertas.espera = setTimeout(function(){
				if(document.getElementById('alertas')!=null){
					document.body.removeChild(document.getElementById('alertas'));
					clearTimeout(alertas.espera);
				}
			},5000);
		}
	};
	alertas.init(mensaje);
}