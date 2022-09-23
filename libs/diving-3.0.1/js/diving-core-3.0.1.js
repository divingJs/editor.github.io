    //divButton
    (function() {
        var widget = {
            name: "Button",
            init: function(prm) {
                prm = diving.extend(prm, {
                    text: prm.text || diving(this)[0].innerHTML || '',
                    classParent:"d-button",
                    class: ((prm.type) ? 'd-' + prm.type : 'd-default') + ((prm.class) ? ' ' + prm.class : ''),
                    type: (prm.type) ? prm.type : 'default'
                });
                var widtgetData = {
                    setText: function(t) {
                        diving(diving(this.elm).find('button')).text(t);
                        this.text = t;
                    },
                    elem:diving(this)[0]
                };
                widget.createElement(prm,widtgetData);
                diving(this).data('div'+widget.name, widtgetData);
            },
            createElement: function(p,data) {
                diving(data.elem).empty();
                var attributes = diving.extend(p, {
                    text: p.text,
                    class: p.class,
                    type: p.type
                });
                diving(data.elem).addClass(p.classParent);
                delete attributes.classParent;
                var elemento = diving('<button>', attributes);
                (p.type == 'disabled') ? elemento[0].onclick = function(event) {
                    event.preventDefault();
                }: null;
                (p.icon) ? elemento[((typeof p.icon === 'string') ? 'append' : ((p.icon.pos == 'before') ? 'prepend' : 'append'))](diving('<em>', {
                    class: (typeof p.icon === 'string') ? p.icon : p.icon.class
                })): null;
                diving(data.elem).append(elemento);
                diving.extend(data,attributes);
            }
        };
        diving.widget(widget);
    })();

    (function() {
        var widget = {
            name: "Notification",
            init: function(prm) {
                prm = diving.extend(prm, {
                    text: prm.text || diving(this)[0].innerHTML || '',
                    classParent:"d-notification",
                    class: ((prm.type) ? 'd-' + prm.type : 'd-default') + ((prm.class) ? ' ' + prm.class : ''),
                    type: (prm.type) ? prm.type : 'default'
                });
                var widtgetData = {
                    setText: function(t) {
                        diving(diving(this.elem).find('div')).text(t);
                        this.text = t;
                    },
                    destroy:function(){
                        diving(this.elem).removeData('divNotification');
                        diving(this.elem)[0].remove();
                    },
                    setType:function(t){
                        diving(this.elem).find('div').attr('type',t);
                        diving(this.elem).find('div').attr('class','d-'+t);
                        this.class='d-'+t;
                        this.type = t;
                    },
                    elem:diving(this)[0]
                };
                widget.createElement(prm,widtgetData);
                diving(this).data('div'+widget.name, widtgetData);
            },
            createElement: function(p,data) {
                diving(data.elem).empty();
                //getIcon
                var icn=(p.icon)?p.icon:null;
                delete p.icon;
                //getConfirm
                var confirm = (p.hasOwnProperty('confirm'))?p.confirm:false;
                p.type=(confirm)?'light':p.type;
                p.class=(confirm)?'d-light':p.class;
                delete p.confirm;
                var action={
                    cancel:(p.action)?p.action.cancel  ||function(){}:function(){},
                    confirm:(p.action)?p.action.confirm||function(){}:function(){}
                };
                delete p.action;
                var attributes=diving.extend(p,{text:p.text,class:p.class,type:p.type});
                diving(data.elem).addClass(p.classParent);
                if(p.configure!=null){
                    var stl="";diving.each( Object.keys( p.configure ),function(i,v){stl+=v+':'+p.configure[v]+';'});diving(data.elem).attr('style',stl);
                    delete p.configure;
                }
                delete attributes.classParent;
                if(p.autoClose){
                    var x=diving(data.elem);
                    setTimeout(function(){diving(x).data('divNotification').destroy();},p.autoClose);
                    delete p.autoClose;
                }
                var elemento = diving('<div>', attributes);
                (icn)?elemento[
                    ((typeof icn==='string')?'append':((icn.pos=='before')?'prepend':'append'))
                    ](diving('<em>',{class:(typeof icn==='string')?icn:icn.class})): null;
                var em = diving('<em>',{class:'icon-close3',
                        click:function(e){
                            diving(this.parentNode).data('divNotification').destroy();
                        }
                    });
                diving(data.elem).append(em).append(elemento);
                if(confirm){
                    var cancel=diving('<div>',{class:'d-confirm-cancel'});
                    var confirmacion=diving('<div>',{class:'d-confirm-confirm'});
                    diving(data.elem).append(diving('<div>',{class:'d-clear'})).append(cancel).append(confirmacion).append(diving('<div>',{class:'d-clear'}));
                    diving(data.elem).attr('style','background-color: #969696;padding: 1px 5px 5px;border-radius: 0;display:block;width: auto;');
                    cancel.divButton({
                        type: 'danger',
                        text: 'Cancelar',
                        click:function(){
                            action.cancel.constructor=cancel.click;
                            action.cancel();
                        }
                    });
                    confirmacion.divButton({
                        type: 'success',
                        text: 'Aceptar',
                        click:function(){
                            action.confirm.constructor=confirmacion.click;
                            action.confirm();
                        }
                    });
                }
                diving.extend(data,attributes);
            }
        };
        diving.widget(widget);
    })();
    /*textbox*/
    (function() {
        var widget = {
            name: "Text",
            init: function(prm) {
                prm = diving.extend(prm, {
                    text: prm.text || diving(this)[0].innerHTML || '',
                    class: "d-text" + ((prm.type) ? ' d-' + prm.type : ' d-default') + ((prm.class) ? ' ' + prm.class : '')
                });
                var widtgetData = {
                    setText: function(t) {
                        console.log( diving(this.elm).find('input')[0] );
                        diving(this.elm).find('input')[0].value=t;this.text=t;
                    },
                    getValue:function(){return this.text;},
                    elem:diving(this)[0]
                };
                widget.createElement(prm,widtgetData);
                diving(this).data('div'+widget.name, widtgetData);
            },
            createElement: function(p,data) {
                diving(data.elem).empty();
                var attributes = diving.extend(p, {
                    text: p.text,
                    class: p.class,
                    onchange:function(evt){
                        diving(this.parentNode.parentNode).data('divText').text=this.value;
                        if(p.change){
                            p.change.constructor=this.onchange;
                            p.change(evt);
                        }
                    },
                    onkeyup:function(k){
                        diving(this.parentNode.parentNode).data('divText').text=this.value;
                        if(p.keyup){
                            p.keyup.constructor=this.onkeyup;
                            p.keyup(k);
                        }
                    },
                    onkeydown:function(k){
                        diving(this.parentNode.parentNode).data('divText').text=this.value;
                        if(p.keydown){
                            p.keydown.constructor=this.onkeydown;
                            p.keydown(k);
                        }
                    }
                });
                var w;
                if(p.width){w=p.width;delete p.width;}
                var elemento;
                if(p.multiple){
                    if(typeof p.multiple!='object'){
                        delete p.multiple;
                    }else{
                        attributes.rows=p.multiple.row;
                        attributes.cols=p.multiple.col;
                        (p.multiple.resize!=undefined)?(!p.multiple.resize)?attributes.style='resize:none;':'':'';
                        delete p.multiple;
                    }
                    elemento=diving('<textarea>',attributes);
                }else{
                    elemento = diving('<input>', attributes);
                }
                diving(data.elem).append(diving('<div>').append(elemento));
                diving.extend(data,attributes);
            }
        };
        diving.widget(widget);
    })();
    
    (function(){
        var widget = {
            name: "Master",
            init: function(prm) {
                prm=diving.extend(prm,{class:"d-master-page d-row"});
                var widtgetData = {
                    elem:diving(this)[0]
                };
                widget.createElement(prm,widtgetData);
                diving(this).data('div'+widget.name, widtgetData);
            },
            createElement: function(p,data) {
                diving(data.elem).empty();
                var attributes=diving.extend(p,{class:p.class});
                var elemento = diving('<div>',{class:attributes.class});
                diving(data.elem).addClass('d-container-12');
                diving(data.elem).append(elemento);
                function add(content,elm){
                    var actual = diving('<'+elm.type+'>',{class:elm.class});
                    (elm.id!=undefined)?actual.attr('id',elm.id):null;
                    content.append( actual );
                    if(elm.hasOwnProperty('content')){
                        for(var sb in elm.content){
                            add(actual,elm.content[sb]);
                        }
                    }
                    if(elm.hasOwnProperty('load'))
                    loadHref(actual,elm.load);
                }
                diving.each(p.content,function(i,v){
                    add(elemento,v);
                });
                attributes.add = add;
                diving.extend(data,attributes);
            }
        };
        diving.widget(widget);
    })();
    (function(){
        var widget = {
            name: "TabsTrip",
            init: function(prm) {
                prm=diving.extend(prm,{class:"d-tabstrip"});
                var widtgetData = {
                    elem:diving(this)[0]
                };
                widget.createElement(prm,widtgetData);
                diving(this).data('div'+widget.name, widtgetData);
            },
            createElement: function(p,data) {
                diving(data.elem).empty();
                var wdt=this;
                var title=diving('<div>',{'d-role':'title',class:'d-title'});
                var cnt=diving('<div>',{'d-role':'contenido',class:'d-tabstrip-content'});
                var attributes=diving.extend(p,{
                    class:p.class,
                    elements:[],
                    contents:[],
                    openElem:null,
                    titulos:title,
                    contenidos:cnt,
                    add:function(element){
                        wdt.add(
                            element,
                            this.elements.length,
                            diving( this.titulos ),
                            diving( this.contenidos ),
                            this.properties,
                            this
                        );
                    },
                    properties:null
                });
                var elemento = diving('<div>',{class:attributes.class});
                diving(data.elem).append(elemento);
                elemento.append(diving('<div>',{class:'d-title-content'}).append(title)).append(diving('<div>',{class:'d-clear'})).append(cnt);
                var props={t1:0,t2:0,ini:0,fin:0,paso:false};
                diving.each(p.content,function(i,v){
                    if(v.hasOwnProperty('open'))attributes.openElem='tab_'+i;
                    wdt.add(v,i,title,cnt,props,attributes);
                });
                if(props.paso){
                    wdt.creaScroll(title,props);
                }
                attributes.properties = props;
                diving.extend(data,attributes);
            },
            add:function(elm,i,title,cnt,prps,attrs){
                var elmTitle=diving('<div>',{
                        text:elm.title,
                        'd-elem':'tab_'+i,
                        class:'d-title-item'+((elm.hasOwnProperty('open'))?(!elm.open)?'':' d-tab-active':''),
                        click:function(){
                            var dta=diving(this.parentNode.parentNode.parentNode.parentNode).data('divTabsTrip');
                            var actual = diving(this).attr('d-elem');
                            diving.each(dta.elements,function(i,v){
                                if(v.attr('d-elem')==actual){
                                    v.addClass('d-tab-active');
                                    dta.contents[i].removeClass('d-hidden');
                                }else{
                                    v.removeClass('d-tab-active');
                                    dta.contents[i].addClass('d-hidden');
                                }
                            });
                        }
                    });
                title.append(elmTitle);
                attrs.elements.push( elmTitle );
                var elmCnt = diving('<div>',{
                        'd-content':'tab_'+i,
                        class:'d-content-item'+((elm.hasOwnProperty('open'))?((!elm.open)?' d-hidden':''):' d-hidden')
                    }).append(diving(elm.element));
                attrs.contents.push(elmCnt);
                cnt.append(
                    elmCnt
                );
                prps.t1=title[0].parentNode.offsetWidth;
                prps.t2=prps.t2+elmTitle[0].offsetWidth;
                if(prps.t2<prps.t1){
                    prps.fin=i;
                }else{
                    prps.paso=true;
                }
            },
            creaScroll:function(title,prps){
                diving(title[0].parentNode.parentNode).prepend(
                    diving('<div>',{
                        class:'icon-keyboard_arrow_left d-tabTitle-left',
                        click:function(){
                            var elemento = diving(this.parentNode.children[2])[0];
                            elemento.scrollTo((elemento.scrollLeft - 50),0);
                        }
                    })
                );
                diving(title[0].parentNode.parentNode).prepend(
                    diving('<div>',{
                        class:'icon-keyboard_arrow_right d-tabTitle-right',
                        click:function(){
                            var elemento = diving(this.parentNode.children[2])[0];
                            elemento.scrollTo((elemento.scrollLeft + 50),0);
                        }
                    })
                );
                diving(title[0].parentNode).attr('style','overflow:hidden;width:'+prps.t1+'px;position:absolute;');
            }
        };
        diving.widget(widget);
    })();
    (function(){
        var widget = {
            name: "AutoComplete",
            init: function(prm) {
                prm=diving.extend(prm,{class:"d-autocomplete"});
                var widtgetData = {
                    elem:diving(this)[0],
                    value:null
                };
                widget.createElement(prm,widtgetData);
                diving(this).data('div'+widget.name, widtgetData);
            },
            createElement: function(p,data) {
                diving(data.elem).empty();
                var wdt=this;
                var attributes=diving.extend(p,{minkey:p.minkey||0,class:p.class,elements:{},itemSelected:null,select:{text:'',value:''},activos:[]});
                var input = diving('<input>',{
                            class:'d-input-autocomplete',
                            onchange:function(){
                                if(p.change){
                                    p.change.constructor=this.onchange;
                                    p.change();
                                }
                            },
                            onkeydown:function(k){
                                var dac = diving( this.parentNode.parentNode ).data('divAutoComplete');
                                var pr=false;
                                var x = dac.itemSelected;
                                switch(k.keyCode){
                                    case 40:
                                        dac.itemSelected=(dac.itemSelected==null)?dac.activos.length:dac.itemSelected;
                                        if(dac.itemSelected<dac.activos.length-1){
                                            dac.itemSelected+=1;
                                        }else{
                                            dac.itemSelected=0;
                                            x=0;
                                        }
                                        pr=true;
                                    break;
                                    case 38:
                                        dac.itemSelected=(dac.itemSelected==null)?dac.activos.length:dac.itemSelected;
                                        x=dac.itemSelected;
                                        if(dac.itemSelected>0){
                                            dac.itemSelected-=1;
                                        }else{
                                            dac.itemSelected=dac.activos.length-1;
                                            x=dac.activos.length-1;
                                        }
                                        pr=true;
                                    break;
                                    case 13:
                                        if(dac.itemSelected!=null){
                                            dac.elements.input[0].value=dac.activos[dac.itemSelected][0].innerText;
                                            dac.value=           dac.activos[dac.itemSelected][0].innerText;
                                            dac.select={'value': dac.activos[dac.itemSelected][0].val,
                                                        'text':  dac.activos[dac.itemSelected][0].innerText};
                                            dac.activos=[];
                                            dac.itemSelected=null;
                                            dac.elements.list.addClass('d-hidden');
                                        }
                                    break;
                                }
                                if(pr){
                                    wdt.changeSelection(dac.activos,dac.itemSelected);
                                }
                            },
                            onkeyup:function(k){
                                var dac = diving( this.parentNode.parentNode ).data('divAutoComplete');
                                if(k.keyCode==27){
                                    dac.elements.list.addClass('d-hidden');
                                    return;
                                }
                                dac.value=this.value;
                                if(this.value.length > 0 && k.keyCode!=13){
                                    dac.elements.list.removeClass('d-hidden');
                                    dac.activos=[];
                                    dac.select={text:'',value:''};
                                    diving.each(dac.elements.items,function(i,v){
                                        var textoOriginal=v[0].innerText;
                                        var vActual= (v[0].innerText).substring(0,dac.value.length);
                                        if(vActual.length>=attributes.minkey){
                                            if(vActual.toUpperCase()==dac.value.toUpperCase()){
                                                v.removeClass('d-hidden');
                                                var lbl=diving('<b>',{
                                                    text:(v[0].innerText).substring(0,dac.value.length),
                                                    style:''
                                                });
                                                var igual=(v[0].innerText).substring(0,dac.value.length);
                                                v[0].innerText=v[0].innerText.replace(igual,'');
                                                v.prepend(lbl);
                                                dac.activos.push(v);
                                            }else{
                                                v.text(textoOriginal);
                                                v.addClass('d-hidden');
                                                v.removeClass('d-selected');
                                            }
                                        }else{
                                            v.text(textoOriginal);
                                            v.addClass('d-hidden');
                                            v.removeClass('d-selected');
                                        }
                                    });
                                }else{
                                    dac.activos=[];
                                    dac.select={text:'',value:''};
                                    dac.itemSelected=null;
                                    dac.elements.list.addClass('d-hidden');
                                }
                            }
                        });
                var lista=diving('<ul>',{
                                dtrole:'d-list-autocomplete',
                                style:'width:'+(data.elem.offsetWidth)+'px',
                                click:function(k){
                                    var dac = diving( this.parentNode.parentNode.parentNode ).data('divAutoComplete');
                                    dac.elements.input[0].value=diving(k.target)[0].innerText;
                                    dac.value=                  diving(k.target)[0].innerText;
                                    dac.select={'value':        diving(k.target)[0].val,
                                                'text':         diving(k.target)[0].innerText};
                                    dac.activos=[];
                                    dac.itemSelected=null;
                                    dac.elements.list.addClass('d-hidden');
                                    if(p.selected!=null){
                                        p.selected.constructor=this.click;
                                        p.selected();
                                    }
                                }
                            });
                var items=[];
                attributes.elements={'input':input,'list':lista,'items':items};
                var elemento = diving('<div>',{class:attributes.class}).append(
                        input
                    ).append(
                        diving('<div>',{
                            class:'d-list-autocomplete'
                        }).append(
                            lista
                        )
                    );
                diving.each(p.datos,function(i,v){
                    wdt.add(lista,v,p.textValue,p.fieldValue,attributes.elements);
                });
                diving(data.elem).append(elemento);
                diving.extend(data,attributes);
            },
            add:function(list,element,textValue,fieldValue,elements){
                var item=diving('<li>',{
                    class:'d-item-autocomplete d-hidden'
                });
                if(typeof element == 'string'){
                    item.attr('text',element);
                    item.attr('val',element);
                }else{
                    item.attr('text',element[textValue]);
                    item.attr('val',element[fieldValue]);
                }
                elements.items.push(item);
                list.append(item);
            },
            changeSelection:function(elements,i){
                diving.each(elements,function(x,v){
                    v.removeClass('d-selected');
                });
                elements[i].addClass('d-selected');
            }
        };
        diving.widget(widget);
    })();
    /*MultiSelect*/
    (function(){
         var widget = {
            name: "MultiSelect",
            init: function(prm) {
                prm=diving.extend(prm,{class:"d-multiselect"});
                var widtgetData = {
                    elem:diving(this)[0],
                    maxItemSelected:prm.maxItemSelected||prm.datos.length
                };
                widget.createElement(prm,widtgetData);
                diving(this).data('div'+widget.name, widtgetData);
            },
            createElement: function(p,data) {
                dvn(data.elem).addClass( p.class );
                diving.extend(data,{
                    elements:[],
                    selectes:[],
                    activos:{},
                    text:"",
                    slt:0,
                    objetos:{},
                    selected:function(){
                        return this.selectes;
                    }
                });
                if(p.change){
                    diving.extend(data,{change:p.change});
                }
                var mltSlc = this;
                var c = 'd-hidden';
                var itmSlc =    diving('<div>',   {'d-rol':'d-itemSelects'});
                var cntTxtDown= diving('<div>',   {class:'d-cntTxtDown'});
                var txt =       diving('<input>', {class:'d-txtMultiSelect'});
                var ul =        diving('<ul>',    {class:'d-hidden','d-rol':'d-listMultiSelect',click:function(e){
                    var t=e.target;
                    var obj={
                        txt:t.innerText,
                        value:dvn(t).attr('val')
                    };
                    mltSlc.addElementSelected(obj,dvn(data.elem));

                        em.removeClass('icon-expand_more');
                        em.removeClass('icon-expand_less');
                        em.addClass('icon-expand_more');
                }
            });
                var em =         diving('<em>',    {class:'icon-expand_more'});
                var down =       diving('<div>',   {class:'d-moreLess',
                                click: function(){
                                    em.toggleClass('icon-expand_more');
                                    em.toggleClass('icon-expand_less');
                                    ul.toggleClass(c);
                                    var mda = diving( data.elem ).data('divMultiSelect');
                                    var arr = ((mda.text.length>0)?mda.activos['lvl_'+mda.text.length].elements.length>0:false)?mda.activos['lvl_'+mda.text.length].elements:mda.elements;
                                    diving.each(arr,function(i,v){
                                        (diving.className.has(ul[0],c))?v.addClass(c):v.removeClass(c);
                                    });
                                }
                            }).append(em);
                dvn(data.elem).append(itmSlc).append(cntTxtDown.append(txt).append(down)).append(ul);
                data.objetos = {
                    itemSelect:itmSlc,
                    inputText:txt,
                    list:ul,
                    expands:em
                };
                diving.each(p.datos, function(i,v){
                    mltSlc.add(ul,v,null,null,data.elements);
                });
                txt[0].onkeyup=function(e){
                    data.text = this.value;
                    if( e.keyCode !== 38 && e.keyCode !== 40 && e.keyCode !== 27 && e.keyCode!== 13){
                        em.removeClass('icon-expand_more');
                        em.removeClass('icon-expand_less');
                        em.addClass('icon-expand_less');
                        if(this.value.length>0){
                            ul.removeClass('d-hidden');
                            mltSlc.keyup(e,dvn(data.elem));
                        }else{
                            em.removeClass('icon-expand_more');
                            em.removeClass('icon-expand_less');
                            em.addClass('icon-expand_more');
                            ul.addClass('d-hidden');
                        }
                    }else if( e.keyCode == 13 ){
                        em.removeClass('icon-expand_more');
                        em.removeClass('icon-expand_less');
                        em.addClass('icon-expand_more');
                        mltSlc.selectedByEnterKey(e,dvn(data.elem) );
                    }else{
                        em.removeClass('icon-expand_more');
                        em.removeClass('icon-expand_less');
                        em.addClass('icon-expand_less');
                        mltSlc.selectByKeyboard( e, dvn(data.elem));
                    }
                }
                ul.attr('style','width:'+(diving(data.elem)[0].offsetWidth)+'px;'+
                    ((data.elements.length>5)?'overflow:hidden;height:16em;overflow-y:scroll;':''));
            },
            add:function(list,element,textValue,fieldValue,elements){
                var item=diving('<li>',{
                    class:'d-item-multiselect d-hidden'
                });
                if(typeof element == 'string'){
                    item.attr('text',element);
                    item.attr('val',element);
                }else{
                    item.attr('text',element.textValue);
                    item.attr('val',element.fieldValue);
                }
                elements.push(item);
                list.append(item);
            },
            keyup:function(e,elem){
                var mda = diving(elem).data('divMultiSelect');
                if( e.keyCode == 27 ){
                    mda.objetos.list.addClass('d-hidden');
                    mda.slt=-1;
                    return;
                }
                var obj={};
                if( mda.text.length == 1 ){
                    mda.activos={};
                    mda.activos = {
                        lvl_1:{
                            elements:[],
                            search: mda.text.toUpperCase()
                        }
                    };
                    mda.slt = -1;
                }else{
                    var arrkeys = Object.keys( mda.activos );
                    if( mda.text.length > arrkeys.length ){
                        mda.activos['lvl_'+mda.text.length]={
                            elements:[],
                            search:mda.text.toUpperCase()
                        };
                        mda.slt = -1;
                        obj.nuevo=true;
                    }else{
                        obj.nuevo=false;
                    }
                }
                var arr = (mda.activos['lvl_'+mda.text.length].elements.length>0)?mda.activos['lvl_'+mda.text.length].elements:mda.elements;
                for( var i = 0; i < arr.length; i ++ ){
                    if(arr[i][0].innerText.toUpperCase().startsWith(mda.activos['lvl_'+mda.text.length].search)){
                       arr[i].removeClass('d-hidden'); 
                       if(obj.nuevo){
                           mda.activos['lvl_'+mda.text.length].elements.push(arr[i]);
                       }
                    }else{
                       arr[i].addClass('d-hidden');  
                    }
                }

            },
            selectByKeyboard:function(e,elem){
                var mda = diving(elem).data('divMultiSelect');
                var arr = (mda.activos['lvl_'+mda.text.length].elements.length>0)?mda.activos['lvl_'+mda.text.length].elements:mda.elements;
                mda.objetos.list.removeClass('d-hidden');
                switch( e.keyCode ){
                    case 38: mda.slt=(mda.slt<=0)?arr.length-1:mda.slt-1; break;
                    case 40: mda.slt=(mda.slt==arr.length-1)?0:mda.slt+1; break;
                    case 27: mda.objetos.list.addClass('d-hidden'); mda.slt=0; break;
                }
                for( var i = 0; i <arr.length ; i ++ ){
                    arr[i].removeClass('d-selected');
                }
                var x = 0;
                for( var idx = 4; idx < mda.slt; idx ++ ){
                    x = x + arr[idx][0].offsetHeight
                }
                mda.objetos.list[0].scrollTop = x;
                arr[mda.slt].addClass('d-selected');
            },
            selectedByEnterKey:function( e, elem ){
                var mda = diving(elem).data('divMultiSelect');
                var arr = (mda.activos['lvl_'+mda.text.length].elements.length>0)?mda.activos['lvl_'+mda.text.length].elements:mda.elements;
                var obj = {
                    txt: arr[mda.slt][0].innerText,
                    value: arr[mda.slt].attr('val')
                };
                this.addElementSelected(obj, elem);
            },
            addElementSelected:function(obj, elem){
                var mda = diving(elem).data('divMultiSelect');
                var noExiste = false;
                for( var i = 0; i < mda.selectes.length; i ++ ){
                    if( mda.selectes[i].value == obj.value ){
                        noExiste= true;
                        i = mda.selectes.length + 1;
                    }
                }
                if(!noExiste){
                    if(mda.selectes.length<mda.maxItemSelected){
                        var label = dvn('<label>',{
                                text: obj.txt,
                                value: obj.value,
                                class:'d-multiSelect-selected'
                            });
                        mda.objetos.itemSelect.append(
                            label.append(dvn('<em>',{
                                class:'icon-x1',
                                click:function(){
                                    var value = diving(label).attr('value');
                                    for( var i = 0;i<mda.selectes.length; i++){
                                        if( mda.selectes[i].value == value ){
                                            mda.selectes.splice(i,1);
                                            //label.empty();
                                            label[0].remove();
                                        }
                                    }
                                }
                            }))
                        );
                        mda.selectes.push(obj);
                        if( mda.change ){
                            mda.change.constructor = mda.objetos.inputText[0].onchange;
                            mda.change(mda);
                        }
                    }
                }
                mda.objetos.list.addClass('d-hidden');
                mda.slt=-1;
            }
        };
        diving.widget(widget);
    })();


    /*grid* /
    (function(){
         var widget = {
            name: "Grid",
            init: function(prm) {
                prm=diving.extend(prm,{class:"d-grid",scrollable:(prm.hasOwnProperty('scrollable'))?prm.scrollable:false});
                var widtgetData = {
                    elem:diving(this)[0],
                    columns:(prm.columns)?prm.columns:Object.keys(prm.dataSource.data[0]),
                    editing:false,
                    command:prm.commands||null,
                    refresh:function(){
                        prm.dataSource = this.dataSource;
                        widget.createElement(prm,this);
                    }
                };
                widget.createElement(prm,widtgetData);
                diving(this).data('div'+widget.name, widtgetData);
                widget.addCommand(prm.commands, widtgetData, widget, prm );
            },
            createElement: function(p,data) {
                diving(data.elem).empty();
                diving.extend(data,{
                    dataSource:p.dataSource
                });
                if(typeof data.columns[0] == "string"){
                    var oCols=[];
                    diving.each(data.columns,function(i,v){
                        oCols.push({title:v,field:v});
                    });
                    data.columns = oCols;
                }
                var th = diving('<table>',{'d-role':'t-head'});
                var t = diving('<table>',{'d-role':'t-body'});
                var h = diving('<thead>',{});
                var b = diving('<tbody>',{});
                var cg = document.createElement('COLGROUP');
                var cgh = document.createElement('COLGROUP');
                var oCols = {h:[],b:[]};
                diving.extend(data,{
                    'd-head':h,
                    'd-body':b
                });
                var ttal=data.columns.length+((data.dataSource.grupo)?data.dataSource.grupo.length:0)+((p.commands!=null)?p.commands.action.length:0);
                for(var i = 0; i < ttal; i ++ ){
                    var cl = document.createElement('COL');
                    var clh = document.createElement('COL');
                    cg.appendChild(cl);
                    cgh.appendChild(clh);
                    oCols.h.push(clh);
                    oCols.b.push(cl);
                }
                this.createColumns(p,data,b,cg);
                this.createHeaders(p,data,h);
                if(p.title){
                    var cp = document.createElement('CAPTION');
                    cp.appendChild(diving('<div>',{class:'d-caption-title',text:p.title})[0]);
                    th[0].appendChild(cp);
                }
                th[0].appendChild(cgh);
                t[0].appendChild(cg);
                var dhCnt = diving('<div>',{'d-role':'d-content-header',class:'d-grid-header'+((p.scrollable)?' d-grid-scroll':'')}).append(th.append(h));
                var dbCnt = diving('<div>',{'d-role':'d-content-body',  class:'d-grid-body'+  ((p.scrollable)?' d-grid-scroll':'')}).append(t.append(b));
                data.elem.append(dhCnt[0]);
                data.elem.append(dbCnt[0]);
                diving.each(h.find('tr')[0].cells,function(i,v){
                    diving(oCols.b[i]).attr('style','width:'+diving(v)[0].offsetWidth+'px');
                });
                if(p.scrollable){
                    dhCnt.attr('style','width:'+(diving(data.elem)[0].offsetWidth)+'px;');
                    dbCnt.attr('style','width:'+(diving(data.elem)[0].offsetWidth)+'px;height:'+diving.addPx(p.height));
                }else if(p.height){
                    dbCnt.attr('style','overflow:hidden;height:'+diving.addPx(p.height));
                }
            },
            addCommand:function(command,data, widget, prm){
                if( ( command != null )?command.action.includes('add'):false ){
                    var caption = diving(diving(data.elem).find('table[d-role=t-head]')[0]).find('caption');
                    var cmdR=diving('<div>',{class:'d-comand-row'});
                    var cpt = diving('<div>',{'d-role':'d-content-command',class:'d-grid-command'}).append(cmdR);
                    var cntCommand=null;
                    if(caption.length==0){
                        cntCommand=document.createElement('CAPTION');
                        cntCommand.appendChild(cpt[0]);
                    }else{
                        cntCommand=cpt;
                    }
                    diving(caption[0]).append(cntCommand);
                    for(var i = 0; i < command.action.length; i ++ ){
                        if(command.action[i]=='add'){
                            var cmd = diving('<div>');
                            cmdR.append(cmd);
                            diving(cmd).divButton({
                                type: 'default',
                                class:'d-comand',
                                'd-role':'t-command',
                                'command':command.action[i],
                                text: command.action[i],
                                click:function(){
                                    if(diving(this).attr('command')=='add'){
                                        widget.addPopup(data,diving(data.elem),(command.hasOwnProperty('popup')?command.popup:false));
                                    }else if(diving(this).attr('command')=='remove'){
                                        widget.removePopup(data.dataSource,diving(data.elem),(command.hasOwnProperty('popup')?command.popup:false));
                                    }else{
                                        widget.updatePopup(data.dataSource,diving(data.elem),(command.hasOwnProperty('popup')?command.popup:false));
                                    }
                                }
                            });
                        }
                    }
                }
            },
            addPopup:function(dtSource, element, popup){
                var g=element.data('divGrid');
                if(g.editing)return;
                g.editing=true;
                var flds=(Object.keys(g.dataSource.schema.model.fields).length>0)?g.dataSource.schema.model.fields:obj=diving.map(g.columns,function(i){return {[i.field]:{type:'string'}};});
                var obj;
                if(obj!=undefined){obj={};diving.each(flds,function(i,v){var k = Object.keys(v)[0];obj[k]={type:v[k].type};});}else{obj=flds;}
                var o={};
                for(var i=0,l=Object.keys(obj).length;i<l;i++){
                    var type=function(t,fld){
                        return diving('<div>',{'d-role':'d-grid-edit-text','d-field':fld});
                    }
                    o[Object.keys(obj)[i]]=type(obj[Object.keys(obj)[i]].type,Object.keys(obj)[i]);
                }
                diving.map(g.columns,function(a){ return (a.hasOwnProperty('template'))? delete a.template: a; });
                var wdt = this;
                if(popup){
                    var confirmacion = diving('<div>',{'d-role':'notificacion',class:'d-col-4'});
                    var dt = new diving.store.Source({data: [o],schema:{model:{fields:flds}}});
                    var gg = diving('<div>');
                    gg.divGrid({dataSource:dt,columns: g.columns});
                    diving('body').append(confirmacion);
                    confirmacion.divNotification({
                        confirm: true,
                        text: gg[0].innerHTML,
                        action:{
                            cancel:function(){
                                element.data('divGrid').editing=false;
                                confirmacion.data('divNotification').destroy();
                            },
                            confirm:function(){
                                var rtext={};
                                diving.each(Object.keys(obj),function(i,v){
                                    var t = diving('div[d-field='+v+']').data('divText').text;
                                    rtext[v]=(obj[v].type=='number')?parseInt(t):t;
                                });
                                dtSource.dataSource.data.push(rtext);
                                wdt.createTr(element.data('divGrid')['d-body'],rtext,wdt,dtSource);
                                element.data('divGrid').editing=false;
                                confirmacion.data('divNotification').destroy();
                            }
                        },
                        destroy:function(){
                            element.data('divGrid').editing=false;
                            diving(this.elem).removeData('divNotification');
                            diving(this.elem)[0].remove();
                        }
                    });
                    confirmacion.attr('style',confirmacion.attr('style')+'position: absolute;top: 5em;left: 10em;');
                    var ttl=diving(confirmacion).find('div');
                    diving.draggable(ttl[0],confirmacion[0]);
                }else{
                    wdt.createTr(element.data('divGrid')['d-body'],o,wdt,dtSource);
                }
                var x1=null;
                diving.each(
                    Object.keys(obj),function(i,v){
                        diving('div[d-field='+v+']').divText({
                            type:(obj[v].type=='string')?'text':obj[v].type,
                            keyup:function(k){
                                if(!popup){
                                    var t = diving('div[d-field='+v+']');
                                    while(((t!=null)?(t[0].nodeName!='TR'):true)){
                                        t=(t==null)?diving(this):diving(diving(t)[0].parentNode);
                                    }
                                    if(k.keyCode==27){
                                        t.remove();
                                    }
                                    if(k.keyCode==13){
                                        var nobj={};
                                        diving.each(Object.keys(obj),function(i,v){
                                            nobj[v]=(obj[v].type=='number')?parseInt(diving(o[v]).data('divText').text):diving(o[v]).data('divText').text;
                                        });
                                        var dg = diving('div[d-field='+v+']');
                                        while(((dg!=null)?((dg.attr('d-role')!=null)?dg.attr('d-role')!='d-content-body':true):true)){
                                            dg=(dg==null)?diving(this):diving(diving(dg)[0].parentNode);
                                        }
                                        dg=diving(dg[0].parentNode);
                                        dg.data('divGrid').dataSource.data.push(nobj);
                                        wdt.createTr(dg.data('divGrid')['d-body'],nobj,wdt,dg.data('divGrid').dataSource);
                                        dg.data('divGrid').editing=false;
                                        t.remove();
                                    }
                                }
                            }
                        });
                        if(i==0){
                            diving('div[d-field='+v+']').find('INPUT')[0].focus();
                        }
                    }
                );
            },
            removePopup:function(data, element){
                var t = diving(element);
                while(((t!=null)?(t[0].nodeName!='TR'):true)){
                    t=(t==null)?diving(this):diving(diving(t)[0].parentNode);
                }
                diving.each(data.relate, function(i,v){
                    if(t[0]==v.tagTr[0]){
                        diving.each(data.dataSource.data,function(x,y){
                            if( y['d-row-item'] == v.obj['d-row-item'] ){
                                var dx = data.dataSource.data.splice(x,1);
                                var dy = data.relate.splice(i,1);
                                return false;
                            }
                        });
                        return false;
                    }
                });
                data.dataSource = new diving.store.Source(data.dataSource.initParams);
                diving(t).remove();
                data.refresh();
            },
            updatePopup:function(data,element,popup){
                var g=diving(data.elem).data('divGrid');
                if(g.editing)return;
                g.editing=true;
                var flds=(Object.keys(g.dataSource.schema.model.fields).length>0)?g.dataSource.schema.model.fields:obj=diving.map(g.columns,function(i){return {[i.field]:{type:'string'}};});
                var obj;
                if(obj!=undefined){obj={};diving.each(flds,function(i,v){var k = Object.keys(v)[0];obj[k]={type:v[k].type};});}else{obj=flds;}
                var o={};
                for(var i=0,l=Object.keys(obj).length;i<l;i++){
                    var type=function(t,fld){
                        return diving('<div>',{'d-role':'d-grid-edit-text','d-field':fld});
                    }
                    o[Object.keys(obj)[i]]=type(obj[Object.keys(obj)[i]].type,Object.keys(obj)[i]);
                }
                diving.map(g.columns,function(a){ return (a.hasOwnProperty('template'))? delete a.template: a; });
                var wdt = this;
                if(popup){
                    var confirmacion = diving('<div>',{'d-role':'notificacion',class:'d-col-4'});
                    var dt = new diving.store.Source({data: [o],schema:{model:{fields:flds}}});
                    var gg = diving('<div>');
                    gg.divGrid({dataSource:dt,columns: g.columns});
                    diving('body').append(confirmacion);
                    confirmacion.divNotification({
                        confirm: true,
                        text: gg[0].innerHTML,
                        action:{
                            cancel:function(){
                                diving(data.elem).data('divGrid').editing=false;
                                confirmacion.data('divNotification').destroy();
                            },
                            confirm:function(){
                                var rtext={};
                                diving.each(Object.keys(obj),function(i,v){
                                    var t = diving('div[d-field='+v+']').data('divText').text;
                                    rtext[v]=(obj[v].type=='number')?parseInt(t):t;
                                });
                                dtSource.dataSource.data.push(rtext);
                                wdt.createTr(diving(data.elem).data('divGrid')['d-body'],rtext,wdt,dtSource);
                                diving(data.elem).data('divGrid').editing=false;
                                confirmacion.data('divNotification').destroy();
                            }
                        },
                        destroy:function(){
                            diving(data.elem).data('divGrid').editing=false;
                            diving(this.elem).removeData('divNotification');
                            diving(this.elem)[0].remove();
                        }
                    });
                    confirmacion.attr('style',confirmacion.attr('style')+'position: absolute;top: 5em;left: 10em;');
                    var ttl=diving(confirmacion).find('div');
                    diving.draggable(ttl[0],confirmacion[0]);
                }
                /*
                var t = diving(element);
                while(((t!=null)?(t[0].nodeName!='TR'):true)){
                    t=(t==null)?diving(this):diving(diving(t)[0].parentNode);
                }
                var x=0;
                if(popup){
                    console.log( t, x, data, element, popup );
                }
                /*
                    1.- se agrega una columna flotante a cada renglon que aparecera con la leyenda update en el momento del mouse over
                    2.- se construye un grid con las columnas visibles para update
                * /
            },
            createColumns:function(p,data,body){
                var wdgt = this;
                for(var i = p.dataSource.view().length-1; i >= 0; i--){
                    var keys = Object.keys(p.dataSource.view()[i]);
                    wdgt.createTr(body,p.dataSource.view()[i],wdgt, data);
                }
            },
            createTr:function(content, fields,wdgt, data){
                //console.log('\ncontent:', content,'\nfields:', fields,'\nwdgt:', wdgt,'\ndata:', data );
                var ks;
                if(fields.hasOwnProperty('items')){
                    var tr = diving('<tr>',{
                        class:'d-grid-tr d-grid-tr-group',
                        'd-rownum':content[0].rows.length,
                        'd-field':fields.field,
                        'd-ctr-clpse':0
                    });
                    ks = Object.keys( fields.items );
                    var rg=-1;
                    var textoGrupo = '';
                    for( var i = 0; i < data.dataSource.grupo.length; i ++ ){
                        textoGrupo = data.dataSource.grupo[i].field;
                        if(data.dataSource.grupo[i].field==fields.field){
                            tr.append(wdgt.createTd(diving('<em>',{class:'icon-chevron-up1'}),0));
                            tr.attr('d-ctr-clpse',i);
                            rg++;
                            break;
                        }else{
                            rg++;
                            tr.append(wdgt.createTd('',0));
                        }
                    }
                    var td = wdgt.createTd(textoGrupo+':'+fields.value,((data.dataSource.grupo.length-rg)+data.columns.length));
                    tr[0].onclick=function(e){
                        wdgt.colapseGrid( tr,td,content );
                        diving(diving( this ).find('em')[0]).toggleClass('icon-chevron-down1');
                        diving(diving( this ).find('em')[0]).toggleClass('icon-chevron-up1');
                    }
                    tr.append(td);
                    content.append( tr );
                    for(var i = 0; i < fields.items.length; i ++){
                        wdgt.createTr(content,fields.items[i],wdgt,data);
                    }
                }else{
                    var rlate = (data.hasOwnProperty('relate')?data.relate:data.relate=[]);
                    ks = Object.keys(fields);
                    var tr = diving('<tr>',{class:'d-grid-tr','d-row-class':'item','d-rownum':content[0].rows.length});
                    rlate.push({obj:fields,tagTr:tr});
                    if(data.dataSource.grupo)
                    for(var j = 0; j < data.dataSource.grupo.length; j ++ ){
                        tr.append(wdgt.createTd('',null));
                    }
                    for( var j = 0; j<ks.length; j ++ ){
                        for(var k = 0; k < data.columns.length; k ++ ){
                            if( data.columns[k].field == ks[j]){
                                tr.append(
                                    wdgt.createTd(
                                        (data.columns[k].hasOwnProperty('template')?
                                            diving.template(data.columns[k].template,fields):
                                        fields[ks[j]]),
                                        null
                                    )
                                );
                            }
                        }
                    }
                    if((data.command!=null)?data.command.hasOwnProperty('action')?data.command.action.includes('update'):false:false){
                        tr.append(
                            wdgt.createTd(
                                diving('<em>',{
                                    class:'icon-pen-angled',
                                    click:function(){
                                        wdgt.updatePopup(data,this, data.command.popup );
                                    }
                                }),
                                null
                            )
                        );
                    }
                    if((data.command!=null)?data.command.hasOwnProperty('action')?data.command.action.includes('remove'):false:false){
                        tr.append(
                            wdgt.createTd(
                                diving('<em>',{
                                    class:'icon-clearclose',
                                    click:function(){
                                        wdgt.removePopup(data,this);
                                    }
                                }),
                                null
                            )
                        );
                    }
                    content.append(tr);
                }
            },
            createTd:function(text,clspan){
                var td = diving('<td>');
                td.append(text);
                if(clspan){
                    td.attr('colspan',clspan);
                }
                return td;
            },
            createHeaders:function(p,data,header){
                var tr = diving( '<tr>');
                if(data.dataSource.grupo)
                for(var i=0;i<data.dataSource.grupo.length; i ++){
                    tr.append( diving( '<th>'));
                }
                for( var i = 0; i < data.columns.length; i ++ ){
                    tr.append( diving( '<th>',{text:data.columns[i].title}));
                }

                if((data.command!=null)?data.command.hasOwnProperty('action')?data.command.action.includes('update'):false:false){
                    tr.append(
                        diving('<th>',{})
                    );
                }
                if((data.command!=null)?data.command.hasOwnProperty('action')?data.command.action.includes('remove'):false:false){
                    tr.append(
                        diving('<th>',{})
                    );
                }
                header.append( tr );
            },
            colapseGrid:function(tr,td,cnt){
                var grupo = tr.attr('d-field');
                var clpse = tr.attr('d-ctr-clpse');
                for( var i = ( parseInt(tr.attr('d-rownum'))+1); i < cnt[0].rows.length; i ++ ){
                    if( diving( cnt[0].rows[i] ).attr('d-field') != grupo ){
                        if( parseInt( diving(cnt[0].rows[i]).attr('d-ctr-clpse') ) < clpse ){
                            break;
                        }else{
                            var dhb = diving(cnt[0].rows[i]).attr('d-hid-by');
                            if(((dhb!=null)?dhb:grupo)==grupo){
                                diving(cnt[0].rows[i]).toggleClass('d-hidden');
                                if(diving.className.has(cnt[0].rows[i],'d-hidden')){
                                    diving(cnt[0].rows[i]).attr('d-hid-by',grupo);
                                }else{
                                    diving(cnt[0].rows[i]).removeAttr('d-hid-by');
                                }
                            }
                        }
                    }else{
                        break;
                    }
                }
            }
        };
        diving.widget(widget);
    })();
    */




    /*
    Menu
    */
    
(function(){
     var widget = {
          name: "Menu",
          init: function(prm) {
               prm=diving.extend(prm,{
                    class:"d-menu-content"+(prm.hasOwnProperty('class')?' '+prm.class:''),
                    vertical:(prm.hasOwnProperty('vertical'))?prm.vertical:false
               });
               var widtgetData = {
                    elem:diving(this)[0],
                    class:prm.class,
                    vertical: prm.vertical,
                    items:[],
                    list:[]
               };
               delete prm.vertical;
               delete prm.class;
               widget.createElement(prm,widtgetData);
               diving(this).data('div'+widget.name, widtgetData);
          },
          createElement: function(d,p) {
               dvn(p.elem).empty();
               var ul=dvn('<ul>',{class:p.class});
               p.list.push(ul);
               (p.vertical)?ul.attr('d-orientation','vrt'):ul.attr('d-orientation','orn');
               p.elem.append(ul[0]);
               if(d.hasOwnProperty('header')){
                    var dh = dvn('<div>',{class:'d-menu-header'});
                    dh[0].innerHTML=d.header;
                    var li = dvn('<li>',{class:'d-item-header','d-role':'d-header'});
                    li.append(dh[0]);
                    ul.append(li[0]);
               }
               dvn.each(d.data,function(i,v){
                    widget.addItem(ul,v,d.tField,d.tValue,d.template,p);
               });
               if(d.hasOwnProperty('actions')){
                    dvn.each(d.actions,function(i,v){
                         dvn.each(p.items,function(x,y){
                              if(typeof v.field!="number"){
                                   if(v.field==dvn(y).attr('d-value')){
                                        dvn(y)[0].onclick = v.action;
                                   }
                              }else{
                                   if(x==v.field){
                                        dvn(y)[0].onclick=v.action;
                                   }
                              }
                         });
                         if(v.field=='header'){
                              var lh = dvn(p.list[0]).find('li')[0];
                              dvn(lh)[0].onclick=v.action;
                         }
                    });
               }
               p.addItem=widget.addItem;
               p.removeItem=widget.removeItem;
          },
          addItem: function(c,elem,tField,tValue,template,p){
               var l = dvn('<li>',{'d-role':'d-item'});
               if(template!=undefined){
                    l.append(dvn.template(template,elem));
               }else{
                    l.text((typeof elem!='string')?(tField!=undefined)?elem[tField]:elem:elem);
               }
               l.attr('d-value',
                      (typeof elem!='string')?
                        (tValue!=undefined)?elem[tValue]:
                        'item_'+p.items.length:
                      'item_'+p.items.length);
               c.append(l);
               p.items.push(l);
               if(elem.hasOwnProperty('action')){
                    dvn(l)[0].onclick=elem.action;
               }
               if(elem.hasOwnProperty('items')){
                    var em = dvn('<em>',{class:'icon-download8 d-sbm'});
                    l.append(em);
                    var ul=dvn('<ul>',{class:'subMenu'});
                    p.list.push(ul);
                    dvn.each(elem.items,function(i,v){
                         widget.addItem(ul,v,tField,tValue,template,p);
                    });
                    l.append(ul);
               }
          },
          removeItem:function(item){
               var m = dvn(this.elem).data('divMenu');
               dvn.each(m.items,function(i,v){
                    if(v.attr('d-value')==item){
                         v.remove();
                    }
               });
          }
     };
     diving.widget(widget);
})();



    /*window*/
    (function(){
         var widget = {
            name: "Window",
            init: function(prm) {
                prm=diving.extend(prm,{
                    class:"d-window-content"+(prm.hasOwnProperty('class')?' '+prm.class:'')
                });
                var widtgetData = {
                    elem:diving(this)[0],
                    class:prm.class,
                    actions:prm.actions,
                    modal:prm.modal||false,
                    close:widget.close,
                    open:widget.open,
                    destroy:widget.destroy,
                    center:widget.center
                };
                widget.createElement(prm,widtgetData);
                diving(this).data('div'+widget.name, widtgetData);
            },
            createElement: function(p,data) {
                diving(data.elem).empty();
                var contentVentana = diving('<div>',{class:p.class});
                (p.hasOwnProperty('width'))?contentVentana.attr('style','width:'+diving.addPx(p.width)+';'):'';
                (p.hasOwnProperty('height'))?contentVentana.attr('style',contentVentana.attr('style')+'height:'+diving.addPx(p.height)+';'):'';
                diving(data.elem).append(contentVentana);
                var ttlWnt = diving('<div>',{class:'d-window-title'}).append(
                            (p.title)?
                                (typeof p.title=='string')?
                                    diving('<div>',{text:p.title}):
                                    p.title
                                :diving('<div>',{text:'&nbsp;'})
                            );
                contentVentana.append(ttlWnt);
                if(p.actions){
                    this.createActions(ttlWnt, p.actions, this, p, data, contentVentana, ttlWnt );
                }
                if(p.hasOwnProperty('modal')?p.modal:false){
                    diving(data.elem).prepend(
                        diving('<div>',{
                            style:'width:'+window.innerWidth+'px;height:'+window.innerHeight+"px;background-color: #0c0c0c94;position: absolute;top: 0;right: 0;"
                        })
                    );
                }
                if(p.content){
                    this.createContent(contentVentana,this,p,data);
                }else{
                    p.content='&nbsp;';
                    this.createContent(contentVentana,this,p,data);
                }
                diving.draggable(ttlWnt[0],contentVentana[0]);
            },
            center:function(){
                var stl = diving(this.elem.querySelector('.d-window-content')).attr('style');
                var cnt = diving(this.elem.querySelector('.d-window-content'));
                stl = (stl.match(/left:\s?[0-9a-z]+\;/g)==null)?stl+'left:'+diving.addPx((window.innerWidth/2)-(cnt[0].offsetWidth/2))+";":stl.replace(/left:\s?[0-9a-z]+\;/g,'left:'+diving.addPx((window.innerWidth/2)-(cnt[0].offsetWidth/2))+";");
                stl = (stl.match(/top:\s?[0-9a-z]+\;/g)==null)?stl+'top:'+diving.addPx((window.innerHeight/2)-(cnt[0].offsetHeight/2))+";":stl.replace(/top:\s?[0-9a-z]+\;/g,'top:'+diving.addPx((window.innerHeight/2)-(cnt[0].offsetHeight/2))+";");
                diving(this.elem.querySelector('.d-window-content')).attr('style',stl);
            },
            destroy:function(){
                diving(this.elem).removeData('divWindow');
                diving(this.elem).empty();
            },
            close:function(){
                diving(this.elem).addClass('d-hidden');
            },
            open:function(){
                diving(this.elem).removeClass('d-hidden');
            },
            createActions:function(content,actions,wdt,p,data,cntVtn,ttl){
                var acts = [
                    {action:'close',class:'icon-error'},
                    {action:'maximize',class:'icon-add'},
                    {action:'minimize',class:'icon-minus3'}
                    ];
                for(var i=0;i<acts.length;i++){
                    for( var j=0;j<actions.length;j++){
                        if(acts[i].action==actions[j]){
                            var lbl=diving('<label>',{
                                class:'d-window-action',
                                'd-role':acts[i].action,
                                click:function(){
                                    var title = cntVtn[0].querySelector('.d-window-title');
                                    var body  = cntVtn[0].querySelector('.d-window-body');
                                    switch(diving(this).attr('d-role')){
                                        case 'minimize':
                                            var height = title.offsetHeight;
                                            if(cntVtn.attr('d-control')==null){
                                                cntVtn.attr('d-control',cntVtn.attr('style') );
                                                diving(body).addClass('d-hidden');
                                                var stl = cntVtn.attr('style');
                                                stl = stl.replace(/(height:\s[0-9a-z]+\;)/g,'height:'+diving.addPx(height)+';');
                                                cntVtn.attr('style',stl);
                                            }else{
                                                var ctr = cntVtn.attr('d-control');
                                                diving(body).removeClass('d-hidden');
                                                ctr = ctr.replace(/left:\s[0-9a-z]+\;/g,'left:'+diving.addPx(cntVtn[0].offsetLeft)+';');
                                                ctr = ctr.replace(/top:\s[0-9a-z]+\;/g,'top:'+diving.addPx(cntVtn[0].offsetTop)+';');
                                                cntVtn.attr('style',ctr);
                                                cntVtn.removeAttr('d-control');
                                            }
                                        break;
                                        case 'maximize':
                                            if(cntVtn.attr('d-control')==null){
                                                cntVtn.attr('d-control',cntVtn.attr('style') );
                                                diving(body).attr('d-ctr',diving(body).attr('style') );
                                                var ctr = diving(body).attr('style');
                                                ctr = ctr.replace(/width:\s?[0-9a-z]+\;/g,'width:'+diving.addPx(window.innerWidth-17)+';');
                                                ctr = ctr.replace(/height:\s?[0-9a-z]+\;/g,'height:'+diving.addPx(window.innerHeight-92)+';');
                                                diving(body).attr('style',ctr);
                                                cntVtn.attr('style','top:0;right:0;width:'+diving.addPx(window.innerWidth-2)+';height:'+diving.addPx(window.innerHeight-2)+';');
                                            }else{
                                                var cntCtr = cntVtn.attr('d-control');
                                                var bdCtr = diving(body).attr('d-ctr');
                                                diving(body).attr('style',bdCtr);
                                                diving(body).removeAttr('d-ctr');
                                                cntVtn.attr('style',cntCtr);
                                                cntVtn.removeAttr('d-control');
                                            }
                                        break;
                                        case 'close':
                                            data.close();
                                        break;
                                    }
                                }
                            }).append(diving('<em>',{class:acts[i].class}));
                            content.append(lbl);
                        }
                    }
                }
            },
            createContent:function(content,wdt,p,data){
                var cnt = diving('<div>',{class:'d-window-body'}).append(
                    (typeof p.content=='string')?
                        diving('<div>',{text:p.content}):
                        p.content
                    );
                (p.hasOwnProperty('width'))?cnt.attr('style','width:'+(diving.addPx(p.width-17))+';'):'';
                (p.hasOwnProperty('height'))?cnt.attr('style',cnt.attr('style')+'height:'+(diving.addPx(p.height-92))+';'):'';
                (p.hasOwnProperty('scrollable'))?
                    (typeof p.scrollable == 'object')?
                        cnt.attr('style',cnt.attr('style')+'overflow-y:'+(
                            p.scrollable.hasOwnProperty('y')?p.scrollable.y:'scroll'
                            )+';overflow-x:'+(
                            p.scrollable.hasOwnProperty('x')?p.scrollable.x:'scroll'
                            )):
                        cnt.attr('style',cnt.attr('style')+'overflow:scroll;')
                        :cnt.attr('style',cnt.attr('style')+'overflow:hidden;');
                content.append(cnt);
            }
        };
        diving.widget(widget);
    })();
    /*listView*/
    (function(){
         var widget = {
            name: "ListView",
            init: function(prm) {
                prm=diving.extend(prm,{
                    class:"d-listview-content"+(prm.hasOwnProperty('class')?' '+prm.class:'')
                });
                var widtgetData = {
                    elem:diving(this)[0],
                    class:prm.class,
                    click:prm.click||null,
                    selected:[]
                };
                widget.createElement(prm,widtgetData);
                diving(this).data('div'+widget.name, widtgetData);
                //widget.prepareElement(widtgetData);
            },
            createElement: function(p,data) {
                diving(data.elem).empty();
                diving(data.elem).addClass(p.class);
                var wdt=this;
                var ul = diving('<ul>',{class:'d-listview'});
                diving.extend(data,{
                    add:wdt.addElement,
                    data:p.data||[],
                    domList:ul,
                    template:p.template||null
                });
                diving(data.elem).append(ul);
                diving.each(data.data,function(i,v){
                    data.add(v,data);
                });
            },
            addElement: function(obj,component){
                var dlv = (diving(this.elem).data('divListView')!=undefined)?diving(this.elem).data('divListView'):component;
                if(dlv==undefined){
                    return;
                }
                var li = diving('<li>',{
                    'd-value': obj.field,
                    class:'d-listView-item',
                    click:function(){
                        dlv.selected = [{value:diving(this).attr('d-value'),text:diving(this).text()}];
                        if(dlv.click){
                            dlv.click.constructor = this.click;
                            dlv.click(this);
                        }
                    }
                });
                li.append(dlv.hasOwnProperty('template')?
                    diving.template(dlv.template,obj):
                    obj.text);
                dlv.domList.append(li);
            }
        };
        diving.widget(widget);
    })();
    





    (function(){
     var widget={
          name:"Chart",
          init:function(prm){
               prm=diving.extend(prm,{
                    class:'d-chart'+(prm.hasOwnProperty('class')?' '+prm.class:''),
                    viewAxies:(prm.hasOwnProperty('viewAxies')?prm.viewAxies:true)
               });
               var widgetData={
                    elem: diving(this)[0],
                    class:prm.class
               };
               widget.createElement(prm,widgetData);
               diving(this).data('div'+widget.name,widgetData);
          },
          createElement:function(p,dta){
               diving(dta.elem).empty();
               var wdt = this;
               var xmlns="http://www.w3.org/2000/svg";
               (dta.elem.offsetHeight==0)?
                    (p.height!=null)?diving(dta.elem).attr('style','height:'+diving.addPx(p.height))
                        :diving(dta.elem).attr('style','height:500px')
                    :null;
               diving.extend(dta,{
                    width: (dta.elem.offsetWidth),
                    height:(dta.elem.offsetHeight)
               });
               var svgElem=document.createElementNS(xmlns,"svg");
               wdt.setAttributes(svgElem,[{viewBox:'0 0 '+dta.width+' '+dta.height,width:dta.width,height:dta.height}]);
               wdt.createMapa(xmlns,svgElem,p,dta,wdt);
               diving(dta.elem).append(svgElem);
               if(p.title!=undefined){
                    var title=document.createElementNS(xmlns,'text');
                    wdt.setAttributes(title,[{
                         x:((dta.width/3)-(p.title.length*2)),
                         y:50,
                         fill:'black'
                    }]);
                    title.textContent=p.title;
                    svgElem.appendChild(title);
               }
               var colores=['#5499C7','#48C9B0','#E74C3C','#F8C471'];
               var types=['area','bar','point','line'];
               var ct = 0;
               diving.each(p.dataSet,function(i,v){
                    if(ct>types.length-1)ct=0;
                    if(v.color==undefined){v['color']=colores[ct];}
                    if(v.type==undefined){v.type=types[ct];}
                    wdt.createBarr(xmlns,svgElem,v,dta,wdt,(i==0)?p.category:undefined);
                    wdt.createLeyends(xmlns,svgElem,v,dta,wdt,i+1);
                    ct++;
               });
               diving.extend(dta,{dataSet:p.dataSet,viewAxies:p.viewAxies});
          },
          createLeyends(xmlns,element,serie,dta,wdt,it){
               var rc =  document.createElementNS(xmlns,'rect');
               wdt.setAttributes(rc,[{x:dta.areaChart.wtCht+30,y:80+(it*20),'height':15,'width':15,'fill':serie.color}]);
               var txt = document.createElementNS(xmlns,'text');
               this.setAttributes(txt,[{x:dta.areaChart.wtCht+50,y:90+(it*20),fill:'balck'}]);
               txt.textContent=serie.name;
               element.appendChild(txt);
               element.appendChild(rc);
          },
          setAttributes(element,attributes){
               for(var x=0;x<attributes.length;x++){
                    diving.each(Object.keys(attributes[x]),function(i,v){
                         element.setAttributeNS(null,v,attributes[x][v]);
                    });
               }
          },
          createBarr(xmlns,element,p,dta,wdt,category){
               var posInit=90,
                   barWt=((dta.areaChart.wtCht-100)/dta.minMax.total),
                   x1=posInit,y1=dta.areaChart.htCht;
                   var points = '90,'+dta.areaChart.htCht;
                   dta.minMax['barWidth']=barWt;
               for(var s=0;s<p.serie.length;s++){
                    var prc=((p.serie[s]*100)/dta.minMax.max);
                    var h=((dta.areaChart.htCht-100)/100)*prc;
                    h = dta.areaChart.htCht-h;
                    if(p.type=='bar'){
                         var elmn=document.createElementNS(xmlns,'rect');
                         wdt.setAttributes(elmn,[{x:posInit+(barWt*s),y:h,'height':(dta.areaChart.htCht-h),'width':barWt-5,'fill':p.color,'stroke-width':0}]);
                    }
                    if(p.type=='point'){
                         var elmn=document.createElementNS(xmlns,'circle');
                         wdt.setAttributes(elmn,[{cx:(posInit+(barWt*s))+((barWt/2)-2.5),cy:h,r:5,fill:p.color}]);
                    }
                    if(p.type=='line'){
                         var elmn=document.createElementNS(xmlns,'line');
                         wdt.setAttributes(elmn,[{x1:x1,y1:y1,x2:(posInit+(barWt*s))+((barWt/2)-2.5),y2:h,'stroke-width':'2',stroke:p.color}]);
                         x1=(posInit+(barWt*s))+((barWt/2)-2.5);y1=h;
                    }
                    if(p.type=='area'){
                         points=points+' '+((posInit+(barWt*s))+((barWt/2)-2.5))+','+h;
                         if(s==p.serie.length-1){
                              points=points+' '+((posInit+(barWt*s))+((barWt/2)-2.5))+','+dta.areaChart.htCht;
                         }
                    }
                    if(p.type!='area'){
                         element.appendChild(elmn);
                    }
               }
               if(p.type=='area'){
                    var elmn=document.createElementNS(xmlns,'polygon');
                    wdt.setAttributes(elmn,[{points:points,style:'fill:'+p.color}]);
                         element.appendChild(elmn);
               }
               if(category!=undefined){
                    for(var s=0;s<category.length;s++){
                         var txt=document.createElementNS(xmlns,'text');
                         wdt.setAttributes(txt,[{x:posInit+(barWt*s),y:(dta.areaChart.htCht+10),fill:'#000000',transform:'rotate(55 '+(posInit+(barWt*s))+' '+(dta.areaChart.htCht+20)+')'}]);
                         txt.textContent=category[s];
                         element.appendChild(txt);
                    }
               }
          },
          createMapa(xmlns,element,p,dta,wdt){
               var minMax=this.getMinMax(p);
               var wtChart=(dta.width-((dta.width/30)*5))-90;
               var htChart=(dta.height-((dta.height/30)*4)-70);
               var margen = document.createElementNS(xmlns,'rect');
               diving.extend(dta,{minMax:minMax,areaChart:{wtCht:wtChart+90,htCht:htChart+70,top:70,left:90}});
               wdt.setAttributes(margen,[{'x':90,'y':70,'height':htChart,'width':wtChart,'fill':'#f9f9f9'}]);
               element.appendChild(margen);
               var xh =0;
               var incr = Math.floor((htChart+70)/((dta.minMax.total<=10)?dta.minMax.total*2:dta.minMax.total));
               for(var y=(htChart+70);y>70;y--){
                    if(xh%incr==0){
                         var ln = document.createElementNS(xmlns,'line');
                         wdt.setAttributes(ln,[{x1:'90',y1:y,x2:(wtChart+90),y2:y,'stroke-width':'0.5',stroke:'#000',opacity:'0.2'}]);
                         element.appendChild(ln);
                         if(p.viewAxies){
                              var txt=document.createElementNS(xmlns,'text');
                              wdt.setAttributes(txt,[{x:70,y:y,fill:'#000000','font-size':'0.7em'}]);
                              txt.textContent=Math.round(((((xh*minMax.max)/100)*100)/(htChart-26)));
                              element.appendChild(txt);
                         }
                    }
                    xh++;
               }
          },
          getMinMax(p){
               var min,max,arrMin=[],arrMax=[];
               var error = null;
               Array.prototype.max=function(){return Math.max.apply(null, this);};
               Array.prototype.min = function(){return Math.min.apply(null, this);};
               var totalPoints = 0;
               diving.each(p.dataSet,function(i,v){
                    for(var x=0;x<v.serie.length;x++){if(typeof v.serie[x] != 'number'){error="A value of the series is not a number";break;}}
                    if(error!=null){console.log(error);return false;}
                    arrMin.push((min=v.serie.min()));
                    arrMax.push((max=v.serie.max()));
                    totalPoints=(totalPoints==0)?v.serie.length:(totalPoints<v.serie.length)?v.serie.length:totalPoints;
               });
               if(error!=null){
                    return {min:0,max:0};
               }
               if(arrMin.length>1){
                    min=arrMin.min();
                    max=arrMax.max();
               }
               return {min:min,max:max,total:totalPoints};
          }
     };
     diving.widget(widget);
})();



/*

(function(){
         var widget = {
            name: "Menu",
            init: function(prm) {
                prm=diving.extend(prm,{
                    class:"d-menu-content"+(prm.hasOwnProperty('class')?' '+prm.class:''),
                    vertical:(prm.hasOwnProperty('vertical'))?prm.vertical:false
                });
                var widtgetData = {
                    elem:diving(this)[0],
                    dta: prm.data,
                    class:prm.class,
                    vertical: prm.vertical,
                    actions:prm.actions
                };
                widget.createElement(prm,widtgetData);
                diving(this).data('div'+widget.name, widtgetData);
            },
            createElement: function(p,data) {
                diving(data.elem).empty();
                diving(data.elem).addClass(p.class);
                var ul = diving('<ul>',{class: 'd-menu'+((p.hasOwnProperty('vertical'))?(p.vertical)?' d-menu-vertical':'':'')});
                var wgt = this;
                diving.extend(data,{
                    elementos:[],
                    refresh:wgt.refresh,
                    setData:wgt.setData
                });

                diving.each(data.dta, function(i,v){
                    wgt.addItem(ul, v, p, data, wgt);
                });
                diving(data.elem).append(ul);
            },
            addItem: function(content, element, parameters, data, wgt ){
                var textito = diving('<div>',{text: element.text});
                var li = diving('<li>',{
                    'href': element.href,
                    class: 'd-menu-item'+(element.hasOwnProperty('class')?' '+element.class:''),
                    click:function(){
                        if(element.hasOwnProperty('openTo')){
                            var op = (typeof element.openTo=='string')?diving(element.openTo):element.openTo;
                            op.empty();
                            loadHref(op, element.href);
                        }else{
                            window.location.href=element.href;
                        }
                    }
                }).append(textito);
                data.elementos.push(li);
                if(parameters.hasOwnProperty('actions')){
                    for( var i=0; i < parameters.actions.length; i++){
                        if(parameters.actions[i].field==element.field){
                            li[0].onclick = function(){
                                parameters.actions[i].action.constructor=li[0].onclick;
                                parameters.actions[i].action();
                            }
                            break;
                        }
                    }
                }
                if( element.hasOwnProperty( 'items' ) ){
                    var ul = diving('<ul>', { class: 'd-submenu' });
                    for(var i=0;i<element.items.length;i++){wgt.addItem(ul,element.items[i],parameters,data,wgt);}
                    li.append( ul );
                }
                content.append(li);
            },
            refresh:function(){
                var dta = {
                    elem : this.elem,
                    dta: this.dta
                };
                var p = {
                    class: this.class,
                    vertical: this.vertical,
                    actions: this.actions
                };
                widget.createElement(p,dta);
            },
            setData:function(data){
                this.dta = [];
                this.dta = data;
                this.refresh();
            }
        };
        diving.widget(widget);
    })();


    */      