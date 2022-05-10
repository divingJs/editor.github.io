var editorText = {files:[]};
var controlEditor = {
	theme: 'default',
	indent: '2'
};
function preguntarAntesDeSalir(){
	return "¿Seguro que quieres salir?";
}
/**
 * inicio axdb1
 * preparacion de entrada al editor
 */
dvn('body').append(
	dvn('<div>',{
		class:'d-content-engrane'
	}).append(
		dvn('<div>',{
			id:'engrane',
			class:'icon-cog d-engrane',
			dblclick:function(){
				dvn('#engrane').addClass('d-hidden');
				dashboard('rtn_dashboard','dashboard');
			}
		})
	)
);
dvn('#engrane')[0].ontouchend=function(e){
	dvn('#engrane').addClass('d-hidden');
	dashboard('rtn_dashboard','dashboard');
};
dvn.draggable(dvn('#engrane')[0],dvn(dvn('#engrane')[0].parentNode)[0]);
dvn(dvn('#engrane')[0].parentNode).center();
dvn('#area').append(
	dvn('<iframe>',{
		id:'salida',
		class:'iframe-salida',
		style:'height: '+window.innerHeight+'px'
	})
);
window.onresize=function(){
	dvn('#salida').attr('style','height: '+window.innerHeight+'px');
	dvn('#contentDashboard').attr('style','height: '+(window.innerHeight-18)+'px');
  	dvn('#accionesDashBoard').attr('style','height:'+window.innerHeight+'px');
//	dvn(dvn('#engrane')[0].parentNode).center();
}
/*fin axdb1 */
function createCode(){
	if(dvn('#contentEditor').length>0){
		dvn('#contentEditor').removeClass('d-hidden');
	}else{
		dvn('body').prepend(
			dvn('<div>',{id:'contentEditor'})
				.append(dvn('<div>',{id:'contentTextArea'}))
				.append(dvn('<div>',{id:'tabEditor'}))
		);
		var cnt = [];
		diving.each("txtHeader txtHtml txtCss txtJs".split(' '),function(i,v){
			createArea(dvn('#contentTextArea'),v);
			var obj = {title:v.replace('txt',''),element:dvn('#'+v)};
			if(i==0){obj.open=true;}
			cnt.push(obj);
		});
		dvn('#tabEditor').divTabsTrip({
			content:cnt
		});
		var tts = dvn('#tabEditor').data('divTabsTrip');
		dvn(tts.elem).click(function(e){
			if(!diving.className.has(e.target,'d-title-item')) return;
			var idx = parseInt(dvn( e.target ).attr('d-elem').replace('tab_',''));
			dvn.each(tts.content,function(i,v){
				delete tts.content[i].open;
				dvn(tts.elements[i]).removeClass('d-tab-active');
				dvn(tts.contents[i]).addClass('d-hidden');
			});
			tts.content[idx].open=true;
			dvn(tts.elements[idx]).addClass('d-tab-active');
			dvn(tts.contents[idx]).removeClass('d-hidden');
			tts.openElem = 'tab_'+(idx);
			var cntCdMirror=dvn('#tabEditor')[0].querySelectorAll('div[d-role=contenido]')[0];
			var dWb = dvn(cntCdMirror)[0].querySelectorAll('.CodeMirror-scroll')[idx].parentNode.CodeMirror;
			dWb.focus();
		});
		dvn('#contentEditor').divWindow({
			modal: false,
			actions:['close','minimize','maximize'],
			content: dvn('#tabEditor'),
			resize: function(x,y){
				var edtrs = dvn('body')[0].querySelectorAll('.CodeMirror');
				dvn.each(edtrs,function(i,v){
					dvn(v).attr("style","height:"+(y-97)+"px");
				});
			}
		});
		var w = dvn('#contentEditor').data('divWindow');
		dvn(dvn('#contentEditor')[0].querySelector('.d-window-content')).center();
		dvn('#contentEditor').attr('style','position: absolute;width:0px;height:0px;');
	}
}
function createArea(content,ident){
	content.append(dvn('<div>',{id:ident}));
	dvn('#'+ident).divText({
		multiple:{
			resize:false
		},
		text:/txtHeader/.test(ident)?'<!-- libs and stylesheets here -->\n'+((editorText.header!=undefined)?editorText.header:''):
			 /txtHtml/.test(ident)?((editorText.hasOwnProperty('html'))?editorText.html:''):
			 /txtCss/.test(ident)?((editorText.hasOwnProperty('css'))?editorText.css:''):
			 /txtJs/.test(ident)?((editorText.hasOwnProperty('js'))?editorText.js:''):''
	});
	var area = dvn('#'+ident)[0].querySelector('textArea');
	var editor = CodeMirror.fromTextArea(area, {
		lineNumbers: true,
		mode: 	(/HTML/.test(ident.toUpperCase()))?'htmlmixed':
				(/CSS/.test(ident.toUpperCase()))?'text/css':
				(/JS/.test(ident.toUpperCase()))?'text/javascript':
				'htmlmixed',
		theme: 'default',
		extraKeys: {
			"Ctrl-Enter":function(e){
				createHTML(editorText,true);
			},
			"Ctrl-S":function(e){
				if( window.location.search.length == 0 ){
					var name = generateName();
					saveFile({name:name,data:JSON.stringify(editorText)});
				}else{
					updateFile({name:window.location.search.replace('?q=',''),data:JSON.stringify(editorText)});
				}
			}
	    },
	    foldGutter: true,
	    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
	    matchTags: {bothTags: true},
	    indentUnit:5
	});
	setTimeout(
		function(){
			var cntCdMirror=dvn('#tabEditor')[0].querySelectorAll('div[d-role=contenido]')[0];
			var dWb = dvn(cntCdMirror)[0].querySelectorAll('.CodeMirror-scroll')[0].parentNode.CodeMirror;
			dWb.focus();
		},
	100);
	editor.on('change',function(e){
		var value = editor.getValue();
		editorText[ident.toLowerCase().replace('txt','')]=value;
		createHTML(editorText,false);
		if(datoCompartCode.active){
			var comp =$('#compare');
	    	comp.mergely('lhs', getCompare(editorText));
            compartCode({
                invite:'decision',
                params:{
                	to: datoCompartCode.email,
                	code:editorText,
                	desicion: 3
                }
            });
	    }
	});
	emmetCodeMirror(editor);
}

function downloadFile(){
  	var zip = new JSZip();
  	var txthtml = '';
  	txthtml+='<!DOCTYPE html>\n<!-- Thank you for using www.editor.com to edit your website. -->\n<html>\n\t<head>\n\t\t<title>editor</title>\n\t\t';
	txthtml+=(editorText.hasOwnProperty('header')?((editorText.header.length>0)?editorText.header:''):'');
  	var edtContent = zip.folder("editor");
  	if(editorText.hasOwnProperty('css')){
  		if(editorText.css.length>0){
  			var csss = edtContent.folder("css");
			var txtcss = editorText.css;
  			csss.file('editor_css.css',txtcss);
			txthtml+='\n\t\t<link rel="stylesheet" href="css/editor_css.css">';
		}
	}
  	txthtml+='\n\t</head>\n\t<body>\n';
  	txthtml+=editorText.html;
	if(editorText.hasOwnProperty('js')){
  		if(editorText.js.length>0){
			var txtjss = editorText.js;
 			var jsss = edtContent.folder("js");
 			jsss.file('editor_js.js',txtjss);
  			txthtml+='\n\t<script type="text/javascript" d-role="d-editor-script" src="js/editor_js.js"></script>';
		}
	}
  	txthtml+='\n\t</body>\n</html>';
  	edtContent.file("index.html", txthtml);	
	zip.generateAsync({type:"blob"}).then(function(content) {
		saveAs(content, "editor.zip");
	});
}
var datoCompartCode={};
function compartirCodigoFrame(dta){
	switch(dta.clave){
		case 1:
			datoCompartCode.email = dta.email;
			creaSaludo(dta);
		break;
		case 2:
			datoCompartCode.active = false;
			construyeCompare(dta);
		break;
		case 3:
			var comp =$('#compare');
    		comp.mergely('rhs', getCompare(dta.msg));
		break;
	}
}
function creaSaludo(dta){
	if(dvn('#saludocompCode').length > 0){ dvn('#saludocompCode').remove(); }
	dvn('body').append(dvn('<div>',{id:'saludocompCode',style:'position:absolute;width:300px;'}));
	dvn('#saludocompCode').append(
		dvn('<div>',{class: 'd-article',style:'background-color:white;'}).append(
				dvn('<div>',{class:'d-article-header',text:'Hola, '+dta.from+' quiere compartir codigo con tigo aceptas?'})
			).append(
				dvn('<div>',{class:'d-article-section'}).append(
					dvn('<div>',{id:'mtv',class:'d-hidden'}).append(
						dvn('<div>',{id:'motivo'})
					)
				)
			).append(
				dvn('<div>',{class:'d-article-footer'}).append(
					dvn('<div>',{id:'btns1'}).append(
						dvn('<div>',{id:'btnAceptCode'})
					).append(
						dvn('<div>',{id:'btnCancelCode'})
					)
				).append(
					dvn('<div>',{id:'btns2',class:'d-hidden'}).append(
						dvn('<div>',{id:'btnEnviaMotivo'})
					)
				)
			)
		);
	dvn('#saludocompCode').center();
	dvn('#btnAceptCode').divButton({
		type: 'success',
		text:'Aceptar',
		click:function(){
			datoCompartCode.active = false;
			construyeCompare(dta);
            compartCode({
                invite:'decision',
                params:{
                	to: datoCompartCode.email,
                	code:dta.msg,
                	desicion: 2
                }
            });
		}
	});
	dvn('#motivo').divText({
		multiple: {
			resize: false
		},
		placeholder: 'Motivo'
	});
	dvn('#btnEnviaMotivo').divButton({
		text:'Enviar',
		type:'success',
		click:function(){
			var motivo = dvn('#motivo').data('divText').text;
            compartCode({
                invite:'decision',
                params:{
                	to: datoCompartCode.email,
                	code:motivo,
                	desicion:-2
                }
            });
            dvn('#saludocompCode').remove();
		}
	});
	dvn('#btnCancelCode').divButton({
		type: 'danger',
		text:'Rechazar',
		click:function(){
			dvn('#mtv').removeClass('d-hidden');
			dvn('#btns2').removeClass('d-hidden');
			dvn('#btns1').addClass('d-hidden');
		}
	});
}
function construyeCompare(dta){
	if(!datoCompartCode.active){
		dvn('#vtnCompartCode').empty();
		dvn('#vtnCompartCode').append(dvn('<div>',{id:'contentCompareCode',style: 'position:absolute;width:1px;'}));
		var diff = dvn('<div>',{class:'diffs'}
		).append(
			dvn('<header>').append(
				dvn('<button>',{id: 'prev',title: 'Previous diff',class: 'icon-upload7'})
			).append(
				dvn('<button>',{id: 'next',title: 'Next diff',class:'icon-download8'})
			)
		).append(
			dvn('<div>',{class: 'compare-wrapper'}
			).append(
				dvn('<div>',{id:'compare'})
			)
		).append(
			dvn('<div>',{class:'d-hidden'}
			).append(dvn('<div>',{id:'file1'})
			).append(dvn('<div>',{id:'file2'}))
		);
		var espera = 10;
		if(dta.from==undefined){
			espera = 100;
			callback({to:datoCompartCode.email},function(rtn){
				dta.from = rtn[0].nombre_str;
				datoCompartCode.email = rtn[0].email_str;
			});
		}
		setTimeout(function(){
			dvn('#contentCompareCode').divWindow({
				width: 600,
				title: 'compare with '+dta.from,
				height: 400,
				content: dvn('<div>',{class:'container'}).append(diff),
				actions: ['close','minimize'],
				resize: function(x,y){
					var dWb = dvn('#contentCompareCode')[0].querySelectorAll('.d-window-body')[0];
					var cdMr = dWb.querySelectorAll('.CodeMirror-scroll');
					dvn(dWb).attr("style","height:"+(y-97)+"px;width:"+(x-30)+"px;");
					dvn('#compare').attr("style","height:"+(y-97)+"px;width:"+(x-30)+"px;");

					dvn.each(cdMr,function(i,v){
						dvn(v).attr("style","height:"+ (y-97)+"px;");
					});
					var whrl = ( ( dvn(dWb)[0].clientWidth - 72 ) / 2 );
					dvn('#compare-editor-lhs').attr('style','width:'+whrl+'px;height:'+(y-97)+'px;');
					dvn(dvn('#compare-editor-lhs')[0].querySelector('.CodeMirror')).attr('style','height:'+(y-97)+"px;");
					dvn('#compare-editor-rhs').attr('style','width:'+whrl+'px;height:'+(y-97)+'px;');
					dvn(dvn('#compare-editor-rhs')[0].querySelector('.CodeMirror')).attr('style','height:'+(y-97)+"px;");
				}
				});
			dvn('#contentCompareCode').data('divWindow').center();
			datoCompartCode.active = true;
			if(dvn('#saludocompCode').length>0)
				dvn('#saludocompCode').remove();
			setTimeout(function(){
			    var comp =$('#compare');
			    comp.mergely({
			        cmsettings: {readOnly: false,lineWrapping: true},
			        wrap_lines: true,
			        editor_width: 'calc(50% - 25px)',
			        editor_height: '15em',
			        lhs: function(setValue) {setValue(getCompare(dta.msg));},
			        rhs: function(setValue) {setValue(getCompare(dta.msg));}
			    });
			    $('#prev').click(function() { comp.mergely('scrollToDiff', 'prev'); });
			    $('#next').click(function() { comp.mergely('scrollToDiff', 'next'); });
			    editorText = dta.msg;
			    comp.mergely('options', { sidebar: false });

			},200);
		},espera);

	}

}
function getCompare(config){
	return '<!DOCTYPE html>\n'+
	'<html lang="es">\n'+
	'  <head>\n'+
		(config.hasOwnProperty('header')?config.header:'')+
		(config.hasOwnProperty('css')?(
	'   <style type="stylesheets">\n'+
		config.css+
	'	</style>\n'
	):'')+
	'  </head>\n'+
	'  <body>\n'+config.html+'\n'+
	(config.hasOwnProperty('js')?('	<script type="text/javascript">\n'+config.js+'	</script>\n'):'')+
	'  </body>\n'+  
	'</html>';
}








function generateName(){
	var simbolos, color;
	simbolos = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	color = "";
	for(var i = 0; i < 10; i++){
		color = color + simbolos[Math.floor(Math.random() * 62)];
	}
	return color;
}