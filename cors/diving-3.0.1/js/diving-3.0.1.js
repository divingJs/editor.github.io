    (function () {
        var diving = function (a, c) {
            if (a && typeof a == "function" && diving.fn.ready)
                return diving(document).ready(a);
            a = a || diving.context || document;
            if (a.diving)
                return diving(diving.merge(a, []));
            if (c && c.diving)
                return diving(c).find(a);
            if (window == this)
                return new diving(a, c);
            if (a.constructor == String) {
                var m = /^[^<]*(<.+>)[^>]*$/.exec(a);
                if (m)
                    a = diving.clean([m[1]]);
            }
            this.get(a.constructor == Array || a.length && !a.nodeType && a[0] != undefined && a[0].nodeType ?
                    diving.merge(a, []) : diving.find(a, c));
            if (c) {
                var ks = Object.keys(c);
                for (var k = 0; k < ks.length; k++) {
                    diving(a[0]).attr(ks[ k ], c[ ks[ k ] ]);
                }
            }
            var fn = arguments[arguments.length - 1];
            if (fn && typeof fn == "function")
                this.each(fn);
            return this;
        }
        var dvn = window.dvn = diving;

        var rdashAlpha = /-([a-z])/ig,
            fcamelCase = function( all, letter ) {
                return letter.toUpperCase();
            };
        /*this*/
        diving.fn = diving.prototype = {
            size: function () {
                return this.length
            },
            trigger: function( type, data ) {
                return this.each(function() {
                    diving.event.trigger( type, data, this );
                });
            },
            triggerHandler: function( type, data ) {
                if ( this[0] ) {
                    return diving.event.trigger( type, data, this[0], true );
                }
            },
            expando: "diving" + ('3.0.1' + Math.random()).replace(/\D/g, ""),
            each: function (fn, args) {
                return diving.each(this, fn, args);
            },
            get: function (num) {
                if (num && num.constructor == Array) {
                    this.length = 0;
                    [].push.apply(this, num);
                    return this;
                } else
                    return num == undefined ?
                            diving.merge(this, []) :
                            this[num];
            },
            attr: function (key, value, type) {
                key = (key == 'text') ? 'innerHTML' : key;
                if (key == 'append') {
                    diving(this[ 0 ]).append(value);
                } else if (typeof value == 'function') {
                    var o = {};
                    o[key] = value;
                    this[0][((key.toLowerCase()).startsWith('on')) ? key : 'on' + key] = o[key];
                } else {
                    return key.constructor != String || value != undefined ?
                            this.each(function () {
                                if (value == undefined)
                                    for (var prop in key)
                                        diving.attr(
                                                type ? this.style : this,
                                                prop, key[prop]
                                                );
                                else
                                    diving.attr(
                                            type ? this.style : this,
                                            key, value
                                            );
                            }) :
                            diving[ type || "attr" ](this[0], key);
                }
            },
            domManip: function (args, table, dir, fn) {
                var clone = this.size() > 1;
                var a = diving.clean(args);
                return this.each(function () {
                    var obj = this;
                    /*if (table && this.nodeName.toUpperCase() == "TABLE" && a[0].nodeName.toUpperCase() != "THEAD") {
                        var tbody = this.getElementsByTagName("tbody");
                        if (!tbody.length) {
                            obj = document.createElement("tbody");
                            this.appendChild(obj);
                        } else {
                            obj = tbody[0];
                        }
                    }*/
                    for (var i = (dir < 0 ? a.length - 1 : 0);
                            i != (dir < 0 ? dir : a.length); i += dir) {
                        fn.apply(obj, [clone ? a[i].cloneNode(true) : a[i]]);
                    }
                });
            },
            prepend: function () {
                return this.domManip(arguments, true, -1, function (a) {
                    this.insertBefore(a, this.firstChild);
                });
            },
            append: function () {
                return this.domManip(arguments, true, -1, function (a) {
                    this.appendChild(a);
                });
            },
            text: function (value) {
                return value === undefined ?
                        diving.text(this) :
                        this.empty().each(function () {
                    if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                        this.textContent = value;
                    }
                });
            },
            empty: function () {
                var elem, i = 0;
                for (; (elem = this[i]) != null; i++) {
                    if (elem.nodeType == 1) {
                        elem.textContext = "";
                        elem.innerHTML = "";
                    }
                }
                return this;
            },
            removeAttr:function(key){
                this[0].removeAttribute(key);
            },
            show: function(){
                this.style.display=this.oldblock?this.oldblock:'';
                if( diving.css(this,'display')=='none')
                    this.style.display='block';
            },
            hide:function(){
                this.oldblock=this.oldblck||diving.css(this,'display');
                if(this.oldblock=='none')
                    this.oldblock='block';
                this.style.display='none';
            },
            toggle:function(){
                diving(this)[diving(this).is(':hidden')?'show':'hide'].apply(diving(this),arguments);
            },
            addClass:function(c){
                diving.className.add((this.hasOwnProperty('classList'))?this:this[0],c);
            },
            removeClass:function(c){
                diving.className.remove((this.hasOwnProperty('classList'))?this:this[0],c);
            },
            toggleClass:function(c){
                var elm=(this.hasOwnProperty('classList'))?this:this[0];
                diving.className[diving.className.has(elm,c)?'remove':'add'](elm,c);
            },
            remove:function(a){
                if(!a||diving.filter([this],a).r)
                    if(this.nodeType!=undefined){
                        this.parentNode.removeChild(this);
                    }else{
                        this[0].parentNode.removeChild(this[0]);
                    }
            },
            find:function(t){
                return this.pushStack(diving.map(this,function(a){
                    return diving.find(t,a);
                }),arguments);
            },
            pushStack:function(a,args){
                var fn=args&&args[args.length-1];
                if(!fn||fn.constructor!=Function){
                    if(!this.stack)
                        this.stack=[];
                    this.stack.push(this.get());
                    this.get(a);
                }else{
                    var old=this.get();
                    this.get(a);
                    if(fn.consructor==Function)
                        return this.each(fn);
                    this.get(old);
                }
                return this;
            }
        };
        diving.extend = diving.fn.extend = function (obj, prop) {
            if (arguments.length > 1 && (prop === null || prop == undefined))
                return obj;
            if (!prop) {
                prop = obj;
                obj = this;
            }
            for (var i in prop)
                obj[i] = prop[i];
            return obj;
        };

        new function () {
            var b = navigator.userAgent.toLowerCase();
            diving.browser = {
                safari: /webkit/.test(b),
                opera: /opera/.test(b),
                msie: /msie/.test(b) && !/opera/.test(b),
                mozilla: /mozilla/.test(b) && !/compatible/.test(b)
            };
            diving.boxModel = !diving.browser.msie || document.compatMode == "CSS1Compat";
        };

        /*diving.fn*/
        diving.extend({
            each: function (obj, fn, args) {
                if (obj.length == undefined)
                    for (var i in obj)
                        fn.apply(obj[i], args || [i, obj[i]]);
                else
                    for (var i = 0; i < obj.length; i++)
                        if (fn.apply(obj[i], args || [i, obj[i]]) === false)
                            break;
                return obj;
            },
            camelCase:function(string){
                return string.replace(rdashAlpha,fcamelCase);
            },
            attr: function (elem, name, value) {
                var fix = {
                    "for": "htmlFor",
                    "class": "className",
                    "float": diving.browser.msie ? "styleFloat" : "cssFloat",
                    cssFloat: diving.browser.msie ? "styleFloat" : "cssFloat",
                    innerHTML: "innerHTML",
                    className: "className",
                    value: "value",
                    disabled: "disabled",
                    checked: "checked",
                    readonly: "readOnly"
                };
                if (name == "opacity" && diving.browser.msie && value != undefined) {
                    elem['zoom'] = 1;
                    if (value == 1)
                        return elem["filter"] = elem["filter"].replace(/alpha\([^\)]*\)/gi, "");
                    else
                        return elem["filter"] = elem["filter"].replace(/alpha\([^\)]*\)/gi, "") + "alpha(opacity=" + value * 100 + ")";
                } else if (name == "opacity" && diving.browser.msie) {
                    return elem["filter"] ? parseFloat(elem["filter"].match(/alpha\(opacity=(.*)\)/)[1]) / 100 : 1;
                }
                if (name == "opacity" && diving.browser.mozilla && value == 1)
                    value = 0.9999;
                if (fix[name]) {
                    if (value != undefined)
                        elem[fix[name]] = value;
                    return elem[fix[name]];
                } else if (value == undefined && diving.browser.msie && elem.nodeName && elem.nodeName.toUpperCase() == 'FORM' && (name == 'action' || name == 'method')) {
                    return elem.getAttributeNode(name).nodeValue;
                } else if (elem.getAttribute != undefined && elem.tagName) {
                    if (value != undefined)
                        elem.setAttribute(name, value);
                    return elem.getAttribute(name);
                } else {
                    name = name.replace(/-([a-z])/ig, function (z, b) {
                        return b.toUpperCase();
                    });
                    if (value != undefined)
                        elem[name] = value;
                    return elem[name];
                }
            },
            addPx:function(n){
                if(typeof n == 'number'){
                    return n+'px';
                }else if(typeof n == 'string' ){
                    return (n.match(/[a-z]+/gm)!=null)?n:n+"px";
                }
            },
            text:function(elm){
                return elm[0].innerText;
            },
            expr: {
                "": "m[2]== '*'||a.nodeName.toUpperCase()==m[2].toUpperCase()",
                "#": "a.getAttribute('id')&&a.getAttribute('id')==m[2]",
                ":": {
                    lt: "i<m[3]-0",
                    gt: "i>m[3]-0",
                    nth: "m[3]-0==i",
                    eq: "m[3]-0==i",
                    first: "i==0",
                    last: "i==r.length-1",
                    even: "i%2==0",
                    odd: "i%2",
                    "nth-child": "diving.sibling(a,m[3]).cur",
                    "first-child": "diving.sibling(a,0).cur",
                    "last-child": "diving.sibling(a,0).last",
                    "only-child": "diving.sibling(a).length==1",
                    parent: "a.childNodes.length",
                    empty: "!a.childNodes.length",
                    contains: "diving.fn.text.apply([a]).indexOf(m[3])>=0",
                    visible: "a.type!='hidden'&&diving.css(a,'display')!='none'&&diving.css(a,'visibility')!='hidden'",
                    hidden: "a.type=='hidden'||diving.css(a,'display')=='none'||diving.css(a,'visibility')=='hidden'",
                    enabled: "!a.disabled",
                    disabled: "a.disabled",
                    checked: "a.checked",
                    selected: "a.selected || diving.attr(a, 'selected')",
                    text: "a.type=='text'",
                    radio: "a.type=='radio'",
                    checkbox: "a.type=='checkbox'",
                    file: "a.type=='file'",
                    password: "a.type=='password'",
                    submit: "a.type=='submit'",
                    image: "a.type=='image'",
                    reset: "a.type=='reset'",
                    button: "a.type=='button'",
                    input: "a.nodeName.toLowerCase().match(/input|select|textarea|button/)"
                },
                ".": "diving.className.has(a,m[2])",
                "@": {
                    "=": "z==m[4]",
                    "!=": "z!=m[4]",
                    "^=": "z && !z.indexOf(m[4])",
                    "$=": "z && z.substr(z.length - m[4].length,m[4].length)==m[4]",
                    "*=": "z && z.indexOf(m[4])>=0",
                    "": "z"
                },
                "[": "diving.find(m[2],a).length"
            },
            token: [
                "\\.\\.|/\\.\\.",
                "a.parentNode",
                ">|/",
                "diving.sibling(a.firstChild)",
                "\\+",
                "diving.sibling(a).next",
                "~",
                function (a) {
                    var r = [];
                    var s = diving.sibling(a);
                    if (s.n > 0)
                        for (var i = s.n; i < s.length; i++)
                            r.push(s[i]);
                    return r;
                }
            ],
            find: function (t, context) {
                if (context && context.nodeType == undefined)
                    context = null;
                context = context || diving.context || document;
                if (t.constructor != String)
                    return [t];
                if (!t.indexOf("//")) {
                    context = context.documentElement;
                    t = t.substr(2, t.length);
                } else if (!t.indexOf("/")) {
                    context = context.documentElement;
                    t = t.substr(1, t.length);
                    if (t.indexOf("/") >= 1)
                        t = t.substr(t.indexOf("/"), t.length);
                }
                var ret = [context];
                var done = [];
                var last = null;
                while (t.length > 0 && last != t) {
                    var r = [];
                    last = t;
                    t = diving.trim(t).replace(/^\/\//i, "");
                    var foundToken = false;
                    for (var i = 0; i < diving.token.length; i += 2) {
                        if (foundToken)
                            continue;
                        var re = new RegExp("^(" + diving.token[i] + ")");
                        var m = re.exec(t);
                        if (m) {
                            r = ret = diving.map(ret, diving.token[i + 1]);
                            t = diving.trim(t.replace(re, ""));
                            foundToken = true;
                        }
                    }
                    if (!foundToken) {
                        if (!t.indexOf(",") || !t.indexOf("|")) {
                            if (ret[0] == context)
                                ret.shift();
                            done = diving.merge(done, ret);
                            r = ret = [context];
                            t = " " + t.substr(1, t.length);
                        } else {

                            var re2 = /(^[a-z0-9\[\=\_\-\]]+)?(^(([#.[a-z0-9]?)([a-z0-9\\*_-]*)))?/i;
                            var m = re2.exec(t);
                            if (m[ m.length - 2 ] == "#") {
                                var oid = document.getElementById(m[m.length - 1 ]);
                                r = ret = oid ? [oid] : [];
                                t = t.replace(re2, "");
                            } else if (/^([a-z]+\[)/.test(m[1])) {
                                var oid = document.querySelector(m[1]);
                                r = ret = oid ? [oid] : [];
                                t = t.replace(re2, '');
                            } else {
                                if (!m[ m.length - 1 ] || m[ m.length - 2 ] == ".")
                                    m[m.length - 1] = "*";
                                for (var i = 0; i < ret.length; i++)
                                    r = diving.merge(r,
                                            m[m.length - 1] == "*" ?
                                            diving.getAll(ret[i]) :
                                            ret[i].getElementsByTagName(m[m.length - 1 ])
                                            );
                            }
                        }
                    }
                    if (t) {
                        var val = diving.filter(t, r);
                        ret = r = val.r;
                        t = diving.trim(val.t);
                    }
                }

                if (ret && ret[0] == context)
                    ret.shift();
                done = diving.merge(done, ret);

                return done;
            },
            className: {
                add: function (o, c) {
                    if (diving.className.has(o, c))
                        return;
                    o.className += (o.className?' ':'')+c;
                },
                remove: function (o, c) {
                    if (!c) {
                        o.className = "";
                    } else {
                        var classes = o.className.split(" ");
                        for (var i = 0; i < classes.length; i++) {
                            if (classes[i] == c) {
                                classes.splice(i, 1);
                                break;
                            }
                        }
                        o.className = classes.join(' ');
                    }
                },
                has: function (e, a) {
                    if (e.className != undefined)
                        e = e.className;
                    return new RegExp("(^|\\s)" + a + "(\\s|$)").test(e);
                }
            },
            getAll: function (o, r) {
                r = r || [];
                var s = o.childNodes;
                for (var i = 0; i < s.length; i++)
                    if (s[i].nodeType == 1) {
                        r.push(s[i]);
                        diving.getAll(s[i], r);
                    }
                return r;
            },
            parse: [
                "\\[ *(@)S *([!*$^=]*) *('?\"?)(.*?)\\4 *\\]",
                "(\\[)\s*(.*?)\s*\\]",
                "(:)S\\(\"?'?([^\\)]*?)\"?'?\\)",
                "([:.#]*)S"
            ],
            filter: function (t, r, not) {
                var g = not !== false ? diving.grep : function (a, f) {
                    return diving.grep(a, f, true);
                };
                while (t && /^[a-z[({ < * :.#]/i.test(t)) {
                    var p = diving.parse;
                    for (var i = 0; i < p.length; i++) {
                        var re = new RegExp(
                                "^" + p[i].replace("S", "([a-z*_-][a-z0-9_-]*)"), "i");
                        var m = re.exec(t);
                        if (m) {
                            if (!i)
                                m = ["", m[1], m[3], m[2], m[5]];
                            t = t.replace(re, "");
                            break;
                        }
                    }
                    if (m[1] == ":" && m[2] == "not")
                        r = diving.filter(m[3], r, false).r;
                    else {
                        var f = diving.expr[m[1]];
                        if (f.constructor != String)
                            f = diving.expr[m[1]][m[2]];
                        eval("f = function(a,i){" +
                                (m[1] == "@" ? "z=diving.attr(a,m[3]);" : "") +
                                "return " + f + "}");
                        r = g(r, f);
                    }
                }
                return {r: r, t: t};
            },
            trim: function (t) {
                return t.replace(/^\s+|\s+$/g, "");
            },
            merge: function (first, second) {
                var result = [];
                for (var k = 0; k < first.length; k++)
                    result[k] = first[k];
                for (var i = 0; i < second.length; i++) {
                    var noCollision = true;
                    for (var j = 0; j < first.length; j++)
                        if (second[i] == first[j])
                            noCollision = false;
                    if (noCollision)
                        result.push(second[i]);
                }
                return result;
            },
            grep: function (elems, fn, inv) {
                if (fn.constructor == String)
                    fn = new Function("a", "i", "return " + fn);
                var result = [];
                for (var i = 0; i < elems.length; i ++)
                    if (!inv && fn(elems[i], i) || inv && fn(elems[i], i))
                        result.push(elems[i]);
                return result;
            },
            map: function (elems, fn) {
                if (fn.constructor == String)
                    fn = new Function("a", "return " + fn);
                var result = [];
                for (var i = 0; i < elems.length; i++) {
                    var val = fn(elems[i], i);
                    if (val !== null && val != undefined) {
                        if (val.constructor != Array)
                            val = [val];
                        result = diving.merge(result, val);
                    }
                }
                return result;
            },
            clean: function (a) {
                var r = [];
                for (var i = 0; i < a.length; a++) {
                    var arg = a[i];
                    if (arg.constructor == String) {
                        var s = diving.trim(arg),
                                elemento = document.createElement("div"),
                                wrap = [0, "", ""];
                        if (!s.indexOf("<opt"))
                            wrap = [1, "<select>", "</select>"];
                        else if (!s.indexOf("<thead") || !s.indexOf("<tbody"))
                            wrap = [1, "<table>", "</table>"];
                        else if (!s.indexOf("<tr"))
                            wrap = [2, "<table>", "</table>"];
                        else if (!s.indexOf("<td") || !s.indexOf("<th"))
                            wrap = [3, "<table><tbody><tr>", "</tr></tbody></table>"];
                        elemento.innerHTML = wrap[1] + s + wrap[2];
                        while (wrap[0]--)
                            elemento = elemento.firstChild;
                        for (var j = 0; j < elemento.childNodes.length; j++)
                            r.push(elemento.childNodes[j]);
                    } else if (arg.length != undefined && !arg.nodeType) {
                        for (var n = 0; n < arg.length; n++) {
                            r.push(arg[n]);
                        }
                    } else {
                        r.push(arg.nodeType ? arg : document.createTextNode(arg.toString()));
                    }
                }
                return r;
            },
            ui: {},
            widget: function (w) {
                var obj = {name: 'div' + w.name || null};
                if (!obj.name)
                    return;
                var fun = diving.fn[obj.name] = w || {};
                diving.extend(diving.ui, {[obj.name]: fun});
                diving.fn[obj.name] = w.init;
            },
            draggable:function(title, content) {
                var px = 0, py = 0;
                var dragObj = null;
                var obj = content || title;
                obj.style.position = "absolute";
                title.addEventListener('mousedown', function () {
                    obj.addEventListener('mousedown', onMouseDown);
                    function onMouseDown(a) {
                        px = a.layerX;
                        py = a.layerY;
                        dragObj = obj;
                    }
                    obj.addEventListener('mouseup', function (e) {
                        obj.removeEventListener('mousedown', onMouseDown, false);
                        dragObj = null;
                    });
                    obj.addEventListener('mousemove', function (e) {
                        var x = e.pageX - px;
                        var y = e.pageY - py;
                        if (dragObj == null)
                            return;
                        dragObj.style.left = x + "px";
                        dragObj.style.top = y + "px";
                    });
                });
            },
            template:function(str, obj) {
                if( str.startsWith('/=') ){
                    var nss="",s="",a=str.match(/\/=((\s{1,})?[a-zA-Z0-9_\(\)":#=\?\/\-]+(\s{1,})?)\//g);///((#:)+(\s{1,})?[a-zA-Z\_0-9]+(\s{1,})?\#)/g);
                    for(var i = 0; i < a.length; i++) {
                        var b = a[i].match( /((#:)+(\s{1,})?[a-zA-Z\_0-9]+(\s{1,})?\#)/g );
                        for( var j = 0; j < b.length; j ++ ){
                            var sub = (s.length === 0) ? str.replace(/^\/=/g,'').replace(/\/$/g,'') : s;
                            s = sub.replace("#:"+b[j].match(/[a-zA-Z\_0-9]/g).join('')+'#', obj[(b[j].match(/[a-zA-Z\_0-9]/g).join(''))]);
                        }
                    }
                    return eval(s.toString());
                }else{
                    var nss="",s="",b=str.match(/((#:)+(\s{1,})?[a-zA-Z\_0-9]+(\s{1,})?\#)/g);
                    for( var j = 0; j < b.length; j ++ ){
                        var sub = (s.length === 0) ? str: s;
                        s = sub.replace("#:"+b[j].match(/[a-zA-Z\_0-9]/g).join('')+'#', obj[(b[j].match(/[a-zA-Z\_0-9]/g).join(''))]);
                    }
                    return s;
                }
            }
        });
        window.diving = diving || {};
    })();
    diving.each(("blur "+
                 "focus "+
                 "focusin "+
                 "focusout "+
                 "resize "+
                 "scroll "+
                 "click "+
                 "dblclick "+
                 "mousedown "+
                 "mouseup "+
                 "mousemove "+
                 "mouseover "+
                 "mouseout "+
                 "mouseenter "+
                 "mouseleave "+
                 "change "+
                 "select "+
                 "submit "+
                 "keydown "+
                 "keypress "+
                 "keyup "+
                 "contextmenu").split(' '),function(i,v){
        diving.fn[v]=function(data,fn){
            if(arguments.length>0){
                diving(this)[0]['on'+[v]]=arguments[0];
                diving(this)[0]['on'+[v]];
            }
        }
    });
    diving.extend({
        store:{
            Source: function(p){
                diving.each(p.data,function(i,v){v['d-row-item']=i;});
                this.initParams=p;
                this.data=p.data;
                this.elements=p.data;
                this.setData=function(data){this.data=data;}
                this.schema=p.schema || {};
                this.schema.model=(p.schema)?p.schema.model||{}:{};
                this.schema.model.fields=(p.schema)?(p.schema.model)?p.schema.model.fields||{}:{}:{};
                this.group=diving.store.group;
                if(p.group){
                    this.grupo = p.group;
                }
                this.sort=diving.store.sort;
                (p.sort)?this.sort(p.sort):null;
                (p.group)?this.group(p.group):null;
                this.view=function(){return this.elements;}
                return this;
            },
            group:function(p){
                this.elements=this.data;
                this.elements=diving.group(this.elements,p,0);
            },
            sort:function(orden){
                this.elements = this.data;
                var srt=(!Array.isArray(orden))?[orden]:orden;
                var elements = this.elements;
                diving.each( srt, function( i, v ){
                    var sort = v.field;
                    var dir=(v.dir)?(v.dir=='desc')?-1:v.dir:1;
                    elements.sort( function(a,b){
                        if(eval('a[sort]'+((dir==1)?'>':'<')+'b[sort]')){
                            return 1;
                        }
                        if(eval('a[sort]'+((dir==-1)?'>':'<')+'b[sort]')){
                            return -1;
                        }
                        return 1;
                    });
                });
                this.elements = elements;
            }
        },
        subGp:function(arr, p) {
            return this.group(arr.items, p);
        },
        group:function(a, p) {
            var rtn = [];
            var nar = [];
            var sx = false;
            p=(p.length)?p:[p];
            for (var x = 0; x < p.length; x++) {
                a = (nar.length > 0) ? nar : a;
                for (var y = 0; y < a.length; y++) {
                    if (a[y].items) {
                        a[y].items = diving.subGp(a[y], [p[x]]);
                        sx = true;
                    } else {
                        var itm = {};
                        itm = {
                            field: p[x].field,
                            value: a[y][p[x].field],
                            items: [a[y]]
                        };
                        if (nar.length == 0) {
                            nar.push(itm);
                        } else {
                            var ex = false;
                            var itms = 0;
                            for (var z = 0; z < nar.length; z++) {
                                if ((nar[z].field == itm.field) && (nar[z].value == itm.value)) {
                                    ex = true;
                                    itms = z;
                                    break;
                                }
                            }
                            if (!ex) {
                                nar.push(itm);
                            } else {
                                nar[itms].items.push(itm.items[0]);
                            }
                        }
                    }
                }
                if (!sx) {
                    rtn = nar;
                }
            }
            if (!sx)
                a = rtn;
            return a;
        }
    });

    var rnamespaces = /\.(.*)$/,
        rformElems = /^(?:textarea|input|select)$/i,
        rperiod = /\./g,
        rspaces = / /g,
        rescape = /[^\W\s.|`]/g,
        fcleanup = function(nm) {
            return nm.replace(rscape, '\\$&');
        };
    diving.event = {
        add: function(elem, types, handler, data) {
            if (elem.nodeType === 3 || elem.nodeType === 8) return;
            if (handler === false) {
                handler = returnFalse;
            } else if (!handler) {
                return;
            }
            var handleObjIn, handleObj;
            if (handler.handler) {
                handleObjIn = handler;
                handler = handleObjIn.andler;
            }
            if (!handler.guid) {
                handler.guid = diving.guid++;
            }
            var elemData = diving_data(elem);
            if (!elemData) return;
            var events = elemData.events,
                eventHandler = elemData.handle;
            if (!events) {
                elemData.events = events = {};
            }
            if (!eventHandle) {
                elemData.handle = eventHandle = function(e) {
                    return typeof diving !== 'undefined' && (!e || diving.event.triggered !== e.type) ?
                        diving.event.handle.apply(eventHandle.elem, arguments) :
                        undefined;
                };
            }
            eventHandle.elem = elem;
            types = types.split(" ");
            var type, i = 0;
            namespasces;
            while ((type = types[i++])) {
                handleObj = handleObjeIn ?
                    diving.extend({}, handleObjeIn) : {
                        handler: handler,
                        data: data
                    };
                if (type.indexOf('.') > -1) {
                    namespaces = type.split('.');
                    type = namespaces.shif();
                    handleObj.namespace = namespaces.slice(0).sort().join('.');
                } else {
                    namespaces = [];
                    handleObj.namespaces = "";
                }
                handleObj.type = type;
                if (!handleObj.guid) {
                    handleObj.gui = handle.guid;
                }
                var handlers = events[type],
                    special = diving.events.especial[type] = {};
                if (!handlers) {
                    handlers = events[type] = [];
                    if (!special.setup || special.setup.call(elem, data, namespaces, eventHandler) === false) {
                        if (elem.addEventlistener) {
                            elem.addEventListener(type, eventHandle, false);
                        } else if (elem.attachEvent) {
                            elem.attachEvent('on' + type, eventHandle);
                        }
                    }
                }
                if (special.add) {
                    special.add.acll(elem, handleObj);
                    if (!handleObj.handler.guid) {
                        handleObj.handler.guid = handler.guid;
                    }
                }
                handlers.push(handleObj);
                diving.event.global[type] = true;
            }
            elem = null;
        },
        global: {},
        remove: function(elem, types, handler, pos) {
            if (elem.nodeType === 3 || elem.nodeType === 8) {
                return;
            }

            if (handler === false) {
                handler = returnFalse;
            }

            var ret, type, fn, j, i = 0,
                all, namespaces, namespace, special, eventType, handleObj, origType,
                elemData = diving.hasData(elem) && diving._data(elem),
                events = elemData && elemData.events;

            if (!elemData || !events) {
                return;
            }
            if (types && types.type) {
                handler = types.handler;
                types = types.type;
            }
            if (!types || typeof types === "string" && types.charAt(0) === ".") {
                types = types || "";

                for (type in events) {
                    diving.event.remove(elem, type + types);
                }

                return;
            }
            types = types.split(" ");

            while ((type = types[i++])) {
                origType = type;
                handleObj = null;
                all = type.indexOf(".") < 0;
                namespaces = [];

                if (!all) {
                    namespaces = type.split(".");
                    type = namespaces.shift();

                    namespace = new RegExp("(^|\\.)" +
                        diving.map(namespaces.slice(0).sort(), fcleanup).join("\\.(?:.*\\.)?") + "(\\.|$)");
                }

                eventType = events[type];

                if (!eventType) {
                    continue;
                }

                if (!handler) {
                    for (j = 0; j < eventType.length; j++) {
                        handleObj = eventType[j];

                        if (all || namespace.test(handleObj.namespace)) {
                            diving.event.remove(elem, origType, handleObj.handler, j);
                            eventType.splice(j--, 1);
                        }
                    }

                    continue;
                }

                special = diving.event.special[type] || {};

                for (j = pos || 0; j < eventType.length; j++) {
                    handleObj = eventType[j];

                    if (handler.guid === handleObj.guid) {
                        if (all || namespace.test(handleObj.namespace)) {
                            if (pos == null) {
                                eventType.splice(j--, 1);
                            }

                            if (special.remove) {
                                special.remove.call(elem, handleObj);
                            }
                        }

                        if (pos != null) {
                            break;
                        }
                    }
                }
                if (eventType.length === 0 || pos != null && eventType.length === 1) {
                    if (!special.teardown || special.teardown.call(elem, namespaces) === false) {
                        diving.removeEvent(elem, type, elemData.handle);
                    }

                    ret = null;
                    delete events[type];
                }
            }
            if (diving.isEmptyObject(events)) {
                var handle = elemData.handle;
                if (handle) {
                    handle.elem = null;
                }

                delete elemData.events;
                delete elemData.handle;

                if (diving.isEmptyObject(elemData)) {
                    diving.removeData(elem, undefined, true);
                }
            }
        },

        customEvent: {
            "getData": true,
            "setData": true,
            "changeData": true
        },

        trigger: function(event, data, elem, onlyHandlers) {
            var type = event.type || event,
                namespaces = [],
                exclusive;

            if (type.indexOf("!") >= 0) {
                type = type.slice(0, -1);
                exclusive = true;
            }

            if (type.indexOf(".") >= 0) {
                namespaces = type.split(".");
                type = namespaces.shift();
                namespaces.sort();
            }

            if ((!elem || diving.event.customEvent[type]) && !diving.event.global[type]) {
                return;
            }
            event = typeof event === "object" ?
                event[diving.expando] ? event :
                new diving.Event(type, event) :
                new diving.Event(type);

            event.type = type;
            event.exclusive = exclusive;
            event.namespace = namespaces.join(".");
            event.namespace_re = new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.)?") + "(\\.|$)");

            if (onlyHandlers || !elem) {
                event.preventDefault();
                event.stopPropagation();
            }
            if (!elem) {
                diving.each(diving.cache, function() {
                    var internalKey = diving.expando,
                        internalCache = this[internalKey];
                    if (internalCache && internalCache.events && internalCache.events[type]) {
                        diving.event.trigger(event, data, internalCache.handle.elem);
                    }
                });
                return;
            }
            if (elem.nodeType === 3 || elem.nodeType === 8) {
                return;
            }
            event.result = undefined;
            event.target = elem;
            data = data != null ? diving.makeArray(data) : [];
            data.unshift(event);

            var cur = elem,
                ontype = type.indexOf(":") < 0 ? "on" + type : "";
            do {
                var handle = diving._data(cur, "handle");

                event.currentTarget = cur;
                if (handle) {
                    handle.apply(cur, data);
                }
                if (ontype && diving.acceptData(cur) && cur[ontype] && cur[ontype].apply(cur, data) === false) {
                    event.result = false;
                    event.preventDefault();
                }
                cur = cur.parentNode || cur.ownerDocument || cur === event.target.ownerDocument && window;
            } while (cur && !event.isPropagationStopped());
            if (!event.isDefaultPrevented()) {
                var old,
                    special = diving.event.special[type] || {};

                if ((!special._default || special._default.call(elem.ownerDocument, event) === false) &&
                    !(type === "click" && diving.nodeName(elem, "a")) && diving.acceptData(elem)) {
                    try {
                        if (ontype && elem[type]) {
                            old = elem[ontype];

                            if (old) {
                                elem[ontype] = null;
                            }

                            diving.event.triggered = type;
                            elem[type]();
                        }
                    } catch (ieError) {}

                    if (old) {
                        elem[ontype] = old;
                    }

                    diving.event.triggered = undefined;
                }
            }

            return event.result;
        },

        handle: function(event) {
            event = diving.event.fix(event || window.event);
            var handlers = ((diving._data(this, "events") || {})[event.type] || []).slice(0),
                run_all = !event.exclusive && !event.namespace,
                args = Array.prototype.slice.call(arguments, 0);
            args[0] = event;
            event.currentTarget = this;

            for (var j = 0, l = handlers.length; j < l; j++) {
                var handleObj = handlers[j];
                if (run_all || event.namespace_re.test(handleObj.namespace)) {
                    event.handler = handleObj.handler;
                    event.data = handleObj.data;
                    event.handleObj = handleObj;

                    var ret = handleObj.handler.apply(this, args);

                    if (ret !== undefined) {
                        event.result = ret;
                        if (ret === false) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    }

                    if (event.isImmediatePropagationStopped()) {
                        break;
                    }
                }
            }
            return event.result;
        },

        props:  "altKey attrChange attrName bubbles button cancelable "+
                "charCode clientX clientY ctrlKey currentTarget data detail "+
                "eventPhase fromElement handler keyCode layerX layerY metaKey "+
                "newValue offsetX offsetY pageX pageY prevValue relatedNode "+
                "relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),

        fix: function(event) {
            if (event[diving.expando]) {
                return event;
            }
            var originalEvent = event;
            event = diving.Event(originalEvent);

            for (var i = this.props.length, prop; i;) {
                prop = this.props[--i];
                event[prop] = originalEvent[prop];
            }
            if (!event.target) {
                event.target = event.srcElement || document;
            }
            if (event.target.nodeType === 3) {
                event.target = event.target.parentNode;
            }
            if (!event.relatedTarget && event.fromElement) {
                event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
            }
            if (event.pageX == null && event.clientX != null) {
                var eventDocument = event.target.ownerDocument || document,
                    doc = eventDocument.documentElement,
                    body = eventDocument.body;

                event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
                event.pageY = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
            }
            if (event.which == null && (event.charCode != null || event.keyCode != null)) {
                event.which = event.charCode != null ? event.charCode : event.keyCode;
            }
            if (!event.metaKey && event.ctrlKey) {
                event.metaKey = event.ctrlKey;
            }
            if (!event.which && event.button !== undefined) {
                event.which = (event.button & 1 ? 1 : (event.button & 2 ? 3 : (event.button & 4 ? 2 : 0)));
            }

            return event;
        },
        guid: 1E8,
        proxy: diving.proxy,

        special: {
            ready: {
                setup: diving.bindReady,
                teardown: diving.noop
            },

            live: {
                add: function(handleObj) {
                    diving.event.add(this,
                        liveConvert(handleObj.origType, handleObj.selector),
                        diving.extend({}, handleObj, {
                            handler: liveHandler,
                            guid: handleObj.handler.guid
                        }));
                },

                remove: function(handleObj) {
                    diving.event.remove(this, liveConvert(handleObj.origType, handleObj.selector), handleObj);
                }
            },

            beforeunload: {
                setup: function(data, namespaces, eventHandle) {
                    if (diving.isWindow(this)) {
                        this.onbeforeunload = eventHandle;
                    }
                },

                teardown: function(namespaces, eventHandle) {
                    if (this.onbeforeunload === eventHandle) {
                        this.onbeforeunload = null;
                    }
                }
            }
        }
    };

    var rbrace = /^(?:\{.*\}|\[.*\])$/,
        rmultiDash = /([a-z])([A-Z])/g;

    diving.extend({
        cache: {},
        uuid: 0,
        expando: diving.fn.expando,
        noData: {
            "embed": true,
            "object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
            "applet": true
        },
        hasData: function(elem) {
            elem = elem.nodeType ? diving.cache[elem[diving.expando]] : elem[diving.expando];

            return !!elem && !isEmptyDataObject(elem);
        },
        data: function(elem, name, data, pvt /* Internal Use Only */ ) {
            if (!diving.acceptData(elem)) {
                return;
            }
            var internalKey = diving.expando,
                getByName = typeof name === "string",
                thisCache,
                isNode = elem.nodeType,
                cache = isNode ? diving.cache : elem,
                id = isNode ? elem[diving.expando] : elem[diving.expando] && diving.expando;
            if ((!id || (pvt && id && !cache[id][internalKey])) && getByName && data === undefined) {
                return;
            }
            if (!id) {
                if (isNode) {
                    elem[diving.expando] = id = ++diving.uuid;
                } else {
                    id = diving.expando;
                }
            }
            if (!cache[id]) {
                cache[id] = {};
                if (!isNode) {
                    cache[id].toJSON = diving.noop;
                }
            }
            if (typeof name === "object" || typeof name === "function") {
                if (pvt) {
                    cache[id][internalKey] = diving.extend(cache[id][internalKey], name);
                } else {
                    cache[id] = diving.extend(cache[id], name);
                }
            }
            thisCache = cache[id];
            if (pvt) {
                if (!thisCache[internalKey]) {
                    thisCache[internalKey] = {};
                }

                thisCache = thisCache[internalKey];
            }
            if (data !== undefined) {
                thisCache[diving.camelCase(name)] = data;
            }
            if (name === "events" && !thisCache[name]) {
                return thisCache[internalKey] && thisCache[internalKey].events;
            }
            return getByName ?
                thisCache[diving.camelCase(name)] || thisCache[name] :
                thisCache;
        },
        removeData: function(elem, name, pvt /* Internal Use Only */ ) {
            if (!diving.acceptData(elem)) {
                return;
            }
            var internalKey = diving.expando,
                isNode = elem.nodeType,
                cache = isNode ? diving.cache : elem,
                id = isNode ? elem[diving.expando] : diving.expando;
            if (!cache[id]) {
                return;
            }
            if (name) {
                var thisCache = pvt ? cache[id][internalKey] : cache[id];
                if (thisCache) {
                    delete thisCache[name];
                    if (!isEmptyDataObject(thisCache)) {
                        return;
                    }
                }
            }
            if (pvt) {
                delete cache[id][internalKey];
                if (!isEmptyDataObject(cache[id])) {
                    return;
                }
            }
            var internalCache = cache[id][internalKey];
            if (true || cache != window) {
                delete cache[id];
            } else {
                cache[id] = null;
            }
            if (internalCache) {
                cache[id] = {};
                if (!isNode) {
                    cache[id].toJSON = diving.noop;
                }
                cache[id][internalKey] = internalCache;
            } else if (isNode) {
                if (true) {
                    delete elem[diving.expando];
                } else if (elem.removeAttribute) {
                    elem.removeAttribute(diving.expando);
                } else {
                    elem[diving.expando] = null;
                }
            }
        },
        _data: function(elem, name, data) {
            return diving.data(elem, name, data, true);
        },
        acceptData: function(elem) {
            if (elem.nodeName) {
                var match = diving.noData[elem.nodeName.toLowerCase()];

                if (match) {
                    return !(match === true || elem.getAttribute("classid") !== match);
                }
            }
            return true;
        }
    });
    diving.fn.extend({
        data: function(key, value) {
            var data = null;
            console.log( key, value );
            if (typeof key === "undefined") {
                if (this.length) {
                    data = diving.data(this[0]);
                    if (this[0].nodeType === 1) {
                        var attr = this[0].attributes,
                            name;
                        for (var i = 0, l = attr.length; i < l; i++) {
                            name = attr[i].name;
                            if (name.indexOf("data-") === 0) {
                                name = diving.camelCase(name.substring(5));
                                dataAttr(this[0], name, data[name]);
                            }
                        }
                    }
                }
                return data;
            } else if (typeof key === "object") {
                return this.each(function() {
                    diving.data(this, key);
                });
            }
            var parts = key.split(".");
            parts[1] = parts[1] ? "." + parts[1] : "";

            if (value === undefined) {
                data = this.triggerHandler("getData" + parts[1] + "!", [parts[0]]);
                if (data === undefined && this.length) {
                    data = diving.data(this[0], key);
                    data = dataAttr(this[0], key, data);
                }
                return data === undefined && parts[1] ?
                    this.data(parts[0]) :
                    data;

            } else {
                return this.each(function() {
                    var $this = diving(this),
                        args = [parts[0], value];
                    $this.triggerHandler("setData" + parts[1] + "!", args);
                    diving.data(this, key, value);
                    $this.triggerHandler("changeData" + parts[1] + "!", args);
                });
            }
        },
        removeData: function(key) {
            return this.each(function() {
                diving.removeData(this, key);
            });
        }
    });
    function dataAttr(elem,key,data){
        if(data===undefined&&elem.nodeType===1){
            var name="data-"+key.replace(rmultiDash,"$1-$2").toLowerCase();
            data=elem.getAttribute(name);
            if(typeof data==="string"){
                try {
                    data=data==="true"?true:
                    data==="false"?false:
                    data==="null"?null:
                    !diving.isNaN(data)?parseFloat(data):
                    rbrace.test(data)?diving.parseJSON(data):
                    data;
                }catch(e){}
                diving.data(elem,key,data);
            }else{
                data=undefined;
            }
        }
        return data;
    }
    function isEmptyDataObject(obj){
        for(var name in obj){
            if(name!=="toJSON"){
                return false;
            }
        }
        return true;
    }
    /*
    //invocacion ajax XMLHttp
    var ajax = {};
    diving.extend(ajax,{
        x:function(){
            if(typeof XMLHttpRequest!=='undefined')
                return new XMLHttpRequest();
            var versions=[
                "MSXML2.XmlHttp.6.0",
                "MSXML2.XmlHttp.5.0",
                "MSXML2.XmlHttp.4.0",
                "MSXML2.XmlHttp.3.0",
                "MSXML2.XmlHttp.2.0",
                "Microsoft.XmlHttp"
            ];
            var xhr;
            for(var i=0;i<versions.length;i++){
                try{
                    xhr=new ActiveXObject(version[i]);
                    break;
                }catch(e){};
            }
            return xhr;
        },
        send:function(url,callback,method,header,data,async,error){
            if(async===undefined)async=true;
            var x=ajax.x();
            x.open(method,url,async);
            x.onreadystatechange=function(){
                if(x.readyState==4){
                    if(x.status===200){
                        callback(x.responseText);
                    }else{
                        error(x.statusText);
                    }
                }
            };
            if(method=='POST'){
                x.withCredentials=true;
                for(var k in header){
                    x.setRequestHeader(k,header[k]);
                }
            }
            x.send(data);
        },
        get:function(url,data,callback,header,async,error){
            var query=[];
            for(var key in data){
                query.push(encodeURIComponent(key)+'='+encodeURIComponent(data[key]));
            }
            ajax.send(url+(query.lenght?'?'+query.join('&'):''),callback,'GET',null,null,async,error);
        },
        post:function(url,data,callback,header,async,error){
            if(typeof data=='string'){
                ajax.send(url,callback,'POST',header,data,async,error);
            }else if(typeof data=='object'){
                var query=[];
                for(var key in data){
                    query.push(encodeURIComponent(key)+'='+encodeURIComponent(data[key]));
                }
                ajax.send(url,callback,'POST',header,query.join('&'),async,error);
            }
        },
        call:function(opt){
            if(opt.done){
                diving.extend(opt,{
                    type:opt.type||'POST',
                    async:opt.async
                });
                if(!opt.hasOwnProperty('error')){
                    opt.error=function(){};
                }
                if(!opt.hasOwnProperty('header')){
                    var opcion='Content-Type'+'application/json'+
                            "datatype"+"charset=UTF-8"+
                            "contentType"+"text/plain"+
                            "Content-type"+"application/x-www-form-urlencoded";
                    opt.header={
                        'Content-type':'application/x-www-form-urlencoded'
                    };
                }
                ajax[opt.type.toLowerCase()](opt.url,opt.data,opt.done,opt.header,opt.async,opt.error);
            }else{
                return new Promise(function(resolve,reject){
                    let xhr = new XMLHttpRequest();
                    var query = [];
                    for( var key in opt.data ){
                        query.push( encodeURIComponent( key ) + '=' + encodeURIComponent( opt.data[ key ] ) );
                    }
                    xhr.open( opt.type||'GET', opt.url+((opt.type=='GET')?( query.length ? '?' + query.join('&'):''):'') );
                    xhr.onreadystatechange = function(){
                        if( xhr.readyState>3 && xhr.status == 200 ){
                            resolve(xhr.responseText );
                        }else if( xhr.status != 200 ){
                            reject( xhr.statusText );
                        }
                    };
                    xhr.withCredentials = true;
                    if( !opt.hasOwnProperty( 'header' ) ){
                        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    }else{
                        for( var k in opt.header ){
                            xhr.setRequestHeader( k, opt.header[ k ] );
                        }
                        xhr.setRequestHeader("Accept",'* / *');
                    }
                    xhr.onload = function(){
                        resolve( xhr.responseText );
                    }
                    xhr.onerror = function(){
                        reject( xhr.statusText );
                    }
                    if( opt.type != 'POST'){
                        xhr.send();
                    }else{
                        xhr.send(query.join('&'));
                    }
                });
            }
        },
        when:function(opt,callback,error){
            if(error==undefined){
                error=function(e){
                    return e;
                }
            }
            Promise.all(opt).then(function(rst){
                callback(rst);
            }).catch(function(err){
                error(err);
            });
        }
    });
*/

