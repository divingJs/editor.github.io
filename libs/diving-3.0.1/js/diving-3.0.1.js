(function() {
    var diving = function(a, c) {
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
                diving(a[0]).attr(ks[k], c[ks[k]]);
            }
        }
        var fn = arguments[arguments.length - 1];
        if (fn && typeof fn == "function")
            this.each(fn);
        return this;
    }
    var dvn = window.dvn = diving;

    var rdashAlpha = /-([a-z])/ig,
        fcamelCase = function(all, letter) {
            return letter.toUpperCase();
        };
    /*this*/
    diving.fn = diving.prototype = {
        size: function() {
            return this.length
        },
        trigger: function(type, data) {
            return this.each(function() {
                diving.event.trigger(type, data, this);
            });
        },
        triggerHandler: function(type, data) {
            if (this[0]) {
                return diving.event.trigger(type, data, this[0], true);
            }
        },
        expando: "diving" + ('3.0.1' + Math.random()).replace(/\D/g, ""),
        each: function(fn, args) {
            return diving.each(this, fn, args);
        },
        get: function(num) {
            if (num && num.constructor == Array) {
                this.length = 0;
                [].push.apply(this, num);
                return this;
            } else
                return num == undefined ?
                    diving.merge(this, []) :
                    this[num];
        },
        attr: function(key, value, type) {
            key = (key == 'text') ? 'innerHTML' : key;
            if (key == 'append') {
                diving(this[0]).append(value);
            } else if (typeof value == 'function') {
                var o = {};
                o[key] = value;
                this[0][((key.toLowerCase()).startsWith('on')) ? key : 'on' + key] = o[key];
            } else {
                return key.constructor != String || value != undefined ?
                    this.each(function() {
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
                    diving[type || "attr"](this[0], key);
            }
        },
        domManip: function(args, table, dir, fn) {
            var clone = this.size() > 1;
            var a = diving.clean(args);
            return this.each(function() {
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
                for (var i = (dir < 0 ? a.length - 1 : 0); i != (dir < 0 ? dir : a.length); i += dir) {
                    fn.apply(obj, [clone ? a[i].cloneNode(true) : a[i]]);
                }
            });
        },
        prepend: function() {
            return this.domManip(arguments, true, -1, function(a) {
                this.insertBefore(a, this.firstChild);
            });
        },
        append: function() {
            return this.domManip(arguments, true, -1, function(a) {
                this.appendChild(a);
            });
        },
        text: function(value) {
            return value === undefined ?
                diving.text(this) :
                this.empty().each(function() {
                    if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                        this.textContent = value;
                    }
                });
        },
        empty: function() {
            var elem, i = 0;
            for (;
                (elem = this[i]) != null; i++) {
                if (elem.nodeType == 1) {
                    elem.textContext = "";
                    elem.innerHTML = "";
                }
            }
            return this;
        },
        removeAttr: function(key) {
            this[0].removeAttribute(key);
        },
        show: function() {
            this.style.display = this.oldblock ? this.oldblock : '';
            if (diving.css(this, 'display') == 'none')
                this.style.display = 'block';
        },
        hide: function() {
            this.oldblock = this.oldblck || diving.css(this, 'display');
            if (this.oldblock == 'none')
                this.oldblock = 'block';
            this.style.display = 'none';
        },
        toggle: function() {
            diving(this)[diving(this).is(':hidden') ? 'show' : 'hide'].apply(diving(this), arguments);
        },
        addClass: function(c) {
            diving.className.add((this.hasOwnProperty('classList')) ? this : this[0], c);
        },
        removeClass: function(c) {
            diving.className.remove((this.hasOwnProperty('classList')) ? this : this[0], c);
        },
        toggleClass: function(c) {
            var elm = (this.hasOwnProperty('classList')) ? this : this[0];
            diving.className[diving.className.has(elm, c) ? 'remove' : 'add'](elm, c);
        },
        hasClass: function(c) {
            return diving.className.has(((this.hasOwnProperty('classList')) ? this : this[0]), c);
        },
        remove: function(a) {
            if (!a || diving.filter([this], a).r)
                if (this.nodeType != undefined) {
                    this.parentNode.removeChild(this);
                } else {
                    this[0].parentNode.removeChild(this[0]);
                }
        },
        find: function(t) {
            return this.pushStack(diving.map(this, function(a) {
                return diving.find(t, a);
            }), arguments);
        },
        pushStack: function(a, args) {
            var fn = args && args[args.length - 1];
            if (!fn || fn.constructor != Function) {
                if (!this.stack)
                    this.stack = [];
                this.stack.push(this.get());
                this.get(a);
            } else {
                var old = this.get();
                this.get(a);
                if (fn.consructor == Function)
                    return this.each(fn);
                this.get(old);
            }
            return this;
        },
        parent: function() {
            return dvn(this[0].parentNode);
        },
        center: function() {
            var stl = (diving(this).attr('style') == null) ? '' : diving(this).attr('style');
            var cnt = diving(this);
            stl = /position:/.test(stl) ? stl.replace(/(position:\s?(absolute)?(relative)?;)/, "position:relative;") : stl += 'position:relative;';
            stl = /left:/.test(stl) ? stl.replace(/(left:\s?[0-9\.]+px;)/, 'left:' + diving.addPx((window.innerWidth / 2) - (cnt[0].offsetWidth / 2)) + ";") : stl += 'left:' + diving.addPx((window.innerWidth / 2) - (cnt[0].offsetWidth / 2)) + ";";
            stl = /top:/.test(stl) ? stl.replace(/(top:\s?[0-9\.]+px;)/, 'top:' + diving.addPx((window.innerHeight / 2) - (cnt[0].offsetHeight / 2)) + ";") : stl += 'top:' + diving.addPx((window.innerHeight / 2) - (cnt[0].offsetHeight / 2)) + ";";
            diving(this).attr('style', stl);
        }
    };
    diving.extend = diving.fn.extend = function(obj, prop) {
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
    new function() {
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
        each: function(obj, fn, args) {
            if (obj.length == undefined)
                for (var i in obj)
                    fn.apply(obj[i], args || [i, obj[i]]);
            else
                for (var i = 0; i < obj.length; i++)
                    if (fn.apply(obj[i], args || [i, obj[i]]) === false)
                        break;
            return obj;
        },
        camelCase: function(string) {
            return string.replace(rdashAlpha, fcamelCase);
        },
        attr: function(elem, name, value) {
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
                name = name.replace(/-([a-z])/ig, function(z, b) {
                    return b.toUpperCase();
                });
                if (value != undefined)
                    elem[name] = value;
                return elem[name];
            }
        },
        addPx: function(n) {
            if (typeof n == 'number') {
                return n + 'px';
            } else if (typeof n == 'string') {
                return (n.match(/[a-z]+/gm) != null) ? n : n + "px";
            }
        },
        text: function(elm) {
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
            function(a) {
                var r = [];
                var s = diving.sibling(a);
                if (s.n > 0)
                    for (var i = s.n; i < s.length; i++)
                        r.push(s[i]);
                return r;
            }
        ],
        find: function(t, context) {
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
                        if (m[m.length - 2] == "#") {
                            var oid = document.getElementById(m[m.length - 1]);
                            r = ret = oid ? [oid] : [];
                            t = t.replace(re2, "");
                        } else if (/^([a-z]+\[)/.test(m[1])) {
                            var oid = document.querySelector(m[1]);
                            r = ret = oid ? [oid] : [];
                            t = t.replace(re2, '');
                        } else {
                            if (!m[m.length - 1] || m[m.length - 2] == ".")
                                m[m.length - 1] = "*";
                            for (var i = 0; i < ret.length; i++)
                                r = diving.merge(r,
                                    m[m.length - 1] == "*" ?
                                    diving.getAll(ret[i]) :
                                    ret[i].getElementsByTagName(m[m.length - 1])
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
            add: function(o, c) {
                if (diving.className.has(o, c))
                    return;
                o.className += (o.className ? ' ' : '') + c;
            },
            remove: function(o, c) {
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
            has: function(e, a) {
                if (e.className != undefined)
                    e = e.className;
                return new RegExp("(^|\\s)" + a + "(\\s|$)").test(e);
            }
        },
        getAll: function(o, r) {
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
        filter: function(t, r, not) {
            var g = not !== false ? diving.grep : function(a, f) {
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
            return {
                r: r,
                t: t
            };
        },
        trim: function(t) {
            return t.replace(/^\s+|\s+$/g, "");
        },
        merge: function(first, second) {
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
        grep: function(elems, fn, inv) {
            if (fn.constructor == String)
                fn = new Function("a", "i", "return " + fn);
            var result = [];
            for (var i = 0; i < elems.length; i++)
                if (!inv && fn(elems[i], i) || inv && fn(elems[i], i))
                    result.push(elems[i]);
            return result;
        },
        map: function(elems, fn) {
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
        clean: function(a) {
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
        widget: function(w) {
            var obj = {
                name: 'div' + w.name || null
            };
            if (!obj.name)
                return;
            var fun = diving.fn[obj.name] = w || {};
            diving.extend(diving.ui, {
                [obj.name]: fun
            });
            diving.fn[obj.name] = w.init;
        },
        draggable: function(title, content) {
            var px = 0,
                py = 0;
            var dragObj = null;
            var obj = content || title;
            obj.style.position = "absolute";
            title.addEventListener('mousedown', function() {
                obj.addEventListener('mousedown', onMouseDown);

                function onMouseDown(a) {
                    px = a.layerX;
                    py = a.layerY;
                    dragObj = obj;
                }
                obj.addEventListener('mouseup', function(e) {
                    obj.removeEventListener('mousedown', onMouseDown, false);
                    dragObj = null;
                });
                obj.addEventListener('mousemove', function(e) {
                    var x = e.pageX - px;
                    var y = e.pageY - py;
                    if (dragObj == null)
                        return;
                    dragObj.style.left = x + "px";
                    dragObj.style.top = y + "px";
                });
            });
        },
        template: function(str, obj) {
            if (str.startsWith('/=')) {
                var nss = "",
                    s = "",
                    a = str.match(/\/=((\s{1,})?[a-zA-Z0-9_\(\)":#=\?\/\-]+(\s{1,})?)\//g); ///((#:)+(\s{1,})?[a-zA-Z\_0-9]+(\s{1,})?\#)/g);
                for (var i = 0; i < a.length; i++) {
                    var b = a[i].match(/((#:)+(\s{1,})?[a-zA-Z\_0-9]+(\s{1,})?\#)/g);
                    for (var j = 0; j < b.length; j++) {
                        var sub = (s.length === 0) ? str.replace(/^\/=/g, '').replace(/\/$/g, '') : s;
                        s = sub.replace("#:" + b[j].match(/[a-zA-Z\_0-9]/g).join('') + '#', obj[(b[j].match(/[a-zA-Z\_0-9]/g).join(''))]);
                    }
                }
                return eval(s.toString());
            } else {
                var nss = "",
                    s = "",
                    b = str.match(/((#:)+(\s{1,})?[a-zA-Z\_0-9]+(\s{1,})?\#)/g);
                for (var j = 0; j < b.length; j++) {
                    var sub = (s.length === 0) ? str : s;
                    s = sub.replace("#:" + b[j].match(/[a-zA-Z\_0-9]/g).join('') + '#', obj[(b[j].match(/[a-zA-Z\_0-9]/g).join(''))]);
                }
                return s;
            }
        }
    });
    window.diving = diving || {};
})();
diving.each(("blur|focus|focusin|focusout|resize|scroll|click|dblclick|mousedown|mouseup|mousemove|mouseover|mouseout|mouseenter|mouseleave|change|select|submit|keydown|keypress|keyup|contextmenu").split('|'), function(i, v) {
    diving.fn[v] = function(data, fn) {
        if (arguments.length > 0) {
            diving(this)[0]['on' + [v]] = arguments[0];
            diving(this)[0]['on' + [v]];
        }
    }
});
diving.extend({
    store: {
        Source: function(p) {
            diving.each(p.data, function(i, v) {
                v['d-row-item'] = i;
            });
            this.initParams = p;
            this.data = p.data;
            this.elements = p.data;
            this.setData = function(data) {
                this.data = data;
            }
            this.schema = p.schema || {};
            this.schema.model = (p.schema) ? p.schema.model || {} : {};
            this.schema.model.fields = (p.schema) ? (p.schema.model) ? p.schema.model.fields || {} : {} : {};
            this.group = diving.store.group;
            if (p.group) {
                this.grupo = p.group;
            }
            this.sort = diving.store.sort;
            (p.sort) ? this.sort(p.sort): null;
            (p.group) ? this.group(p.group): null;
            this.view = function() {
                return this.elements;
            }
            return this;
        },
        group: function(p) {
            this.elements = this.data;
            this.elements = diving.group(this.elements, p, 0);
        },
        sort: function(orden) {
            this.elements = this.data;
            var srt = (!Array.isArray(orden)) ? [orden] : orden;
            var elements = this.elements;
            diving.each(srt, function(i, v) {
                var sort = v.field;
                var dir = (v.dir) ? (v.dir == 'desc') ? -1 : v.dir : 1;
                elements.sort(function(a, b) {
                    if (eval('a[sort]' + ((dir == 1) ? '>' : '<') + 'b[sort]')) {
                        return 1;
                    }
                    if (eval('a[sort]' + ((dir == -1) ? '>' : '<') + 'b[sort]')) {
                        return -1;
                    }
                    return 1;
                });
            });
            this.elements = elements;
        }
    },
    subGp: function(arr, p) {
        return this.group(arr.items, p);
    },
    group: function(a, p) {
        var rtn = [];
        var nar = [];
        var sx = false;
        p = (p.length) ? p : [p];
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
    props: "altKey attrChange attrName bubbles button cancelable " +
        "charCode clientX clientY ctrlKey currentTarget data detail " +
        "eventPhase fromElement handler keyCode layerX layerY metaKey " +
        "newValue offsetX offsetY pageX pageY prevValue relatedNode " +
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

function dataAttr(elem, key, data) {
    if (data === undefined && elem.nodeType === 1) {
        var name = "data-" + key.replace(rmultiDash, "$1-$2").toLowerCase();
        data = elem.getAttribute(name);
        if (typeof data === "string") {
            try {
                data = data === "true" ? true :
                    data === "false" ? false :
                    data === "null" ? null :
                    !diving.isNaN(data) ? parseFloat(data) :
                    rbrace.test(data) ? diving.parseJSON(data) :
                    data;
            } catch (e) {}
            diving.data(elem, key, data);
        } else {
            data = undefined;
        }
    }
    return data;
}

function isEmptyDataObject(obj) {
    for (var name in obj) {
        if (name !== "toJSON") {
            return false;
        }
    }
    return true;
}
//invocacion ajax XMLHttp
var ajax = {};
diving.extend(ajax, {
    x: function() {
        if (typeof XMLHttpRequest !== 'undefined')
            return new XMLHttpRequest();
        var versions = [
            "MSXML2.XmlHttp.6.0",
            "MSXML2.XmlHttp.5.0",
            "MSXML2.XmlHttp.4.0",
            "MSXML2.XmlHttp.3.0",
            "MSXML2.XmlHttp.2.0",
            "Microsoft.XmlHttp"
        ];
        var xhr;
        for (var i = 0; i < versions.length; i++) {
            try {
                xhr = new ActiveXObject(version[i]);
                break;
            } catch (e) {};
        }
        return xhr;
    },
    send: function(url, callback, method, header, data, async, error) {
        if (async === undefined) async = true;
        var x = ajax.x();
        x.open(method, url, async);
        x.onreadystatechange = function() {
            if (x.readyState == 4) {
                if (x.status === 200) {
                    callback(x.responseText);
                } else {
                    error(x.statusText);
                }
            }
        };
        if (method == 'POST') {
            x.withCredentials = true;
            for (var k in header) {
                x.setRequestHeader(k, header[k]);
            }
        }
        x.send(data);
    },
    get: function(url, data, callback, header, async, error) {
        var query = [];
        for (var key in data) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        ajax.send(url + (query.lenght ? '?' + query.join('&') : ''), callback, 'GET', null, null, async, error);
    },
    post: function(url, data, callback, header, async, error) {
        if (typeof data == 'string') {
            ajax.send(url, callback, 'POST', header, data, async, error);
        } else if (typeof data == 'object') {
            var query = [];
            for (var key in data) {
                query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
            }
            ajax.send(url, callback, 'POST', header, query.join('&'), async, error);
        }
    },
    call: function(opt) {
        if (opt.done) {
            diving.extend(opt, {
                type: opt.type || 'POST',
                async: opt.async
            });
            if (!opt.hasOwnProperty('error')) {
                opt.error = function() {};
            }
            if (!opt.hasOwnProperty('header')) {
                var opcion = 'Content-Type' + 'application/json' +
                    "datatype" + "charset=UTF-8" +
                    "contentType" + "text/plain" +
                    "Content-type" + "application/x-www-form-urlencoded";
                opt.header = {
                    'Content-type': 'application/x-www-form-urlencoded'
                };
            }
            ajax[opt.type.toLowerCase()](opt.url, opt.data, opt.done, opt.header, opt.async, opt.error);
        } else {
            return new Promise(function(resolve, reject) {
                let xhr = new XMLHttpRequest();
                var query = [];
                for (var key in opt.data) {
                    query.push(encodeURIComponent(key) + '=' + encodeURIComponent(opt.data[key]));
                }
                xhr.open(opt.type || 'GET', opt.url + ((opt.type == 'GET') ? (query.length ? '?' + query.join('&') : '') : ''));
                xhr.onreadystatechange = function() {
                    if (xhr.readyState > 3 && xhr.status == 200) {
                        resolve(xhr.responseText);
                    } else if (xhr.status != 200) {
                        reject(xhr.statusText);
                    }
                };
                xhr.withCredentials = true;
                if (!opt.hasOwnProperty('header')) {
                    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                } else {
                    for (var k in opt.header) {
                        xhr.setRequestHeader(k, opt.header[k]);
                    }
                    xhr.setRequestHeader("Accept", '*/*');
                }
                xhr.onload = function() {
                    resolve(xhr.responseText);
                }
                xhr.onerror = function() {
                    reject(xhr.statusText);
                }
                if (opt.type != 'POST') {
                    xhr.send();
                } else {
                    xhr.send(query.join('&'));
                }
            });
        }
    },
    when: function(opt, callback, error) {
        if (error == undefined) {
            error = function(e) {
                return e;
            }
        }
        Promise.all(opt).then(function(rst) {
            callback(rst);
        }).catch(function(err) {
            error(err);
        });
    }
});
//divButton
(function() {
    var widget = {
        name: "Button",
        init: function(prm) {
            prm = diving.extend(prm, {
                text: prm.text || diving(this)[0].innerHTML || '',
                classParent: "d-button",
                class: ((prm.type) ? 'd-' + prm.type : 'd-default') + ((prm.class) ? ' ' + prm.class : ''),
                type: (prm.type) ? prm.type : 'default'
            });
            var widtgetData = {
                setText: function(t) {
                    diving(diving(this.elm).find('button')).text(t);
                    this.text = t;
                },
                elem: diving(this)[0]
            };
            widget.createElement(prm, widtgetData);
            diving(this).data('div' + widget.name, widtgetData);
        },
        createElement: function(p, data) {
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
            diving.extend(data, attributes);
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
                classParent: "d-notification",
                class: ((prm.type) ? 'd-' + prm.type : 'd-default') + ((prm.class) ? ' ' + prm.class : ''),
                type: (prm.type) ? prm.type : 'default'
            });
            var widtgetData = {
                setText: function(t) {
                    diving(diving(this.elem).find('div')).text(t);
                    this.text = t;
                },
                destroy: function() {
                    diving(this.elem).removeData('divNotification');
                    diving(this.elem)[0].remove();
                },
                setType: function(t) {
                    diving(this.elem).find('div').attr('type', t);
                    diving(this.elem).find('div').attr('class', 'd-' + t);
                    this.class = 'd-' + t;
                    this.type = t;
                },
                elem: diving(this)[0]
            };
            widget.createElement(prm, widtgetData);
            diving(this).data('div' + widget.name, widtgetData);
        },
        createElement: function(p, data) {
            diving(data.elem).empty();
            //getIcon
            var icn = (p.icon) ? p.icon : null;
            delete p.icon;
            //getConfirm
            var confirm = (p.hasOwnProperty('confirm')) ? p.confirm : false;
            p.type = (confirm) ? 'light' : p.type;
            p.class = (confirm) ? 'd-light' : p.class;
            delete p.confirm;
            var action = {
                cancel: (p.action) ? p.action.cancel || function() {} : function() {},
                confirm: (p.action) ? p.action.confirm || function() {} : function() {}
            };
            delete p.action;
            var attributes = diving.extend(p, {
                text: p.text,
                class: p.class,
                type: p.type
            });
            diving(data.elem).addClass(p.classParent);
            if (p.configure != null) {
                var stl = "";
                diving.each(Object.keys(p.configure), function(i, v) {
                    stl += v + ':' + p.configure[v] + ';'
                });
                diving(data.elem).attr('style', stl);
                delete p.configure;
            }
            delete attributes.classParent;
            if (p.autoClose) {
                var x = diving(data.elem);
                setTimeout(function() {
                    diving(x).data('divNotification').destroy();
                }, p.autoClose);
                delete p.autoClose;
            }
            var elemento = diving('<div>', attributes);
            (icn) ? elemento[
                ((typeof icn === 'string') ? 'append' : ((icn.pos == 'before') ? 'prepend' : 'append'))
            ](diving('<em>', {
                class: (typeof icn === 'string') ? icn : icn.class
            })): null;
            var em = diving('<em>', {
                class: 'icon-close3',
                click: function(e) {
                    diving(this.parentNode).data('divNotification').destroy();
                }
            });
            diving(data.elem).append(em).append(elemento);
            if (confirm) {
                var cancel = diving('<div>', {
                    class: 'd-confirm-cancel'
                });
                var confirmacion = diving('<div>', {
                    class: 'd-confirm-confirm'
                });
                diving(data.elem).append(diving('<div>', {
                    class: 'd-clear'
                })).append(cancel).append(confirmacion).append(diving('<div>', {
                    class: 'd-clear'
                }));
                diving(data.elem).attr('style', 'background-color: #969696;padding: 1px 5px 5px;border-radius: 0;display:block;width: auto;');
                cancel.divButton({
                    type: 'danger',
                    text: 'Cancelar',
                    click: function() {
                        action.cancel.constructor = cancel.click;
                        action.cancel();
                    }
                });
                confirmacion.divButton({
                    type: 'success',
                    text: 'Aceptar',
                    click: function() {
                        action.confirm.constructor = confirmacion.click;
                        action.confirm();
                    }
                });
            }
            diving.extend(data, attributes);
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
                    console.log(diving(this.elm).find('input')[0]);
                    diving(this.elm).find('input')[0].value = t;
                    this.text = t;
                },
                getValue: function() {
                    return this.text;
                },
                elem: diving(this)[0]
            };
            widget.createElement(prm, widtgetData);
            diving(this).data('div' + widget.name, widtgetData);
        },
        createElement: function(p, data) {
            diving(data.elem).empty();
            var attributes = diving.extend(p, {
                text: p.text,
                class: p.class,
                onchange: function(evt) {
                    diving(this.parentNode.parentNode).data('divText').text = this.value;
                    if (p.change) {
                        p.change.constructor = this.onchange;
                        p.change(evt);
                    }
                },
                onkeyup: function(k) {
                    diving(this.parentNode.parentNode).data('divText').text = this.value;
                    if (p.keyup) {
                        p.keyup.constructor = this.onkeyup;
                        p.keyup(k);
                    }
                },
                onkeydown: function(k) {
                    diving(this.parentNode.parentNode).data('divText').text = this.value;
                    if (p.keydown) {
                        p.keydown.constructor = this.onkeydown;
                        p.keydown(k);
                    }
                }
            });
            var w;
            if (p.width) {
                w = p.width;
                delete p.width;
            }
            var elemento;
            if (p.multiple) {
                if (typeof p.multiple != 'object') {
                    delete p.multiple;
                } else {
                    attributes.rows = p.multiple.row;
                    attributes.cols = p.multiple.col;
                    (p.multiple.resize != undefined) ? (!p.multiple.resize) ? attributes.style = 'resize:none;': '': '';
                    delete p.multiple;
                }
                elemento = diving('<textarea>', attributes);
            } else {
                elemento = diving('<input>', attributes);
            }
            diving(data.elem).append(diving('<div>').append(elemento));
            diving.extend(data, attributes);
        }
    };
    diving.widget(widget);
})();

function loadHref(parentTo, page) {
    var url = (page.endsWith('/')) ? page + 'index.html' : page.endsWith('.html') ? page : page;
    if (url == '#')
        return;
    req = new XMLHttpRequest();
    req.open("GET", url, false);
    req.send(null);
    parentTo[0].innerHTML = req.responseText;
    var scr = parentTo[0].getElementsByTagName('script');
    var i = 0;
    var llamada = function(i) {
        var script = scr[i];
        var srcs = diving(script).attr('src');
        if (srcs != null) {
            diving(src[i]).remove();
            var fileref = diving('<script>', {
                "type": "text/javascript",
                "src": srcs
            });
            parentTo.append(fileref);
        } else if (i < scr.length) {
            i++;
            setTimeout(function() {
                if (script)
                    eval(script.innerHTML);
                llamada(i);
            }, 10);
        }
    };
    llamada(i);
}
(function() {
    var widget = {
        name: "Master",
        init: function(prm) {
            prm = diving.extend(prm, {
                class: "d-master-page d-row"
            });
            var widtgetData = {
                elem: diving(this)[0]
            };
            widget.createElement(prm, widtgetData);
            diving(this).data('div' + widget.name, widtgetData);
        },
        createElement: function(p, data) {
            diving(data.elem).empty();
            var attributes = diving.extend(p, {
                class: p.class
            });
            var elemento = diving('<div>', {
                class: attributes.class
            });
            diving(data.elem).addClass('d-container-12');
            diving(data.elem).append(elemento);

            function add(content, elm) {
                var actual = diving('<' + elm.type + '>', {
                    class: elm.class
                });
                (elm.id != undefined) ? actual.attr('id', elm.id): null;
                content.append(actual);
                if (elm.hasOwnProperty('content')) {
                    for (var sb in elm.content) {
                        add(actual, elm.content[sb]);
                    }
                }
                if (elm.hasOwnProperty('load'))
                    loadHref(actual, elm.load);
            }
            diving.each(p.content, function(i, v) {
                add(elemento, v);
            });
            attributes.add = add;
            diving.extend(data, attributes);
        }
    };
    diving.widget(widget);
})();
(function() {
    var widget = {
        name: "TabsTrip",
        init: function(prm) {
            prm = diving.extend(prm, {
                class: "d-tabstrip"
            });
            var widtgetData = {
                elem: diving(this)[0]
            };
            widget.createElement(prm, widtgetData);
            diving(this).data('div' + widget.name, widtgetData);
        },
        createElement: function(p, data) {
            diving(data.elem).empty();
            var wdt = this;
            var title = diving('<div>', {
                'd-role': 'title',
                class: 'd-title'
            });
            var cnt = diving('<div>', {
                'd-role': 'contenido',
                class: 'd-tabstrip-content'
            });
            var attributes = diving.extend(p, {
                class: p.class,
                elements: [],
                contents: [],
                openElem: null,
                titulos: title,
                contenidos: cnt,
                add: function(element) {
                    wdt.add(
                        element,
                        this.elements.length,
                        diving(this.titulos),
                        diving(this.contenidos),
                        this.properties,
                        this
                    );
                },
                properties: null
            });
            var elemento = diving('<div>', {
                class: attributes.class
            });
            diving(data.elem).append(elemento);
            elemento.append(diving('<div>', {
                class: 'd-title-content'
            }).append(title)).append(diving('<div>', {
                class: 'd-clear'
            })).append(cnt);
            var props = {
                t1: 0,
                t2: 0,
                ini: 0,
                fin: 0,
                paso: false
            };
            diving.each(p.content, function(i, v) {
                if (v.hasOwnProperty('open')) attributes.openElem = 'tab_' + i;
                wdt.add(v, i, title, cnt, props, attributes);
            });
            if (props.paso) {
                wdt.creaScroll(title, props);
            }
            attributes.properties = props;
            diving.extend(data, attributes);
        },
        add: function(elm, i, title, cnt, prps, attrs) {
            var elmTitle = diving('<div>', {
                text: elm.title,
                'd-elem': 'tab_' + i,
                class: 'd-title-item' + ((elm.hasOwnProperty('open')) ? (!elm.open) ? '' : ' d-tab-active' : ''),
                click: function() {
                    var dta = diving(this.parentNode.parentNode.parentNode.parentNode).data('divTabsTrip');
                    var actual = diving(this).attr('d-elem');
                    diving.each(dta.elements, function(i, v) {
                        if (v.attr('d-elem') == actual) {
                            v.addClass('d-tab-active');
                            dta.contents[i].removeClass('d-hidden');
                        } else {
                            v.removeClass('d-tab-active');
                            dta.contents[i].addClass('d-hidden');
                        }
                    });
                }
            });
            title.append(elmTitle);
            attrs.elements.push(elmTitle);
            var elmCnt = diving('<div>', {
                'd-content': 'tab_' + i,
                class: 'd-content-item' + ((elm.hasOwnProperty('open')) ? ((!elm.open) ? ' d-hidden' : '') : ' d-hidden')
            }).append(diving(elm.element));
            attrs.contents.push(elmCnt);
            cnt.append(
                elmCnt
            );
            prps.t1 = title[0].parentNode.offsetWidth;
            prps.t2 = prps.t2 + elmTitle[0].offsetWidth;
            if (prps.t2 < prps.t1) {
                prps.fin = i;
            } else {
                prps.paso = true;
            }
        },
        creaScroll: function(title, prps) {
            diving(title[0].parentNode.parentNode).prepend(
                diving('<div>', {
                    class: 'icon-keyboard_arrow_left d-tabTitle-left',
                    click: function() {
                        var elemento = diving(this.parentNode.children[2])[0];
                        elemento.scrollTo((elemento.scrollLeft - 50), 0);
                    }
                })
            );
            diving(title[0].parentNode.parentNode).prepend(
                diving('<div>', {
                    class: 'icon-keyboard_arrow_right d-tabTitle-right',
                    click: function() {
                        var elemento = diving(this.parentNode.children[2])[0];
                        elemento.scrollTo((elemento.scrollLeft + 50), 0);
                    }
                })
            );
            diving(title[0].parentNode).attr('style', 'overflow:hidden;width:' + prps.t1 + 'px;position:absolute;');
        }
    };
    diving.widget(widget);
})();
(function() {
    var widget = {
        name: "AutoComplete",
        init: function(prm) {
            prm = diving.extend(prm, {
                class: "d-autocomplete"
            });
            var widtgetData = {
                elem: diving(this)[0],
                value: null
            };
            widget.createElement(prm, widtgetData);
            diving(this).data('div' + widget.name, widtgetData);
        },
        createElement: function(p, data) {
            diving(data.elem).empty();
            var wdt = this;
            var attributes = diving.extend(p, {
                minkey: p.minkey || 0,
                class: p.class,
                elements: {},
                itemSelected: null,
                select: {
                    text: '',
                    value: ''
                },
                activos: []
            });
            var input = diving('<input>', {
                class: 'd-input-autocomplete',
                onchange: function() {
                    if (p.change) {
                        p.change.constructor = this.onchange;
                        p.change();
                    }
                },
                onkeydown: function(k) {
                    var dac = diving(this.parentNode.parentNode).data('divAutoComplete');
                    var pr = false;
                    var x = dac.itemSelected;
                    switch (k.keyCode) {
                        case 40:
                            dac.itemSelected = (dac.itemSelected == null) ? dac.activos.length : dac.itemSelected;
                            if (dac.itemSelected < dac.activos.length - 1) {
                                dac.itemSelected += 1;
                            } else {
                                dac.itemSelected = 0;
                                x = 0;
                            }
                            pr = true;
                            break;
                        case 38:
                            dac.itemSelected = (dac.itemSelected == null) ? dac.activos.length : dac.itemSelected;
                            x = dac.itemSelected;
                            if (dac.itemSelected > 0) {
                                dac.itemSelected -= 1;
                            } else {
                                dac.itemSelected = dac.activos.length - 1;
                                x = dac.activos.length - 1;
                            }
                            pr = true;
                            break;
                        case 13:
                            if (dac.itemSelected != null) {
                                dac.elements.input[0].value = dac.activos[dac.itemSelected][0].innerText;
                                dac.value = dac.activos[dac.itemSelected][0].innerText;
                                dac.select = {
                                    'value': dac.activos[dac.itemSelected][0].val,
                                    'text': dac.activos[dac.itemSelected][0].innerText
                                };
                                dac.activos = [];
                                dac.itemSelected = null;
                                dac.elements.list.addClass('d-hidden');
                            }
                            break;
                    }
                    if (pr) {
                        wdt.changeSelection(dac.activos, dac.itemSelected);
                    }
                },
                onkeyup: function(k) {
                    var dac = diving(this.parentNode.parentNode).data('divAutoComplete');
                    if (k.keyCode == 27) {
                        dac.elements.list.addClass('d-hidden');
                        return;
                    }
                    dac.value = this.value;
                    if (this.value.length > 0 && k.keyCode != 13) {
                        dac.elements.list.removeClass('d-hidden');
                        dac.activos = [];
                        dac.select = {
                            text: '',
                            value: ''
                        };
                        diving.each(dac.elements.items, function(i, v) {
                            var textoOriginal = v[0].innerText;
                            var vActual = (v[0].innerText).substring(0, dac.value.length);
                            if (vActual.length >= attributes.minkey) {
                                if (vActual.toUpperCase() == dac.value.toUpperCase()) {
                                    v.removeClass('d-hidden');
                                    var lbl = diving('<b>', {
                                        text: (v[0].innerText).substring(0, dac.value.length),
                                        style: ''
                                    });
                                    var igual = (v[0].innerText).substring(0, dac.value.length);
                                    v[0].innerText = v[0].innerText.replace(igual, '');
                                    v.prepend(lbl);
                                    dac.activos.push(v);
                                } else {
                                    v.text(textoOriginal);
                                    v.addClass('d-hidden');
                                    v.removeClass('d-selected');
                                }
                            } else {
                                v.text(textoOriginal);
                                v.addClass('d-hidden');
                                v.removeClass('d-selected');
                            }
                        });
                    } else {
                        dac.activos = [];
                        dac.select = {
                            text: '',
                            value: ''
                        };
                        dac.itemSelected = null;
                        dac.elements.list.addClass('d-hidden');
                    }
                }
            });
            var lista = diving('<ul>', {
                dtrole: 'd-list-autocomplete',
                style: 'width:' + (data.elem.offsetWidth) + 'px',
                click: function(k) {
                    var dac = diving(this.parentNode.parentNode.parentNode).data('divAutoComplete');
                    dac.elements.input[0].value = diving(k.target)[0].innerText;
                    dac.value = diving(k.target)[0].innerText;
                    dac.select = {
                        'value': diving(k.target)[0].val,
                        'text': diving(k.target)[0].innerText
                    };
                    dac.activos = [];
                    dac.itemSelected = null;
                    dac.elements.list.addClass('d-hidden');
                    if (p.selected != null) {
                        p.selected.constructor = this.click;
                        p.selected();
                    }
                }
            });
            var items = [];
            attributes.elements = {
                'input': input,
                'list': lista,
                'items': items
            };
            var elemento = diving('<div>', {
                class: attributes.class
            }).append(
                input
            ).append(
                diving('<div>', {
                    class: 'd-list-autocomplete'
                }).append(
                    lista
                )
            );
            diving.each(p.datos, function(i, v) {
                wdt.add(lista, v, p.textValue, p.fieldValue, attributes.elements);
            });
            diving(data.elem).append(elemento);
            diving.extend(data, attributes);
        },
        add: function(list, element, textValue, fieldValue, elements) {
            var item = diving('<li>', {
                class: 'd-item-autocomplete d-hidden'
            });
            if (typeof element == 'string') {
                item.attr('text', element);
                item.attr('val', element);
            } else {
                item.attr('text', element[textValue]);
                item.attr('val', element[fieldValue]);
            }
            elements.items.push(item);
            list.append(item);
        },
        changeSelection: function(elements, i) {
            diving.each(elements, function(x, v) {
                v.removeClass('d-selected');
            });
            elements[i].addClass('d-selected');
        }
    };
    diving.widget(widget);
})();
/*MultiSelect*/
(function() {
    var widget = {
        name: "MultiSelect",
        init: function(prm) {
            prm = diving.extend(prm, {
                class: "d-multiselect"
            });
            var widtgetData = {
                elem: diving(this)[0],
                maxItemSelected: prm.maxItemSelected || prm.datos.length
            };
            widget.createElement(prm, widtgetData);
            diving(this).data('div' + widget.name, widtgetData);
        },
        createElement: function(p, data) {
            dvn(data.elem).addClass(p.class);
            diving.extend(data, {
                elements: [],
                selectes: [],
                activos: {},
                text: "",
                slt: 0,
                objetos: {},
                selected: function() {
                    return this.selectes;
                }
            });
            if (p.change) {
                diving.extend(data, {
                    change: p.change
                });
            }
            var mltSlc = this;
            var c = 'd-hidden';
            var itmSlc = diving('<div>', {
                'd-rol': 'd-itemSelects'
            });
            var cntTxtDown = diving('<div>', {
                class: 'd-cntTxtDown'
            });
            var txt = diving('<input>', {
                class: 'd-txtMultiSelect'
            });
            var ul = diving('<ul>', {
                class: 'd-hidden',
                'd-rol': 'd-listMultiSelect',
                click: function(e) {
                    var t = e.target;
                    var obj = {
                        txt: t.innerText,
                        value: dvn(t).attr('val')
                    };
                    mltSlc.addElementSelected(obj, dvn(data.elem));

                    em.removeClass('icon-expand_more');
                    em.removeClass('icon-expand_less');
                    em.addClass('icon-expand_more');
                }
            });
            var em = diving('<em>', {
                class: 'icon-expand_more'
            });
            var down = diving('<div>', {
                class: 'd-moreLess',
                click: function() {
                    em.toggleClass('icon-expand_more');
                    em.toggleClass('icon-expand_less');
                    ul.toggleClass(c);
                    var mda = diving(data.elem).data('divMultiSelect');
                    var arr = ((mda.text.length > 0) ? mda.activos['lvl_' + mda.text.length].elements.length > 0 : false) ? mda.activos['lvl_' + mda.text.length].elements : mda.elements;
                    diving.each(arr, function(i, v) {
                        (diving.className.has(ul[0], c)) ? v.addClass(c): v.removeClass(c);
                    });
                }
            }).append(em);
            dvn(data.elem).append(itmSlc).append(cntTxtDown.append(txt).append(down)).append(ul);
            data.objetos = {
                itemSelect: itmSlc,
                inputText: txt,
                list: ul,
                expands: em
            };
            diving.each(p.datos, function(i, v) {
                mltSlc.add(ul, v, null, null, data.elements);
            });
            txt[0].onkeyup = function(e) {
                data.text = this.value;
                if (e.keyCode !== 38 && e.keyCode !== 40 && e.keyCode !== 27 && e.keyCode !== 13) {
                    em.removeClass('icon-expand_more');
                    em.removeClass('icon-expand_less');
                    em.addClass('icon-expand_less');
                    if (this.value.length > 0) {
                        ul.removeClass('d-hidden');
                        mltSlc.keyup(e, dvn(data.elem));
                    } else {
                        em.removeClass('icon-expand_more');
                        em.removeClass('icon-expand_less');
                        em.addClass('icon-expand_more');
                        ul.addClass('d-hidden');
                    }
                } else if (e.keyCode == 13) {
                    em.removeClass('icon-expand_more');
                    em.removeClass('icon-expand_less');
                    em.addClass('icon-expand_more');
                    mltSlc.selectedByEnterKey(e, dvn(data.elem));
                } else {
                    em.removeClass('icon-expand_more');
                    em.removeClass('icon-expand_less');
                    em.addClass('icon-expand_less');
                    mltSlc.selectByKeyboard(e, dvn(data.elem));
                }
            }
            ul.attr('style', 'width:' + (diving(data.elem)[0].offsetWidth) + 'px;' +
                ((data.elements.length > 5) ? 'overflow:hidden;height:16em;overflow-y:scroll;' : ''));
        },
        add: function(list, element, textValue, fieldValue, elements) {
            var item = diving('<li>', {
                class: 'd-item-multiselect d-hidden'
            });
            if (typeof element == 'string') {
                item.attr('text', element);
                item.attr('val', element);
            } else {
                item.attr('text', element.textValue);
                item.attr('val', element.fieldValue);
            }
            elements.push(item);
            list.append(item);
        },
        keyup: function(e, elem) {
            var mda = diving(elem).data('divMultiSelect');
            if (e.keyCode == 27) {
                mda.objetos.list.addClass('d-hidden');
                mda.slt = -1;
                return;
            }
            var obj = {};
            if (mda.text.length == 1) {
                mda.activos = {};
                mda.activos = {
                    lvl_1: {
                        elements: [],
                        search: mda.text.toUpperCase()
                    }
                };
                mda.slt = -1;
            } else {
                var arrkeys = Object.keys(mda.activos);
                if (mda.text.length > arrkeys.length) {
                    mda.activos['lvl_' + mda.text.length] = {
                        elements: [],
                        search: mda.text.toUpperCase()
                    };
                    mda.slt = -1;
                    obj.nuevo = true;
                } else {
                    obj.nuevo = false;
                }
            }
            var arr = (mda.activos['lvl_' + mda.text.length].elements.length > 0) ? mda.activos['lvl_' + mda.text.length].elements : mda.elements;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i][0].innerText.toUpperCase().startsWith(mda.activos['lvl_' + mda.text.length].search)) {
                    arr[i].removeClass('d-hidden');
                    if (obj.nuevo) {
                        mda.activos['lvl_' + mda.text.length].elements.push(arr[i]);
                    }
                } else {
                    arr[i].addClass('d-hidden');
                }
            }

        },
        selectByKeyboard: function(e, elem) {
            var mda = diving(elem).data('divMultiSelect');
            var arr = (mda.activos['lvl_' + mda.text.length].elements.length > 0) ? mda.activos['lvl_' + mda.text.length].elements : mda.elements;
            mda.objetos.list.removeClass('d-hidden');
            switch (e.keyCode) {
                case 38:
                    mda.slt = (mda.slt <= 0) ? arr.length - 1 : mda.slt - 1;
                    break;
                case 40:
                    mda.slt = (mda.slt == arr.length - 1) ? 0 : mda.slt + 1;
                    break;
                case 27:
                    mda.objetos.list.addClass('d-hidden');
                    mda.slt = 0;
                    break;
            }
            for (var i = 0; i < arr.length; i++) {
                arr[i].removeClass('d-selected');
            }
            var x = 0;
            for (var idx = 4; idx < mda.slt; idx++) {
                x = x + arr[idx][0].offsetHeight
            }
            mda.objetos.list[0].scrollTop = x;
            arr[mda.slt].addClass('d-selected');
        },
        selectedByEnterKey: function(e, elem) {
            var mda = diving(elem).data('divMultiSelect');
            var arr = (mda.activos['lvl_' + mda.text.length].elements.length > 0) ? mda.activos['lvl_' + mda.text.length].elements : mda.elements;
            var obj = {
                txt: arr[mda.slt][0].innerText,
                value: arr[mda.slt].attr('val')
            };
            this.addElementSelected(obj, elem);
        },
        addElementSelected: function(obj, elem) {
            var mda = diving(elem).data('divMultiSelect');
            var noExiste = false;
            for (var i = 0; i < mda.selectes.length; i++) {
                if (mda.selectes[i].value == obj.value) {
                    noExiste = true;
                    i = mda.selectes.length + 1;
                }
            }
            if (!noExiste) {
                if (mda.selectes.length < mda.maxItemSelected) {
                    var label = dvn('<label>', {
                        text: obj.txt,
                        value: obj.value,
                        class: 'd-multiSelect-selected'
                    });
                    mda.objetos.itemSelect.append(
                        label.append(dvn('<em>', {
                            class: 'icon-x1',
                            click: function() {
                                var value = diving(label).attr('value');
                                for (var i = 0; i < mda.selectes.length; i++) {
                                    if (mda.selectes[i].value == value) {
                                        mda.selectes.splice(i, 1);
                                        //label.empty();
                                        label[0].remove();
                                    }
                                }
                            }
                        }))
                    );
                    mda.selectes.push(obj);
                    if (mda.change) {
                        mda.change.constructor = mda.objetos.inputText[0].onchange;
                        mda.change(mda);
                    }
                }
            }
            mda.objetos.list.addClass('d-hidden');
            mda.slt = -1;
        }
    };
    diving.widget(widget);
})();
/*grid*/
(function() {
    var widget = {
        name: "Grid",
        init: function(prm) {
            prm = diving.extend(prm, {
                class: "d-grid",
                scrollable: (prm.hasOwnProperty('scrollable')) ? prm.scrollable : false
            });
            var widtgetData = {
                elem: diving(this)[0],
                columns: (prm.columns) ? prm.columns : Object.keys(prm.dataSource.data[0]),
                editing: false,
                command: prm.commands || null,
                refresh: function() {
                    prm.dataSource = this.dataSource;
                    widget.createElement(prm, this);
                }
            };
            widget.createElement(prm, widtgetData);
            diving(this).data('div' + widget.name, widtgetData);
            widget.addCommand(prm.commands, widtgetData, widget, prm);
        },
        createElement: function(p, data) {
            diving(data.elem).empty();
            diving.extend(data, {
                dataSource: p.dataSource
            });
            if (typeof data.columns[0] == "string") {
                var oCols = [];
                diving.each(data.columns, function(i, v) {
                    oCols.push({
                        title: v,
                        field: v
                    });
                });
                data.columns = oCols;
            }
            var th = diving('<table>', {
                'd-role': 't-head'
            });
            var t = diving('<table>', {
                'd-role': 't-body'
            });
            var h = diving('<thead>', {});
            var b = diving('<tbody>', {});
            var cg = document.createElement('COLGROUP');
            var cgh = document.createElement('COLGROUP');
            var oCols = {
                h: [],
                b: []
            };
            diving.extend(data, {
                'd-head': h,
                'd-body': b
            });
            var ttal = data.columns.length + ((data.dataSource.grupo) ? data.dataSource.grupo.length : 0) + ((p.commands != null) ? p.commands.action.length : 0);
            for (var i = 0; i < ttal; i++) {
                var cl = document.createElement('COL');
                var clh = document.createElement('COL');
                cg.appendChild(cl);
                cgh.appendChild(clh);
                oCols.h.push(clh);
                oCols.b.push(cl);
            }
            this.createColumns(p, data, b, cg);
            this.createHeaders(p, data, h);
            if (p.title) {
                var cp = document.createElement('CAPTION');
                cp.appendChild(diving('<div>', {
                    class: 'd-caption-title',
                    text: p.title
                })[0]);
                th[0].appendChild(cp);
            }
            th[0].appendChild(cgh);
            t[0].appendChild(cg);
            var dhCnt = diving('<div>', {
                'd-role': 'd-content-header',
                class: 'd-grid-header' + ((p.scrollable) ? ' d-grid-scroll' : '')
            }).append(th.append(h));
            var dbCnt = diving('<div>', {
                'd-role': 'd-content-body',
                class: 'd-grid-body' + ((p.scrollable) ? ' d-grid-scroll' : '')
            }).append(t.append(b));
            data.elem.append(dhCnt[0]);
            data.elem.append(dbCnt[0]);
            diving.each(h.find('tr')[0].cells, function(i, v) {
                diving(oCols.b[i]).attr('style', 'width:' + diving(v)[0].offsetWidth + 'px');
            });
            if (p.scrollable) {
                dhCnt.attr('style', 'width:' + (diving(data.elem)[0].offsetWidth) + 'px;');
                dbCnt.attr('style', 'width:' + (diving(data.elem)[0].offsetWidth) + 'px;height:' + diving.addPx(p.height));
            } else if (p.height) {
                dbCnt.attr('style', 'overflow:hidden;height:' + diving.addPx(p.height));
            }
        },
        addCommand: function(command, data, widget, prm) {
            if ((command != null) ? command.action.includes('add') : false) {
                var caption = diving(diving(data.elem).find('table[d-role=t-head]')[0]).find('caption');
                var cmdR = diving('<div>', {
                    class: 'd-comand-row'
                });
                var cpt = diving('<div>', {
                    'd-role': 'd-content-command',
                    class: 'd-grid-command'
                }).append(cmdR);
                var cntCommand = null;
                if (caption.length == 0) {
                    cntCommand = document.createElement('CAPTION');
                    cntCommand.appendChild(cpt[0]);
                } else {
                    cntCommand = cpt;
                }
                diving(caption[0]).append(cntCommand);
                for (var i = 0; i < command.action.length; i++) {
                    if (command.action[i] == 'add') {
                        var cmd = diving('<div>');
                        cmdR.append(cmd);
                        diving(cmd).divButton({
                            type: 'default',
                            class: 'd-comand',
                            'd-role': 't-command',
                            'command': command.action[i],
                            text: command.action[i],
                            click: function() {
                                if (diving(this).attr('command') == 'add') {
                                    widget.addPopup(data, diving(data.elem), (command.hasOwnProperty('popup') ? command.popup : false));
                                } else if (diving(this).attr('command') == 'remove') {
                                    widget.removePopup(data.dataSource, diving(data.elem), (command.hasOwnProperty('popup') ? command.popup : false));
                                } else {
                                    widget.updatePopup(data.dataSource, diving(data.elem), (command.hasOwnProperty('popup') ? command.popup : false));
                                }
                            }
                        });
                    }
                }
            }
        },
        addPopup: function(dtSource, element, popup) {
            var g = element.data('divGrid');
            if (g.editing) return;
            g.editing = true;
            var flds = (Object.keys(g.dataSource.schema.model.fields).length > 0) ? g.dataSource.schema.model.fields : obj = diving.map(g.columns, function(i) {
                return {
                    [i.field]: {
                        type: 'string'
                    }
                };
            });
            var obj;
            if (obj != undefined) {
                obj = {};
                diving.each(flds, function(i, v) {
                    var k = Object.keys(v)[0];
                    obj[k] = {
                        type: v[k].type
                    };
                });
            } else {
                obj = flds;
            }
            var o = {};
            for (var i = 0, l = Object.keys(obj).length; i < l; i++) {
                var type = function(t, fld) {
                    return diving('<div>', {
                        'd-role': 'd-grid-edit-text',
                        'd-field': fld
                    });
                }
                o[Object.keys(obj)[i]] = type(obj[Object.keys(obj)[i]].type, Object.keys(obj)[i]);
            }
            diving.map(g.columns, function(a) {
                return (a.hasOwnProperty('template')) ? delete a.template : a;
            });
            var wdt = this;
            if (popup) {
                var confirmacion = diving('<div>', {
                    'd-role': 'notificacion',
                    class: 'd-col-4'
                });
                var dt = new diving.store.Source({
                    data: [o],
                    schema: {
                        model: {
                            fields: flds
                        }
                    }
                });
                var gg = diving('<div>');
                gg.divGrid({
                    dataSource: dt,
                    columns: g.columns
                });
                diving('body').append(confirmacion);
                confirmacion.divNotification({
                    confirm: true,
                    text: gg[0].innerHTML,
                    action: {
                        cancel: function() {
                            element.data('divGrid').editing = false;
                            confirmacion.data('divNotification').destroy();
                        },
                        confirm: function() {
                            var rtext = {};
                            diving.each(Object.keys(obj), function(i, v) {
                                var t = diving('div[d-field=' + v + ']').data('divText').text;
                                rtext[v] = (obj[v].type == 'number') ? parseInt(t) : t;
                            });
                            dtSource.dataSource.data.push(rtext);
                            wdt.createTr(element.data('divGrid')['d-body'], rtext, wdt, dtSource);
                            element.data('divGrid').editing = false;
                            confirmacion.data('divNotification').destroy();
                        }
                    },
                    destroy: function() {
                        element.data('divGrid').editing = false;
                        diving(this.elem).removeData('divNotification');
                        diving(this.elem)[0].remove();
                    }
                });
                confirmacion.attr('style', confirmacion.attr('style') + 'position: absolute;top: 5em;left: 10em;');
                var ttl = diving(confirmacion).find('div');
                diving.draggable(ttl[0], confirmacion[0]);
            } else {
                wdt.createTr(element.data('divGrid')['d-body'], o, wdt, dtSource);
            }
            var x1 = null;
            diving.each(
                Object.keys(obj),
                function(i, v) {
                    diving('div[d-field=' + v + ']').divText({
                        type: (obj[v].type == 'string') ? 'text' : obj[v].type,
                        keyup: function(k) {
                            if (!popup) {
                                var t = diving('div[d-field=' + v + ']');
                                while (((t != null) ? (t[0].nodeName != 'TR') : true)) {
                                    t = (t == null) ? diving(this) : diving(diving(t)[0].parentNode);
                                }
                                if (k.keyCode == 27) {
                                    t.remove();
                                }
                                if (k.keyCode == 13) {
                                    var nobj = {};
                                    diving.each(Object.keys(obj), function(i, v) {
                                        nobj[v] = (obj[v].type == 'number') ? parseInt(diving(o[v]).data('divText').text) : diving(o[v]).data('divText').text;
                                    });
                                    var dg = diving('div[d-field=' + v + ']');
                                    while (((dg != null) ? ((dg.attr('d-role') != null) ? dg.attr('d-role') != 'd-content-body' : true) : true)) {
                                        dg = (dg == null) ? diving(this) : diving(diving(dg)[0].parentNode);
                                    }
                                    dg = diving(dg[0].parentNode);
                                    dg.data('divGrid').dataSource.data.push(nobj);
                                    wdt.createTr(dg.data('divGrid')['d-body'], nobj, wdt, dg.data('divGrid').dataSource);
                                    dg.data('divGrid').editing = false;
                                    t.remove();
                                }
                            }
                        }
                    });
                    if (i == 0) {
                        diving('div[d-field=' + v + ']').find('INPUT')[0].focus();
                    }
                }
            );
        },
        removePopup: function(data, element) {
            var t = diving(element);
            while (((t != null) ? (t[0].nodeName != 'TR') : true)) {
                t = (t == null) ? diving(this) : diving(diving(t)[0].parentNode);
            }
            diving.each(data.relate, function(i, v) {
                if (t[0] == v.tagTr[0]) {
                    diving.each(data.dataSource.data, function(x, y) {
                        if (y['d-row-item'] == v.obj['d-row-item']) {
                            var dx = data.dataSource.data.splice(x, 1);
                            var dy = data.relate.splice(i, 1);
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
        updatePopup: function(data, element, popup) {
            var g = diving(data.elem).data('divGrid');
            if (g.editing) return;
            g.editing = true;
            diving.map(g.columns, function(a) {
                return (a.hasOwnProperty('template')) ? delete a.template : a;
            });
            var flds = (Object.keys(g.dataSource.schema.model.fields).length > 0) ? g.dataSource.schema.model.fields : obj = diving.map(g.columns, function(i) {
                return {
                    [i.field]: {
                        type: 'string'
                    }
                };
            });
            var obj;
            if (obj != undefined) {
                obj = {};
                diving.each(flds, function(i, v) {
                    var k = Object.keys(v)[0];
                    obj[k] = {
                        type: v[k].type
                    };
                });
            } else {
                obj = flds;
            }
            var o = {};
            for (var i = 0, l = Object.keys(obj).length; i < l; i++) {
                var type = function(t, fld) {
                    return diving('<div>', {
                        'd-role': 'd-grid-edit-text',
                        'd-field': fld
                    });
                }
                o[Object.keys(obj)[i]] = type(obj[Object.keys(obj)[i]].type, Object.keys(obj)[i])[0].innerHTML;
            }
            var wdt = this;

            var t = diving(element);
            while (((t != null) ? (t[0].nodeName != 'TR') : true)) {
                t = (t == null) ? diving(this) : diving(diving(t)[0].parentNode);
            }
            var a, value;
            diving.each(data.relate, function(i, v) {
                if (t[0] == v.tagTr[0]) {
                    diving.each(data.dataSource.data, function(x, y) {
                        if (y['d-row-item'] == v.obj['d-row-item']) {
                            a = x;
                            value = y;
                            return false;
                        }
                    });
                    return false;
                }
            });
            diving.each(t[0].cells, function(i, v) {
                if (diving(v).attr('d-role') == 'd-cel') {
                    var ov = diving(v).attr('d-field');
                    o[ov] = value[ov];
                    var nodo = diving('<div>');
                    nodo.divText({
                        type: flds[ov].type,
                        value: o[ov],
                        'd-field': ov,
                        keyup: function(e) {
                            var vlue = diving(nodo).data('divText').text;
                            o[ov] = (flds[ov].type == 'number') ? parseInt(vlue) : vlue;
                            if (e.keyCode == 13) {
                                var objData = data.dataSource.data[a];
                                diving.each(Object.keys(objData), function(x, y) {
                                    if (o.hasOwnProperty(y)) {
                                        data.dataSource.data[a][y] = o[y];
                                    }
                                });
                                g.dataSource.setData(data.dataSource.data);
                                g.editing = false;
                                g.refresh();
                            }
                        }
                    });
                    if (popup) {} else {
                        diving(v).empty();
                        diving(v).append(
                            nodo
                        );
                    }
                }
            });
        },
        createColumns: function(p, data, body) {
            var wdgt = this;
            for (var i = p.dataSource.view().length - 1; i >= 0; i--) {
                var keys = Object.keys(p.dataSource.view()[i]);
                wdgt.createTr(body, p.dataSource.view()[i], wdgt, data);
            }
        },
        createTr: function(content, fields, wdgt, data) {
            //console.log('\ncontent:', content,'\nfields:', fields,'\nwdgt:', wdgt,'\ndata:', data );
            var ks;
            if (fields.hasOwnProperty('items')) {
                var tr = diving('<tr>', {
                    class: 'd-grid-tr d-grid-tr-group',
                    'd-rownum': content[0].rows.length,
                    'd-field': fields.field,
                    'd-ctr-clpse': 0
                });
                ks = Object.keys(fields.items);
                var rg = -1;
                var textoGrupo = '';
                for (var i = 0; i < data.dataSource.grupo.length; i++) {
                    textoGrupo = data.dataSource.grupo[i].field;
                    if (data.dataSource.grupo[i].field == fields.field) {
                        tr.append(wdgt.createTd(diving('<em>', {
                            class: 'icon-chevron-up1'
                        }), 0));
                        tr.attr('d-ctr-clpse', i);
                        rg++;
                        break;
                    } else {
                        rg++;
                        tr.append(wdgt.createTd('', 0));
                    }
                }
                var td = wdgt.createTd(textoGrupo + ':' + fields.value, ((data.dataSource.grupo.length - rg) + data.columns.length));
                tr[0].onclick = function(e) {
                    wdgt.colapseGrid(tr, td, content);
                    diving(diving(this).find('em')[0]).toggleClass('icon-chevron-down1');
                    diving(diving(this).find('em')[0]).toggleClass('icon-chevron-up1');
                }
                tr.append(td);
                content.append(tr);
                for (var i = 0; i < fields.items.length; i++) {
                    wdgt.createTr(content, fields.items[i], wdgt, data);
                }
            } else {
                var rlate = (data.hasOwnProperty('relate') ? data.relate : data.relate = []);
                ks = Object.keys(fields);
                var tr = diving('<tr>', {
                    class: 'd-grid-tr',
                    'd-row-class': 'item',
                    'd-rownum': content[0].rows.length
                });
                rlate.push({
                    obj: fields,
                    tagTr: tr
                });
                if (data.dataSource.grupo)
                    for (var j = 0; j < data.dataSource.grupo.length; j++) {
                        tr.append(wdgt.createTd('', null));
                    }
                for (var j = 0; j < ks.length; j++) {
                    for (var k = 0; k < data.columns.length; k++) {
                        if (data.columns[k].field == ks[j]) {
                            tr.append(
                                wdgt.createTd(
                                    (data.columns[k].hasOwnProperty('template') ?
                                        diving.template(data.columns[k].template, fields) :
                                        fields[ks[j]]),
                                    null, {
                                        'd-role': 'd-cel',
                                        'd-field': ks[j]
                                    }
                                )
                            );
                        }
                    }
                }
                if ((data.command != null) ? data.command.hasOwnProperty('action') ? data.command.action.includes('update') : false : false) {
                    tr.append(
                        wdgt.createTd(
                            diving('<em>', {
                                class: 'icon-pen-angled',
                                click: function() {
                                    wdgt.updatePopup(data, this, data.command.popup);
                                }
                            }),
                            null, {
                                'd-role': 'd-edit-cel'
                            }
                        )
                    );
                }
                if ((data.command != null) ? data.command.hasOwnProperty('action') ? data.command.action.includes('remove') : false : false) {
                    tr.append(
                        wdgt.createTd(
                            diving('<em>', {
                                class: 'icon-clearclose',
                                click: function() {
                                    wdgt.removePopup(data, this);
                                }
                            }),
                            null, {
                                'd-role': 'd-remove-cel'
                            }
                        )
                    );
                }
                content.append(tr);
            }
        },
        createTd: function(text, clspan, params) {
            var td = diving('<td>');
            if (params) {
                diving.each(Object.keys(params), function(i, v) {
                    td.attr(v, params[v]);
                });
            }
            td.append(text);
            if (clspan) {
                td.attr('colspan', clspan);
            }
            return td;
        },
        createHeaders: function(p, data, header) {
            var tr = diving('<tr>');
            if (data.dataSource.grupo)
                for (var i = 0; i < data.dataSource.grupo.length; i++) {
                    tr.append(diving('<th>'));
                }
            for (var i = 0; i < data.columns.length; i++) {
                tr.append(diving('<th>', {
                    text: data.columns[i].title
                }));
            }

            if ((data.command != null) ? data.command.hasOwnProperty('action') ? data.command.action.includes('update') : false : false) {
                tr.append(
                    diving('<th>', {})
                );
            }
            if ((data.command != null) ? data.command.hasOwnProperty('action') ? data.command.action.includes('remove') : false : false) {
                tr.append(
                    diving('<th>', {})
                );
            }
            header.append(tr);
        },
        colapseGrid: function(tr, td, cnt) {
            var grupo = tr.attr('d-field');
            var clpse = tr.attr('d-ctr-clpse');
            for (var i = (parseInt(tr.attr('d-rownum')) + 1); i < cnt[0].rows.length; i++) {
                if (diving(cnt[0].rows[i]).attr('d-field') != grupo) {
                    if (parseInt(diving(cnt[0].rows[i]).attr('d-ctr-clpse')) < clpse) {
                        break;
                    } else {
                        var dhb = diving(cnt[0].rows[i]).attr('d-hid-by');
                        if (((dhb != null) ? dhb : grupo) == grupo) {
                            diving(cnt[0].rows[i]).toggleClass('d-hidden');
                            if (diving.className.has(cnt[0].rows[i], 'd-hidden')) {
                                diving(cnt[0].rows[i]).attr('d-hid-by', grupo);
                            } else {
                                diving(cnt[0].rows[i]).removeAttr('d-hid-by');
                            }
                        }
                    }
                } else {
                    break;
                }
            }
        }
    };
    diving.widget(widget);
})();
/*
Menu
*/
(function() {
    var widget = {
        name: "Menu",
        init: function(prm) {
            prm = diving.extend(prm, {
                class: "d-menu-content" + (prm.hasOwnProperty('class') ? ' ' + prm.class : ''),
                vertical: (prm.hasOwnProperty('vertical')) ? prm.vertical : false
            });
            var widtgetData = {
                elem: diving(this)[0],
                dta: prm.data,
                class: prm.class,
                vertical: prm.vertical,
                actions: prm.actions
            };
            widget.createElement(prm, widtgetData);
            diving(this).data('div' + widget.name, widtgetData);
        },
        createElement: function(p, data) {
            diving(data.elem).empty();
            diving(data.elem).addClass(p.class);
            var ul = diving('<ul>', {
                class: 'd-menu' + ((p.hasOwnProperty('vertical')) ? (p.vertical) ? ' d-menu-vertical' : '' : '')
            });
            var wgt = this;
            diving.extend(data, {
                elementos: [],
                refresh: wgt.refresh,
                setData: wgt.setData
            });

            diving.each(data.dta, function(i, v) {
                wgt.addItem(ul, v, p, data, wgt);
            });
            diving(data.elem).append(ul);
        },
        addItem: function(content, element, parameters, data, wgt) {
            var textito = diving('<div>', {
                text: element.text
            });
            var li = diving('<li>', {
                'href': element.href,
                class: 'd-menu-item' + (element.hasOwnProperty('class') ? ' ' + element.class : ''),
                click: function() {
                    if (element.hasOwnProperty('openTo')) {
                        var op = (typeof element.openTo == 'string') ? diving(element.openTo) : element.openTo;
                        op.empty();
                        loadHref(op, element.href);
                    } else {
                        window.location.href = element.href;
                    }
                }
            }).append(textito);
            data.elementos.push(li);
            if (parameters.hasOwnProperty('actions')) {
                for (var i = 0; i < parameters.actions.length; i++) {
                    if (parameters.actions[i].field == element.field) {
                        li[0].onclick = function() {
                            parameters.actions[i].action.constructor = li[0].onclick;
                            parameters.actions[i].action();
                        }
                        break;
                    }
                }
            }
            if (element.hasOwnProperty('items')) {
                var ul = diving('<ul>', {
                    class: 'd-submenu'
                });
                for (var i = 0; i < element.items.length; i++) {
                    wgt.addItem(ul, element.items[i], parameters, data, wgt);
                }
                li.append(ul);
            }
            content.append(li);
        },
        refresh: function() {
            var dta = {
                elem: this.elem,
                dta: this.dta
            };
            var p = {
                class: this.class,
                vertical: this.vertical,
                actions: this.actions
            };
            widget.createElement(p, dta);
        },
        setData: function(data) {
            this.dta = [];
            this.dta = data;
            this.refresh();
        }
    };
    diving.widget(widget);
})();





/*window*/
(function() {
    var widget = {
        name: "Window",
        init: function(prm) {
            prm = diving.extend(prm, {
                class: "d-window-content" + (prm.hasOwnProperty('class') ? ' ' + prm.class : ''),
                estilo: 'width:' + (diving.addPx(prm.width) || diving.addPx(100)) +
                    ";height:" + (diving.addPx(prm.height) || diving.addPx(50)) + ";z-index:0;",
                ajustaMargen: widget.ajustaMargen,
                dRoles: ['t', 'l', 'b', 'r', 'tl', 'bl', 'br', 'tr'],
                wDraggable: widget.wdraggable,
                resizable: prm.resizable || true
            });
            var widtgetData = {
                elem: diving(this)[0],
                class: prm.class,
                actions: prm.actions,
                modal: prm.modal || false,
                close: widget.close,
                open: widget.open,
                destroy: widget.destroy,
                center: widget.center
            };
            widget.createElement(prm, widtgetData);
            diving(this).data('div' + widget.name, widtgetData);
        },
        createElement: function(p, data) {
            diving(data.elem).empty();
            diving(data.elem).attr('style', 'width:0;height:0;');
            var expando = diving.expando;
            if (p.hasOwnProperty('modal')) {
                if (p.modal) {
                    diving(data.elem).append(
                        diving('<div>', {
                            class: 'd-window-modal'
                        })
                    );
                }
            }
            var ventana = diving('<div>', {
                style: p.estilo,
                class: p.class,
                'd-role': 'divWindow',
                ui: expando
            });
            diving(data.elem).append(ventana);
            var title = diving('<div>', {
                class: 'd-window-title',
                text: p.hasOwnProperty('title') ? p.title : '&nbsp;'
            });
            ventana.append(title);
            p['title'] = title;
            p.wDraggable(title[0], ventana[0]);

            var acts = [{
                elem: diving('<em>', {
                    class: 'icon-minus3',
                    click: function() {
                        if (widget.maximize)
                            return;
                        var wbd = diving(diving(this).parent().parent().parent()).find('.d-window-body');
                        var ttl = (diving(this).parent().parent())[0].getBoundingClientRect();
                        wbd.toggleClass('d-hidden');
                        if (wbd.hasClass('d-hidden')) {
                            diving(diving(this).parent().parent().parent())[0].style.height = ttl.height + "px";
                        } else {
                            diving(diving(this).parent().parent().parent())[0].style.height = widget.rect.height + 'px';
                        }
                    }
                }),
                visible: false,
                name: 'minimize'
            }, {
                elem: diving('<em>', {
                    class: 'icon-add',
                    click: function() {
                        var wbd = diving(diving(this).parent().parent().parent()).find('.d-window-body');
                        if (wbd.hasClass('d-hidden'))
                            wbd.toggleClass('d-hidden');
                        if (!widget.maximize) {
                            diving(diving(this).parent().parent().parent())[0].style.width = 'calc(100% - 2px)';
                            diving(diving(this).parent().parent().parent())[0].style.height = 'calc(100% - 2px)';
                            diving(diving(this).parent().parent().parent())[0].style.top = "0px";
                            diving(diving(this).parent().parent().parent())[0].style.left = "0px";
                            widget.maximize = true;
                        } else {
                            diving(diving(this).parent().parent().parent())[0].style.width = widget.rect.width + "px";
                            diving(diving(this).parent().parent().parent())[0].style.height = widget.rect.height + "px";
                            diving(diving(this).parent().parent().parent())[0].style.top = widget.rect.top + "px";
                            diving(diving(this).parent().parent().parent())[0].style.left = widget.rect.left + "px";
                            widget.maximize = false;
                        }
                    }
                }),
                visible: false,
                name: 'maximize'
            }, {
                elem: diving('<em>', {
                    class: 'icon-error',
                    click: function() {
                        var dw = (diving(diving(this).parent().parent().parent().parent())).data('divWindow');
                        dw.close();
                    }
                }),
                visible: false,
                name: 'close'
            }];

            var actions = diving('<div>', {
                class: 'd-window-actions'
            });
            for (var a = 0; a < acts.length; a++) {
                for (var i = 0; i < p.actions.length; i++) {
                    if (acts[a].name == p.actions[i]) {
                        acts[a].visible = true;
                    }
                }
                if (acts[a].visible) {
                    actions.append(acts[a].elem);
                }
            }
            title.append(actions);
            if (p.hasOwnProperty('resizable')) {
                if (p.resizable) {
                    setTimeout(function() {
                        diving.each(p.dRoles, function(i, v) {
                            diving(data.elem).append(
                                diving('<div>', {
                                    class: 'd-window-ajuste',
                                    'd-role': "w_" + v,
                                    'd-roleTo': v
                                })
                            );
                        });
                        p.ajustaMargen(p, data, ventana);
                    }, 100);
                }
            }
            var wBody = diving('<div>', {
                'd-role': 'd-window-body',
                class: 'd-window-body'
            });
            wBody.append(p.content);
            ventana.append(wBody);
            wBody[0].style.overflowY = (p.hasOwnProperty('scrollable') ? 'scroll' : '');
            widget.rect = ventana[0].getBoundingClientRect();
        },
        center: function() {
            diving(this.elem.querySelector('.d-window-content')).center();
        },
        destroy: function() {
            diving(this.elem).removeData('div' + widget.name);
            diving(this.elem)[0].remove();
        },
        close: function() {
            diving(this.elem).addClass('d-hidden');
        },
        open: function() {
            diving(this.elem).removeClass('d-hidden');
        },
        ajustaMargen: function(p, data, elem) {
            var ui = diving(elem).attr('ui');
            var vth = elem[0].getBoundingClientRect();
            diving.each(p.dRoles, function(i, v) {
                var element = diving(data.elem).find('div[d-roleTo=' + v + ']')[0];
                var stl = 'background-color:transparent; position:absolute;cursor:';
                switch (v) {
                    case 'b':
                        stl += "n-resize; left:" + vth.left + "px;         top:" + (vth.y + vth.height) + "px;width:" + vth.width + "px;height:6px;";
                        break;
                    case 't':
                        stl += "n-resize; left:" + vth.left + "px;         top:" + vth.y + "px;             width:" + vth.width + "px;height:6px;";
                        break;
                    case 'tl':
                        stl += "nw-resize;left:" + vth.x + "px;            top:" + vth.y + "px;             width:6px;            height:6px;";
                        break;
                    case 'l':
                        stl += "e-resize; left:" + vth.x + "px;            top:" + vth.y + "px;             width:6px;            height:" + vth.height + "px;";
                        break;
                    case 'r':
                        stl += "ew-resize;left:" + (vth.x + vth.width) + "px;top:" + vth.y + "px;             width:6px;            height:" + vth.height + "px;";
                        break;
                    case 'tr':
                        stl += "ne-resize;left:" + (vth.x + vth.width) + "px;top:" + vth.y + "px;             width:6px;            height:4px;";
                        break;
                    case 'br':
                        stl += "nw-resize;left:" + (vth.x + vth.width) + "px;top:" + (vth.y + vth.height) + "px;width:6px;            height:6px;";
                        break;
                    case 'bl':
                        stl += "ne-resize;left:" + vth.x + "px;            top:" + (vth.y + vth.height) + "px;width:6px;            height:6px;";
                        break;
                    default:
                        stl = "display:none";
                        break;
                }
                diving(element).attr('style', stl);
                widget.dragElement(element, elem, p, data);
            });
        },
        wdraggable: function(title, content) {
            var px = 0,
                py = 0;
            var dragObj = null;
            var obj = content || title;
            obj.style.position = "absolute";
            title.addEventListener('mousedown', function() {
                obj.addEventListener('mousedown', onMouseDown);

                function onMouseDown(a) {
                    if (widget.maximize) {
                        return;
                    }
                    px = a.layerX;
                    py = a.layerY;
                    dragObj = obj;
                }
                obj.addEventListener('mouseup', function(e) {
                    obj.removeEventListener('mousedown', onMouseDown, false);
                    dragObj = null;
                });
                obj.addEventListener('mousemove', function(e) {
                    var x = e.pageX - px;
                    var y = e.pageY - py;
                    if (dragObj == null)
                        return;
                    dragObj.style.left = x + "px";
                    dragObj.style.top = y + "px";
                    var dt = diving(content).parent().find('div[d-roleTo=t]')[0],
                        dl = diving(content).parent().find('div[d-roleTo=l]')[0],
                        dr = diving(content).parent().find('div[d-roleTo=r]')[0],
                        db = diving(content).parent().find('div[d-roleTo=b]')[0],
                        dtr = diving(content).parent().find('div[d-roleTo=tr]')[0],
                        dtl = diving(content).parent().find('div[d-roleTo=tl]')[0],
                        dbr = diving(content).parent().find('div[d-roleTo=br]')[0],
                        dbl = diving(content).parent().find('div[d-roleTo=bl]')[0];
                    dt.style.left = dl.style.left = dtl.style.left = dbl.style.left = db.style.left = x + 'px';
                    dt.style.top = dl.style.top = dtl.style.top = dtr.style.top = dr.style.top = y + "px";
                    var vth = dragObj.getBoundingClientRect();
                    dtr.style.left = dr.style.left = dbr.style.left = (x + vth.width) + 'px';
                    dbl.style.top = db.style.top = dbr.style.top = (y + vth.height) + 'px';
                    widget.rect = vth;
                });
            });
        },
        dragElement: function(elmnt, ventana, p, data) {
            var pos1 = 0,
                pos2 = 0,
                pos3 = 0,
                pos4 = 0;
            elmnt.onmousedown = dragMouseDown;

            function dragMouseDown(e) {
                e = e || window.event;
                e.preventDefault();
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                document.onmousemove = elementDrag;
            }

            function elementDrag(e) {
                e = e || window.event;
                e.preventDefault();
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                var vbc = ventana[0].getBoundingClientRect();
                var dt = diving(elmnt).parent().find('div[d-roleTo=t]')[0],
                    dl = diving(elmnt).parent().find('div[d-roleTo=l]')[0],
                    dr = diving(elmnt).parent().find('div[d-roleTo=r]')[0],
                    db = diving(elmnt).parent().find('div[d-roleTo=b]')[0],
                    dtr = diving(elmnt).parent().find('div[d-roleTo=tr]')[0],
                    dtl = diving(elmnt).parent().find('div[d-roleTo=tl]')[0],
                    dbr = diving(elmnt).parent().find('div[d-roleTo=br]')[0],
                    dbl = diving(elmnt).parent().find('div[d-roleTo=bl]')[0];
                switch (diving(elmnt).attr('d-roleTo')) {
                    case 't':
                        ventana[0].style.top = dr.style.top = dl.style.top = dtr.style.top = dtl.style.top = elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                        ventana[0].style.height = dl.style.height = dr.style.height = db.offsetTop - (elmnt.offsetTop - pos2) + 'px';
                        break;
                    case 'l':
                        db.style.left = dtl.style.left = dbl.style.left = dt.style.left = ventana[0].style.left = elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px';
                        ventana[0].style.width = dt.style.width = db.style.width = dr.offsetLeft - (elmnt.offsetLeft - pos1) + "px";
                        break;
                    case 'b':
                        dbr.style.top = dbl.style.top = elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                        dl.style.height = dr.style.height = ventana[0].style.height = ((elmnt.offsetTop - pos2) - vbc.top) + 'px';
                        break;
                    case 'r':
                        dtr.style.left = dbr.style.left = elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
                        dt.style.width = db.style.width = ventana[0].style.width = ((elmnt.offsetLeft - pos1) - vbc.left) + 'px';
                        break;
                    case 'tr':
                        dr.style.left = dbr.style.left = elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
                        ventana[0].style.top = dl.style.top = dr.style.top = dt.style.top = dtl.style.top = elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                        dt.style.width = db.style.width = ventana[0].style.width = ((elmnt.offsetLeft - pos1) - vbc.left) + 'px';
                        dl.style.height = dr.style.height = ventana[0].style.height = (db.offsetTop - (elmnt.offsetTop - pos2)) + 'px';
                        break;
                    case 'tl':
                        ventana[0].style.top = dl.style.top = dr.style.top = dt.style.top = dtr.style.top = elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                        ventana[0].style.left = dt.style.left = db.style.left = dl.style.left = dbl.style.left = elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px';
                        dl.style.height = dr.style.height = ventana[0].style.height = (db.offsetTop - (elmnt.offsetTop - pos2)) + 'px';
                        dt.style.width = db.style.width = ventana[0].style.width = dr.offsetLeft - (elmnt.offsetLeft - pos1) + "px";
                        break;
                    case 'br':
                        db.style.top = dbl.style.top = elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                        dr.style.left = dtr.style.left = elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
                        dl.style.height = dr.style.height = ventana[0].style.height = ((elmnt.offsetTop - pos2) - vbc.top) + 'px';
                        db.style.width = dt.style.width = ventana[0].style.width = ((elmnt.offsetLeft - pos1) - vbc.left) + 'px';
                        break;
                    case 'bl':
                        db.style.top = dbr.style.top = elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                        dt.style.left = db.style.left = dl.style.left = dtl.style.left = ventana[0].style.left = elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px';
                        dl.style.height = dr.style.height = ventana[0].style.height = ((elmnt.offsetTop - pos2) - vbc.top) + 'px';
                        dt.style.width = db.style.width = ventana[0].style.width = (dr.offsetLeft - (elmnt.offsetLeft - pos1)) + "px";
                        break;
                }
                widget.rect = vbc;

                if (p.hasOwnProperty('resize')) {
                    p.resize.prototype = data.resize;
                    p.resize();
                }
            }

            function closeDragElement() {
                document.onmouseup = null;
                document.onmousemove = null;
            }
        },
        rect: null,
        maximize: false
    };
    diving.widget(widget);
})();







/*listView*
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
                domList:ul//,template:p.template||null
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
                document.createTextNode(obj.text));
            dlv.domList.append(li);
        }
    };
    diving.widget(widget);
})();*/