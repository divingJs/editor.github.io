$.fn.ExcelFile=function(obj){
     var action=function(obj){
          var filename=obj.name;
          var columnas=obj.columns;
          var data=obj.data||[];
          var processRow = function (row) {
               var finalVal = '';
               for (var j=0;j<row.length;j++) {
                    var innerValue=row[j]===null?'':row[j].toString();
                    if (row[j] instanceof Date){innerValue=row[j].toLocaleString();}
                    var result = innerValue.replace(/"/g, '""');
                    if (result.search(/("|,|\n)/g) >= 0)result='"'+result+'"';
                    if(j>0)finalVal+=',';
                    finalVal+=result;
               }
               return finalVal+'\n';
          };
          var csvFile = (obj.hasOwnProperty('encabezado')?obj.encabezado:'');
          csvFile += processRow( columnas );
          for(var i=0;i<data.length;i++){
               var nRow=[];
               var ck = Object.keys(data[i]);
               for(var j=0;j<ck.length;j++){nRow.push(data[i][ck[j]]);}
               csvFile+=processRow(nRow);
          }
          var blob = new Blob([csvFile],{type:'text/csv;charset=utf-8;'});
          if(navigator.msSaveBlob){
               navigator.msSaveBlob(blob, filename);
          }else {
               var link = document.createElement("a");
               if (link.download !== undefined) { 
                    var url = URL.createObjectURL(blob);
                    link.setAttribute("href", url);
                    link.setAttribute("download", filename);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
               }
          }
     }
     var uploadFile = function(fUp,elem){
          var rtn={};
          var extension = fUp.name.split('.').pop();
          if(['csv','txt','xls','xlsx'].includes(extension)){
               $('div[d-role=d-uploaded]').addClass('d-hidden');
               elem.append(
                    $('<label>',{class:'d-upload',text:fUp.name})
                    );
               $.extend(rtn,{
                    name:fUp.name,
                    data:[],
                    size:fUp.size,
                    encabezado:[],
                    extens: extension
               });
               $.extend(obj,rtn);
               if(typeof (FileReader) != 'undefined'){
                    if(['csv','txt'].includes(rtn.extens)){
                         var reader = new FileReader();
                         reader.onload=function(e){
                              var x = 0;
                              var rows = e.target.result.split("\n");
                              for (var i = 0; i < rows.length; i++) {
                                   if(rows[i].length>0){
                                        var frmt = rows[i].match(/(\"[\$]?[.,0-9]+\")/g);
                                        if(frmt!=null){
                                             var nfrmt=frmt[0].replace(',','');
                                             rows[i]=rows[i].replace(frmt[0],nfrmt);
                                        }
                                        var cells = rows[ i ].split( "," );
                                        var obji = {};
                                        var have = 0;
                                        for( var j = 0; j < cells.length; j ++ ){
                                             have = 1;
                                             if( i == 0 ){
                                                  obji[ 'field_' + j ] = ( cells[ j ].trim() ).toUpperCase();
                                             }else{
                                                  var field =  rtn.encabezado[0]['field_' + j ] ;
                                                  obji[ field ] = cells[ j ].trim();
                                             }
                                        }
                                        if( i == 0 ){
                                             obj.encabezado.push( obji );
                                        }else{
                                             if( have == 1 )
                                                  obj.data.push( obji );
                                        }
                                        x++;
                                   }
                              }
                              obj.total=x;
                         }
                         reader.readAsText(fUp);
                    }else{
                         var reader = new FileReader();
                         let sheetNames;
                         reader.readAsArrayBuffer(fUp);
                         reader.onload=function(e){
                              var data = new Uint8Array(reader.result);
                              var wb = XLSX.read(data,{ type:'array'});
                              var i = 1;
                              wb.SheetNames.forEach(function(sheetName) {
                                   if(obj.hasOwnProperty('sheet')){
                                        if((typeof obj.sheet == 'string')?sheetName==obj.sheet:i==obj.sheet){
                                             var XL_row_object = XLSX.utils.sheet_to_row_object_array(wb.Sheets[sheetName]);
                                             var json_object = JSON.stringify(XL_row_object);
                                             obj.data=XL_row_object;
                                             var headers =       XLSX.utils.sheet_to_row_object_array(wb.Sheets[sheetName],{
                                                  header:1,
                                                  dfval:'',
                                                  balckrows:true
                                             });
                                             obj.encabezado=headers[0];
                                        }
                                   }else{
                                        var XL_row_object=XLSX.utils.sheet_to_row_object_array(wb.Sheets[sheetName]);
                                        var json_object=JSON.stringify(XL_row_object);
                                        obj.data.push({name:sheetName,index:i,data:XL_row_object});
                                        var headers =       XLSX.utils.sheet_to_row_object_array(wb.Sheets[sheetName],{
                                             header:1,
                                             dfval:'',
                                             balckrows:true
                                        });
                                        obj.encabezado.push({name:sheetName,index:i,data:headers[0]});
                                   }
                                   i++;
                              });
                         }
                    }
               }
          }else{
               alert("File is not scv,txt,xls,xlsx");
          }
     }
     var d = obj.action||'read';
     if( d=='download' ){
          this.empty().text(obj.text).click(function(){action(obj);});
     }else if(d=='export'){
          this.empty().text(obj.text).click(function(){
               if(obj.data==undefined){
                    alert('no dataFound');
                    return;
               }else{
                    action(obj);
               }
          });
     }else if(d=='upload'){
          this.empty();
          var elem = this;
          window.upload_file = function( e ){
               e.preventDefault();
               uploadFile( e.dataTransfer.files[0],elem);
          }
          var inputs = $('<input>',{
               'd-elem':'selectFile',
               type:'file',
               change:function(){uploadFile( inputs[0].files[0],elem);}
          });
          var cnt=$('<div>',{
               ondragover:"return false",
               ondrop:'upload_file(event)',
               class:'d-upload',
               'd-role':'d-uploaded',
               click: function(){
                    inputs[0].click();
               }
          }).append(
               $('<div>',{'d-element':'drag_upload_file'}).append(
                    $('<div>',{class:'datos'}).append(
                         $('<h5>').append(obj.text)
                    )
               ).append(inputs)
          );
          this.append(cnt);
     }
     this.data('file',obj);
}

