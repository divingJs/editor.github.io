var llave = "01011101000110100101110110110111011011011011000111010110101001101001101011010110";
(function(){
    var ConvertBase=function(num){
    	return {
    		from:function(baseFrom){
    			return {
    				to:function(baseTo){
    					return parseInt(num,baseFrom).toString(baseTo);
    				}
    			};
    		}
    	};
    };
    ConvertBase.bin2dec = function (num) {return ConvertBase(num).from(2).to(10);};
    ConvertBase.bin2hex = function (num) {return ConvertBase(num).from(2).to(16);};
    ConvertBase.dec2bin = function (num) {return ConvertBase(num).from(10).to(2);};
    ConvertBase.dec2hex = function (num) {return ConvertBase(num).from(10).to(16);};
    ConvertBase.hex2bin = function (num) {return ConvertBase(num).from(16).to(2);};
    ConvertBase.hex2dec = function (num) {return ConvertBase(num).from(16).to(10);};
    this.ConvertBase = ConvertBase;
})(this);
async function encript(parameter){
	var clave_encryptada = "";
	var valor_binario = parameter;
	var valor_hex = "";
	var cadena_8bits = "";
	var clave_encryptada_hex = "";
	var caracter = '';
	var caracter_valor_binario = '';
	var caracter_llave_binaria = '';
	var j = 0;
	for(var a = 0; a < valor_binario.length; a++){
		caracter_valor_binario = valor_binario.substring(a,(a+1));
		caracter_llave_binaria = llave.substring(j,(j+1));
		if( j == llave.length -1 ){
			j = -1;
		}
		j ++;
		if(( parseInt( caracter_valor_binario ) + parseInt( caracter_llave_binaria ) ) == 1){
			caracter = "1";
		}else{
			caracter = "0";
		}
		clave_encryptada = clave_encryptada + "" + caracter;
	}
	var b= 0;
	var total = valor_binario.length/8;
	for(var a = 0; a < total; a++){
		if( a === 0 ){
		  cadena_8bits =  clave_encryptada.substring( 0, ( b + 8 ) );
		}else{
		  cadena_8bits =  clave_encryptada.substring( b, ( b + 8 ) );
		}
		b = b + 8;
		valor_hex = ConvertBase.bin2hex(cadena_8bits).toUpperCase();
		clave_encryptada_hex = clave_encryptada_hex + "" + valor_hex;
	}
	return clave_encryptada_hex;
}

exports.encript = encript;
