var JSON;if(!JSON){JSON={}}(function(){function f(n){return n<10?"0"+n:n}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+string+'"'}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==="object"&&typeof value.toJSON==="function"){value=value.toJSON(key)}if(typeof rep==="function"){value=rep.call(holder,key,value)}switch(typeof value){case"string":return quote(value);case"number":return isFinite(value)?String(value):"null";case"boolean":case"null":return String(value);case"object":if(!value){return"null"}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==="[object Array]"){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||"null"}v=partial.length===0?"[]":gap?"[\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"]":"["+partial.join(",")+"]";gap=mind;return v}if(rep&&typeof rep==="object"){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==="string"){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}v=partial.length===0?"{}":gap?"{\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"}":"{"+partial.join(",")+"}";gap=mind;return v}}if(typeof JSON.stringify!=="function"){JSON.stringify=function(value,replacer,space){var i;gap="";indent="";if(typeof space==="number"){for(i=0;i<space;i+=1){indent+=" "}}else{if(typeof space==="string"){indent=space}}rep=replacer;if(replacer&&typeof replacer!=="function"&&(typeof replacer!=="object"||typeof replacer.length!=="number")){throw new Error("JSON.stringify")}return str("",{"":value})}}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==="object"){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v}else{delete value[k]}}}}return reviver.call(holder,key,value)}text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")}}}());;/*! jQuery Migrate v1.3.0 | (c) jQuery Foundation and other contributors | jquery.org/license */
"undefined"==typeof jQuery.migrateMute&&(jQuery.migrateMute=!0),function(a,b,c){function d(c){var d=b.console;f[c]||(f[c]=!0,a.migrateWarnings.push(c),d&&d.warn&&!a.migrateMute&&(d.warn("JQMIGRATE: "+c),a.migrateTrace&&d.trace&&d.trace()))}function e(b,c,e,f){if(Object.defineProperty)try{return void Object.defineProperty(b,c,{configurable:!0,enumerable:!0,get:function(){return d(f),e},set:function(a){d(f),e=a}})}catch(g){}a._definePropertyBroken=!0,b[c]=e}a.migrateVersion="1.3.0";var f={};a.migrateWarnings=[],!a.migrateMute&&b.console&&b.console.log&&b.console.log("JQMIGRATE: Logging is active"),a.migrateTrace===c&&(a.migrateTrace=!0),a.migrateReset=function(){f={},a.migrateWarnings.length=0},"BackCompat"===document.compatMode&&d("jQuery is not compatible with Quirks Mode");var g=a("<input/>",{size:1}).attr("size")&&a.attrFn,h=a.attr,i=a.attrHooks.value&&a.attrHooks.value.get||function(){return null},j=a.attrHooks.value&&a.attrHooks.value.set||function(){return c},k=/^(?:input|button)$/i,l=/^[238]$/,m=/^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,n=/^(?:checked|selected)$/i;e(a,"attrFn",g||{},"jQuery.attrFn is deprecated"),a.attr=function(b,e,f,i){var j=e.toLowerCase(),o=b&&b.nodeType;return i&&(h.length<4&&d("jQuery.fn.attr( props, pass ) is deprecated"),b&&!l.test(o)&&(g?e in g:a.isFunction(a.fn[e])))?a(b)[e](f):("type"===e&&f!==c&&k.test(b.nodeName)&&b.parentNode&&d("Can't change the 'type' of an input or button in IE 6/7/8"),!a.attrHooks[j]&&m.test(j)&&(a.attrHooks[j]={get:function(b,d){var e,f=a.prop(b,d);return f===!0||"boolean"!=typeof f&&(e=b.getAttributeNode(d))&&e.nodeValue!==!1?d.toLowerCase():c},set:function(b,c,d){var e;return c===!1?a.removeAttr(b,d):(e=a.propFix[d]||d,e in b&&(b[e]=!0),b.setAttribute(d,d.toLowerCase())),d}},n.test(j)&&d("jQuery.fn.attr('"+j+"') might use property instead of attribute")),h.call(a,b,e,f))},a.attrHooks.value={get:function(a,b){var c=(a.nodeName||"").toLowerCase();return"button"===c?i.apply(this,arguments):("input"!==c&&"option"!==c&&d("jQuery.fn.attr('value') no longer gets properties"),b in a?a.value:null)},set:function(a,b){var c=(a.nodeName||"").toLowerCase();return"button"===c?j.apply(this,arguments):("input"!==c&&"option"!==c&&d("jQuery.fn.attr('value', val) no longer sets properties"),void(a.value=b))}};var o,p,q=a.fn.init,r=a.parseJSON,s=/^\s*</,t=/^([^<]*)(<[\w\W]+>)([^>]*)$/;a.fn.init=function(b,e,f){var g,h;return b&&"string"==typeof b&&!a.isPlainObject(e)&&(g=t.exec(a.trim(b)))&&g[0]&&(s.test(b)||d("$(html) HTML strings must start with '<' character"),g[3]&&d("$(html) HTML text after last tag is ignored"),"#"===g[0].charAt(0)&&(d("HTML string cannot start with a '#' character"),a.error("JQMIGRATE: Invalid selector string (XSS)")),e&&e.context&&(e=e.context),a.parseHTML)?q.call(this,a.parseHTML(g[2],e&&e.ownerDocument||e||document,!0),e,f):("#"===b&&(d("jQuery( '#' ) is not a valid selector"),b=[]),h=q.apply(this,arguments),b&&b.selector!==c?(h.selector=b.selector,h.context=b.context):(h.selector="string"==typeof b?b:"",b&&(h.context=b.nodeType?b:e||document)),h)},a.fn.init.prototype=a.fn,a.parseJSON=function(a){return a?r.apply(this,arguments):(d("jQuery.parseJSON requires a valid JSON string"),null)},a.uaMatch=function(a){a=a.toLowerCase();var b=/(chrome)[ \/]([\w.]+)/.exec(a)||/(webkit)[ \/]([\w.]+)/.exec(a)||/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(a)||/(msie) ([\w.]+)/.exec(a)||a.indexOf("compatible")<0&&/(mozilla)(?:.*? rv:([\w.]+)|)/.exec(a)||[];return{browser:b[1]||"",version:b[2]||"0"}},a.browser||(o=a.uaMatch(navigator.userAgent),p={},o.browser&&(p[o.browser]=!0,p.version=o.version),p.chrome?p.webkit=!0:p.webkit&&(p.safari=!0),a.browser=p),e(a,"browser",a.browser,"jQuery.browser is deprecated"),a.boxModel=a.support.boxModel="CSS1Compat"===document.compatMode,e(a,"boxModel",a.boxModel,"jQuery.boxModel is deprecated"),e(a.support,"boxModel",a.support.boxModel,"jQuery.support.boxModel is deprecated"),a.sub=function(){function b(a,c){return new b.fn.init(a,c)}a.extend(!0,b,this),b.superclass=this,b.fn=b.prototype=this(),b.fn.constructor=b,b.sub=this.sub,b.fn.init=function(d,e){var f=a.fn.init.call(this,d,e,c);return f instanceof b?f:b(f)},b.fn.init.prototype=b.fn;var c=b(document);return d("jQuery.sub() is deprecated"),b},a.fn.size=function(){return d("jQuery.fn.size() is deprecated; use the .length property"),this.length};var u=!1;a.swap&&a.each(["height","width","reliableMarginRight"],function(b,c){var d=a.cssHooks[c]&&a.cssHooks[c].get;d&&(a.cssHooks[c].get=function(){var a;return u=!0,a=d.apply(this,arguments),u=!1,a})}),a.swap=function(a,b,c,e){var f,g,h={};u||d("jQuery.swap() is undocumented and deprecated");for(g in b)h[g]=a.style[g],a.style[g]=b[g];f=c.apply(a,e||[]);for(g in b)a.style[g]=h[g];return f},a.ajaxSetup({converters:{"text json":a.parseJSON}});var v=a.fn.data;a.fn.data=function(b){var e,f,g=this[0];return!g||"events"!==b||1!==arguments.length||(e=a.data(g,b),f=a._data(g,b),e!==c&&e!==f||f===c)?v.apply(this,arguments):(d("Use of jQuery.fn.data('events') is deprecated"),f)};var w=/\/(java|ecma)script/i;a.clean||(a.clean=function(b,c,e,f){c=c||document,c=!c.nodeType&&c[0]||c,c=c.ownerDocument||c,d("jQuery.clean() is deprecated");var g,h,i,j,k=[];if(a.merge(k,a.buildFragment(b,c).childNodes),e)for(i=function(a){return!a.type||w.test(a.type)?f?f.push(a.parentNode?a.parentNode.removeChild(a):a):e.appendChild(a):void 0},g=0;null!=(h=k[g]);g++)a.nodeName(h,"script")&&i(h)||(e.appendChild(h),"undefined"!=typeof h.getElementsByTagName&&(j=a.grep(a.merge([],h.getElementsByTagName("script")),i),k.splice.apply(k,[g+1,0].concat(j)),g+=j.length));return k});var x=a.event.add,y=a.event.remove,z=a.event.trigger,A=a.fn.toggle,B=a.fn.live,C=a.fn.die,D=a.fn.load,E="ajaxStart|ajaxStop|ajaxSend|ajaxComplete|ajaxError|ajaxSuccess",F=new RegExp("\\b(?:"+E+")\\b"),G=/(?:^|\s)hover(\.\S+|)\b/,H=function(b){return"string"!=typeof b||a.event.special.hover?b:(G.test(b)&&d("'hover' pseudo-event is deprecated, use 'mouseenter mouseleave'"),b&&b.replace(G,"mouseenter$1 mouseleave$1"))};a.event.props&&"attrChange"!==a.event.props[0]&&a.event.props.unshift("attrChange","attrName","relatedNode","srcElement"),a.event.dispatch&&e(a.event,"handle",a.event.dispatch,"jQuery.event.handle is undocumented and deprecated"),a.event.add=function(a,b,c,e,f){a!==document&&F.test(b)&&d("AJAX events should be attached to document: "+b),x.call(this,a,H(b||""),c,e,f)},a.event.remove=function(a,b,c,d,e){y.call(this,a,H(b)||"",c,d,e)},a.each(["load","unload","error"],function(b,c){a.fn[c]=function(){var a=Array.prototype.slice.call(arguments,0);return d("jQuery.fn."+c+"() is deprecated"),"load"===c&&"string"==typeof arguments[0]?D.apply(this,arguments):(a.splice(0,0,c),arguments.length?this.bind.apply(this,a):(this.triggerHandler.apply(this,a),this))}}),a.fn.toggle=function(b,c){if(!a.isFunction(b)||!a.isFunction(c))return A.apply(this,arguments);d("jQuery.fn.toggle(handler, handler...) is deprecated");var e=arguments,f=b.guid||a.guid++,g=0,h=function(c){var d=(a._data(this,"lastToggle"+b.guid)||0)%g;return a._data(this,"lastToggle"+b.guid,d+1),c.preventDefault(),e[d].apply(this,arguments)||!1};for(h.guid=f;g<e.length;)e[g++].guid=f;return this.click(h)},a.fn.live=function(b,c,e){return d("jQuery.fn.live() is deprecated"),B?B.apply(this,arguments):(a(this.context).on(b,this.selector,c,e),this)},a.fn.die=function(b,c){return d("jQuery.fn.die() is deprecated"),C?C.apply(this,arguments):(a(this.context).off(b,this.selector||"**",c),this)},a.event.trigger=function(a,b,c,e){return c||F.test(a)||d("Global events are undocumented and deprecated"),z.call(this,a,b,c||document,e)},a.each(E.split("|"),function(b,c){a.event.special[c]={setup:function(){var b=this;return b!==document&&(a.event.add(document,c+"."+a.guid,function(){a.event.trigger(c,Array.prototype.slice.call(arguments,1),b,!0)}),a._data(this,c,a.guid++)),!1},teardown:function(){return this!==document&&a.event.remove(document,c+"."+a._data(this,c)),!1}}}),a.event.special.ready={setup:function(){d("'ready' event is deprecated")}};var I=a.fn.andSelf||a.fn.addBack,J=a.fn.find;if(a.fn.andSelf=function(){return d("jQuery.fn.andSelf() replaced by jQuery.fn.addBack()"),I.apply(this,arguments)},a.fn.find=function(a){var b=J.apply(this,arguments);return b.context=this.context,b.selector=this.selector?this.selector+" "+a:a,b},a.Callbacks){var K=a.Deferred,L=[["resolve","done",a.Callbacks("once memory"),a.Callbacks("once memory"),"resolved"],["reject","fail",a.Callbacks("once memory"),a.Callbacks("once memory"),"rejected"],["notify","progress",a.Callbacks("memory"),a.Callbacks("memory")]];a.Deferred=function(b){var c=K(),e=c.promise();return c.pipe=e.pipe=function(){var b=arguments;return d("deferred.pipe() is deprecated"),a.Deferred(function(d){a.each(L,function(f,g){var h=a.isFunction(b[f])&&b[f];c[g[1]](function(){var b=h&&h.apply(this,arguments);b&&a.isFunction(b.promise)?b.promise().done(d.resolve).fail(d.reject).progress(d.notify):d[g[0]+"With"](this===e?d.promise():this,h?[b]:arguments)})}),b=null}).promise()},c.isResolved=function(){return d("deferred.isResolved is deprecated"),"resolved"===c.state()},c.isRejected=function(){return d("deferred.isRejected is deprecated"),"rejected"===c.state()},b&&b.call(c,c),c}}}(jQuery,window);;/* Modernizr 2.8.2 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-fontface-backgroundsize-borderimage-borderradius-boxshadow-flexbox-flexboxlegacy-hsla-multiplebgs-opacity-rgba-textshadow-cssanimations-csscolumns-generatedcontent-cssgradients-cssreflections-csstransforms-csstransforms3d-csstransitions-applicationcache-canvas-canvastext-draganddrop-hashchange-history-audio-video-indexeddb-input-inputtypes-localstorage-postmessage-sessionstorage-websockets-websqldatabase-webworkers-shiv-mq-cssclasses-addtest-prefixed-teststyles-testprop-testallprops-hasevent-prefixes-domprefixes-load
 */
;window.Modernizr=function(a,b,c){function C(a){j.cssText=a}function D(a,b){return C(n.join(a+";")+(b||""))}function E(a,b){return typeof a===b}function F(a,b){return!!~(""+a).indexOf(b)}function G(a,b){for(var d in a){var e=a[d];if(!F(e,"-")&&j[e]!==c)return b=="pfx"?e:!0}return!1}function H(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:E(f,"function")?f.bind(d||b):f}return!1}function I(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+p.join(d+" ")+d).split(" ");return E(b,"string")||E(b,"undefined")?G(e,b):(e=(a+" "+q.join(d+" ")+d).split(" "),H(e,b,c))}function J(){e.input=function(c){for(var d=0,e=c.length;d<e;d++)t[c[d]]=c[d]in k;return t.list&&(t.list=!!b.createElement("datalist")&&!!a.HTMLDataListElement),t}("autocomplete autofocus list placeholder max min multiple pattern required step".split(" ")),e.inputtypes=function(a){for(var d=0,e,f,h,i=a.length;d<i;d++)k.setAttribute("type",f=a[d]),e=k.type!=="text",e&&(k.value=l,k.style.cssText="position:absolute;visibility:hidden;",/^range$/.test(f)&&k.style.WebkitAppearance!==c?(g.appendChild(k),h=b.defaultView,e=h.getComputedStyle&&h.getComputedStyle(k,null).WebkitAppearance!=="textfield"&&k.offsetHeight!==0,g.removeChild(k)):/^(search|tel)$/.test(f)||(/^(url|email)$/.test(f)?e=k.checkValidity&&k.checkValidity()===!1:e=k.value!=l)),s[a[d]]=!!e;return s}("search tel url email datetime date month week time datetime-local number range color".split(" "))}var d="2.8.2",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k=b.createElement("input"),l=":)",m={}.toString,n=" -webkit- -moz- -o- -ms- ".split(" "),o="Webkit Moz O ms",p=o.split(" "),q=o.toLowerCase().split(" "),r={},s={},t={},u=[],v=u.slice,w,x=function(a,c,d,e){var f,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),l.appendChild(j);return f=["&#173;",'<style id="s',h,'">',a,"</style>"].join(""),l.id=h,(m?l:n).innerHTML+=f,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=g.style.overflow,g.style.overflow="hidden",g.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),g.style.overflow=k),!!i},y=function(b){var c=a.matchMedia||a.msMatchMedia;if(c)return c(b)&&c(b).matches||!1;var d;return x("@media "+b+" { #"+h+" { position: absolute; } }",function(b){d=(a.getComputedStyle?getComputedStyle(b,null):b.currentStyle)["position"]=="absolute"}),d},z=function(){function d(d,e){e=e||b.createElement(a[d]||"div"),d="on"+d;var f=d in e;return f||(e.setAttribute||(e=b.createElement("div")),e.setAttribute&&e.removeAttribute&&(e.setAttribute(d,""),f=E(e[d],"function"),E(e[d],"undefined")||(e[d]=c),e.removeAttribute(d))),e=null,f}var a={select:"input",change:"input",submit:"form",reset:"form",error:"img",load:"img",abort:"img"};return d}(),A={}.hasOwnProperty,B;!E(A,"undefined")&&!E(A.call,"undefined")?B=function(a,b){return A.call(a,b)}:B=function(a,b){return b in a&&E(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=v.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(v.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(v.call(arguments)))};return e}),r.flexbox=function(){return I("flexWrap")},r.flexboxlegacy=function(){return I("boxDirection")},r.canvas=function(){var a=b.createElement("canvas");return!!a.getContext&&!!a.getContext("2d")},r.canvastext=function(){return!!e.canvas&&!!E(b.createElement("canvas").getContext("2d").fillText,"function")},r.postmessage=function(){return!!a.postMessage},r.websqldatabase=function(){return!!a.openDatabase},r.indexedDB=function(){return!!I("indexedDB",a)},r.hashchange=function(){return z("hashchange",a)&&(b.documentMode===c||b.documentMode>7)},r.history=function(){return!!a.history&&!!history.pushState},r.draganddrop=function(){var a=b.createElement("div");return"draggable"in a||"ondragstart"in a&&"ondrop"in a},r.websockets=function(){return"WebSocket"in a||"MozWebSocket"in a},r.rgba=function(){return C("background-color:rgba(150,255,150,.5)"),F(j.backgroundColor,"rgba")},r.hsla=function(){return C("background-color:hsla(120,40%,100%,.5)"),F(j.backgroundColor,"rgba")||F(j.backgroundColor,"hsla")},r.multiplebgs=function(){return C("background:url(https://),url(https://),red url(https://)"),/(url\s*\(.*?){3}/.test(j.background)},r.backgroundsize=function(){return I("backgroundSize")},r.borderimage=function(){return I("borderImage")},r.borderradius=function(){return I("borderRadius")},r.boxshadow=function(){return I("boxShadow")},r.textshadow=function(){return b.createElement("div").style.textShadow===""},r.opacity=function(){return D("opacity:.55"),/^0.55$/.test(j.opacity)},r.cssanimations=function(){return I("animationName")},r.csscolumns=function(){return I("columnCount")},r.cssgradients=function(){var a="background-image:",b="gradient(linear,left top,right bottom,from(#9f9),to(white));",c="linear-gradient(left top,#9f9, white);";return C((a+"-webkit- ".split(" ").join(b+a)+n.join(c+a)).slice(0,-a.length)),F(j.backgroundImage,"gradient")},r.cssreflections=function(){return I("boxReflect")},r.csstransforms=function(){return!!I("transform")},r.csstransforms3d=function(){var a=!!I("perspective");return a&&"webkitPerspective"in g.style&&x("@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}",function(b,c){a=b.offsetLeft===9&&b.offsetHeight===3}),a},r.csstransitions=function(){return I("transition")},r.fontface=function(){var a;return x('@font-face {font-family:"font";src:url("https://")}',function(c,d){var e=b.getElementById("smodernizr"),f=e.sheet||e.styleSheet,g=f?f.cssRules&&f.cssRules[0]?f.cssRules[0].cssText:f.cssText||"":"";a=/src/i.test(g)&&g.indexOf(d.split(" ")[0])===0}),a},r.generatedcontent=function(){var a;return x(["#",h,"{font:0/0 a}#",h,':after{content:"',l,'";visibility:hidden;font:3px/1 a}'].join(""),function(b){a=b.offsetHeight>=3}),a},r.video=function(){var a=b.createElement("video"),c=!1;try{if(c=!!a.canPlayType)c=new Boolean(c),c.ogg=a.canPlayType('video/ogg; codecs="theora"').replace(/^no$/,""),c.h264=a.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/,""),c.webm=a.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,"")}catch(d){}return c},r.audio=function(){var a=b.createElement("audio"),c=!1;try{if(c=!!a.canPlayType)c=new Boolean(c),c.ogg=a.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),c.mp3=a.canPlayType("audio/mpeg;").replace(/^no$/,""),c.wav=a.canPlayType('audio/wav; codecs="1"').replace(/^no$/,""),c.m4a=(a.canPlayType("audio/x-m4a;")||a.canPlayType("audio/aac;")).replace(/^no$/,"")}catch(d){}return c},r.localstorage=function(){try{return localStorage.setItem(h,h),localStorage.removeItem(h),!0}catch(a){return!1}},r.sessionstorage=function(){try{return sessionStorage.setItem(h,h),sessionStorage.removeItem(h),!0}catch(a){return!1}},r.webworkers=function(){return!!a.Worker},r.applicationcache=function(){return!!a.applicationCache};for(var K in r)B(r,K)&&(w=K.toLowerCase(),e[w]=r[K](),u.push((e[w]?"":"no-")+w));return e.input||J(),e.addTest=function(a,b){if(typeof a=="object")for(var d in a)B(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof f!="undefined"&&f&&(g.className+=" "+(b?"":"no-")+a),e[a]=b}return e},C(""),i=k=null,function(a,b){function l(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function m(){var a=s.elements;return typeof a=="string"?a.split(" "):a}function n(a){var b=j[a[h]];return b||(b={},i++,a[h]=i,j[i]=b),b}function o(a,c,d){c||(c=b);if(k)return c.createElement(a);d||(d=n(c));var g;return d.cache[a]?g=d.cache[a].cloneNode():f.test(a)?g=(d.cache[a]=d.createElem(a)).cloneNode():g=d.createElem(a),g.canHaveChildren&&!e.test(a)&&!g.tagUrn?d.frag.appendChild(g):g}function p(a,c){a||(a=b);if(k)return a.createDocumentFragment();c=c||n(a);var d=c.frag.cloneNode(),e=0,f=m(),g=f.length;for(;e<g;e++)d.createElement(f[e]);return d}function q(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return s.shivMethods?o(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+m().join().replace(/[\w\-]+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(s,b.frag)}function r(a){a||(a=b);var c=n(a);return s.shivCSS&&!g&&!c.hasCSS&&(c.hasCSS=!!l(a,"article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")),k||q(a,c),a}var c="3.7.0",d=a.html5||{},e=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,f=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,g,h="_html5shiv",i=0,j={},k;(function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",g="hidden"in a,k=a.childNodes.length==1||function(){b.createElement("a");var a=b.createDocumentFragment();return typeof a.cloneNode=="undefined"||typeof a.createDocumentFragment=="undefined"||typeof a.createElement=="undefined"}()}catch(c){g=!0,k=!0}})();var s={elements:d.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",version:c,shivCSS:d.shivCSS!==!1,supportsUnknownElements:k,shivMethods:d.shivMethods!==!1,type:"default",shivDocument:r,createElement:o,createDocumentFragment:p};a.html5=s,r(b)}(this,b),e._version=d,e._prefixes=n,e._domPrefixes=q,e._cssomPrefixes=p,e.mq=y,e.hasEvent=z,e.testProp=function(a){return G([a])},e.testAllProps=I,e.testStyles=x,e.prefixed=function(a,b,c){return b?I(a,b,c):I(a,"pfx")},g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+u.join(" "):""),e}(this,this.document),function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))};;// -----------------------------------------------------------------------------
// Loads a widget's content dynamically. This is for widgets that need their
// published content loaded dynamically via xhr.
// -----------------------------------------------------------------------------
(function($) {
  if (!($.iv)) { $.extend({ iv: {} }); }

  $.fn.iv_widget = function(options) {
    return this.each(function() {
      new jQuery.iv.widget(this, options);
    });
  };

  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // Widget
  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  $.iv.widget = function(el, options) {
    jQuery.data(el, 'widget', this);

    options = $.extend({
      values:    null,
      no_parent: false
    }, options);

    var $$      = $(el);       // the calling div
    var $widget = $$.parent(); // the widget div (only if no_parent is false)

    _load();

    // ---------------------------------------------------------------------------
    function _load() {
      var url     = '/website/widget';
      var qry_str = location.search;

      if (qry_str) { url += qry_str; }

      var $div = $widget;
      if (options.no_parent) {
        $div = $$;
      }

      $div.load(url, {
          id:     $$[0].id,
          values: options.values
        },
        function() {
          if (options.no_parent) {
            var $children = $$.children();
            if ($children.length > 0) {
              $children.first().unwrap();
            }
            else {
              $$.remove();
            }
          }
        }
      );
    }

    // ---------------------------------------------------------------------------
  };

})(jQuery);
;
// -----------------------------------------------------------------------------
// Utility functions for menu & menuwidget widgets. This file is meant to be
// compatible with published sites as well as within the editor (i.e. this
// file is a way to share/re-use code for menu widgets on published sites or
// within the editor).
// -----------------------------------------------------------------------------
(function($) {
  if (!($.iv)) { $.extend({ iv: {} }); }

  $.fn.iv_menu_util = function(options) {
    return this.each(function() {
      new jQuery.iv.menu_util(this, options);
    });
  };

  $.fn.iv_menu_util_show_sub_menu = function(menu, parent_menu) {
    return this.each(function() {
      jQuery.data(this, 'menu_util').show_sub_menu(menu, parent_menu);
    });
  };

  $.fn.iv_menu_util_hide_sub_menus = function(args) {
    return this.each(function() {
      jQuery.data(this, 'menu_util').hide_sub_menus(args);
    });
  };

  $.fn.iv_menu_util_expand = function(args) {
    return this.each(function() {
      jQuery.data(this, 'menu_util').expand(args);
    });
  };

  $.fn.iv_menu_util_collapse = function(args) {
    return this.each(function() {
      jQuery.data(this, 'menu_util').collapse(args);
    });
  };

  $.fn.iv_menu_util_menu_type = function() {
    return jQuery.data(this[0], 'menu_util').menu_type();
  };

  $.fn.iv_menu_util_in_editor = function(in_editor) {
    return this.each(function() {
      jQuery.data(this, 'menu_util').in_editor(in_editor);
    });
  };

  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // Menu Util
  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  $.iv.menu_util = function(el, options) {
    jQuery.data(el, 'menu_util', this);

    options = $.extend({
      auto_hide: true,      // auto-hide menu items
      in_editor: false,
      globals:   {
        open_sub_menus:      [],
        current_menu_item:   null,
        current_parent_menu: null,
        hide_timeouts:       []
      }
    }, options);

    var $$                 = $(el); // the menu widget
    var $sub_menus         = null;
    var next_submenu_index = 0;
    var prev_menu_type     = null;
    var menu_types         = {
      phone: 'box_menu'
    };

    // public methods
    this.show_sub_menu  = _show_sub_menu;
    this.hide_sub_menus = _hide_sub_menus;
    this.expand         = _expand;
    this.collapse       = _collapse;
    this.menu_type      = _menu_type;
    this.in_editor      = _in_editor;

    // ---------------------------------------------------------------------------
    function _in_editor(in_editor) {
      if (typeof(in_editor) !== 'undefined') {
        options.in_editor = in_editor;
      }

      return options.in_editor;
    }

    // ---------------------------------------------------------------------------
    function _get_doc_height() {
      if (!options.in_editor) {
        var D = document;
        return Math.max(
          Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
          Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
          Math.max(D.body.clientHeight, D.documentElement.clientHeight)
        );
      }

      return $('#editor_page').height();
    }

    // ---------------------------------------------------------------------------
    function _get_doc_width() {
      if (!options.in_editor) {
        return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      }

      return $('#editor_content').width() - $.iv.scrollbar_width();
    }

    // ---------------------------------------------------------------------------
    function _menu_type() {
      if ($('#__res_main_nav_label', $$).css('display') != 'none') {
        return 'box_menu';
      }

      return 'default';
    }

    // ---------------------------------------------------------------------------
    function _is_using_responsive_menu() {
      if ($$.hasClass('b_menu')) {
        var $breakpoints = jQuery('head meta[name="breakpoints"]');
    
        if ($breakpoints.length == 1) {
          var widths    = $breakpoints.prop('content').split(',');
          var $res_menu = jQuery('#__res_main_nav_label'); // responsive menu label
    
          for (var i=0; i<widths.length; i++) {
            var doc_width = _get_doc_width();
    
            if (doc_width <= widths[i]) {
              if ($res_menu &&
                  $res_menu.length == 1 &&
                  $res_menu.css('display') != 'none') {
                $$.removeClass('default_menu').addClass('box_menu');
                return true;
              }
            }
          }
        }
      }

      $$.removeClass('box_menu').addClass('default_menu');
    
      return false;
    }

    // ---------------------------------------------------------------------------
    function _show_sub_menu(menu, parent_menu) {
      // TODO: Fix this line. Menuwidget submenus do not show!
      if (_is_using_responsive_menu()) { return; }
    
      // clear all timeouts
      while (options.globals.hide_timeouts.length) {
        clearTimeout(options.globals.hide_timeouts.pop());
      }

// COMMENTED: Now using CSS to show/hide submenus
//      // auto-hide menu items
//      if (options.auto_hide) {
//        if (options.globals.open_sub_menus.length) {
//          if (parent_menu == options.globals.current_parent_menu) {
//            var open_sub_menu = options.globals.open_sub_menus.pop();
//            open_sub_menu.css("visibility", "hidden");
//          }
//          else if (!parent_menu) {
//            while (options.globals.open_sub_menus.length) {
//              var open_sub_menu = options.globals.open_sub_menus.pop();
//              open_sub_menu.css("visibility", "hidden");
//            }
//          }
//        }
//      }
    
      // track the current parent menu
      options.globals.current_parent_menu = parent_menu;

      var id                = jQuery(menu).attr("id");
      var ul                = jQuery("#sub_"+id);
      var div_parent        = ul.parents("div:first");
      var padding_left      = parseInt(jQuery(menu).css("padding-left").replace(/px/, ""));
      var padding_right     = parseInt(jQuery(menu).css("padding-right").replace(/px/, ""));
      var padding_top       = parseInt(jQuery(menu).css("padding-top").replace(/px/, ""));
      var padding_bottom    = parseInt(jQuery(menu).css("padding-bottom").replace(/px/, ""));
      var ul_padding_left   = parseInt(ul.css("padding-left").replace(/px/, ""));
      var ul_padding_right  = parseInt(ul.css("padding-right").replace(/px/, ""));
      var ul_padding_top    = parseInt(ul.css("padding-top").replace(/px/, ""));
      var ul_padding_bottom = parseInt(ul.css("padding-bottom").replace(/px/, ""));
      var menu_position     = (ul.attr('menu_position'))?ul.attr('menu_position'):null;

// COMMENTED: Now using CSS to show/hide submenus
//      if (options.auto_hide) {
//        options.globals.open_sub_menus.push(ul);
//      }
    
      if (menu_position == 'top') {
        if (parent_menu) {
          // Sub sub menu & beyond
    
          // if submenu will expand past bottom of the page, move up instead
          if (jQuery(menu).offset().top + jQuery(menu).height() + ul_padding_top + ul_padding_bottom + ul.height() > _get_doc_height()) {
            ul.css("top", jQuery(menu).position().top - ul.height() + jQuery(menu).height() + padding_top + padding_bottom);
          } else {
            ul.css("top", jQuery(menu).position().top - ul_padding_top);
          }
    
          // If submenu goes off screen, move left instead.
          if (jQuery(menu).offset().left + jQuery(menu).width() + padding_left + padding_right + ul.width() > _get_doc_width()) {
            ul.css("left", jQuery(menu).position().left - ul.width());
          }
          else {
            ul.css("left", jQuery(menu).position().left + jQuery(menu).width() + padding_left + padding_right);
          }
        } else {
          // Initial submenu
          var ul_top;
          if (div_parent.css('position')) {
            var li = jQuery(menu);
            // Add 35 from activation bar
            if (li.position().top + li.height() + padding_top + padding_bottom + ul.height() + 35 > _get_doc_height()) {
              ul_top = li.position().top - ul.height();
            } else {
              // Get li height, not div
              ul_top = li.position().top + li.height() + padding_top + padding_bottom;
            }
          }
    
          ul.css("top", ul_top);
          if (jQuery(menu).offset().left - ul_padding_left + ul.width() > _get_doc_width()) {
            // If submenu goes off screen, move left instead.
            ul.css("left", _get_doc_width() - ul.width());
          }
          else {
            ul.css("left", jQuery(menu).position().left - ul_padding_left);
          }
        }
      }
      else if (menu_position == 'left') {
        if (parent_menu) {
          if (jQuery(menu).offset().top + ul_padding_bottom + ul_padding_top + ul.height() > _get_doc_height()) {
    	ul.css("top", jQuery(menu).position().top - ul.height() + jQuery(menu).height() + padding_top + padding_bottom);
          } else {
    	ul.css("top", jQuery(menu).position().top - ul_padding_top);
          }
        }
        else {
          // Initial submenu
          if (jQuery(menu).position().top - padding_top + ul.height() > _get_doc_height()) {
    	ul.css("top", _get_doc_height() - ul.height() - padding_top); 
          } else {
    	ul.css("top", jQuery(menu).position().top);
          }
        }
        if (jQuery(menu).offset().left + jQuery(menu).width() + padding_left + padding_right + ul.width() > _get_doc_width()) {
          ul.css("left", jQuery(menu).position().left - ul.width());
          if (ul.offset().left < 0) { ul.css("left", 0); }
        }
        else {
          ul.css("left", jQuery(menu).position().left + jQuery(menu).width() + padding_left + padding_right);
          if (ul.offset().left + ul.width() > _get_doc_width()) {
            ul.css("left", jQuery(menu).position().left - ul.width());
            if (ul.offset().left < 0) { ul.css("left", 0); }
          }
        }
        //ul.css("left", jQuery(menu).position().left + jQuery(menu).width() + padding_left + padding_right);
      }
      else if (menu_position == 'right') {
        var ul_width = jQuery(ul).width();
        var max_width = 400;
        if (ul_width >= max_width) { ul_width = max_width; jQuery(ul).width(max_width) }
        ul.css("top", jQuery(menu).position().top - ul_padding_top);
        var left;
        if (jQuery(menu).offset().left - ul_width - ul_padding_left - ul_padding_right < 0) {
          left = jQuery(menu).position().left + ul_width + ul_padding_left + ul_padding_right;
        } else {
          left = jQuery(menu).position().left - ul_width - ul_padding_left - ul_padding_right;
        }
        ul.css("left", left);
      }
      else if (menu_position == 'bottom') {
        if (parent_menu) {
          // Sub sub menu & beyond
          ul.css("top", jQuery(menu).position().top - ul.height() + jQuery(menu).height());
          // If submenu goes off screen, move left instead.
          if (jQuery(menu).offset().left + jQuery(menu).width() + padding_left + padding_right + ul.width() > _get_doc_width()) {
            ul.css("left", jQuery(menu).position().left - ul.width());
          }
          else {
            ul.css("left", jQuery(menu).position().left + jQuery(menu).width() + padding_left + padding_right);
          }
        } else {
          // Initial submenu
          var ul_top;
          if (div_parent.css('position')) {
            var li = jQuery(menu);
            ul_top = li.position().top - padding_top - ul.height();
          }
    
          ul.css("top", ul_top);
          if (jQuery(menu).offset().left - ul_padding_left + ul.width() > _get_doc_width()) {
            // If submenu goes off screen, move left instead.
            ul.css("left", _get_doc_width() - ul.width());
          }
          else {
            ul.css("left", jQuery(menu).position().left - ul_padding_left);
          }
        }
      }

// COMMENTED: Now using CSS to show/hide submenus
//      ul.css("visibility", "visible")
      ul.css("position", "absolute")
        .css("z-index", 50000)
        .show();
    
      jQuery('a', ul).css('float', 'none');

      // Handle menus that overlap video widgets
      // ---------------------------------------
      var $sub_menu     = jQuery('.sub_menu', parent_menu);
      var sub_menu_rect = ($sub_menu[0]) ? $sub_menu[0].getBoundingClientRect() : undefined;

      jQuery('div[block_type="video"] video').each(function() {
        var overlap = false;
        if (sub_menu_rect) {
          // Check for overlapping.  If video/menu overlap then
          // force pause.
          var video_rect = this.getBoundingClientRect();
          overlap        = !(sub_menu_rect.right < video_rect.left ||
                           sub_menu_rect.left > video_rect.right ||
                           sub_menu_rect.bottom < video_rect.top ||
                           sub_menu_rect.top > video_rect.bottom);
        }
        if (overlap) {
          jQuery(this).get(0).pause();
        }
      });

      if (!jQuery('div[block_type="video"] video').hasClass('vjs-tech')) {
        jQuery('div[block_type="video"] video').addClass('hidden');
        jQuery('div[block_type="video"] img.video_preview').removeClass('hidden');
      }
      // ---------------------------------------
    }

    // ---------------------------------------------------------------------------
    function _hide_sub_menus(args) {
// COMMENTED: Now using CSS to show/hide submenus
//      if (_is_using_responsive_menu()) { return; }
//
//      args = args || {};
//
//      var now  = args['now'];
//      var time = (now)?1:500;
//
//      options.globals.hide_timeouts.push(setTimeout(function () {
//        if (!options.globals.current_menu_item) {
//          while (options.globals.open_sub_menus.length) {
//            var open_sub_menu = options.globals.open_sub_menus.pop();
//            open_sub_menu.css("visibility", "hidden");
//            jQuery('.video video').removeClass('hidden');
//            jQuery('.video img.video_preview').addClass('hidden');
//          }
//        }
//      }, time));
    }

    // -------------------------------------------------------------------------
    function _expand(args) {
      args = args || {};

      var menu_type = _menu_type();

      if (prev_menu_type !== menu_type) {
        _collapse(args);
        prev_menu_type = menu_type;
      }

      switch(menu_type) {
        case 'box_menu':
          _expand_for_box_menu(args);
          break;
        default:
          _expand_for_default(args);
      }
    }

    // -------------------------------------------------------------------------
    function _expand_for_box_menu(args) {
      args = args || {};

      var $menu     = $$;
      var menu_type = _menu_type();

      if (!$sub_menus) {
        $sub_menus         = $('ul', $menu);
        next_submenu_index = 0;
      }

      var $ul        = null;
      var $prev_ul   = null;
      var prev_index = next_submenu_index - 1;

      // the next ul to show
      if ($sub_menus.length) {
        if ($sub_menus.length - 1 < next_submenu_index) {
          _collapse({
            menu_type:     menu_type,
            keep_submenus: true
          });
        }

        $ul = $($sub_menus[next_submenu_index]);
      }
      else {
        return _collapse({ menu_type: menu_type });
      }

      // the previous ul
      if ($sub_menus.length - 2 >= prev_index) {
        $prev_ul = $($sub_menus[prev_index]);
      }

      if ($ul) {
        var ul_id      = $ul[0].id;
        var $parent_ul = ($ul.hasClass('sub_menu'))?$ul.parents('ul'):null;

        if ($parent_ul && $parent_ul.length > 0) {
          // if the previous ul exists and is not the root ul and is not the
          // same as the parent ul, we need to hide the previous ul and possibly
          // its parents
          if (prev_index !== 0 &&
              $prev_ul &&
              $prev_ul.length > 0 &&
              $parent_ul[0].id !== $prev_ul[0].id) {
            var $cb = $($prev_ul.prevAll('input[type="checkbox"]')[0]);
            $cb.removeAttr('checked');

            var parents = $prev_ul.parents('ul.sub_menu');
            for (var idx=0; idx<parents.length; idx++) {
              if (parents[idx].id !== $parent_ul[0].id) {
                var $cb = $($(parents[idx]).prevAll('input[type="checkbox"]')[0]);
                $cb.removeAttr('checked');
              }
              else {
                break;
              }
            }
          }
        }

        // clear inline styles
        $ul.removeAttr('style');

        // show the next sub menu
        var $cb = $($ul.prevAll('input[type="checkbox"]')[0]);
        $cb.attr('checked', 'checked');

        // show the sub view
        $ul.css('visibility', 'visible');

        next_submenu_index += 1;
      }
    }

    // -------------------------------------------------------------------------
    function _expand_for_default(args) {
      args = args || {};

      var $menu = $$;

      if (!$sub_menus) {
        $sub_menus         = $('ul.sub_menu', $menu);
        next_submenu_index = 0;
      }

      var $ul        = null;
      var $prev_ul   = null;
      var prev_index = next_submenu_index - 1;

      // the next ul to show
      if ($sub_menus.length) {
        if ($sub_menus.length - 1 < next_submenu_index) {
          _collapse({ keep_submenus: true });
        }

        $ul = $($sub_menus[next_submenu_index]);
      }
      else {
        return _collapse();
      }

      // the previous ul
      if ($sub_menus.length - 2 >= prev_index) {
        $prev_ul = $($sub_menus[prev_index]);
      }

      if ($ul) {
        var ul_id       = $ul[0].id;
        var a_id        = ul_id.replace('sub_', '');
        var $submenu    = $('#'+a_id, $menu);
        var parent_menu = null;
        var $parent_ul  = $submenu.parents('ul');

        if ($parent_ul.length > 0) {
          // if the previous ul exists and is not the same as the parent ul,
          // we need to hide the previous ul and possibly its parents
          if ($prev_ul && $prev_ul.length > 0 && $parent_ul[0].id !== $prev_ul[0].id) {
            $prev_ul.hide().css('visibility', '');
            var parents = $prev_ul.parents('ul.sub_menu');
            for (var idx=0; idx<parents.length; idx++) {
              if (parents[idx].id !== $parent_ul[0].id) {
                $(parents[idx]).hide().css('visibility', '');
              }
              else {
                break;
              }
            }
          }

          // get the actual parent element
          if ($parent_ul.hasClass('sub_menu')) {
            var parent_id = $parent_ul[0].id.replace('sub_', '');
            var $parent_menu = $('#'+parent_id, $menu);
            parent_menu = $parent_menu[0];
          }
        }

        // position the next sub menu
        _show_sub_menu($submenu[0], parent_menu);

        // show the sub view
        $ul.css('visibility', 'visible');

        next_submenu_index += 1;
      }
    }

    // -------------------------------------------------------------------------
    function _collapse(args) {
      args = args || {};

      var menu_type = _menu_type();

      switch(menu_type) {
        case 'box_menu':
          _collapse_for_box_menu(args);
          break;
        default:
          _collapse_for_default(args);
      }
    }

    // -------------------------------------------------------------------------
    function _collapse_for_box_menu(args) {
      args = args || {};

      var $menu = $$;

      $('input[type="checkbox"]', $menu).each(function() {
        $(this).removeAttr('checked');
      });

      $('ul li ul', $menu).each(function() {
        $(this).hide().css('visibility', '');
      });

      if (!args['keep_submenus']) { $sub_menus = null; }

      next_submenu_index = 0;
    }

    // -------------------------------------------------------------------------
    function _collapse_for_default(args) {
      args = args || {};

      var $menu = $$;

      // Don't collapse menu trees
      if ($('div.menuwidget_vertical_tree', $menu)[0]) {
        return;
      }
      
      $('ul li ul', $menu).each(function() {
        $(this).hide().css('visibility', '');
      });

      if (!args['keep_submenus']) { $sub_menus = null; }

      next_submenu_index = 0;
    }

    // ---------------------------------------------------------------------------
  };

})(jQuery);
;

// -------------------------------------------
// This file is for website menu blocks
//   It is needed for the display on published sites
//   This only works for single menus.  Will need to be changed for menu widgets
// -------------------------------------------

var _iv_menu_globals = {
  open_sub_menus:      [],
  current_menu_item:   null,
  current_parent_menu: null,
  hide_timeouts:       [],
  prev_window_width:   0
};

// wait until the DOM is ready before creating objects
jQuery(document).ready(function() {
  // all menu and menuwidget widgets should have menu_util objects
  jQuery('div.b_menu').iv_menu_util({ globals: _iv_menu_globals });
  jQuery('div.b_menuwidget').iv_menu_util({ globals: _iv_menu_globals });
});

// Helper function used by the dimensions and offset modules
function num(elem, prop) {
  return elem[0] && parseInt( jQuery.css(elem[0], prop, true), 10 ) || 0;
}

function _on_responsive_resize() {
  var $res_menu = jQuery('#__res_main_nav_label'); // responsive menu label

  if ($res_menu && $res_menu.length == 1 && _iv_menu_globals.prev_window_width != jQuery(window).width()) {
    jQuery('ul li ul', $res_menu.parent()).hide();
    jQuery('input[type="checkbox"]:checked', $res_menu.parent()).prop('checked', false);
  }
}

function _init_responsive_menu() {
  var $res_menu = jQuery('#__res_main_nav_label'); // responsive menu label

  _iv_menu_globals.prev_window_width = jQuery(window).width();

  if ($res_menu && $res_menu.length == 1) {
    jQuery(window).unbind('resize', _on_responsive_resize).resize(_on_responsive_resize);

    var clear_styles = function($obj) {
      $obj.parent().find('ul').removeAttr('style');
      $obj.parent().find('ul li').removeAttr('style');
      $obj.parent().find('ul li a').removeAttr('style');
    };

    $res_menu.unbind().click(function() { clear_styles(jQuery(this)); });

    jQuery('.res_main_nav_label_child', $res_menu.parent()).unbind().click(function() {
      clear_styles(jQuery(this));
    });
  }
}

function _show_sub_menu(menu, parent_menu) {
  var widget_div = (jQuery(menu).parents('.b_menu')[0])
                    ?jQuery(menu).parents('.b_menu')[0]
                    :jQuery(menu).parents('.b_menuwidget')[0];
  jQuery(widget_div).iv_menu_util_show_sub_menu(menu, parent_menu);
}

function _hide_sub_menus(now) {
  jQuery('div.b_menu').each(function() {
    jQuery(this).iv_menu_util_hide_sub_menus({
      now: now
    });
  });
  jQuery('div.b_menuwidget').each(function() {
    jQuery(this).iv_menu_util_hide_sub_menus({
      now: now
    });
  });
}
;

Date.CultureInfo={name:"zh-TW",englishName:"Chinese (Taiwan)",nativeName:"中文(台灣)",dayNames:["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],abbreviatedDayNames:["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],shortestDayNames:["日","一","二","三","四","五","六"],firstLetterDayNames:["日","一","二","三","四","五","六"],monthNames:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],abbreviatedMonthNames:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],amDesignator:"上午",pmDesignator:"下午",firstDayOfWeek:0,twoDigitYearMax:2029,dateElementOrder:"ymd",formatPatterns:{shortDate:"yyyy/M/d",longDate:"yyyy 年 M 月 d 日 ",shortTime:"tt hh:mm",longTime:"tt hh:mm:ss",fullDateTime:"yyyy 年 M 月 d 日 tt hh:mm:ss",sortableDateTime:"yyyy-MM-ddTHH:mm:ss",universalSortableDateTime:"yyyy-MM-dd HH:mm:ssZ",rfc1123:"ddd, dd MMM yyyy HH:mm:ss GMT",monthDay:"M 月 d 日 ",yearMonth:"yyyyMMMM"},regexPatterns:{jan:/^一月/i,feb:/^二月/i,mar:/^三月/i,apr:/^四月/i,may:/^五月/i,jun:/^六月/i,jul:/^七月/i,aug:/^八月/i,sep:/^九月/i,oct:/^十月/i,nov:/^十一月/i,dec:/^十二月/i,sun:/^星期日/i,mon:/^星期一/i,tue:/^星期二/i,wed:/^星期三/i,thu:/^星期四/i,fri:/^星期五/i,sat:/^星期六/i,future:/^next/i,past:/^last|past|prev(ious)?/i,add:/^(\+|after|from)/i,subtract:/^(\-|before|ago)/i,yesterday:/^yesterday/i,today:/^t(oday)?/i,tomorrow:/^tomorrow/i,now:/^n(ow)?/i,millisecond:/^ms|milli(second)?s?/i,second:/^sec(ond)?s?/i,minute:/^min(ute)?s?/i,hour:/^h(ou)?rs?/i,week:/^w(ee)?k/i,month:/^m(o(nth)?s?)?/i,day:/^d(ays?)?/i,year:/^y((ea)?rs?)?/i,shortMeridian:/^(a|p)/i,longMeridian:/^(a\.?m?\.?|p\.?m?\.?)/i,timezone:/^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,ordinalSuffix:/^\s*(st|nd|rd|th)/i,timeContext:/^\s*(\:|a|p)/i},abbreviatedTimeZoneStandard:{GMT:"-000",EST:"-0400",CST:"-0500",MST:"-0600",PST:"-0700"},abbreviatedTimeZoneDST:{GMT:"-000",EDT:"-0500",CDT:"-0600",MDT:"-0700",PDT:"-0800"}};;

Date.getMonthNumberFromName=function(b){var e=Date.CultureInfo.monthNames,a=Date.CultureInfo.abbreviatedMonthNames,d=b.toLowerCase();for(var c=0;c<e.length;c++){if(e[c].toLowerCase()==d||a[c].toLowerCase()==d){return c}}return -1};Date.getDayNumberFromName=function(b){var f=Date.CultureInfo.dayNames,a=Date.CultureInfo.abbreviatedDayNames,e=Date.CultureInfo.shortestDayNames,d=b.toLowerCase();for(var c=0;c<f.length;c++){if(f[c].toLowerCase()==d||a[c].toLowerCase()==d){return c}}return -1};Date.isLeapYear=function(a){return(((a%4===0)&&(a%100!==0))||(a%400===0))};Date.getDaysInMonth=function(a,b){return[31,(Date.isLeapYear(a)?29:28),31,30,31,30,31,31,30,31,30,31][b]};Date.getTimezoneOffset=function(a,b){return(b||false)?Date.CultureInfo.abbreviatedTimeZoneDST[a.toUpperCase()]:Date.CultureInfo.abbreviatedTimeZoneStandard[a.toUpperCase()]};Date.getTimezoneAbbreviation=function(b,d){var c=(d||false)?Date.CultureInfo.abbreviatedTimeZoneDST:Date.CultureInfo.abbreviatedTimeZoneStandard,a;for(a in c){if(c[a]===b){return a}}return null};Date.prototype.clone=function(){return new Date(this.getTime())};Date.prototype.compareTo=function(a){if(isNaN(this)){throw new Error(this)}if(a instanceof Date&&!isNaN(a)){return(this>a)?1:(this<a)?-1:0}else{throw new TypeError(a)}};Date.prototype.equals=function(a){return(this.compareTo(a)===0)};Date.prototype.between=function(c,a){var b=this.getTime();return b>=c.getTime()&&b<=a.getTime()};Date.prototype.addMilliseconds=function(a){this.setMilliseconds(this.getMilliseconds()+a);return this};Date.prototype.addSeconds=function(a){return this.addMilliseconds(a*1000)};Date.prototype.addMinutes=function(a){return this.addMilliseconds(a*60000)};Date.prototype.addHours=function(a){return this.addMilliseconds(a*3600000)};Date.prototype.addDays=function(a){return this.addMilliseconds(a*86400000)};Date.prototype.addWeeks=function(a){return this.addMilliseconds(a*604800000)};Date.prototype.addMonths=function(a){var b=this.getDate();this.setDate(1);this.setMonth(this.getMonth()+a);this.setDate(Math.min(b,this.getDaysInMonth()));return this};Date.prototype.addYears=function(a){return this.addMonths(a*12)};Date.prototype.add=function(b){if(typeof b=="number"){this._orient=b;return this}var a=b;if(a.millisecond||a.milliseconds){this.addMilliseconds(a.millisecond||a.milliseconds)}if(a.second||a.seconds){this.addSeconds(a.second||a.seconds)}if(a.minute||a.minutes){this.addMinutes(a.minute||a.minutes)}if(a.hour||a.hours){this.addHours(a.hour||a.hours)}if(a.month||a.months){this.addMonths(a.month||a.months)}if(a.year||a.years){this.addYears(a.year||a.years)}if(a.day||a.days){this.addDays(a.day||a.days)}return this};Date._validate=function(d,c,a,b){if(typeof d!="number"){throw new TypeError(d+" is not a Number.")}else{if(d<c||d>a){throw new RangeError(d+" is not a valid value for "+b+".")}}return true};Date.validateMillisecond=function(a){return Date._validate(a,0,999,"milliseconds")};Date.validateSecond=function(a){return Date._validate(a,0,59,"seconds")};Date.validateMinute=function(a){return Date._validate(a,0,59,"minutes")};Date.validateHour=function(a){return Date._validate(a,0,23,"hours")};Date.validateDay=function(c,a,b){return Date._validate(c,1,Date.getDaysInMonth(a,b),"days")};Date.validateMonth=function(a){return Date._validate(a,0,11,"months")};Date.validateYear=function(a){return Date._validate(a,1,9999,"seconds")};Date.prototype.set=function(b){var a=b;if(!a.millisecond&&a.millisecond!==0){a.millisecond=-1}if(!a.second&&a.second!==0){a.second=-1}if(!a.minute&&a.minute!==0){a.minute=-1}if(!a.hour&&a.hour!==0){a.hour=-1}if(!a.day&&a.day!==0){a.day=-1}if(!a.month&&a.month!==0){a.month=-1}if(!a.year&&a.year!==0){a.year=-1}if(a.millisecond!=-1&&Date.validateMillisecond(a.millisecond)){this.addMilliseconds(a.millisecond-this.getMilliseconds())}if(a.second!=-1&&Date.validateSecond(a.second)){this.addSeconds(a.second-this.getSeconds())}if(a.minute!=-1&&Date.validateMinute(a.minute)){this.addMinutes(a.minute-this.getMinutes())}if(a.hour!=-1&&Date.validateHour(a.hour)){this.addHours(a.hour-this.getHours())}if(a.month!==-1&&Date.validateMonth(a.month)){this.addMonths(a.month-this.getMonth())}if(a.year!=-1&&Date.validateYear(a.year)){this.addYears(a.year-this.getFullYear())}if(a.day!=-1&&Date.validateDay(a.day,this.getFullYear(),this.getMonth())){this.addDays(a.day-this.getDate())}if(a.timezone){this.setTimezone(a.timezone)}if(a.timezoneOffset){this.setTimezoneOffset(a.timezoneOffset)}return this};Date.prototype.clearTime=function(){this.setHours(0);this.setMinutes(0);this.setSeconds(0);this.setMilliseconds(0);return this};Date.prototype.isLeapYear=function(){var a=this.getFullYear();return(((a%4===0)&&(a%100!==0))||(a%400===0))};Date.prototype.isWeekday=function(){return !(this.is().sat()||this.is().sun())};Date.prototype.getDaysInMonth=function(){return Date.getDaysInMonth(this.getFullYear(),this.getMonth())};Date.prototype.moveToFirstDayOfMonth=function(){return this.set({day:1})};Date.prototype.moveToLastDayOfMonth=function(){return this.set({day:this.getDaysInMonth()})};Date.prototype.moveToDayOfWeek=function(a,b){var c=(a-this.getDay()+7*(b||+1))%7;return this.addDays((c===0)?c+=7*(b||+1):c)};Date.prototype.moveToMonth=function(c,a){var b=(c-this.getMonth()+12*(a||+1))%12;return this.addMonths((b===0)?b+=12*(a||+1):b)};Date.prototype.getDayOfYear=function(){return Math.floor((this-new Date(this.getFullYear(),0,1))/86400000)};Date.prototype.getWeekOfYear=function(a){var h=this.getFullYear(),c=this.getMonth(),f=this.getDate();var j=a||Date.CultureInfo.firstDayOfWeek;var e=7+1-new Date(h,0,1).getDay();if(e==8){e=1}var b=((Date.UTC(h,c,f,0,0,0)-Date.UTC(h,0,1,0,0,0))/86400000)+1;var i=Math.floor((b-e+7)/7);if(i===j){h--;var g=7+1-new Date(h,0,1).getDay();if(g==2||g==8){i=53}else{i=52}}return i};Date.prototype.isDST=function(){return this.datetostring().match(/(E|C|M|P)(S|D)T/)[2]=="D"};Date.prototype.getTimezone=function(){return Date.getTimezoneAbbreviation(this.getUTCOffset,this.isDST())};Date.prototype.setTimezoneOffset=function(b){var a=this.getTimezoneOffset(),c=Number(b)*-6/10;this.addMinutes(c-a);return this};Date.prototype.setTimezone=function(a){return this.setTimezoneOffset(Date.getTimezoneOffset(a))};Date.prototype.getUTCOffset=function(){var b=this.getTimezoneOffset()*-10/6,a;if(b<0){a=(b-10000).toString();return a[0]+a.substr(2)}else{a=(b+10000).toString();return"+"+a.substr(1)}};Date.prototype.getDayName=function(a){return a?Date.CultureInfo.abbreviatedDayNames[this.getDay()]:Date.CultureInfo.dayNames[this.getDay()]};Date.prototype.getMonthName=function(a){return a?Date.CultureInfo.abbreviatedMonthNames[this.getMonth()]:Date.CultureInfo.monthNames[this.getMonth()]};Date.prototype._datetostring=Date.prototype.datetostring;Date.prototype.datetostring=function(c){var a=this;var b=function b(d){return(d.toString().length==1)?"0"+d:d};return c?c.replace(/dd?d?d?|MM?M?M?|yy?y?y?|hh?|HH?|mm?|ss?|tt?|zz?z?/g,function(d){switch(d){case"hh":return b(a.getHours()<13?a.getHours():(a.getHours()-12));case"h":return a.getHours()<13?a.getHours():(a.getHours()-12);case"HH":return b(a.getHours());case"H":return a.getHours();case"mm":return b(a.getMinutes());case"m":return a.getMinutes();case"ss":return b(a.getSeconds());case"s":return a.getSeconds();case"yyyy":return a.getFullYear();case"yy":return a.getFullYear().datetostring().substring(2,4);case"dddd":return a.getDayName();case"ddd":return a.getDayName(true);case"dd":return b(a.getDate());case"d":return a.getDate().toString();case"MMMM":return a.getMonthName();case"MMM":return a.getMonthName(true);case"MM":return b((a.getMonth()+1));case"M":return a.getMonth()+1;case"t":return a.getHours()<12?Date.CultureInfo.amDesignator.substring(0,1):Date.CultureInfo.pmDesignator.substring(0,1);case"tt":return a.getHours()<12?Date.CultureInfo.amDesignator:Date.CultureInfo.pmDesignator;case"zzz":case"zz":case"z":return""}}):this._datetostring()};(function(){Date.Parsing={Exception:function(i){this.message="Parse error at '"+i.substring(0,10)+" ...'"}};var a=Date.Parsing;var c=a.Operators={rtoken:function(i){return function(j){var k=j.match(i);if(k){return([k[0],j.substring(k[0].length)])}else{throw new a.Exception(j)}}},token:function(i){return function(j){return c.rtoken(new RegExp("^s*"+j+"s*"))(j)}},stoken:function(i){return c.rtoken(new RegExp("^"+i))},until:function(i){return function(j){var k=[],m=null;while(j.length){try{m=i.call(this,j)}catch(l){k.push(m[0]);j=m[1];continue}break}return[k,j]}},many:function(i){return function(j){var m=[],k=null;while(j.length){try{k=i.call(this,j)}catch(l){return[m,j]}m.push(k[0]);j=k[1]}return[m,j]}},optional:function(i){return function(j){var k=null;try{k=i.call(this,j)}catch(l){return[null,j]}return[k[0],k[1]]}},not:function(i){return function(j){try{i.call(this,j)}catch(k){return[null,j]}throw new a.Exception(j)}},ignore:function(i){return i?function(j){var k=null;k=i.call(this,j);return[null,k[1]]}:null},product:function(){var k=arguments[0],l=Array.prototype.slice.call(arguments,1),m=[];for(var j=0;j<k.length;j++){m.push(c.each(k[j],l))}return m},cache:function(k){var i={},j=null;return function(l){try{j=i[l]=(i[l]||k.call(this,l))}catch(m){j=i[l]=m}if(j instanceof a.Exception){throw j}else{return j}}},any:function(){var i=arguments;return function(k){var l=null;for(var j=0;j<i.length;j++){if(i[j]==null){continue}try{l=(i[j].call(this,k))}catch(m){l=null}if(l){return l}}throw new a.Exception(k)}},each:function(){var i=arguments;return function(k){var n=[],l=null;for(var j=0;j<i.length;j++){if(i[j]==null){continue}try{l=(i[j].call(this,k))}catch(m){throw new a.Exception(k)}n.push(l[0]);k=l[1]}return[n,k]}},all:function(){var j=arguments,i=i;return i.each(i.optional(j))},sequence:function(i,j,k){j=j||c.rtoken(/^\s*/);k=k||null;if(i.length==1){return i[0]}return function(o){var p=null,t=null;var v=[];for(var n=0;n<i.length;n++){try{p=i[n].call(this,o)}catch(u){break}v.push(p[0]);try{t=j.call(this,p[1])}catch(m){t=null;break}o=t[1]}if(!p){throw new a.Exception(o)}if(t){throw new a.Exception(t[1])}if(k){try{p=k.call(this,p[1])}catch(l){throw new a.Exception(p[1])}}return[v,(p?p[1]:o)]}},between:function(j,k,i){i=i||j;var l=c.each(c.ignore(j),k,c.ignore(i));return function(m){var n=l.call(this,m);return[[n[0][0],r[0][2]],n[1]]}},list:function(i,j,k){j=j||c.rtoken(/^\s*/);k=k||null;return(i instanceof Array?c.each(c.product(i.slice(0,-1),c.ignore(j)),i.slice(-1),c.ignore(k)):c.each(c.many(c.each(i,c.ignore(j))),px,c.ignore(k)))},set:function(i,j,k){j=j||c.rtoken(/^\s*/);k=k||null;return function(B){var l=null,n=null,m=null,o=null,t=[[],B],A=false;for(var v=0;v<i.length;v++){m=null;n=null;l=null;A=(i.length==1);try{l=i[v].call(this,B)}catch(y){continue}o=[[l[0]],l[1]];if(l[1].length>0&&!A){try{m=j.call(this,l[1])}catch(z){A=true}}else{A=true}if(!A&&m[1].length===0){A=true}if(!A){var w=[];for(var u=0;u<i.length;u++){if(v!=u){w.push(i[u])}}n=c.set(w,j).call(this,m[1]);if(n[0].length>0){o[0]=o[0].concat(n[0]);o[1]=n[1]}}if(o[1].length<t[1].length){t=o}if(t[1].length===0){break}}if(t[0].length===0){return t}if(k){try{m=k.call(this,t[1])}catch(x){throw new a.Exception(t[1])}t[1]=m[1]}return t}},forward:function(i,j){return function(k){return i[j].call(this,k)}},replace:function(j,i){return function(k){var l=j.call(this,k);return[i,l[1]]}},process:function(j,i){return function(k){var l=j.call(this,k);return[i.call(this,l[0]),l[1]]}},min:function(i,j){return function(k){var l=j.call(this,k);if(l[0].length<i){throw new a.Exception(k)}return l}}};var h=function(i){return function(){var j=null,m=[];if(arguments.length>1){j=Array.prototype.slice.call(arguments)}else{if(arguments[0] instanceof Array){j=arguments[0]}}if(j){for(var l=0,k=j.shift();l<k.length;l++){j.unshift(k[l]);m.push(i.apply(null,j));j.shift();return m}}else{return i.apply(null,arguments)}}};var g="optional not ignore cache".split(/\s/);for(var d=0;d<g.length;d++){c[g[d]]=h(c[g[d]])}var f=function(i){return function(){if(arguments[0] instanceof Array){return i.apply(null,arguments[0])}else{return i.apply(null,arguments)}}};var e="each any all".split(/\s/);for(var b=0;b<e.length;b++){c[e[b]]=f(c[e[b]])}}());(function(){var f=function(j){var k=[];for(var g=0;g<j.length;g++){if(j[g] instanceof Array){k=k.concat(f(j[g]))}else{if(j[g]){k.push(j[g])}}}return k};Date.Grammar={};Date.Translator={hour:function(g){return function(){this.hour=Number(g)}},minute:function(g){return function(){this.minute=Number(g)}},second:function(g){return function(){this.second=Number(g)}},meridian:function(g){return function(){this.meridian=g.slice(0,1).toLowerCase()}},timezone:function(g){return function(){var j=g.replace(/[^\d\+\-]/g,"");if(j.length){this.timezoneOffset=Number(j)}else{this.timezone=g.toLowerCase()}}},day:function(g){var j=g[0];return function(){this.day=Number(j.match(/\d+/)[0])}},month:function(g){return function(){this.month=((g.length==3)?Date.getMonthNumberFromName(g):(Number(g)-1))}},year:function(g){return function(){var j=Number(g);this.year=((g.length>2)?j:(j+(((j+2000)<Date.CultureInfo.twoDigitYearMax)?2000:1900)))}},rday:function(g){return function(){switch(g){case"yesterday":this.days=-1;break;case"tomorrow":this.days=1;break;case"today":this.days=0;break;case"now":this.days=0;this.now=true;break}}},finishExact:function(g){g=(g instanceof Array)?g:[g];var j=new Date();this.year=j.getFullYear();this.month=j.getMonth();this.day=1;this.hour=0;this.minute=0;this.second=0;for(var k=0;k<g.length;k++){if(g[k]){g[k].call(this)}}this.hour=(this.meridian=="p"&&this.hour<13)?this.hour+12:this.hour;if(this.day>Date.getDaysInMonth(this.year,this.month)){throw new RangeError(this.day+" is not a valid value for days.")}var l=new Date(this.year,this.month,this.day,this.hour,this.minute,this.second);if(this.timezone){l.set({timezone:this.timezone})}else{if(this.timezoneOffset){l.set({timezoneOffset:this.timezoneOffset})}}return l},finish:function(g){g=(g instanceof Array)?f(g):[g];if(g.length===0){return null}for(var m=0;m<g.length;m++){if(typeof g[m]=="function"){g[m].call(this)}}if(this.now){return new Date()}var j=Date.today();var p=null;var n=!!(this.days!=null||this.orient||this.operator);if(n){var o,l,k;k=((this.orient=="past"||this.operator=="subtract")?-1:1);if(this.weekday){this.unit="day";o=(Date.getDayNumberFromName(this.weekday)-j.getDay());l=7;this.days=o?((o+(k*l))%l):(k*l)}if(this.month){this.unit="month";o=(this.month-j.getMonth());l=12;this.months=o?((o+(k*l))%l):(k*l);this.month=null}if(!this.unit){this.unit="day"}if(this[this.unit+"s"]==null||this.operator!=null){if(!this.value){this.value=1}if(this.unit=="week"){this.unit="day";this.value=this.value*7}this[this.unit+"s"]=this.value*k}return j.add(this)}else{if(this.meridian&&this.hour){this.hour=(this.hour<13&&this.meridian=="p")?this.hour+12:this.hour}if(this.weekday&&!this.day){this.day=(j.addDays((Date.getDayNumberFromName(this.weekday)-j.getDay()))).getDate()}if(this.month&&!this.day){this.day=1}return j.set(this)}}};var b=Date.Parsing.Operators,e=Date.Grammar,d=Date.Translator,i;e.datePartDelimiter=b.rtoken(/^([\s\-\.\,\/\x27]+)/);e.timePartDelimiter=b.stoken(":");e.whiteSpace=b.rtoken(/^\s*/);e.generalDelimiter=b.rtoken(/^(([\s\,]|at|on)+)/);var a={};e.ctoken=function(m){var l=a[m];if(!l){var n=Date.CultureInfo.regexPatterns;var k=m.split(/\s+/),j=[];for(var g=0;g<k.length;g++){j.push(b.replace(b.rtoken(n[k[g]]),k[g]))}l=a[m]=b.any.apply(null,j)}return l};e.ctoken2=function(g){return b.rtoken(Date.CultureInfo.regexPatterns[g])};e.h=b.cache(b.process(b.rtoken(/^(0[0-9]|1[0-2]|[1-9])/),d.hour));e.hh=b.cache(b.process(b.rtoken(/^(0[0-9]|1[0-2])/),d.hour));e.H=b.cache(b.process(b.rtoken(/^([0-1][0-9]|2[0-3]|[0-9])/),d.hour));e.HH=b.cache(b.process(b.rtoken(/^([0-1][0-9]|2[0-3])/),d.hour));e.m=b.cache(b.process(b.rtoken(/^([0-5][0-9]|[0-9])/),d.minute));e.mm=b.cache(b.process(b.rtoken(/^[0-5][0-9]/),d.minute));e.s=b.cache(b.process(b.rtoken(/^([0-5][0-9]|[0-9])/),d.second));e.ss=b.cache(b.process(b.rtoken(/^[0-5][0-9]/),d.second));e.hms=b.cache(b.sequence([e.H,e.mm,e.ss],e.timePartDelimiter));e.t=b.cache(b.process(e.ctoken2("shortMeridian"),d.meridian));e.tt=b.cache(b.process(e.ctoken2("longMeridian"),d.meridian));e.z=b.cache(b.process(b.rtoken(/^(\+|\-)?\s*\d\d\d\d?/),d.timezone));e.zz=b.cache(b.process(b.rtoken(/^(\+|\-)\s*\d\d\d\d/),d.timezone));e.zzz=b.cache(b.process(e.ctoken2("timezone"),d.timezone));e.timeSuffix=b.each(b.ignore(e.whiteSpace),b.set([e.tt,e.zzz]));e.time=b.each(b.optional(b.ignore(b.stoken("T"))),e.hms,e.timeSuffix);e.d=b.cache(b.process(b.each(b.rtoken(/^([0-2]\d|3[0-1]|\d)/),b.optional(e.ctoken2("ordinalSuffix"))),d.day));e.dd=b.cache(b.process(b.each(b.rtoken(/^([0-2]\d|3[0-1])/),b.optional(e.ctoken2("ordinalSuffix"))),d.day));e.ddd=e.dddd=b.cache(b.process(e.ctoken("sun mon tue wed thu fri sat"),function(g){return function(){this.weekday=g}}));e.M=b.cache(b.process(b.rtoken(/^(1[0-2]|0\d|\d)/),d.month));e.MM=b.cache(b.process(b.rtoken(/^(1[0-2]|0\d)/),d.month));e.MMM=e.MMMM=b.cache(b.process(e.ctoken("jan feb mar apr may jun jul aug sep oct nov dec"),d.month));e.y=b.cache(b.process(b.rtoken(/^(\d\d?)/),d.year));e.yy=b.cache(b.process(b.rtoken(/^(\d\d)/),d.year));e.yyy=b.cache(b.process(b.rtoken(/^(\d\d?\d?\d?)/),d.year));e.yyyy=b.cache(b.process(b.rtoken(/^(\d\d\d\d)/),d.year));i=function(){return b.each(b.any.apply(null,arguments),b.not(e.ctoken2("timeContext")))};e.day=i(e.d,e.dd);e.month=i(e.M,e.MMM);e.year=i(e.yyyy,e.yy);e.orientation=b.process(e.ctoken("past future"),function(g){return function(){this.orient=g}});e.operator=b.process(e.ctoken("add subtract"),function(g){return function(){this.operator=g}});e.rday=b.process(e.ctoken("yesterday tomorrow today now"),d.rday);e.unit=b.process(e.ctoken("minute hour day week month year"),function(g){return function(){this.unit=g}});e.value=b.process(b.rtoken(/^\d\d?(st|nd|rd|th)?/),function(g){return function(){this.value=g.replace(/\D/g,"")}});e.expression=b.set([e.rday,e.operator,e.value,e.unit,e.orientation,e.ddd,e.MMM]);i=function(){return b.set(arguments,e.datePartDelimiter)};e.mdy=i(e.ddd,e.month,e.day,e.year);e.ymd=i(e.ddd,e.year,e.month,e.day);e.dmy=i(e.ddd,e.day,e.month,e.year);e.date=function(g){return((e[Date.CultureInfo.dateElementOrder]||e.mdy).call(this,g))};e.format=b.process(b.many(b.any(b.process(b.rtoken(/^(dd?d?d?|MM?M?M?|yy?y?y?|hh?|HH?|mm?|ss?|tt?|zz?z?)/),function(g){if(e[g]){return e[g]}else{throw Date.Parsing.Exception(g)}}),b.process(b.rtoken(/^[^dMyhHmstz]+/),function(g){return b.ignore(b.stoken(g))}))),function(g){return b.process(b.each.apply(null,g),d.finishExact)});var h={};var c=function(g){return h[g]=(h[g]||e.format(g)[0])};e.formats=function(j){if(j instanceof Array){var k=[];for(var g=0;g<j.length;g++){k.push(c(j[g]))}return b.any.apply(null,k)}else{return c(j)}};e._formats=e.formats(["yyyy-MM-ddTHH:mm:ss","ddd, MMM dd, yyyy H:mm:ss tt","ddd MMM d yyyy HH:mm:ss zzz","d"]);e._start=b.process(b.set([e.date,e.time,e.expression],e.generalDelimiter,e.whiteSpace),d.finish);e.start=function(g){try{var j=e._formats.call({},g);if(j[1].length===0){return j}}catch(k){}return e._start.call({},g)}}());Date._parse=Date.parse;Date.parse=function(a){var b=null;if(!a){return null}try{b=Date.Grammar.start.call({},a)}catch(c){return null}return((b[1].length===0)?b[0]:null)};Date.getParseFunction=function(b){var a=Date.Grammar.formats(b);return function(c){var d=null;try{d=a.call({},c)}catch(f){return null}return((d[1].length===0)?d[0]:null)}};Date.parseExact=function(a,b){return Date.getParseFunction(b)(a)};Date.datenow=function(){return new Date()};Date.today=function(){return Date.datenow().clearTime()};Date.prototype._orient=+1;Date.prototype.next=function(){this._orient=+1;return this};Date.prototype.last=Date.prototype.prev=Date.prototype.previous=function(){this._orient=-1;return this};Date.prototype._is=false;Date.prototype.is=function(){this._is=true;return this};Number.prototype._dateElement="day";Number.prototype.fromNow=function(){var a={};a[this._dateElement]=this;return Date.datenow().add(a)};Number.prototype.ago=function(){var a={};a[this._dateElement]=this*-1;return Date.datenow().add(a)};(function(){var g=Date.prototype,a=Number.prototype;var p=("sunday monday tuesday wednesday thursday friday saturday").split(/\s/),o=("january february march april may june july august september october november december").split(/\s/),n=("Millisecond Second Minute Hour Day Week Month Year").split(/\s/),m;var l=function(i){return function(){if(this._is){this._is=false;return this.getDay()==i}return this.moveToDayOfWeek(i,this._orient)}};for(var f=0;f<p.length;f++){g[p[f]]=g[p[f].substring(0,3)]=l(f)}var h=function(i){return function(){if(this._is){this._is=false;return this.getMonth()===i}return this.moveToMonth(i,this._orient)}};for(var d=0;d<o.length;d++){g[o[d]]=g[o[d].substring(0,3)]=h(d)}var e=function(i){return function(){if(i.substring(i.length-1)!="s"){i+="s"}return this["add"+i](this._orient)}};var b=function(i){return function(){this._dateElement=i;return this}};for(var c=0;c<n.length;c++){m=n[c].toLowerCase();g[m]=g[m+"s"]=e(n[c]);a[m]=a[m+"s"]=b(m)}}());Date.prototype.toJSONString=function(){return this.datetostring("yyyy-MM-ddThh:mm:ssZ")};Date.prototype.toShortDateString=function(){return this.datetostring(Date.CultureInfo.formatPatterns.shortDatePattern)};Date.prototype.toLongDateString=function(){return this.datetostring(Date.CultureInfo.formatPatterns.longDatePattern)};Date.prototype.toShortTimeString=function(){return this.datetostring(Date.CultureInfo.formatPatterns.shortTimePattern)};Date.prototype.toLongTimeString=function(){return this.datetostring(Date.CultureInfo.formatPatterns.longTimePattern)};Date.prototype.getOrdinal=function(){switch(this.getDate()){case 1:case 21:case 31:return"st";case 2:case 22:return"nd";case 3:case 23:return"rd";default:return"th"}};;

(function($) {
  
  // initialize iv if it doesn't exist yet
  $.fn.iv_datepicker = function(options) {
    var i = 0;
    return this.each(function() {
      new $.iv.datepicker(this, options);
    });
  };
  
  $.iv = $.iv || {};

  var month_cache         = [];
  var month_period_cache  = [];
  var html_cache          = [];
  var month_year_cache    = [];
  // create the global method
  $.iv.datepicker = function(el, options) {
    var id = el.id;
    var current_month;
    var selected_date = '';
    var months =  $("#" + id).find('.day').length / 42;
    var link_id = 'link_' + id;
    var initialized = false;
    var m_counter;

    options = $.extend({
      locale      : 'en-US',
      empty_by_default : false,
      begin_month : {
        'month' : Date.today().getMonth(),
        'year'  : Date.today().getFullYear()
      },
      selected_date: ''
    }, options);

    selected_date = options.selected_date;

    month_year_cache[options.locale] = [];

    var month_view = function(month, year) {
      // check the month_cache first
      if (month_cache[year + '-' + month] && month_cache[year+'-'+month].hasOwnProperty('length')) {
        return month_cache[year + '-' + month];
      }
      var i;
      var this_month = [];
      var start_date = Date.today().set({ 'month': month, 'year': year, 'day': 1 });
      var days_in_month_view = 0; // 7 days in 6 weeks = 42 days
      var extra_days = 0; // next month's days to show
      var days_in_month = start_date.getDaysInMonth();
      var day_of_week = Date.getDayNumberFromName(start_date.getDayName());

      start_date = start_date.add( { days: -day_of_week });

      // begin with the days of the previous month
      for (i = day_of_week; i > 0; i--) {
        days_in_month_view++;
        this_month.push(start_date.getDate());
        start_date.add( {days: 1} );
      }
      month_period_cache[year+'-'+month] = month_period_cache[year+'-'+month] || {};
      month_period_cache[year+'-'+month].begin = days_in_month_view;
      // continue with the days of the month in question
      for (i = 1; i <= days_in_month; i++) {
        days_in_month_view++;
        this_month.push(i);
      }
      month_period_cache[year+'-'+month].end = days_in_month_view;
        
      // finish with the days of the next month
      while (days_in_month_view < 42) {
        days_in_month_view++;
        extra_days++;
        this_month.push(extra_days);
      }
      // update the cache and return
      month_cache[year+'-'+month] = this_month;
      return this_month;
    };

    var populate_table = function(this_month) {
      var month             = this_month.getMonth();
      var year              = this_month.getFullYear();
      var this_month_data   = month_view(month, year);
      var month_year_format = Date.CultureInfo.formatPatterns['yearMonth'];
      var day_cells;
      var month_year = month + '_' + year;
      $("#" + id).find('.month_' + m_counter).find('.month_year').html(this_month.datetostring(month_year_format)).attr('month_year', month_year);
      month_year_cache[options.locale][month_year] = { 'year' : year, 'month' : month };
      if (html_cache[year+'-'+month]) {
        $("#" + id).find('.month_' + m_counter).find('tbody').html(html_cache[year+'-'+month]);
        var index_month = (month >= 9) ? month + 1 : '0' + (month + 1);
        if (selected_date && selected_date.substr(0,2) == index_month && selected_date.substr(6,4) == year) {
          index_day = parseInt(selected_date.substr(3,2), 10);
          $($("#" + id).find('.month_' + m_counter).find('.day').filter('.selectable')[index_day-1]).addClass('date_picked');
        }
        return;
      }

      // pretty straight forward, populate each table cell with this_month_data
      // and change CSS classes as needed
      day_cells = $("#" + id).find('.month_' + m_counter).find('.day');
      for (i = 0; i < 42; i++) {
        $(day_cells[i]).removeClass('selectable');
        $(day_cells[i]).removeClass('nonselectable');
        $(day_cells[i]).removeClass('date_picked');
        if (i >= month_period_cache[year + '-' + month].begin && i < month_period_cache[year + '-' + month].end) {
          $(day_cells[i]).addClass('selectable');
          var string_month = new String(month + 1);
          if (string_month.length == 1) {
            string_month = '0' + string_month;
          }
          var string_day = new String(this_month_data[i]);
          if (string_day.length == 1) {
            string_day = '0' + string_day;
          }
          var string_year = new String(year);
          var current_date = string_month + '-' + string_day + '-' + string_year;
          if (
              typeof selected_date != 'undefined' && 
              (
               !(selected_date < current_date) && 
               !(selected_date > current_date)
              )
             ) {
            $(day_cells[i]).addClass('date_picked');
          }
        }
        else {
          $(day_cells[i]).addClass('nonselectable');
        }
        $(day_cells[i]).html(this_month_data[i]);
      }
      html_cache[year+'-'+month] = $("#" + id).find('.month_' + m_counter).find('tbody').html();
    };
    
    var set_month_view = function(mm, yy) {
      var this_month = Date.today().set({ 'month': mm, 'year': yy, 'day': 1});
      for (m_counter = 1; m_counter <= months; m_counter++) {
        if (m_counter != 1) {
          this_month = this_month.addMonths(1);
        }
        populate_table(this_month);
        $('#'+id).find('.day').unbind('click');
        if (initialized) {
          // events get lost, so we have to rebind
          bind_click();
        }
      }
    };

    set_month_view(options['begin_month'].month, options['begin_month'].year);
    current_month = Date.today().set({ 'month' : options['begin_month'].month, 'year':  options['begin_month'].year, 'day' : 1})
    initialized = true;

   // set the day names
    var weekdays = $("#" + id).find('.weekdays').children();
    var weekday_counter = 0;
    for (i = 1; i <= months; i++) {
      for (j = 0; j < 7; j++) {      
        $(weekdays[weekday_counter]).html(Date.CultureInfo.shortestDayNames[j]);
        weekday_counter++;
      }
    }

    var day_width = new String(Math.floor(100/weekday_counter));
    day_width = day_width + '%';
    if ($.browser.msie) {
      $("#" + id).find('.day').attr({width: day_width});
    }
    else {
      $("#" + id).find('.day').css({width: day_width});
    }
    // show previous month
    $("#" + id).find(".prev").bind('click', function() {
      current_month = current_month.addMonths(-1);
      set_month_view(current_month.getMonth(), current_month.getFullYear());
    });

    // show next month
    $("#" + id).find(".next").bind('click', function() {
      current_month = current_month.addMonths(1);
      set_month_view(current_month.getMonth(), current_month.getFullYear());
    });

    var show_datepicker = function() {
      var dialog = $("#" + id).find(".datepicker_container");
      var close = $("#" + id).find(".close");
      var image = $(close).find("img");
      var open_pos;
      dialog.show();
      open_pos = $("#" + id).find(".open").offset({scroll: false});
      if (open_pos) {
        $(close).css({left: dialog.width() - image.width()});
      }
    };

    if (!$("#" + link_id)[0]) {
      var parsed_date;
      if ($("#" + id).find(".date_field")[0].value) {
        parsed_date = Date.parse($("#" + id).find(".date_field")[0].value);
        options.empty_by_default = false;
      }
      else {
        parsed_date = Date.today();
      }
      if(!options.empty_by_default && parsed_date) {
        $("#" + id).find(".date_field")[0].value = parsed_date.datetostring(
          Date.CultureInfo.formatPatterns['shortDate']
        );
      }
      // show the datepicker when the field gets focus, blur immediatly afterwards
      $("#" + id).find(".date_field").bind('click', function(ev) {
//        var input = $(this);
//        var dialog = $("#" + id).find(".datepicker_container");
//        var offsetX  = (ev.offsetX || ev.clientX - $(ev.target).offset().left);
//        var left = offsetX < dialog.width() ? dialog.width() : offsetX
//        left = input.offset().left + offsetX;
//        dialog.css({
//          left: left
//        });
        show_datepicker();
//        this.blur();
      });
    }

    // show the datepicker when you click the icon
    $("#" + id).find(".open").bind('click', function(ev) {
//      var $cal_icon = $(this);
//      var dialog = $("#" + id).find(".datepicker_container");
//      var $input = $cal_icon.prev();
//      var offsetX  = (ev.offsetX || ev.clientX - $(ev.target).offset().left);
//      var left = offsetX + $cal_icon.offset().left - dialog.width();
//      dialog.css({
//          left: left
//      });
      show_datepicker();
    });
    
    // close the popup
    $("#" + id).find(".close").bind('click', function() {
      $("#" + id).find(".datepicker_container").hide();
    });

    var bind_click = function() {
      // Pick a date
      $("#" + id).find(".day").bind('click', function() {
        var display_date, month_year, std_month_year, day, month, format;
        if ($(this).hasClass('selectable')) {
          // we're selecting another day, forget previous selection
          $(".date_picked", $("#" + id)).removeClass('date_picked');
          //                       td     tr     tbody    thead
          month_year = $(this).parent().parent().prev().find('.month_year').attr('month_year');
          std_month_year = month_year_cache[options.locale][month_year];
          display_date = Date.today().set({
            'month' : std_month_year.month, 
            'year': std_month_year.year, 
            'day': parseInt($(this).text(), 10)
          });

          // prepare de string for display
          day = new String($(this).text());
          if (day.length == 1) {
            day = new String('0' + day);
          }

          month = new String(std_month_year.month + 1);
          if (month.length == 1) {
            month = '0' + month;
          }

          selected_date = month + '-' + day + '-' + std_month_year.year;
          $(this).addClass('date_picked');
          format = Date.CultureInfo.formatPatterns['shortDate'];
          if (!$("#" + link_id)[0]) {
            $("#" + id).find(".date_field")[0].value = display_date.datetostring(format);
          }
          else {
            $("#" + link_id)[0].value = display_date.datetostring(format);
          }
          
          var container = $("#" + id).find(".datepicker_container");
          if (container.hasClass('popup')) {
            container.hide();
          }
          
          if (options.callback) {
            options.callback(selected_date);
          }
          $('.date_field', $("#" + id)).trigger('change');
        }
      });
    };
    bind_click();
    return;
  };
})(jQuery);
;

(function($) {

  // Init customform
  $.fn.iv_customform = function (options) {
    return this.each(function() {
        new $.iv.customform(this, options);
    });
  };

  $.iv.customform = function (el, options) {
    var options = $.extend({
      ajax_uri: null,
      decimal_a_message: '',
      decimal_b_message: '',
      dummy_data: null,
      email_message: '',
      extension: '.html',
      file_extension_message: 'file bad',
      hidden_recaptcha_id: null,
      js_view: null,
      number_message: '',
      phone_message: '',
      recaptcha_id: null,
      recaptcha_message: '',
      recaptcha_sitekey: '',
      regions: '',
      required_message: '',
      after_submit_data: null
    }, options);

    var $$ = $(el);
    var $iframe;
    var errors = [];
    var regions = {};
    _init();

    function _update_loaded_at() {
      var form_id = $$.attr('id');

      var params = {
        id:      $('#'+form_id+'_id', $$).val(),
        values:  $('#'+form_id+'_values', $$).val(),
        form_id: form_id
      };

      $.iv.post_json('/website/widget/update_loaded_at', params);
    }

    function _init() {
      if (options.ajax_uri) {
        _update_loaded_at();
      }

      _init_regions();
      _init_validation();
      _init_toggle_options();
      if(options.js_view) {
        _init_js_view();
      }
    }

    function _init_regions() {
      regions = JSON.parse(decodeURIComponent(options.regions));
      $("select[linked]", $$).each(function () {
        var $select = $(this);
        var country_id = $(this).attr('linked');
        var $country_sel = $("#"+country_id);

        $country_sel.change(function () {
          var country = $("option:selected", $country_sel).text();
          // see if we have regions defined for country
          if (country && regions[country]) {
            var country_regions = regions[country];
            $select.empty();
            $select.append($("<option value=''></option>"));
            for (var j = 0; j < country_regions.length; j++) {
              var $option = $("<option value='"+country_regions[j]['id']+"'>"+country_regions[j]['name']+"</option>");
              // Set default value
              if ($select.attr('default_value') == country_regions[j]['name']) {
                $option.attr('selected', true);
              }
              $select.append($option);
            }
            $select.show().removeClass('disabled');
            $select.next().hide().addClass('disabled');
          }
          else {
            $select.empty();
            $select.hide().addClass('disabled');
            var $input = $select.next();
            $input.show().removeClass('disabled');
          }
        });

        $country_sel.change();        
      });
    }

    function _init_validation() {
      // Add phone number
      $.validator.addMethod("phone", function (phone_number, element) {
        return phone_number.match(/^[0-9\(\)\- ]*$/);
      }, options.phone_message);
      // Add decimal number
      $.validator.addMethod("decimal", function (number, element) {
        var decimals = parseInt($(element).attr('decimal_places'));
        if (decimals > 0) {
          var regex = new RegExp("^\\d*\\.?\\d{0,"+decimals+"}$");
          return(regex.test(number));
        }
        else {
          return(number.match(/^[0-9]*$/));
        }
      }, function (result, element) {
        var decimals = parseInt($(element).attr('decimal_places'));
        if (decimals > 0) {
          return(options.decimal_a_message + decimals + options.decimal_b_message + Array(decimals+1).join('1'));
        }
        else {
          return(options.number_message);
        }
      });
      // Check for valid extension (reject .exe .pif . bat .scr .lnk .com .vbs)
      $.validator.addMethod('file_upload', function (filename, element) {
        return ! filename.match(/\.(exe|pif|bat|scr|lnk|com|vbs)$/);
      }, options.file_extension_message);

      var validation_messages = {
        required: options.required_message,
        email:    options.email_message
      };

      var validation_rules = {
        ".phone": {
          phone: true
        }
      };

      if(options.recaptcha_id && options.hidden_recaptcha_id) {
        validation_rules[options.hidden_recaptcha_id] = {
          required: true
        };
        validation_messages[options.hidden_recaptcha_id] = options.recaptcha_message;
      }

      $.extend($.validator.messages, validation_messages);

      $$.validate({
        ignore: ".ignore",
        rules: validation_rules,
        messages: $.validator.messages,
        errorClass: "invalid"
      });
      $$.submit(_on_submit);
    }

    function _init_recaptcha() {
      var $submit = $("input.submit", $$);
      $("input.hidden_submit", $$).val($submit.val());
      var $hidden_el = $("input.hidden_recaptcha", $$);
      var block_action = true;
      if($submit) {
        grecaptcha.render($submit.attr("id"), {
          "sitekey"  : options.recaptcha_sitekey,
          "badge"    : "inline",
          "callback" : function(recaptcha_response) {
            $hidden_el.val(recaptcha_response);
            block_action = false;
            $$.submit();
          }
        });
        $submit.unbind("click").bind("click", function(e) {
          if(!block_action) {
            $$.submit();
          }
        });
      }
    }

    function _init_toggle_options() {
      // Enable/disable other option in radio & checkboxes
      $("input[other][type=radio]").each(function () {
        var input_other = this;
        var label = $(this).attr('name');
        $('input[name="'+label+'"]').change(function () {
          if ($(input_other).is(":checked")) {
            $(input_other).next().removeAttr("disabled").removeClass("disabled");
          } else {
            $(input_other).next().attr('disabled', 'disabled').addClass('disabled');
          }
        });
      }).change();
      $("input[other][type=checkbox]").change(function () {
        if ($(this).is(":checked")) {
          $(this).next().removeAttr("disabled").removeClass("disabled");
        } else {
          $(this).next().attr('disabled', 'disabled').addClass("disabled");
        }
      }).change();
    }

    function _init_js_view() {
      // If using javascript to display form, create iframe and set properties
      var $wrap = $$.wrap('<div class="js_view_wrapper"></div>');
      var iframe_id = $$.attr('id')+'_iframe';
      $iframe = $('<iframe id="'+iframe_id+'" name="'+iframe_id+'" src="about:blank"></iframe>').hide();
      $wrap.parent().after($iframe);
      $$.attr('target', iframe_id);
      if (options.ajax_uri) {
        $$.attr('action', options.ajax_uri);
      }
      else {
        $$.attr('action', '/public/customform/js_view');
      }
    }

    function _on_submit () {
/*      if(options.recaptcha_id && options.hidden_recaptcha_id) {
        alert($('.g-recaptcha-response', $('#' + options.recaptcha_id)).val());
        $('#' + options.hidden_recaptcha_id).val($('.g-recaptcha-response', $('#' + options.recaptcha_id)).val());
      }*/
      if ($$.valid()) {
        var restore_hash = {};
        $("select[linked]", $$).each(function () {
          var $select = $(this);
          var country_id = $(this).attr('linked');
          restore_hash[country_id] = $select.val();
        });
        // Hidden captcha info doesn't need to be submitted, so go ahead and remove before submit
        if(options.hidden_recaptcha_id) {
          $('#' + options.hidden_recaptcha_id).remove();
        }
        // If we're using dummy data, don't actually submit anything.
        if (options.dummy_data) {
          alert('Please set up calendar.')
          return false;
        }

        // Check for prototype.js.  Prototype is conflicting and extending array's adding toJSON which
        // messes up the JSON.stringify call
        if (window.Prototype) {
          delete Array.prototype.toJSON;
        }

        // Group contact fields
        var contact_fields = $('[contact_field]', $$);
        var contact_groups = {};
        for (var i=0; i < contact_fields.length; i++) {
          var field = contact_fields[i];
          var cf_id = $(field).attr('contact_field');
          var column = $(field).attr('column_name');
          if (! contact_groups[cf_id]) { contact_groups[cf_id] = {} }
          contact_groups[cf_id][column] = $(field).attr('name');
        }
        if ($("input[name='_contact_groups']")[0]) {
          $("input[name='_contact_groups']").val(JSON.stringify(contact_groups));
        } else {
          $("<input />").attr('type', 'hidden')
            .attr('name', '_contact_groups')
            .attr('value', JSON.stringify(contact_groups))
            .appendTo($$);
        }

        // Mark country fields
        var $country_fields = $('[custom_country]', $$);
        var custom_countries = [];
        for (var i=0; i < $country_fields.length; i++) {
          var $field = $($country_fields[i]);
          custom_countries.push($field.attr('name'));
        }
        if ($("input[name='_custom_countries']", $$)[0]) {
          $("input[name='_custom_countries']", $$).val(JSON.stringify(custom_countries));
        } else {
          $("<input />").attr('type', 'hidden')
            .attr('name', '_custom_countries')
            .val(JSON.stringify(custom_countries))
            .appendTo($$);
        }

        // Mark state fields
        var $state_fields = $('[custom_state]', $$);
        var custom_states = [];
        for (var i=0; i < $state_fields.length; i++) {
          var $field = $($state_fields[i]);
          custom_states.push($field.attr('name'));
        }
        if ($("input[name='_custom_states']", $$)[0]) {
          $("input[name='_custom_states']", $$).val(JSON.stringify(custom_states));
        } else {
          $("<input />").attr('type', 'hidden')
            .attr('name', '_custom_states')
            .val(JSON.stringify(custom_states))
            .appendTo($$);
        }
        

        // Mark upload file fields
        var $upload_fields = $('input[type="file"]', $$);
        var uploads = [];
        for (var i=0; i < $upload_fields.length; i++) {
          var $field = $($upload_fields[i]);
          uploads.push($field.attr('name'));
        }
        if ($("input[name='_uploads']", $$)[0]) {
          $("input[name='_uploads']", $$).val(JSON.stringify(uploads));
        } else {
          $("<input />").attr('type', 'hidden')
            .attr('name', '_uploads')
            .val(JSON.stringify(uploads))
            .appendTo($$);
        }

        $(".disabled", $$).remove();

        // If using javascript for displaying forms, submit to iframe
        if (options.js_view) {
          var parent_type = (options.ajax_uri)?'customform':'iv';
          var $iv         = $$.parents('div[type="'+parent_type+'"]');

          if (parent_type == 'iv') {
            // Add __data & __block_id
            $("<input />").attr('type', 'hidden')
              .attr('name', '__data')
              .val($iv.attr('data'))
              .appendTo($$);
            $("<input />").attr('type', 'hidden')
              .attr('name', '__block_id')
              .val($iv.attr('block_id'))
              .appendTo($$);
          }

          // After iframe is loaded...
          $iframe.load(function () {
            var iframe_content = $iframe.contents().find('body');

            var data = $iv.attr('data');
            if (data) {
              // legacy
              data = JSON.parse(decodeURIComponent(data));
              if (data) { data = data['values']; }
            }
            else {
              data = options.after_submit_data;
            }

            if (data) {
              if (data['confirm_message']) {
                var form_id = $$.attr('id');
                $('.js_view_wrapper', $iv).html(iframe_content.html());
                var iframe_id = $(this).attr('id');
                $$ = $('#' + form_id); // reload DO NOT remove this is deliberate
                $$.attr('target', iframe_id);
                if (options.ajax_uri) {
                  $$.attr('action', options.ajax_uri);
                }
                else {
                  $$.attr('action', '/public/customform/js_view');
                }
                _init_regions();
                _init_validation();
                _init_toggle_options();
                if(options.hidden_recaptcha_id && ($('#' + options.hidden_recaptcha_id).length > 0)) {
                  _init_recaptcha();
                }
                // Restore values
                $.each(restore_hash, function(key, val) {
                  $("select[linked='" + key + "']", $$).each(function () {
                    $(this).val(val);
                  });
                });
              }
              else if (data['confirm_page']) {
                // We need to do some checking to see if file exists, if not, try ../page
                var page = data['confirm_page'] + '.' + options.extension;
                $.ajax({
                  url: page,
                  type: "get",
                  error: function () {
                    page = '../'+ page;
                    window.location = page;
                  },
                  success: function () {
                    window.location = page;
                  }
                });
              }
              else if (data['confirm_url']) {
                window.location = data['confirm_url'];
              }
              else {
                // we shouldn't get here, but ...
                $iv.html('Form submitted');
              }
            }

//            $iframe.unbind('load');
            setTimeout(function () {
              iframe_content.html('');
            }, 1);
          });
        }
      }
    }

    function _check_number (value) {
      if (!isNaN(parseFloat(value)) && isFinite(value)) {
        return true;
      } else {
        return false;
      }
    }

    function _check_required (value) {
      if (value == '') {
        return false;
      } else {
        return true;
      }
    }
  };
  
})(jQuery);

  
;

/*! jQuery Validation Plugin - v1.11.1 - 3/22/2013\n* https://github.com/jzaefferer/jquery-validation
* Copyright (c) 2013 Jörn Zaefferer; Licensed MIT */(function(t){t.extend(t.fn,{validate:function(e){if(!this.length)return e&&e.debug&&window.console&&console.warn("Nothing selected, can't validate, returning nothing."),void 0;var i=t.data(this[0],"validator");return i?i:(this.attr("novalidate","novalidate"),i=new t.validator(e,this[0]),t.data(this[0],"validator",i),i.settings.onsubmit&&(this.validateDelegate(":submit","click",function(e){i.settings.submitHandler&&(i.submitButton=e.target),t(e.target).hasClass("cancel")&&(i.cancelSubmit=!0),void 0!==t(e.target).attr("formnovalidate")&&(i.cancelSubmit=!0)}),this.submit(function(e){function s(){var s;return i.settings.submitHandler?(i.submitButton&&(s=t("<input type='hidden'/>").attr("name",i.submitButton.name).val(t(i.submitButton).val()).appendTo(i.currentForm)),i.settings.submitHandler.call(i,i.currentForm,e),i.submitButton&&s.remove(),!1):!0}return i.settings.debug&&e.preventDefault(),i.cancelSubmit?(i.cancelSubmit=!1,s()):i.form()?i.pendingRequest?(i.formSubmitted=!0,!1):s():(i.focusInvalid(),!1)})),i)},valid:function(){if(t(this[0]).is("form"))return this.validate().form();var e=!0,i=t(this[0].form).validate();return this.each(function(){e=e&&i.element(this)}),e},removeAttrs:function(e){var i={},s=this;return t.each(e.split(/\s/),function(t,e){i[e]=s.attr(e),s.removeAttr(e)}),i},rules:function(e,i){var s=this[0];if(e){var r=t.data(s.form,"validator").settings,n=r.rules,a=t.validator.staticRules(s);switch(e){case"add":t.extend(a,t.validator.normalizeRule(i)),delete a.messages,n[s.name]=a,i.messages&&(r.messages[s.name]=t.extend(r.messages[s.name],i.messages));break;case"remove":if(!i)return delete n[s.name],a;var u={};return t.each(i.split(/\s/),function(t,e){u[e]=a[e],delete a[e]}),u}}var o=t.validator.normalizeRules(t.extend({},t.validator.classRules(s),t.validator.attributeRules(s),t.validator.dataRules(s),t.validator.staticRules(s)),s);if(o.required){var l=o.required;delete o.required,o=t.extend({required:l},o)}return o}}),t.extend(t.expr[":"],{blank:function(e){return!t.trim(""+t(e).val())},filled:function(e){return!!t.trim(""+t(e).val())},unchecked:function(e){return!t(e).prop("checked")}}),t.validator=function(e,i){this.settings=t.extend(!0,{},t.validator.defaults,e),this.currentForm=i,this.init()},t.validator.format=function(e,i){return 1===arguments.length?function(){var i=t.makeArray(arguments);return i.unshift(e),t.validator.format.apply(this,i)}:(arguments.length>2&&i.constructor!==Array&&(i=t.makeArray(arguments).slice(1)),i.constructor!==Array&&(i=[i]),t.each(i,function(t,i){e=e.replace(RegExp("\\{"+t+"\\}","g"),function(){return i})}),e)},t.extend(t.validator,{defaults:{messages:{},groups:{},rules:{},errorClass:"error",validClass:"valid",errorElement:"label",focusInvalid:!0,errorContainer:t([]),errorLabelContainer:t([]),onsubmit:!0,ignore:":hidden",ignoreTitle:!1,onfocusin:function(t){this.lastActive=t,this.settings.focusCleanup&&!this.blockFocusCleanup&&(this.settings.unhighlight&&this.settings.unhighlight.call(this,t,this.settings.errorClass,this.settings.validClass),this.addWrapper(this.errorsFor(t)).hide())},onfocusout:function(t){this.checkable(t)||!(t.name in this.submitted)&&this.optional(t)||this.element(t)},onkeyup:function(t,e){(9!==e.which||""!==this.elementValue(t))&&(t.name in this.submitted||t===this.lastElement)&&this.element(t)},onclick:function(t){t.name in this.submitted?this.element(t):t.parentNode.name in this.submitted&&this.element(t.parentNode)},highlight:function(e,i,s){"radio"===e.type?this.findByName(e.name).addClass(i).removeClass(s):t(e).addClass(i).removeClass(s)},unhighlight:function(e,i,s){"radio"===e.type?this.findByName(e.name).removeClass(i).addClass(s):t(e).removeClass(i).addClass(s)}},setDefaults:function(e){t.extend(t.validator.defaults,e)},messages:{required:"This field is required.",remote:"Please fix this field.",email:"Please enter a valid email address.",url:"Please enter a valid URL.",date:"Please enter a valid date.",dateISO:"Please enter a valid date (ISO).",number:"Please enter a valid number.",digits:"Please enter only digits.",creditcard:"Please enter a valid credit card number.",equalTo:"Please enter the same value again.",maxlength:t.validator.format("Please enter no more than {0} characters."),minlength:t.validator.format("Please enter at least {0} characters."),rangelength:t.validator.format("Please enter a value between {0} and {1} characters long."),range:t.validator.format("Please enter a value between {0} and {1}."),max:t.validator.format("Please enter a value less than or equal to {0}."),min:t.validator.format("Please enter a value greater than or equal to {0}.")},autoCreateRanges:!1,prototype:{init:function(){function e(e){var i=t.data(this[0].form,"validator"),s="on"+e.type.replace(/^validate/,"");i.settings[s]&&i.settings[s].call(i,this[0],e)}this.labelContainer=t(this.settings.errorLabelContainer),this.errorContext=this.labelContainer.length&&this.labelContainer||t(this.currentForm),this.containers=t(this.settings.errorContainer).add(this.settings.errorLabelContainer),this.submitted={},this.valueCache={},this.pendingRequest=0,this.pending={},this.invalid={},this.reset();var i=this.groups={};t.each(this.settings.groups,function(e,s){"string"==typeof s&&(s=s.split(/\s/)),t.each(s,function(t,s){i[s]=e})});var s=this.settings.rules;t.each(s,function(e,i){s[e]=t.validator.normalizeRule(i)}),t(this.currentForm).validateDelegate(":text, [type='password'], [type='file'], select, textarea, [type='number'], [type='search'] ,[type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], [type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'] ","focusin focusout keyup",e).validateDelegate("[type='radio'], [type='checkbox'], select, option","click",e),this.settings.invalidHandler&&t(this.currentForm).bind("invalid-form.validate",this.settings.invalidHandler)},form:function(){return this.checkForm(),t.extend(this.submitted,this.errorMap),this.invalid=t.extend({},this.errorMap),this.valid()||t(this.currentForm).triggerHandler("invalid-form",[this]),this.showErrors(),this.valid()},checkForm:function(){this.prepareForm();for(var t=0,e=this.currentElements=this.elements();e[t];t++)this.check(e[t]);return this.valid()},element:function(e){e=this.validationTargetFor(this.clean(e)),this.lastElement=e,this.prepareElement(e),this.currentElements=t(e);var i=this.check(e)!==!1;return i?delete this.invalid[e.name]:this.invalid[e.name]=!0,this.numberOfInvalids()||(this.toHide=this.toHide.add(this.containers)),this.showErrors(),i},showErrors:function(e){if(e){t.extend(this.errorMap,e),this.errorList=[];for(var i in e)this.errorList.push({message:e[i],element:this.findByName(i)[0]});this.successList=t.grep(this.successList,function(t){return!(t.name in e)})}this.settings.showErrors?this.settings.showErrors.call(this,this.errorMap,this.errorList):this.defaultShowErrors()},resetForm:function(){t.fn.resetForm&&t(this.currentForm).resetForm(),this.submitted={},this.lastElement=null,this.prepareForm(),this.hideErrors(),this.elements().removeClass(this.settings.errorClass).removeData("previousValue")},numberOfInvalids:function(){return this.objectLength(this.invalid)},objectLength:function(t){var e=0;for(var i in t)e++;return e},hideErrors:function(){this.addWrapper(this.toHide).hide()},valid:function(){return 0===this.size()},size:function(){return this.errorList.length},focusInvalid:function(){if(this.settings.focusInvalid)try{t(this.findLastActive()||this.errorList.length&&this.errorList[0].element||[]).filter(":visible").focus().trigger("focusin")}catch(e){}},findLastActive:function(){var e=this.lastActive;return e&&1===t.grep(this.errorList,function(t){return t.element.name===e.name}).length&&e},elements:function(){var e=this,i={};return t(this.currentForm).find("input, select, textarea").not(":submit, :reset, :image, [disabled]").not(this.settings.ignore).filter(function(){return!this.name&&e.settings.debug&&window.console&&console.error("%o has no name assigned",this),this.name in i||!e.objectLength(t(this).rules())?!1:(i[this.name]=!0,!0)})},clean:function(e){return t(e)[0]},errors:function(){var e=this.settings.errorClass.replace(" ",".");return t(this.settings.errorElement+"."+e,this.errorContext)},reset:function(){this.successList=[],this.errorList=[],this.errorMap={},this.toShow=t([]),this.toHide=t([]),this.currentElements=t([])},prepareForm:function(){this.reset(),this.toHide=this.errors().add(this.containers)},prepareElement:function(t){this.reset(),this.toHide=this.errorsFor(t)},elementValue:function(e){var i=t(e).attr("type"),s=t(e).val();return"radio"===i||"checkbox"===i?t("input[name='"+t(e).attr("name")+"']:checked").val():"string"==typeof s?s.replace(/\r/g,""):s},check:function(e){e=this.validationTargetFor(this.clean(e));var i,s=t(e).rules(),r=!1,n=this.elementValue(e);for(var a in s){var u={method:a,parameters:s[a]};try{if(i=t.validator.methods[a].call(this,n,e,u.parameters),"dependency-mismatch"===i){r=!0;continue}if(r=!1,"pending"===i)return this.toHide=this.toHide.not(this.errorsFor(e)),void 0;if(!i)return this.formatAndAdd(e,u),!1}catch(o){throw this.settings.debug&&window.console&&console.log("Exception occurred when checking element "+e.id+", check the '"+u.method+"' method.",o),o}}return r?void 0:(this.objectLength(s)&&this.successList.push(e),!0)},customDataMessage:function(e,i){return t(e).data("msg-"+i.toLowerCase())||e.attributes&&t(e).attr("data-msg-"+i.toLowerCase())},customMessage:function(t,e){var i=this.settings.messages[t];return i&&(i.constructor===String?i:i[e])},findDefined:function(){for(var t=0;arguments.length>t;t++)if(void 0!==arguments[t])return arguments[t];return void 0},defaultMessage:function(e,i){return this.findDefined(this.customMessage(e.name,i),this.customDataMessage(e,i),!this.settings.ignoreTitle&&e.title||void 0,t.validator.messages[i],"<strong>Warning: No message defined for "+e.name+"</strong>")},formatAndAdd:function(e,i){var s=this.defaultMessage(e,i.method),r=/\$?\{(\d+)\}/g;"function"==typeof s?s=s.call(this,i.parameters,e):r.test(s)&&(s=t.validator.format(s.replace(r,"{$1}"),i.parameters)),this.errorList.push({message:s,element:e}),this.errorMap[e.name]=s,this.submitted[e.name]=s},addWrapper:function(t){return this.settings.wrapper&&(t=t.add(t.parent(this.settings.wrapper))),t},defaultShowErrors:function(){var t,e;for(t=0;this.errorList[t];t++){var i=this.errorList[t];this.settings.highlight&&this.settings.highlight.call(this,i.element,this.settings.errorClass,this.settings.validClass),this.showLabel(i.element,i.message)}if(this.errorList.length&&(this.toShow=this.toShow.add(this.containers)),this.settings.success)for(t=0;this.successList[t];t++)this.showLabel(this.successList[t]);if(this.settings.unhighlight)for(t=0,e=this.validElements();e[t];t++)this.settings.unhighlight.call(this,e[t],this.settings.errorClass,this.settings.validClass);this.toHide=this.toHide.not(this.toShow),this.hideErrors(),this.addWrapper(this.toShow).show()},validElements:function(){return this.currentElements.not(this.invalidElements())},invalidElements:function(){return t(this.errorList).map(function(){return this.element})},showLabel:function(e,i){var s=this.errorsFor(e);s.length?(s.removeClass(this.settings.validClass).addClass(this.settings.errorClass),s.html(i)):(s=t("<"+this.settings.errorElement+">").attr("for",this.idOrName(e)).addClass(this.settings.errorClass).html(i||""),this.settings.wrapper&&(s=s.hide().show().wrap("<"+this.settings.wrapper+"/>").parent()),this.labelContainer.append(s).length||(this.settings.errorPlacement?this.settings.errorPlacement(s,t(e)):s.insertAfter(e))),!i&&this.settings.success&&(s.text(""),"string"==typeof this.settings.success?s.addClass(this.settings.success):this.settings.success(s,e)),this.toShow=this.toShow.add(s)},errorsFor:function(e){var i=this.idOrName(e);return this.errors().filter(function(){return t(this).attr("for")===i})},idOrName:function(t){return this.groups[t.name]||(this.checkable(t)?t.name:t.id||t.name)},validationTargetFor:function(t){return this.checkable(t)&&(t=this.findByName(t.name).not(this.settings.ignore)[0]),t},checkable:function(t){return/radio|checkbox/i.test(t.type)},findByName:function(e){return t(this.currentForm).find("[name='"+e+"']")},getLength:function(e,i){switch(i.nodeName.toLowerCase()){case"select":return t("option:selected",i).length;case"input":if(this.checkable(i))return this.findByName(i.name).filter(":checked").length}return e.length},depend:function(t,e){return this.dependTypes[typeof t]?this.dependTypes[typeof t](t,e):!0},dependTypes:{"boolean":function(t){return t},string:function(e,i){return!!t(e,i.form).length},"function":function(t,e){return t(e)}},optional:function(e){var i=this.elementValue(e);return!t.validator.methods.required.call(this,i,e)&&"dependency-mismatch"},startRequest:function(t){this.pending[t.name]||(this.pendingRequest++,this.pending[t.name]=!0)},stopRequest:function(e,i){this.pendingRequest--,0>this.pendingRequest&&(this.pendingRequest=0),delete this.pending[e.name],i&&0===this.pendingRequest&&this.formSubmitted&&this.form()?(t(this.currentForm).submit(),this.formSubmitted=!1):!i&&0===this.pendingRequest&&this.formSubmitted&&(t(this.currentForm).triggerHandler("invalid-form",[this]),this.formSubmitted=!1)},previousValue:function(e){return t.data(e,"previousValue")||t.data(e,"previousValue",{old:null,valid:!0,message:this.defaultMessage(e,"remote")})}},classRuleSettings:{required:{required:!0},email:{email:!0},url:{url:!0},date:{date:!0},dateISO:{dateISO:!0},number:{number:!0},digits:{digits:!0},creditcard:{creditcard:!0}},addClassRules:function(e,i){e.constructor===String?this.classRuleSettings[e]=i:t.extend(this.classRuleSettings,e)},classRules:function(e){var i={},s=t(e).attr("class");return s&&t.each(s.split(" "),function(){this in t.validator.classRuleSettings&&t.extend(i,t.validator.classRuleSettings[this])}),i},attributeRules:function(e){var i={},s=t(e),r=s[0].getAttribute("type");for(var n in t.validator.methods){var a;"required"===n?(a=s.get(0).getAttribute(n),""===a&&(a=!0),a=!!a):a=s.attr(n),/min|max/.test(n)&&(null===r||/number|range|text/.test(r))&&(a=Number(a)),a?i[n]=a:r===n&&"range"!==r&&(i[n]=!0)}return i.maxlength&&/-1|2147483647|524288/.test(i.maxlength)&&delete i.maxlength,i},dataRules:function(e){var i,s,r={},n=t(e);for(i in t.validator.methods)s=n.data("rule-"+i.toLowerCase()),void 0!==s&&(r[i]=s);return r},staticRules:function(e){var i={},s=t.data(e.form,"validator");return s.settings.rules&&(i=t.validator.normalizeRule(s.settings.rules[e.name])||{}),i},normalizeRules:function(e,i){return t.each(e,function(s,r){if(r===!1)return delete e[s],void 0;if(r.param||r.depends){var n=!0;switch(typeof r.depends){case"string":n=!!t(r.depends,i.form).length;break;case"function":n=r.depends.call(i,i)}n?e[s]=void 0!==r.param?r.param:!0:delete e[s]}}),t.each(e,function(s,r){e[s]=t.isFunction(r)?r(i):r}),t.each(["minlength","maxlength"],function(){e[this]&&(e[this]=Number(e[this]))}),t.each(["rangelength","range"],function(){var i;e[this]&&(t.isArray(e[this])?e[this]=[Number(e[this][0]),Number(e[this][1])]:"string"==typeof e[this]&&(i=e[this].split(/[\s,]+/),e[this]=[Number(i[0]),Number(i[1])]))}),t.validator.autoCreateRanges&&(e.min&&e.max&&(e.range=[e.min,e.max],delete e.min,delete e.max),e.minlength&&e.maxlength&&(e.rangelength=[e.minlength,e.maxlength],delete e.minlength,delete e.maxlength)),e},normalizeRule:function(e){if("string"==typeof e){var i={};t.each(e.split(/\s/),function(){i[this]=!0}),e=i}return e},addMethod:function(e,i,s){t.validator.methods[e]=i,t.validator.messages[e]=void 0!==s?s:t.validator.messages[e],3>i.length&&t.validator.addClassRules(e,t.validator.normalizeRule(e))},methods:{required:function(e,i,s){if(!this.depend(s,i))return"dependency-mismatch";if("select"===i.nodeName.toLowerCase()){var r=t(i).val();return r&&r.length>0}return this.checkable(i)?this.getLength(e,i)>0:t.trim(e).length>0},email:function(t,e){return this.optional(e)||/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(t)},url:function(t,e){return this.optional(e)||/^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(t)},date:function(t,e){return this.optional(e)||!/Invalid|NaN/.test(""+new Date(t))},dateISO:function(t,e){return this.optional(e)||/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(t)},number:function(t,e){return this.optional(e)||/^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(t)},digits:function(t,e){return this.optional(e)||/^\d+$/.test(t)},creditcard:function(t,e){if(this.optional(e))return"dependency-mismatch";if(/[^0-9 \-]+/.test(t))return!1;var i=0,s=0,r=!1;t=t.replace(/\D/g,"");for(var n=t.length-1;n>=0;n--){var a=t.charAt(n);s=parseInt(a,10),r&&(s*=2)>9&&(s-=9),i+=s,r=!r}return 0===i%10},minlength:function(e,i,s){var r=t.isArray(e)?e.length:this.getLength(t.trim(e),i);return this.optional(i)||r>=s},maxlength:function(e,i,s){var r=t.isArray(e)?e.length:this.getLength(t.trim(e),i);return this.optional(i)||s>=r},rangelength:function(e,i,s){var r=t.isArray(e)?e.length:this.getLength(t.trim(e),i);return this.optional(i)||r>=s[0]&&s[1]>=r},min:function(t,e,i){return this.optional(e)||t>=i},max:function(t,e,i){return this.optional(e)||i>=t},range:function(t,e,i){return this.optional(e)||t>=i[0]&&i[1]>=t},equalTo:function(e,i,s){var r=t(s);return this.settings.onfocusout&&r.unbind(".validate-equalTo").bind("blur.validate-equalTo",function(){t(i).valid()}),e===r.val()},remote:function(e,i,s){if(this.optional(i))return"dependency-mismatch";var r=this.previousValue(i);if(this.settings.messages[i.name]||(this.settings.messages[i.name]={}),r.originalMessage=this.settings.messages[i.name].remote,this.settings.messages[i.name].remote=r.message,s="string"==typeof s&&{url:s}||s,r.old===e)return r.valid;r.old=e;var n=this;this.startRequest(i);var a={};return a[i.name]=e,t.ajax(t.extend(!0,{url:s,mode:"abort",port:"validate"+i.name,dataType:"json",data:a,success:function(s){n.settings.messages[i.name].remote=r.originalMessage;var a=s===!0||"true"===s;if(a){var u=n.formSubmitted;n.prepareElement(i),n.formSubmitted=u,n.successList.push(i),delete n.invalid[i.name],n.showErrors()}else{var o={},l=s||n.defaultMessage(i,"remote");o[i.name]=r.message=t.isFunction(l)?l(e):l,n.invalid[i.name]=!0,n.showErrors(o)}r.valid=a,n.stopRequest(i,a)}},s)),"pending"}}}),t.format=t.validator.format})(jQuery),function(t){var e={};if(t.ajaxPrefilter)t.ajaxPrefilter(function(t,i,s){var r=t.port;"abort"===t.mode&&(e[r]&&e[r].abort(),e[r]=s)});else{var i=t.ajax;t.ajax=function(s){var r=("mode"in s?s:t.ajaxSettings).mode,n=("port"in s?s:t.ajaxSettings).port;return"abort"===r?(e[n]&&e[n].abort(),e[n]=i.apply(this,arguments),e[n]):i.apply(this,arguments)}}}(jQuery),function(t){t.extend(t.fn,{validateDelegate:function(e,i,s){return this.bind(i,function(i){var r=t(i.target);return r.is(e)?s.apply(r,arguments):void 0})}})}(jQuery);;

var locale_maportal_uri_map = new Array();
var internal_update_default_price_page = false;

(function($) {
  if(!($.iv)){
    $.extend({ iv: {} });
  }

  // We need traditional param serialization.
  $.ajaxSettings.traditional = true;

  $.iv.on_ajax_success = function(data, text_status, request, callback) {
    // The web server will set Ajax-Location if a redirect is needed.
    var loc = request.getResponseHeader('Ajax-Location')

    if (loc) {
      location.href = loc;
    }
    else {
      if (callback) {
        callback(data, text_status, request);
      }
    }
  };

  $.iv.post_json = function(uri, data, success, error) {
    if(typeof(data) === 'string') {
      data += '&_output=json';
    }
    else {
      data['_output'] = 'json';
    }
    return jQuery.ajax({ url: uri,
                         type: 'post',
                         data: data,
                         success: function(data, text_status, request) {
                           $.iv.on_ajax_success(data, text_status, request, success);
                         },
                         error: error,
                         dataType: 'json' });
  };

  $.iv.post_json_sync = function(uri, data, callback) {
    if(typeof(data) === 'string') {
      data += '&_output=json';
    }
    else {
      data['_output'] = 'json';
    }
    return jQuery.ajax({ url: uri,
                         async: false,
                         type: 'post',
                         data: data,
                         success: callback,
                         dataType: 'json' });
  };

  $.iv.get_uri = function(uri, data) {
    if(typeof(uri) == 'object') {
      uri = uri['uri'];
    }
    
    if(data) {
      uri += '?' + jQuery.param(data);
    }
    location.href = uri;
  };
    
  $.iv.post_uri = function(uri, data) {
    if(typeof(uri) == 'object') {
      uri = uri['uri'];
      data = uri;
    }
    data = data || {};
    var form = jQuery('#action_form').attr({ action: uri }).empty();
    jQuery.each(data, function(key, val) {
      form.append('<input type="hidden" name="' + key + '" value="' + (val ? val.toString().escapeHTML() : '') + '"/>');
    });
    form.submit();
  };

  $.iv.load_uri_into_element = function(data) {
    var uri = data.uri || null;
    var element_id = data.element_id || null;
    var params = data.params || {};
    
    if(uri && element_id) {
      $('#' + element_id).load(uri, params);
    }
  };
    
  $.iv.get_key = function(e) {
    var key = null;
    switch(e.keyCode) {
    case 9: // tab
      key = 'tab';
      break;
    case 13: // return
      key = 'enter';
      break;
    case 16: // shift
      key = 'shift';
      break;
    case 27: // esc
      key = 'esc';
      break;
    }
    return key;
  };

  $.iv.popup_window = function(uri, window_name, options) {
    options = $.extend({
      width: 1010,
      height: 712,
      toolbar: 0,
      location: 0,
      directories: 0,
      status: 0,
      scrollbars: 1,
      resizable: 1
    }, options);
    
    var opt_str = '';
    $.each(options, function(name, val) {
      opt_str += name + '=' + val + ',';
    });
    opt_str = opt_str.slice(0, -1);
    
    window.open(uri, window_name, opt_str);
  };

  // Localize a string by hitting the server and getting the translated string.
  // Don't overuse this!!
  // You can pass 99.99% of the strings from your mason to the JS
  $.iv.loc_strings = {}; // cache the lookups for fast access if called twice for the same string.
  $.iv.loc = function(string) {
    var loc_string = '';
    if($.iv.loc_strings[string]) {
      return($.iv.loc_strings[string]);
    }
    
    $.iv.post_json_sync('/public/loc', { string: string }, function(json) {
      loc_string = json.loc_string;
    });
    $.iv.loc_strings[string] = loc_string;
    return(loc_string);
  };
  
  // takes a normal href link and does a popup
  $.fn.iv_href_popup = function() {
    return this.each(function() {
      $(this).click(function() {
        var name = this.target || 'hrefpopup';
        $.iv.popup_window(this.href, name);
        return(false);
      });
    });
  };
  
  // perform a synchronous load operation.  This is usually needed to ensure that IE
  // processes any embedded JS correctly.
  $.fn.iv_load_sync = function(uri, params, callback) {
    return this.each(function() {
      $.ajaxSetup( { async: false });
      $(this).load(uri, params, callback);
      $.ajaxSetup( { async: true });
    });
  };

  //----------------- Ajax ------------------------------
  $.ajaxSetup( {
    type: 'POST'
  });

  $.iv.loading_timeout = null;
  $.iv.show_loading    = true;
  
  $(document).ajaxStart(function() {
    if($.iv.show_loading) {
      $('body, span.button').addClass('loading');
      $.iv.loading_timeout = setTimeout(function() { $('#loading').show(); }, 1000);
    }
  });
  
  $(document).ajaxComplete(function(e, request, settings) {
    // The web server will set Ajax-Location if a redirect is needed.
    var loc = request.getResponseHeader('Ajax-Location')
    if(loc) {
      location.href = loc;
    }
  });
  
  $(document).ajaxStop(function() {
    if($.iv.show_loading) {
      clearTimeout($.iv.loading_timeout);
      $('#loading').hide();
      $('body, span.button').removeClass('loading');
    }
  });
  //----------------- End Ajax --------------------------
  
  //----------------- Delay -----------------------------
// Delay doesn't work right.  Commenting out for now.
//  $.fn.iv_delay = function(ms) {
//    ms = ms || 1000;
//    return this.each(function() {
//      var $$ = $(this);
//      $(this).queue(function() {
//        setTimeout(function() { $$.dequeue(); }, ms);
//      });
//    });
//  };
//  
//  $.fn.iv_clear_delay = function() {
//    return this.each(function() {
//      var $$ = $(this);
//      if($$.queue) {
//        $$.dequeue().stop();
//      }
//    });
//  };
  //----------------- End Delay --------------------------

  //----------------- Simple Drag -----------------------------
  $.fn.iv_simpledrag = function(options) {
    options = $.extend({
      handle: null,
      constrain: 1
    }, options);
  
    return this.each(function() {
      var handle = options.handle ? $(options.handle, this) : $(this);
      var $$ = $(this);
      var coordinates = {};
      handle.mousedown(function(e) {
        coordinates = {
          left:   parseInt($$.css('left')),
          top:    parseInt($$.css('top')),
          height: parseInt($$.height()),
          width:  parseInt($$.width()),
          page_x: e.pageX,
          page_y: e.pageY
        };
        $(document).mousemove( _drag ).mouseup( _stop );
        return(false);
      });

      if('ontouchend' in document) {
        var offset = null;
        handle.bind('touchstart', function(e) {
          e.preventDefault();
          var orig = e.originalEvent;
          var pos = handle.parent().offset();
          offset = {
            x: orig.changedTouches[0].pageX - pos.left,
            y: orig.changedTouches[0].pageY - pos.top
          };
        });
        handle.bind('touchmove', function(e) {
          e.preventDefault();
          var orig = e.originalEvent;
          var $parent = handle.parent().parent();
          if(handle.attr("tagName") == 'TD') {
            $parent = $parent.parent().parent();
          }
          $parent.css({
            top: orig.changedTouches[0].pageY - offset.y - $(window).scrollTop(),
            left: orig.changedTouches[0].pageX - offset.x - $(window).scrollLeft()
          });
        });
      }
  
      function _drag(e) {
        var new_left = coordinates.left + e.pageX - coordinates.page_x;
        var new_top  = coordinates.top  + e.pageY - coordinates.page_y;

        if(options.constrain) {
          var window_w = $(window).width();
          var window_h = $(window).height();
          var scroll_t = $(window).scrollTop();
          var scroll_l = $(window).scrollLeft();
          if(new_left < scroll_l) {
            new_left = scroll_l;
          }
          else if(new_left + coordinates.width > window_w + scroll_l) {
            new_left = (window_w + scroll_l) - coordinates.width;
          }
          if(new_top + coordinates.height > window_h) {
            new_top = window_h - coordinates.height;
          }
          
          if(new_top < 0) new_top = 0;
        }
        
        $$.css({ left: new_left, top: new_top });
        return(false);
      }
  
      function _stop(e) {
        $(document).unbind('mousemove', _drag).unbind('mouseup', _stop);
      }
  
    });        
  }
  //----------------- End Simple Drag -------------------------

  //----------------- Modal -----------------------------------
  // We use a stack array to track all the open modals.
  // $.iv.modal_stack[0] will always give you the active(on top) modal.
  $.iv.modal_stack  = [];
  $.iv.modal_names  = {};
  $.iv.modal_events = {};
  
  $.iv.modal = function(options) {
    var options = $.extend({
      name: null,
      callback: null,
      on_load: null,
      z_index: 2000,
      uri: false,
      auto_data_change: true,
      params: {},
      classes: [],
      max_height: '500px',
      confirm_close: false,
      close: false,
      before_close: null,
      sync: false,
      maximize: false,
      can_shade: true,
      can_close: true,
      hide_shade: false,
      hide_close: false,
      close_on_escape: true,
      close_previous: false,
      flash: null,
      focus: null,
      height_override: null
    }, options);

    if (options.close_previous && $.iv.modal_stack.length > 0) {
      $.iv.modal_stack[$.iv.modal_stack.length - 1].close();
    }

    $.iv.modal_stack.unshift(this);
    if (options['name']) {
      $.iv.modal_names[options.name] = true;
    }

    // update index
    for (var idx=1; idx<$.iv.modal_stack.length; idx++) {
      $.iv.modal_stack[idx].index = idx;
    }
    
    var id   = 'modal_' + ($.iv.modal_stack.length + 1);
    var shade_html = options.can_shade ? '<div id="' + id + '_shade" class="modal_shade float_r"></div>' : '';
    var close_html = options.can_close ? '<div id="' + id + '_close" class="modal_close float_r"></div>' : '';
    var html = '<div><div class="title_bar_container">' + close_html + shade_html + '<div class="title_bar"></div></div><div id="' + id + '_content" class="content"></div></div>';
    var z    = (options.z_index + ($.iv.modal_stack.length * 2));
    var is_visible = false;
    var overlay = null;
    
    // add the overlay right below the modal
    var $e_menu = $('#editor_menu');
    if($e_menu.length == 1) { // if we are in the editor, we just grey out the top of the page and keep the WYSIWYG clear.
      var overlay_top_height = parseInt($('#editor_content').css('top'));
      overlay = $('<div></div>').addClass('overlay').addClass('editor_overlay').css('z-index', (z - 1)).appendTo('body');
      $('<div></div>').addClass('overlay').addClass('editor_overlay_top').css({'z-index': (z - 1), height: overlay_top_height}).appendTo(overlay);
    }
    else {
      overlay = $('<div></div>').addClass('overlay').addClass('modal_overlay').css('z-index', (z - 1)).appendTo('body');
    }

    var $$ = $(html).attr({ id: id }).addClass('modal_dialog').css('z-index', z).appendTo('body');
    
    $.each(options.classes, function(i, n) {
      $$.addClass(n);
    });

    // Set maximized modal
    if(options.maximize) {
      $('#' + id + '_content').css('max-height', $(window).height() - 50);
      $('#' + id).css('width', $(window).width() - 50);
    }
    else if(options.max_height != '500px') {
      $('#' + id + '_content').css('max-height', options.max_height);
    }
    
    // allow for custom close functions
    if(options.can_close) {
      if(options.close) {
        $('#' + id + '_close').click(function() { options.close(); });
      }
      else {
        $('#' + id + '_close').click(function() { _close(); });
      }

      if(options.hide_close) { _hide_close(); }
    }

    if(options.can_shade) {
      $('#' + id + '_shade').click(function() { _shade(); });
      if(options.hide_shade) { _hide_shade(); }
    }

    _load(options.uri, options.params, options.on_load, options.flash);

    /********** Public Methods **************/

    this.load = _load;
    this.data_change = _data_change;
    this.close = _close;
    this.center = _center;
    this.confirm_close = _confirm_close;
    this.set_confirm = _set_confirm;
    this.shade = _shade;
    this.unshade = _unshade;
    this.hide = _hide;
    this.show = _show;
    this.hide_shade = _hide_shade;
    this.show_shade = _show_shade;
    this.hide_close = _hide_close;
    this.show_close = _show_close;
    this.before_close = options.before_close;
    this.close_on_escape = options.close_on_escape;
    this.is_visible = _is_visible;
    this.id = function () { return id; };
    this.name = options.name;
    this.index = 0;

    /********** Private Methods *************/

    function _load(url, params, callback, flash) {
      $$.hide();
      is_visible = false;

      var on_load = function() {
        _center();
        if (options.focus) { $('#'+options.focus, $$).focus(); }
        if (callback) { callback(); }
        $$.trigger('loaded.modal');
        // Chrome is sometimes having trouble rendering modals in certain 
        // situations. No clue to the reason, but hiding and redisplaying 
        // the modal causes it to render properly
        _hide();
        setTimeout(function () { _show(); }, 10);

        if ($.iv.modal_events) {
          for (var key in $.iv.modal_events) {
            var obj = $.iv.modal_events[key]['obj'];
            if (obj) {
              obj[$.iv.modal_events[key]['on_open']]();
            }
          }
        }
      };
      
      if (url) {
        // Use synchronous ajax calls
        if (options.sync) {
          $('#' + id + '_content').iv_load_sync(url, params, function() {
            //$('div.content .modal_close', $$).click(function() { _close(); });
            setTimeout(on_load, 600);
          });
        }
        else {
          $('#' + id + '_content').load(url, params, function() {
            //$('div.content .modal_close', $$).click(function() { _close(); });
            setTimeout(on_load, 600);
          });
        }
      }
      else {
        $('#' + id + '_content').html(flash);
        $('.modal_close').click(function() { _close(); });
        on_load();
      }
    }

    function _hide_close() { $('#' + id + '_close').hide(); }
    function _hide_shade() { $('#' + id + '_shade').hide(); }
    function _show_close() { $('#' + id + '_close').show(); }
    function _show_shade() { $('#' + id + '_shade').show(); }

    // set obj to false to disable a previously enabled confirm
    function _set_confirm(obj) {
      options.confirm_close = obj;
    }

    function _confirm_close(conf) {
      if ($.iv.modal_stack[1]) {
        if (conf) {
          $.iv.modal_stack[1].close(true);
        }
      }
      _close();
    }
    
    function _close(force) {
      if (this.before_close) {
        this.before_close();
      }

      if (!force && options.confirm_close) {
        new $.iv.modal({
          uri: options.confirm_close.uri,
          params: options.confirm_close.params
        });
        return false;
      }

      if (options.auto_data_change == true) {
        _data_change();
      }
      $$.remove();
      overlay.remove();
      if (this.name) {
        delete($.iv.modal_names[this.name]);
        $.iv.modal_stack.splice(this.index, 1);

        // update index
        for (var idx=this.index; idx<$.iv.modal_stack.length; idx++) {
          $.iv.modal_stack[idx].index = idx;
        }
      }
      else {
        $.iv.modal_stack.shift();
      }

      if ($.iv.modal_events) {
        for (var key in $.iv.modal_events) {
          var obj = $.iv.modal_events[key]['obj'];
          if (obj) {
            obj[$.iv.modal_events[key]['on_close']]();
          }
        }
      }
    }
    
    function _center() {
      var window_height = $(window).height();

      if ($.iv['editor'] && $.iv.editor.is_gp_frame_open) {
        window_height = window_height - $('#gp_styles_frame').outerHeight();
      }

      var modal_height = $$.height();
      var top  = parseInt((window_height / 2) - (modal_height / 2));
      var left = parseInt(($(window).width() / 2) - ($$.width() / 2));
      if(top < 0) top = 0;
      if(left < 0) left = 0;
      
      $$.css({ top: top + 'px', left: left + 'px' });

      if(window_height < modal_height) {
        var new_height = window_height - ( (parseInt($$.css('border-top-width')) * 2) + parseInt($('.title_bar', $$).css('height')) + 1 );

        if(!options.height_override){
          $('div.content', $$).css({ 'max-height': new_height + 'px' });
        }
      }
      
      if(!is_visible) {
        $$.show().iv_simpledrag({
          handle: 'div.title_bar'
        });
        is_visible = true;
      }
    }

    function _data_change() {
      if(options.callback) {
        options.callback();
      }
    }

    function _shade() {
      $('#' + id + '_content').hide();
      $('#' + id + '_shade').removeClass('modal_shade').addClass('modal_unshade');
      $('#' + id + '_shade').unbind('click').click(function() { _unshade(); });      
    }
    
    function _unshade() {
      $('#' + id + '_content').show();
      $('#' + id + '_shade').removeClass('modal_unshade').addClass('modal_shade');
      $('#' + id + '_shade').unbind('click').click(function() { _shade(); });      
    }

    function _hide() {
      $$.hide();
      is_visible = false;
    }

    function _show() {
      $$.show();
      is_visible = true;
    }

    function _is_visible() {
      return $$.css('display') != 'none';
    }
  }
  //----------------- End Modal -------------------------------
  
  //----------------- Button ----------------------------------
  $.fn.iv_button = function(options) {
    return this.each(function() {
      new $.iv.button(this, options);
    });
  }

  $.fn.iv_button_disable = function(options) {
    return this.each(function() {
      var btn = $.data(this, 'button');
      btn.disable();
    });
  }

  $.fn.iv_button_enable = function(options) {
    return this.each(function() {
      var btn = $.data(this, 'button');
      btn.enable();
    });
  }

  $.iv.button = function(el, options) {
  
    options = $.extend({
      value:       null,
      append_to:   null,
      click:       null,
      is_disabled: false
    }, options);
  
    var $$ = $(el);
    var is_disabled = options.is_disabled;
    var click_function = options.click;
    $.data(el, 'button', this);

    if(is_disabled) {
      _disable();
    }
    else {
      is_disabled = true;
      _enable();
    }
   
    this.enable  = _enable;
    this.disable = _disable;

    this.set_click = function(func) {
      click_function = func;
    }

    function _enable() {
      if(is_disabled) {
        is_disabled = false;
        $$.removeClass('disabled')
          .mousedown( function() { $$.addClass('mousedown')    })
          .mouseup(   function() { $$.removeClass('mousedown') })
          .mouseout(  function() { $$.removeClass('mousedown') });
        if(click_function) {
          $$.click( function() { click_function(); });
        }
        if($$.hasClass('modal_close') && $.iv.modal_stack[0]) {
          $$.click( function() { $.iv.modal_stack[0].close() });
        }
      }
    };
      
    function _disable() {
      is_disabled = true;
      $$.addClass('disabled')
        .unbind('click')
        .unbind('mousedown')
        .unbind('mouseup')
        .unbind('mouseout');
    };

  }
  //----------------- End Button ------------------------------

  //----------------- Link ------------------------------------
  $.fn.iv_link = function(options) {
    return this.each(function() {
      new $.iv.link(this, options);
    });
  };

  $.iv.link = function(el, options) {
  
    options = $.extend({
      action: null
    }, options);
  
    var $$ = $(el);
    $.data(el, 'link', this);

    _enable();

    function _enable() {
      $$.click(options.action);
    };
  };
  //----------------- End Link --------------------------------

  //---------------------------- Main Form Stuff ----------------------------
  $.fn.iv_form = function(options) {
    return this.each(function() {
      new $.iv.form(this, options);
    });
  }

  $.fn.iv_form_cancel = function() {
    return this.each(function() {
      var form = $.data(this, 'form');
      form.change_to_view();
    });
  }

  $.fn.iv_form_inline_results = function(data) {
    return this.each(function() {
      var form = $.data(this, 'form');
      form.inline_results(data);
    });
  }

  $.fn.iv_form_submit = function() {
    return this.each(function() {
      var form = $.data(this, 'form');
      form.submit();
    });
  }

  $.fn.iv_form_reload_modal = function(uri) {
    return $.iv.modal_stack[0].load(uri);
  }
  
  $.iv.form = function(el, options) {
  
    options = $.extend({
      mode:                   null,
      item_id:                null,
      submit_on_enter:        false,
      submit_on_enter_fields: [],
      title:                  [], // title is a 1 element array becuase it is passed in as json to escape the string
      uri:                    [],
      tracking_params:        {},
      extra_item_actions:     [],
      masks:                  null,
      load_success_uri_in:    null,
      reset_submit:           false,
      buttons_always_on:      false
    }, options);

    var self = this;
    var $$ = $(el);
    var $iframe = null;
    var iframe = null;
    var submitting = false;
    
    $.data(el, 'form', this);

    this.inline_results = _inline_results;

    _update_title();

    // Set the input masks if they are passed in.
    if(options.masks) {
      $.iv.masks = options.masks;
    }
    $('div.item_actions', $$.parent().parent()).each(function() {
      var container = $(this);

      if(options.mode == 'view') {
        if(options.uri['detail']) {
          $('span.edit', container).click(function() {
            _reload_main(options.uri['detail'], 'edit');          
          });
        }
        
        if(options.uri['delete']) {
          $('span.delete', container).click(function() {
            new $.iv.modal({
              callback: function() {
                if(options.uri['index']) {
                  location.href = options.uri['index'];
                }
              },
              uri: options.uri['delete'],
              params: { id: options.item_id }
            });
          });
        }

        if(options.extra_item_actions.length > 0) {
          $.each(options.extra_item_actions, function(i, n) {
            if(n.uri && n.name) {
              var params = $.extend({}, n.params);
              if(n.form_params) {
                $.each(n.form_params, function(j, p) {
                  params[p] = options[p];
                });
              }
              $('span.' + n.name, container).click(function() {
                if(n.type == 'post') {
                  $.iv.post_uri(n.uri, params);
                }
                else if(n.type == 'popup') {
                  $.iv.popup_window(n.uri, n.name);
                }
                else if(n.type == 'modal') {
                  new $.iv.modal({
                    uri: n.uri,
                    params: params,
                    callback: function() { eval(n.callback) }
                  });
                }
                else if(n.type == 'load_in') {
                  $('#' + n.load_in).load(n.uri, params);
                  $.scrollTo('#' + n.load_in, 500, { offset: -100 });
                }
                else if(n.type == 'close_window') {
                  window.close();
                }
              });
            }
          });
        }
      }
      else { // edit or create
        $('span.save', container).click(function() {
          $$.submit();
        });
        
        $('span.cancel', container).click(function() {
          if(options.uri['cancel']) {
            var params = $.extend({}, options.tracking_params);
            $.iv.post_uri(options.uri['cancel'], params);
//            location.href = options.uri['cancel'];
          }
          else {
            $$.iv_form_cancel();
          }
        });
      }
      
    });
    
    // Show/Hide section events
    _init_collapsibles();

    // Show/Hide sub-section events
    $('div.sub_section_collapsible', $$).each(function() {
      var c = $(this);
      $('div.sub_collapsible_titlebar div.toggle', c).click(function() {
        if(c.is('.open')) {
          _hide_section(c);
        }
        else {
          _show_section(c);
        }
      });
    });

    // Expand All and Collapse All events
    $('div.section_actions span', $$.parent().parent()).click(function() {
      if($(this).is('.expand')) {
        $('div.section_collapsible').each(function() {
          _show_section( $(this) );
        });
      }
      else {
        $('div.section_collapsible').each(function() {
          _hide_section( $(this) );
        });
      }
    });
    
    // submit form when 'enter' hit
    if(options.submit_on_enter) {
      $$.keyup(function(e) {
        var key = $.iv.get_key(e);
        if(key == 'enter') {
          $$.submit();
        }
      });
    }

    // submit form when 'enter' hit for specific fields
    $.each(options.submit_on_enter_fields, function(i, n) {
      $('#' + n, $$).keyup(function(e) {
        var key = $.iv.get_key(e);
        if(key == 'enter') {
          $$.submit();
        }
      });
    });

    $$.unbind('submit').submit( function() {
      _submit();
//      return(false);
    });

    this.change_to_view = function() {
      var params = $.extend({}, options.tracking_params);
      if(options.mode === 'create') {
        if($.iv.modal_stack[0]) {
          $.iv.modal_stack[0].load(options.uri['index'], params);
        }
        else {
          $.iv.post_uri(options.uri['index'], params);
        }
      }
      else {
        _reload_main(options.uri['detail'], 'view');
      }
    }

    this.init_collapsibles = _init_collapsibles;
    this.submit = _submit;
    
    /************* Private Methods *************/

    function _update_title() {
      if(options.title.length == 1 && options.title[0] != null) {
        $('#page_title').html(options.title[0]);
      }
    }
    
    function _submit() {
      submitting = true;
      $('td.label.error, td.label div.label.error', $$).removeClass('error');
      $('div.form_errors', $$).remove();
      if(!options.buttons_always_on) {
        $('span.button', $$).iv_button_disable();
      }
      if($('#_output', $($$[0])).length == 0) {
        $('<input id="_output" type="hidden" name="_output" value="json_iframe">').appendTo($$);
      }

      if($iframe === null) {
        $iframe = $('iframe#form_submitter').unbind('load').load(_submit_return);
        // We need the DOM object for stuff below.
        iframe = $iframe[0];
      }
    }

    function _reset_submit() {
      if($('#_output', $$).length != 0) {
        $('#_output', $$).remove();
      }
      $iframe = null;
    }

    function _inline_results(json) {
      if(json.fatal_err) {
        var error_box = $('<div></div>').addClass('form_errors');
        error_box.append('<div>' + json.fatal_err + '</div>');
        $$.prepend(error_box);
        $.scrollTo('div.form_errors', 500, { offset: -100 });
        if(!options.buttons_always_on) { 
          $('span.button', $$).iv_button_enable();
        }
      }
      else if(json.errors) {
        var messages = {};
        $.each(json.errors, function(i, n) {
          messages[n.message] = 1;
          if(n.field) {
            // If doesn't select anything, look for radio buttons
            var element = $('#' + n.field)[0] ? $('#' + n.field) : $('input[type="radio"][name="' + n.field + '"]:first' );
            element.parent().prev().addClass('error');
          }
        });

        var error_box = $('<div></div>').addClass('form_errors');
        $.each(messages, function(key, val) {
          error_box.append('<div>' + key + '</div>');
        });
        $$.prepend(error_box);
        if(!$.iv.modal_stack[0]) {
          $.scrollTo('div.form_errors', 500, { offset: -100 });
        }
        if(!options.buttons_always_on) {
          $('span.button', $$).iv_button_enable();
        }
      }
      else if(json.success_inline) {
        var messages = {};
        $.each(json.successes, function(i, n) {
          messages[n.message] = 1;
        });

        var msg_box = $('div.form_success').empty();
        if (!msg_box.length) {
          msg_box = $('<div></div>').addClass('form_success');
        }

        $.each(messages, function(key, val) {
          msg_box.append('<div>' + key + '</div>');
        });
        $$.prepend(msg_box);

        if($.iv.modal_stack[0]) {        
          $.scrollTo('.modal_dialog div.content', 500, { offset: -500 });
        }
        if(!options.buttons_always_on) {
          $('span.button', $$).iv_button_enable();
        }

        var to_id =  window.setTimeout(function() {
          window.clearTimeout(to_id);
          msg_box.remove();
        }, 5000);
      }
      else if(json.success_uri) {
        var params = $.extend(options.tracking_params, json.params);
        var load_success_uri_in = json.load_success_uri_in || options.load_success_uri_in;
        if(load_success_uri_in) {
          $('#' + load_success_uri_in).load(json.success_uri, params);
          $.scrollTo('#' + load_success_uri_in, 500, { offset: -100 });
        }
        else if($.iv.modal_stack[0] && json.post_success_uri != 1) {
          $.iv.modal_stack[0].load(json.success_uri, params);
        }
        else {
          $.iv.post_uri(json.success_uri, params);
        }
      }
    }

    function _submit_return() {
      var args = $$.data('_data');

      if (args) {
        if (args['callback']) { args.callback(); }
      }

      // This function will be triggered if the user hits 'back' after the form has generated errors.
      // So, we explicitly send them back in the history when that happens.
      if(!submitting) {
        history.go(-1);
        return;
      }
      
      // extract the server response from the iframe. jQuery doesn't seem to work for this.
      // So, we have to do raw JS.
      var doc = iframe.contentWindow ? iframe.contentWindow.document : iframe.contentDocument ? iframe.contentDocument : iframe.document;
      var ta = doc.getElementsByTagName('textarea')[0];
      if(!ta) {
        alert('System Error');
        return;
      }
      
      json = eval('data = ' + ta.value);
      
      if(json.updates) {
        $.each(json.updates, function(key, val) {
          options.values[key] = val;
        });
      }

      _inline_results(json);

      submitting = false;
      // reset submit to allow subsequent submits
      if (options.reset_submit) { _reset_submit(); }
    }
    
    function _show_section(section) {
      $('span.spawn', section).show();
      $('div.table_container', section).show();
      section.removeClass('closed').addClass('open');
    }
    
    function _hide_section(section) {
      $('span.spawn', section).hide(); // hide link to create a new form
      $('div.table_container', section).hide();
      section.removeClass('open').addClass('closed');
    }

    function _init_collapsibles () {
      $('div.section_collapsible').each(function() {
        var c = $(this);
        $('div.collapsible_titlebar div.toggle', c).click(function() {
          if(c.is('.open')) {
            _hide_section(c);
          }
          else {
            _show_section(c);
          }
        });
      });
    }

    function _reload_main(uri, mode) {
      if(uri) {
        var params = $.extend({
          id: options.item_id,
          _mode: mode
        }, options.tracking_params);

        if(options.load_success_uri_in) {
          $('#' + options.load_success_uri_in).load(uri, params);
          $.scrollTo('#' + options.load_success_uri_in, 500, { offset: -100 });          
        }
        else if($.iv.modal_stack[0]) {
          $.iv.modal_stack[0].load(uri, params);
        }
        else {
          $.iv.post_uri(uri, params);
        }
      }
    }
  }
  //---------------------------- End Main Form Stuff ----------------------------

  //---------------------------- Sub Form Stuff ---------------------------------
  
  $.fn.iv_sub_form = function(options) {
    return this.each(function() {
      new $.iv.sub_form(this, options);
    });
  }
  
  $.fn.iv_sub_form_replace = function(form_div, params) {
    return this.each(function() {
      var sub_form = $.data(this, 'sub_form');
      sub_form.spawn(form_div, params);
    });
  }
  
  $.iv.sub_form = function(el, options) {

    options = $.extend({
      uri:         null,
      delete_uri:  null,
      parent_id:   null,
      require_one: 1,
      collapse:    false,
      modal:       false,
      modal_params: {},
      modal_callback: null
    }, options);

    var $$ = $(el);
    var index = ($('table', $$).length - 1);
    $.data(el, 'sub_form', this);

    if(options.uri != null) {
      $('span.spawn', $$).click(function() {
        if(!options.modal) {
          _spawn();
        }
        else {
          new $.iv.modal({
            callback: options.modal_callback,
            uri: options.uri,
            params: options.modal_params || {},
            auto_data_change: options.modal_params.auto_data_change
          });
        }
      });
    }

    _setup_delete_events();
    _setup_primary_events();

    this.spawn = _spawn;

    function _spawn(form_div, params) {
      if(!form_div) {
        form_div = $('<div></div>').addClass('table_container');
        $$.append(form_div);
        ++index;
      }

      var load_params = $.extend({
        index: index
      }, params);
      
      if(options.parent_id > 0) {
        load_params[options.parent_id] = options.parent_id;
      }
      
      form_div.iv_load_sync(options.uri, load_params);

      _setup_delete_events();
      _setup_primary_events();
    }

    function _remove(tbody) {
      tbody.parent().parent().remove();
      if(options.require_one === 1 && $('div.table_container', $$).length < 2) {
        $('tbody.sub_form_actions', $$).hide();
      }
      
      if($('input:checkbox.primary:checked', $$).length == 0) {
        $('input:checkbox.primary', $$).eq(0).prop('checked', true);
      }
    }
    
    function _setup_primary_events() {
      $('input:checkbox.primary', $$).unbind('click').click(function() {
        if($(this).prop('checked')) {
          $('input:checkbox.primary', $$).not($(this)).prop('checked', false);
        }
        else {
          $(this).prop('checked', true);
        }
      });

      if($('input:checkbox.primary:checked', $$).length == 0) {
        $('input:checkbox.primary', $$).eq(0).prop('checked', true);
      }

      if (options.collapse == 1) {
        $('#'+el.id+" div.collapsible_titlebar div.toggle").trigger('click');
      }
    }

    function _setup_delete_events() {
      if(options.require_one === 1 && $('div.table_container', $$).length < 2) {
        $('tbody.sub_form_actions', $$).hide();
      }
      else {
        $('tbody.sub_form_actions', $$).show();
      }
      $('tbody.sub_form_actions', $$).each( function() {
        var tbody = $(this);
        var parts = this.id.split('-');
        var id    = parts[2];
        $('tr td span.delete', this).unbind('click').click( function() {
          var params = {};
          if(id) {
            params['id'] = id;
          }
          new $.iv.modal({
            callback: function() { _remove(tbody) },
            uri: options.delete_uri,
            params: params,
            auto_data_change: false
          });
        });
      });
    }

  }
  //---------------------------- End Sub Form Stuff -----------------------------

  //---------------------------- Form Utils -------------------------------------
  
  $.fn.iv_country_change = function(options) {
    return this.each(function() {
      new $.iv.country_change(this, options);
    });
  }

  $.fn.iv_update_countries = function(options) {
    return this.each(function() {
      new $.iv.update_countries(this, options);
    });
  }

  $.fn.iv_update_default_price_page = function(options) {
    return this.each(function() {
      new $.iv.update_default_price_page(this, options);
    });
  }

  $.fn.iv_toggle_button_state_checkbox = function(options) {
    return this.each(function() {
      new $.iv.toggle_button_state_checkbox(this, options);
    });
  }

  $.fn.iv_quantity_pricing = function(options) {
    return this.each(function() {
      new $.iv.quantity_pricing(this, options);
    });
  }

  $.fn.iv_conditional_option = function(options) {
    return this.each(function() {
      new $.iv.conditional_option(this, options);
    });
  }

  $.fn.iv_show_address_form = function(options) {
    return this.each(function() {
      new $.iv.show_address_form(this, options);
    });
  }

  $.fn.iv_populate_child_select = function(options) {
    return this.each(function() {
      new $.iv.populate_child_select(this, options);
    });
  }

  $.fn.iv_change_thumbnails = function(options) {
    return this.each(function() {
      new $.iv.change_thumbnails(this, options);
    });
  }

  $.fn.iv_change_maportal_uri = function(options) {
    return this.each(function() {
      new $.iv.change_maportal_uri(this, options);
    });
  }

  $.fn.iv_change_security_question = function(options) {
    return this.each(function() {
      new $.iv.change_security_question(this, options);
    });
  }

  $.fn.iv_select_with_other = function(options) {
    return this.each(function() {
      new $.iv.select_with_other(this, options);
    });
  }

  $.fn.iv_jump_to_next_field = function(options) {
    return this.each(function() {
      var $$ = $(this);
      $$.keyup(function(e) {
        var key = $.iv.get_key(e);
        if(key != 'tab' && key != 'shift') {
          var maxlength = $$.attr('maxlength');
          if(maxlength > 0 && maxlength === $$.val().length) {
            $$.next('input').focus();
          }
        }
      });
    });
  }

  $.fn.iv_alphanumeric = function(options) { 
    options = $.extend({
      ichars: "!@#$%^&*()+=[]\\\';,/{}|\":<>?~`.- ",
      nchars: "",
      allow: ""
    }, options);
    
    return this.each(function() {
      if(options.nocaps) options.nchars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      if(options.allcaps) options.nchars += "abcdefghijklmnopqrstuvwxyz";
      
      s = options.allow.split('');
      for(i=0; i < s.length; i++) if(options.ichars.indexOf(s[i]) != -1) s[i] = "\\" + s[i];
      options.allow = s.join('|');
      
      var reg = new RegExp(options.allow,'gi');
      var ch = options.ichars + options.nchars;
      ch = ch.replace(reg,'');
      
      $(this).keypress(function (e) {
        if(!e.charCode) k = String.fromCharCode(e.which);
        else k = String.fromCharCode(e.charCode);
        
        if(ch.indexOf(k) != -1) e.preventDefault();
        if(e.ctrlKey&&k=='v') e.preventDefault();
      });
      
      $(this).bind('contextmenu',function () {return true});
      
    });

  };

  $.fn.iv_numeric = function(options) {
    var az = "abcdefghijklmnopqrstuvwxyz";
    az += az.toUpperCase();
    
    options = $.extend({
      nchars: az
    }, options);      
    
    return this.each (function() {
      $(this).iv_alphanumeric(options);
    });
  };
        
  $.fn.iv_alpha = function(options) {
    var nm = "1234567890";
    options = $.extend({
      nchars: nm
    }, options);      
    
    return this.each (function() {
      $(this).iv_alphanumeric(options);
    });
  };    
  
  $.iv.many_many_swap = function(dir, in_field, out_field, in_value_name) {
    var $from = dir == 'add' ? $('#' + out_field) : $('#' + in_field);
    var $to   = dir == 'add' ? $('#' + in_field)  : $('#' + out_field);
    $('option:selected', $from).each( function() {
      $to.append($(this));
    });

    var $table = $('#' + in_field).parents('table').eq(0);
    var $td = $('tbody.hidden_fields tr td', $table).empty();
    
    // We need a 'null' value in case there are no other values in the list.
    // If only this 'null' value is passed over, the server knows to remove everything.
    $td.append( $('<input type="hidden" name="' + in_value_name + '" value="" />'));
    
    $('#' + in_field + ' option').each( function() {
      $td.append( $('<input type="hidden" name="' + in_value_name + '" value="' + this.value + '" />'));
    });
  }
 
  $.iv.country_change = function(el, options) {
  
    options = $.extend({
      id_field: null
    }, options);

    var self = this;
    var $$ = $(el);
    var geo_country_id = $$.val();
    var index = options.id_field.substr((options.id_field.length - 1), 1);

    var params = {
      item_id: $('#' + options.id_field).val(),
      geo_country_id: geo_country_id,
      index: index
    };
    var form_div = $$.parent().parent().parent().parent().parent();
    form_div.parent().iv_sub_form_replace(form_div, params);
  }

  $.iv.update_countries = function(el, options) {
  
    options = $.extend({
      id_field: null
    }, options);

    var self = this;
    var $$ = $(el);

    var params = { reseller_id: $$.val() };
    $.iv.post_json(options.action, params, function(json) {
      if(json.options) {
        $('select.country_select').each(function() {
          $.iv.update_select_options($(this), json);
        }).change();
      }
    });    
    
  }

  $.iv.update_default_price_page = function (el, options) {

    options = $.extend({
      id_field:        null,
      currency_field:  null,
      retail_field:    null,
      wholesale_field: null,
      dc_retail_field: null,
      incentive_field: null,
      profit_field:    null,
      hosting_field:   null,
      action:          null
    }, options);

    if (internal_update_default_price_page == true) {
      return(true);
    }

    var self = this;
    var $$ = $(el);

    internal_update_default_price_page = true;

    var params   = { 
                     website_id: $('#' + options.id_field).val(),
                     currency: $('#' + options.currency_field).children('option:selected').val() || 'null',
                     selected_price_id: $('#' + options.retail_field).children('option:selected').val() || 'null',
                     selected_design_center_id: $('#' + options.dc_retail_field).children('option:selected').val() || 'null',
                     selected_hosting_price_id: $('#' + options.hosting_field).children('option:selected').val() || 'null',
                     changed_element: $$.attr('id')
                   };
    $.iv.post_json_sync(options.action, params, function(json) {
      var select = $('#' + options.retail_field);
      $.iv.update_select_options($('#' + options.retail_field), json.pricing_options);
      $.iv.update_select_options($('#' + options.dc_retail_field), json.design_center_options);
      $.iv.update_select_options($('#' + options.hosting_field), json.hosting_options);
      $('#' + options.wholesale_field).text(json.wholesale_price);
      $('#' + options.profit_field).text(json.webcenter_profit).show();
    });

    internal_update_default_price_page = false;

  }

  $.iv.toggle_button_state_checkbox = function (el, options) {

    options = $.extend({
      button_id: null
    }, options);

    var self = this;
    var $$   = $(el);

    $$.bind('change', function (e) {
      if (!this.checked) {
        $('#' + options.button_id).iv_button_disable();
      }
      else {
        $('#' + options.button_id).iv_button_enable();
      }
    });

  }

  $.iv.quantity_pricing = function (el, options) {

    options = $.extend({
      price_field: null,
      unit_price: null,
      qty_err: null
    }, options);

    var self = this;
    var $$ = $(el);

    $$.bind('change', function(e) {
      var amt_text = options.unit_price;
      var quantity = $(this).val();

      if ( quantity < 1 || quantity > 99 ) {
          alert(options.qty_err);
          $(this).val(1);
          quantity = 1;
      }

      var amount = new Number(amt_text.replace(',', '').match(/\d+\.*\d+/));
      var price  = (quantity * amount).toString();
      if (amt_text.match(/\d\./) && !price.match(/\d\./)) {
        price += '.00';
      }

      $('#' + options.price_field).text($('#' + options.price_field).text().replace(/(\d+\,+)*\d+\.*\d{0,2}/, price));

    });

  }

  $.iv.conditional_option = function (el, options) {

    options = $.extend({
      toggle_field: null,
      toggle_value: null
    }, options);

    var $$ = $(el);
    $(':radio:checked.' + options.toggle_field).each(function() {
      if ($(this).val() == options.toggle_value) {
        $$.attr('disabled','disabled');
        $$.removeAttr('selected');
      }
      else {
        $$.removeAttr('disabled');
      }
    });

    $(':radio.' + options.toggle_field).bind('change', function(e) {
      var select_value = $(this).val();
      if (select_value == options.toggle_value) {
        $$.attr('disabled','disabled');
        $$.removeAttr('selected');
      }
      else {
        $$.removeAttr('disabled');
      }
    });

  }

  $.iv.show_address_form = function (el, options) {
    options = $.extend({
    }, options);

    var self = this;
    var $$ = $(el);
    var selected = $$.children('option:selected');

    if (selected.val() == 'new') {
      $('#section_user_address > div.table_container').show();
    }
    else {
      $('#section_user_address > div.table_container').hide();
    }
  }

  $.iv.populate_child_select = function(el, options) {
  
    options = $.extend({
      action: null,
      id_field: null,
      select_field: null,
      name: null,
      parent: null,
      extra_params: null
    }, options);

    var self = this;
    var $$ = $(el);
    var parent_id = $$.val();    
    if(parent_id == null) {
      setTimeout(function() { parent_id = $$.val(); _post(); }, 1000);
    }
    else {
      _post();
    }

    function _post() {
      var params = {
        id: $('#' + options.id_field).val(),
        name: options.name,
        parent: options.parent,
        parent_id: parent_id
      };

      if (options.extra_params) {
        for (var key in options.extra_params) {
          params[key] = $('#' + options.extra_params[key]).val();
        }
      }

      $.iv.post_json(options.action, params, _update_form);
    }

    function _update_form(json) {
      $.iv.update_select_options($('#' + options.select_field), json);
    }
  }

  $.iv.update_select_options = function(select, data) {
    if(select[0] && data.options.length > 0) {
      select.empty();
      $.each(data.options, function(i, n) {
        $('<option></option>').attr({ value: n.id }).html(n.name).appendTo(select);
      });
      if(data.selected) {
        select.val(data.selected);
      }
      else {
        select[0].selectedIndex = 0;
      }
    }
    select.trigger('change');
  }
  
  $.iv.change_thumbnails = function(el, options) {
    options = $.extend({
      param_key: null,
      target_field: null
    }, options);

    if(options.param_key) {
      var $$ = $(el);
      var params = {};
      params[options.param_key] = $$.val();
      $('#thumbnails_' + options.target_field).iv_thumbnails_change_list(params);
    }
  }

  $.iv.change_maportal_uri = function(el, options) {
    options = $.extend({
      param_key: null,
      target_field: null
    }, options);

    if(options.param_key) {
      var $$ = $(el);
      $('span.ma_portal_base_uri').text('http://' + locale_maportal_uri_map[$$.val()] + '/');
    }
  }

  $.iv.thumbnail_preview = function(options) {
    options = $.extend({
      selector: null
    }, options);
    
    $(options.selector).iv_thumbnails_show_preview();
  }

  $.iv.change_security_question = function(el, options) {
    options = $.extend({
    }, options);
    
    var $$ = $(el);
    var $row = $$.parent().parent().next();
    if($$.val() == 100) {
      $row.show();
    }
    else {
      $row.hide();
    }
  }

  $.iv.select_with_other = function(el, options) {
    options = $.extend({
                       }, options);
    
    var $$ = $(el);
    var $input = $('div', $$.parent());
    _change();
    $$.bind('change', _change);
    
    function _change() {
      if($$.val() == 'other') {
        $input.show();
      }
      else {
        $input.hide();
      }
    }
  }

  //---------------------------- End Form Utils ---------------------------------

  //---------------------------- Masked Input -----------------------------------

  if($.mask) {
    $.mask.definitions['d'] = '[0-9]'; // change the placeholder for number to 'd'
    $.mask.definitions['D'] = '[0-9/]'; // change the placeholder for number to 'D' for dates
    $.mask.definitions['p'] = '[0-9() -]'; // change the placeholder for phone number to 'p'
    $.mask.definitions['A'] = '[A-Z]';
    $.mask.definitions['z'] = '[A-Za-z]'; // the z map will auto uppercase all letters
  }

  $.iv.masks = {};

  $.fn.iv_set_input_mask = function(options) {
    return this.each(function() {
      options = $.extend({
        type:     null,
        type_key: null,
        name:     null,
        update_field: null
      }, options);

      var $$ = $(this);
      
      if(options.update_field) {
        options.type_key = $$.val();
      }
      
      if(!$.iv.masks[options.type]) {
        $.iv.post_json_sync('/public/helpers/get_formatting_masks', { _output: 'json' }, _set_masks);
      }
      
      if($.iv.masks[options.type] && $.iv.masks[options.type][options.type_key][options.name]) {
        var $obj = options.update_field ? $('#' + options.update_field) : $$;
        var mask = $.iv.masks[options.type][options.type_key][options.name];
        $obj.unmask().mask(mask, { placeholder: '' });
      }

      function _set_masks(json) {
        $.iv.masks = json.masks;
      }

    });
  }
  //---------------------------- End Masked Input -------------------------------

  //---------------------------- Tooltip ----------------------------------------
  $.fn.iv_tooltip = function(options) {
    return this.each(function() {
      new $.iv.tooltip(this, options);
    });
  }

  $.iv.tooltip = function(el, options) {
    var options = $.extend({
      display_selector: 'img'
    }, options);
    
    var $$ = $(el);
    $.data(el, 'tooltip', this);

    var $img = $(options.display_selector, $$);
    var $div = $('div', $$);

    $$.hover(
      function() {
        clearTimeout($$.data('timeout_id'));
        $$.addClass('hover');
        _set_position();
        _set_dimensions();
        $div.show();
      },
      function() {
        var cb = function() {
          $$.removeClass('hover');
          $div.hide();
        };
        $$.data('timeout_id', setTimeout(cb, 400));
      }
    );

    function _set_position() {
      var offset = $img.offset();
      var top  = (offset.top - $(window).scrollTop()) + $img.height();
      var left = (offset.left - $(window).scrollLeft()) + $img.width();
      if($(window).width() < (left + $('div', $$).outerWidth())) {
        left = $(window).width() - $('div', $$).outerWidth();
      }
      if($(window).height() < (top + $('div', $$).outerHeight())) {
        top = $(window).height() - $('div', $$).outerHeight();
      }
      $div.css({top: top, left: left });
    }

    function _set_dimensions() {
      if ($(window).height() < $div.outerHeight()) {
        var padding = Math.ceil(parseInt($div.css('padding-top').replace('px', '')) * 2);
        var border  = Math.ceil(parseInt($div.css('border-top-width').replace('px', '')) * 2);
        $div.height($(window).height() - (padding + border));
        $div.css('overflow', 'auto')
            .css('top', 0);
      }
    }
  }
  //---------------------------- End Tooltip -----------------------------------

  $.iv.camel_case = function(name) {
    return name.replace(/\-(\w)/g, function(all, letter) {
      return letter.toUpperCase();
    });
  };

  $.iv.rgb_to_hex = function(r,g,b) {
    return $.iv.to_hex(r) + $.iv.to_hex(g) + $.iv.to_hex(b);
  };

  $.iv.to_hex = function(color) {
    color = parseInt(color).toString(16);
    return color.length<2?"0"+color:color;
  };

  $.iv.hex_to_rgb = function(hex) {
    function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
    function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
    function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
    function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

    return {
      r: hexToR(hex),
      g: hexToG(hex),
      b: hexToB(hex)
    };
  };
  
  $.iv.mouse_coord = function(e) {
    if (e.pageX || e.pageY) {
      return {x:e.pageX, y:e.pageY};
    }
    return {
      x:e.clientX + document.body.scrollLeft - document.body.clientLeft,
      y:e.clientY + document.body.scrollTop - document.body.clientTop
    };
  };

  $.iv.scrollbar_width = function() {
    // Create the measurement node
    var scroll_div = document.createElement("div");
    scroll_div.className = "scrollbar-measure";
    document.body.appendChild(scroll_div);

    // Get the scrollbar width
    var scrollbar_width = scroll_div.offsetWidth - scroll_div.clientWidth;

    // Delete the DIV
    document.body.removeChild(scroll_div);

    return scrollbar_width;
  };

  $.fn.iv_ucfirst = function(options) {
    return this.each(function() {
      var str = this.value;
      if (options.lc == 1) {
        // Do it for each word in the string
        if (options.each_word == 1) {
          var pieces = str.split(" ");
          for ( var i = 0; i < pieces.length; i++ ) {
            pieces[i] = pieces[i].charAt(0).toUpperCase() + pieces[i].substring(1).toLowerCase();
          }
          this.value = pieces.join(" ");
        }
        // If string has a space, only convert if asked to
        else if (str.split(" ").length == 1 || options.spaces_ok == 1) {
          this.value = str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
        }
      }
      else {
        // Default action, only convert first char and leave rest alone
        this.value = str.charAt(0).toUpperCase() + str.substring(1);
      }
    });
  };

})(jQuery);

String.prototype.escapeHTML = function () {
  return(
    this.replace(/&/g,'&amp;').
    replace(/>/g,'&gt;').
    replace(/</g,'&lt;').
    replace(/"/g,'&quot;')
  );
};

String.prototype.unescapeHTML = function () {
  return(
    this.replace(/&amp;/g,'&').
    replace(/&gt;/g,'>').
    replace(/&lt;/g,'<').
    replace(/&quot;/g,'"')
  );
};
;

(function($) {
  $.extend({ iv_user_cal: {} });

  //----------------------------- Available Hours --------------------------

  $.fn.iv_user_cal_avail_hours = function(options) {
    return this.each(function() {
      new $.iv.user_cal_avail_hours(this, options);
    });
  };

  $.fn.iv_user_cal_avail_hours_save = function(options) {
    return this.each(function() {
      var ah = $.data(this, 'user_cal_avail_hours');
      if(ah) { ah.save(options) };      
    });
  };

  $.iv.user_cal_avail_hours = function(el, options) {
    options = $.extend({
      same_hours_per_day: 1,
      days: [],
      avail_days: {},
      time_slots: [],
      availability: {},
      strings: {},
      save_uri: null,
      load_success_uri_in: null,
      source: 'default',
      equipment_id: null,
      employee_id: null,
      default_start_time: '0800',
      default_end_time: '1700',
      mode: 'view',
      load_success_uri_in: null
    }, options);

    var $$ = $(el);
    $.data(el, 'user_cal_avail_hours', this);

    var $cur_tbody         = null;
    var $cur_day_selection = $('#cur_day_selection', $$);
    var $cur_day           = $('#cur_day', $$);
    var num_rows           = 0;
    var select_start_re    = /^row_start_(\d+)$/;
    var select_end_re      = /^row_end_(\d+)$/;
    var cur_select_value   = 0;
    
    _init_form();

    this.save = _save;
    
    function _init_form() {
      $.each(options.days, function(i, n) {
        if(options.avail_days[n.value] === 1) {
          $('#day_' + n.value).prop('checked', true);
        }
        else {
          $('#day_' + n.value).removeProp('checked');
        }
      });
      
      if(options.same_hours_per_day) {
        $('#same_hours', $$).prop('checked', true);
      }
      else {
        $('#vary_hours', $$).prop('checked', true);
      }
      
      // When their available days are changed, we need to add or remove that day from the drop down.
      $('input.day_select', $$).change(function() {
        var $day = $(this);
        if($('input.day_select:checked', $$).length == 0) {
          $day.prop('checked', true);
          return(false);
        }

        if($day.is(':checked')) {
          $("option[value='" + $day.val() + "']", $cur_day).removeAttr('disabled');
        }
        else {
          $("option[value='" + $day.val() + "']", $cur_day).attr('disabled', 'disabled');
          if($cur_day.val() === $day.val()) {
            // When a day is unchecked and the drop down is currently on that day, we need to change to
            // the first enabled day.
            $cur_day.val( $cur_day.find('option:enabled:first').val() );
            if(options.same_hours_per_day == 0) {
              _change_tbody($cur_day.val());
            }
          }
        }
      });
      
      $('#same_hours', $$).click(function() {
        options.same_hours_per_day = 1;
        $cur_day_selection.hide();
        _change_tbody('all');
      });
      $('#vary_hours', $$).click(function() {
        options.same_hours_per_day = 0;
        $cur_day_selection.show();
        _change_tbody($cur_day.val());
      });
  
      $cur_day.change(function() {
        $cur_day = $(this);
        $cur_tbody.hide();
        _change_tbody($cur_day.val());
      });

      options.days.push({ value: 'all', name: 'All' });
      $.each(options.days, function(i, n) {
        $cur_tbody = $('#avail_rows_' + n.value, $$);
        if(options.availability[n.value]) {
          var avail = true;
          $.each(options.availability[n.value], function(j,m) {
            _add_row({ loc: 'end',
                       avail: avail,
                       start_time: m.start,
                       end_time: m.end
                     });
            avail = avail ? false : true;
          });
        }
        else {
          _add_row({ loc: 'end',
                     avail: true,
                     start_time: options.default_start_time,
                     end_time: options.default_end_time
                   });
        }
      });
      
      if(options.same_hours_per_day == 1) {
        $cur_tbody = $('#avail_rows_all', $$).show();
      }
      else {
        $cur_tbody = $('#avail_rows_' + $cur_day.val(), $$).show();
      }

      $$.unbind('submit').submit( function() {
        _save();
        
      });
      
//      $('span.save_hours_btn', $$).click(function() {
//        $(this).iv_button_disable();
//        _save();
//      });
    }

    function _change_tbody(num) {
      $cur_tbody.hide();
      $cur_tbody = $('#avail_rows_' + num, $$).show();      
    }
    
    function _add_row(args) {
      var row_id = num_rows++;
      
      var $tr = $('<tr></tr>').attr({id: 'row_' + row_id}).addClass(args.avail ? 'avail' : 'not_avail');
      $('<td></td>').append(args.avail ? options.strings.avail : options.strings.not_avail).appendTo($tr);
      
      var $start_select = $('<select id="row_start_' + row_id + '" name="row_start_' + row_id + '"></select>').change(_time_change).focus(_save_cur_val);
      if(options.mode == 'view') {
        $start_select.attr('disabled', 'disabled');
      }
      
      var $end_select = $('<select id="row_end_' + row_id + '" name="row_end_' + row_id + '"></select>').change(_time_change).focus(_save_cur_val);
      if(options.mode == 'view') {
        $end_select.attr('disabled', 'disabled');
      }
      
      $.each(options.time_slots, function(i, n) {
        var $opt = $('<option value="' + n.value + '">' + n.text + '</option>');
        if(parseInt(args.start_time, 10) == parseInt(n.value, 10)) {
          $opt.attr('selected', 'selected');
        }
        $start_select.append($opt);
        
        if(parseInt(n.value, 10) > parseInt(args.start_time, 10)) {
          var $opt = $('<option value="' + n.value + '">' + n.text + '</option>');
          if(parseInt(args.end_time, 10) == parseInt(n.value, 10)) {
            $opt.attr('selected', 'selected');
          }
          $end_select.append($opt);
        }
      });
      $('<td></td>').append($start_select).appendTo($tr);
      $('<td></td>').append($end_select).appendTo($tr);

      if(options.mode == 'edit') {
        var $link = null;
        if(args.avail) {
          $link = $('<span id="row_link_' + row_id + '" class="link">' + options.strings.add_break + '</span>');
          $link.click(_add_break);
        }
        else {
          $link = $('<span id="row_link_' + row_id + '" class="link">' + options.strings.remove_break + '</span>');
          $link.click(_remove_break);
        }        
        $('<td></td>').append($link).appendTo($tr);
      }
        
      if(args.loc == 'end') {
        $cur_tbody.append($tr);
      }
      else if(args.loc == 'after') {
        $('#row_' + args.loc_ref, $cur_tbody).after($tr);
      }
      _update_link_display($tr);
      return(row_id);
    }

    function _add_break() {
      var row_id = this.id.replace(/^row_link_/, '');
      var $cur_row = $(this).closest('tr');
      var start_time = $('select:eq(0)', $cur_row).val();
      var end_time = $('select:eq(1)', $cur_row).val();
//      console.log([row_id, start_time, end_time].join(', '));
      var diff = end_time - start_time - 100;
      if(diff.toString().match(/50$/)) {
        diff += 50;
      }
      var mid = diff / 2;
//      console.log([row_id, start_time, end_time, diff, mid].join(', '));
      _update_times({ select: $('select:eq(1)', $cur_row),
                      start_time: start_time,
                      exclude_start: true,
                      end_time: parseInt(start_time, 10) + mid });
      var break_row_id = _add_row({ loc: 'after',
                                    loc_ref: row_id,
                                    avail: false,
                                    start_time: parseInt(start_time, 10) + mid,
                                    end_time: parseInt(end_time, 10) - mid
                                  });
      var avail_row_id = _add_row({ loc: 'after',
                                    loc_ref: break_row_id,
                                    avail: true,
                                    start_time: parseInt(end_time, 10) - mid,
                                    end_time: end_time
                                  });
      _update_link_display($cur_row);
    }

    function _remove_break() {
      var $cur_row    = $(this).closest('tr');
      var $prev_row   = $cur_row.prev();
      var $next_row   = $cur_row.next();
      var $next_break = $next_row.next();
      var end_val     = $('select:eq(1)', $next_row).val();
      var end_time    = null;
      
      if($next_break.length === 1) {
        end_time = $('select:eq(0)', $next_break).val()
      }
      else {
        end_time = options.time_slots[options.time_slots.length - 1].value;
      }
      
      _update_times( { select: $('select:eq(1)', $prev_row),
                       sel_time: end_val,
                       exclude_start: true,
                       start_time: $('select:eq(0)', $prev_row).val(),
                       end_time: end_time });
      $cur_row.remove();
      $next_row.remove();
      _update_link_display($prev_row);
    }

    function _update_times(args) {
      var $select = args.select;
      if($select) {
//        console.log(args);
        var start_time = args.start_time ? args.start_time : $('option:first', $select).val();
        var end_time = args.end_time ? args.end_time : $('option:last', $select).val();
        if(args.exclude_start) {
          start_time = parseInt(start_time, 10) + 50;
        }
        var selected = args.sel_time ? args.sel_time : args.keep_sel ? $('option:selected', $select).val() : args.sel_first ? start_time : end_time;
//        console.log([start_time, end_time, selected].join(', '));
        $select.empty();
        $.each(options.time_slots, function(i, n) {
          if(parseInt(n.value, 10) >= parseInt(start_time, 10) || args.show_all_times) {
            $select.append('<option value="' + n.value + '"' + (selected == n.value ? 'selected="selected"' : '') + '>' + n.text + '</option>');
          }
        });
      }
    }

    function _time_change() {
      var $select     = $(this);
      var start_match = null;
      var end_match   = null;
      
      if(start_match = this.id.match(select_start_re)) {
        var $cur_row  = $select.closest('tr');
        var $prev_row = $cur_row.prev();
        var $next_row = $cur_row.next();
        var cur_val   = parseInt($select.val(), 10);
        var $cur_end_select = $('select:eq(1)', $cur_row);
        var cur_end_val = parseInt($cur_end_select.val(), 10);
        
        var $prev_start_select = $prev_row.length === 1 ? $('select:eq(0)', $prev_row) : null;
        var prev_start_val = $prev_row.length === 1 ? parseInt($prev_start_select.val(), 10) : 0;
        
        var action = 'proceed';
//        console.log([cur_val, cur_end_val, $next_row.length, prev_start_val].join(', '));
        if((cur_val >= cur_end_val && $next_row.length === 1)
           || ($prev_start_select && prev_start_val >= cur_val)) {
          $("#range_overlap_dialog").dialog({
	    resizable: false,
	    height:100,
	    modal: true,
            draggable: false,
	    overlay: {
	      backgroundColor: '#aaa',
	      opacity: 0.6
	    },
	    buttons: {
	      Yes: function() {
		_time_change_merge();
                $(this).dialog('close');
	      },
	      No: function() {
		_time_change_revert();
                $(this).dialog('close');
	      }
	    },
	    close: function() {
	      _time_change_revert();
	    }
	  });
        }
        else {          
          // Update end select
          _update_times( { select: $cur_end_select,
                           start_time: $select.val(),
                           keep_sel: true,
                           exclude_start: true } );
          if($prev_row.length === 1) {
            // Update the end times of the previous row
            _update_times( { select: $('select:eq(1)', $prev_row), end_time: $select.val(), sel_last: true } );
            _update_link_display($prev_row);
          }
          _update_link_display($cur_row);
        }

        function _time_change_merge() {
          if($cur_row.hasClass('not_avail')) {
            $('span.link', $cur_row).trigger('click');
          }
          else if(cur_val > cur_end_val) {
            $('span.link', $next_row).trigger('click');
          }
          else {
            $('span.link', $prev_row).trigger('click');
          }
          $("#range_overlap_dialog").dialog('destroy');
        }

        function _time_change_revert() {
          $select.val(cur_select_value);
          $("#range_overlap_dialog").dialog('destroy');
        }
      }
      else if(end_match = this.id.match(select_end_re)) {
        var $cur_row = $select.closest('tr');
        var $next_row = $select.closest('tr').next();
        if($next_row.length === 1) {
          // Update this select
          _update_times( { select: $select, end_time: $select.val() } );
          // Update the start times of the current row
          _update_times( { select: $('select:eq(0)', $cur_row),
                           keep_sel: true,
                           show_all_times: true,
                           sel_first: true } );
          // Update the start times of the next row
          _update_times( { select: $('select:eq(0)', $next_row),
                           start_time: $select.val(),
                           show_all_times: true,
                           sel_first: true } );
          // Update the end times of the next row
          _update_times( { select: $('select:eq(1)', $next_row),
                           start_time: $select.val(),
                           keep_sel: true,
                           exclude_start: true } );
          _update_link_display($next_row);
        }
        _update_link_display($cur_row);
      }
    }

    function _save_cur_val() {
      cur_select_value = $(this).val();
    }
    
    function _update_link_display($row) {
      if($row.hasClass('avail')) {
        var start_val = parseInt( $('select:eq(0)', $row).val(), 10);
        var end_val   = parseInt( $('select:eq(1)', $row).val(), 10);
        if(end_val - start_val <= 100) {
          $('.link', $row).hide();
        }
        else {
          $('.link', $row).show();
        }
      }
    }

    function _save() {
      $('span.save_hours_btn', $$).iv_button_disable();
      var params = {
        source: options.source,
        equipment_id: options.equipment_id,
        employee_id: options.employee_id,
        same_hours_per_day: options.same_hours_per_day ? 1 : 0,
        avail_days: [],
        times: {
          all: [],
          1: [],
          2: [],
          3: [],
          4: [],
          5: [],
          6: [],
          7: []
        }
      };
      
      $('tbody.times', $$).each(function() {
        var id = this.id.replace(/^avail_rows_/, '');
        $('tr', $(this)).each(function() {
          var $tr = $(this);
          params.times[id].push( [$('select:eq(0)', $tr).val(), $('select:eq(1)', $tr).val()] );
        });
      });

      $('input.day_select:checked', $$).each(function() {
        params.avail_days.push($(this).val());
      });

//      console.log(params);
      $.iv.post_json(options.save_uri, { params: JSON.stringify(params) }, _saved);
    }

    function _saved(json) {
      if(json.success_uri) {
        var load_success_uri_in = json.load_success_uri_in || options.load_success_uri_in;
        if(load_success_uri_in) {
          $('#' + load_success_uri_in).load(json.success_uri, json.params);
          $.scrollTo('#' + load_success_uri_in, 500, { offset: -100 });
        }
        else {
          $.iv.post_uri(json.success_uri);
        }
      }
      else if(json.success_inline) {
        var messages = {};
        $.each(json.successes, function(i, n) {
          messages[n.message] = 1;
        });

        var msg_box = $('div.form_success').empty();
        if (!msg_box.length) {
          msg_box = $('<div></div>').addClass('form_success');
        }

        $.each(messages, function(key, val) {
          msg_box.append('<div>' + key + '</div>');
        });
        $$.prepend(msg_box);

        var to_id =  window.setTimeout(function() {
          window.clearTimeout(to_id);
          msg_box.remove();
        }, 5000);
        
      }
      else {
        $('span.save_hours_btn', $$).iv_button_enable();
      }
    }
  };

  //----------------------------- End Available Hours ----------------------

  //----------------------------- Resource Adjustments ---------------------

  $.fn.iv_user_cal_resource_adj_type_change = function(options) {
    return this.each(function() {
      var a = $.data(this, 'user_cal_resource_adj');
      if(a) { a.type_change(options); }
      else { new $.iv_user_cal.resource_adj(this, options); }
    });
  }

  $.iv_user_cal.resource_adj = function(el, options) {
    
    options = $.extend({
      action: null,
      resource_field: null,
      default_resource_id: null
    }, options);
    
    var self = this;
    var $$ = $(el);
    $.data(el, 'user_cal_resource_adj', this);
//    $.iv_user_cal.cur_appt_obj = this;
    
    _type_change();
    
    this.type_change = _type_change;

    function _type_change() {
      var params = {
        resource_type: $$.val()
      };
      $.iv.post_json(options.action, params, _process_resources);
    }

    function _process_resources(json) {
      if(json.success) {
        var $resource_field = $('#' + options.resource_field).empty();
        var selected_index = 0;
        $.each(json.resources, function(i, n) {
          $resource_field.append('<option value="' + n.id + '">' + n.string + '</option>');
          if(n.id == options.default_resource_id) {
            selected_index = i;
          }
        });
        $resource_field[0].selectedIndex = selected_index;
      }
    }
  };

  //----------------------------- EndResource Adjustments ------------------
  
  //----------------------------- Setting Appointments ---------------------

  $.iv_user_cal.cur_appt_obj = null;
  
  $.fn.iv_user_cal_appt_type_change = function(options) {
    return this.each(function() {
      var a = $.data(this, 'user_cal_avail_appts');
      if(a) { a.type_change(options); }
      else { new $.iv_user_cal.appt_avail_appts(this, options); }
    });
  }

  $.fn.iv_user_cal_appt_date_change = function(date) {
    return this.each(function() {
      var a = $.data(this, 'user_cal_avail_appts');
      if(a) {
        a.date_change(date);
      }
      else {
        $.iv_user_cal.cur_appt_obj.date_change(date);
      }
    });
  }

  $.iv_user_cal.appt_date_change = function(date) {
    var a = $.data(this, 'user_cal_avail_appts');
    if(a) {
      a.date_change(date);
    }
    else {
      $.iv_user_cal.cur_appt_obj.date_change(date);
    }
  }
  
  $.fn.iv_user_cal_appt_party_size_change = function() {
    return this.each(function() {
      var a = $.data(this, 'user_cal_avail_appts');
      if(a) {
        a.party_size_change();
      }
      else {
        $.iv_user_cal.cur_appt_obj.party_size_change();
      }
    });
  }
  
  $.fn.iv_user_cal_appt_update_resources = function(options) {
    return this.each(function() {
      var a = $.data(this, 'user_cal_avail_appts');
      if(a) {
        a.update_resources();
      }
      else {
        $.iv_user_cal.cur_appt_obj.update_resources();
      }
    });
  }

  $.iv_user_cal.appt_avail_appts = function(el, options) {
    $.data(el, 'user_cal_avail_appts', this);
    options = $.extend({
      action: null,
      cal_id: 0,
      desc_field: null,
      party_size_field: null,
      type_field: null,
      date_field: null,
      time_field: null,
      resource_field: null,
      website_id: 0,
      default_datetime: null,
      container_id: null,
      dummy_data: null
    }, options);

    var self = this;
    var $$ = $(el);
    var appt_date = null;
    var resource_slots = {};
    var selected_employee_id = null;

    var container_id = options.container_id;
    var $container   = $('#'+options.container_id);

    $.iv_user_cal.cur_appt_obj = this;
    
    _type_change();
    
    this.type_change = _type_change;
    this.date_change = _date_change;
    this.party_size_change = _party_size_change;
    this.update_resources = _update_resources;

    function _type_change() {
      var params = {
        website_id: options.website_id,
        cal_id: options.cal_id,
        type_id: $$.val(),
        dummy_data: options.dummy_data
      };

      if(options.party_size_field) { params['party_size'] = (container_id) ? ($('#' + options.party_size_field, $container).val()) : ($('#' + options.party_size_field).val()); }
      if(appt_date) { params['appt_date'] = appt_date; }
      else if(options.default_datetime) { params['appt_date'] = options.default_datetime; }
      $.iv.post_json(options.action, params, _process_times);
    };
    
    function _date_change(date) {
      appt_date = date;
      var params = {
        website_id: options.website_id,
        cal_id: options.cal_id,
        type_id: $$.val(),
        dummy_data: options.dummy_data
      };
      if(appt_date) { params['appt_date'] = appt_date; }
      if(options.party_size_field) { params['party_size'] = (container_id) ? ($('#' + options.party_size_field, $container).val()) : ($('#' + options.party_size_field).val()); }
      $.iv.post_json(options.action, params, _process_times);
    };
    
    function _party_size_change() {
      var params = {
        website_id: options.website_id,
        cal_id: options.cal_id,
        type_id: $$.val(),
        party_size: (container_id) ? ($('#' + options.party_size_field, $container).val()) : ($('#' + options.party_size_field).val()),
        dummy_data: options.dummy_data
      };
      if(appt_date) { params['appt_date'] = appt_date; }
      else if(options.default_datetime) { params['appt_date'] = options.default_datetime; }
      $.iv.post_json(options.action, params, _process_times);
    };
    
    function _process_times(json) {
      if(json.description && options.desc_field) {
        if(container_id) {
          $('#' + options.desc_field, $container).text(json.description);
        }
        else {
          $('#' + options.desc_field).text(json.description);
        }
      }
      if(json.success) {
        // Dummy Data - if we have dummy data, we have to populate the appointment types
        if (options.dummy_data == 1) {
          var $type_field;
          if (container_id) {
            $type_field = $('select#' + options.type_field, $container).empty();
          } else {
            $type_field = $('select#' + options.type_field).empty();
          }
          var selected_index = 0;
          if($type_field) {
            $.each(json.appt_types, function(i, n) {
//              console.log(n);
              $type_field.append('<option value="' + n + '">' + n + '</option>');
            });
            if($type_field[0]) {
              $type_field[0].selectedIndex = selected_index;
            }
          }
        }
        var $time_field;
        if (container_id) {
          $time_field = $('select#' + options.time_field, $container).empty();
        } else {
          $time_field = $('select#' + options.time_field).empty();
        }
        var selected_index = 0;
        if($time_field) {
          $.each(json.appt_list, function(i, n) {
            $time_field.append('<option value="' + n.id + '">' + n.string + '</option>');
            if(n.id == options.default_datetime) {
              selected_index = i;
            }
          });
          if($time_field[0]) {
            $time_field[0].selectedIndex = selected_index;
          }
        }
        resource_slots = json.resource_slots || {};
        selected_employee_id = json.selected_employee_id || null;
        _update_resources();
      }
    };

    function _update_resources() {
      var time;
      if (container_id) {
        time = $('select#' + options.time_field, $container).val();
      } else {
        time = $('select#' + options.time_field).val();
      }
      if(resource_slots[time]) {
        var $e;
        if(container_id) {
          $e = $('select#' + options.resource_field, $container).empty();
        }
        else {
          $e = $('select#' + options.resource_field).empty();
        }
        var selected_index = 0;
        var i = 0;
        if($e) {
          $.each(resource_slots[time], function(k, v) {
            $e.append('<option value="' + k + '">' + v + '</option>');
            if(k == selected_employee_id) {
              selected_index = i;
            }
            ++i;
          });
          if($e[0]) {
            $e[0].selectedIndex = selected_index;
          }
        }
      }
    };
  }

  //----------------------------- End Setting Appointments -----------------
  
})(jQuery);
;


jQuery.iv.customform_regions = "%7B%22%E5%8A%A0%E6%8B%BF%E5%A4%A7%22%3A%5B%7B%22name%22%3A%22Alberta%22%2C%22id%22%3A56%7D%2C%7B%22name%22%3A%22British%20Columbia%22%2C%22id%22%3A52%7D%2C%7B%22name%22%3A%22Manitoba%22%2C%22id%22%3A62%7D%2C%7B%22name%22%3A%22New%20Brunswick%22%2C%22id%22%3A63%7D%2C%7B%22name%22%3A%22Newfoundland%22%2C%22id%22%3A59%7D%2C%7B%22id%22%3A61%2C%22name%22%3A%22North%20West%20Territories%22%7D%2C%7B%22name%22%3A%22Nova%20Scotia%22%2C%22id%22%3A54%7D%2C%7B%22name%22%3A%22Ontario%22%2C%22id%22%3A53%7D%2C%7B%22id%22%3A60%2C%22name%22%3A%22Prince%20Edward%20Island%22%7D%2C%7B%22id%22%3A58%2C%22name%22%3A%22Saskatchewan%22%7D%2C%7B%22name%22%3A%22Yukon%22%2C%22id%22%3A55%7D%5D%2C%22%E5%A4%9A%E6%98%8E%E5%B0%BC%E5%8A%A0%E5%85%B1%E5%92%8C%E5%9C%8B%22%3A%5B%5D%2C%22%E4%B8%AD%E5%9C%8B%22%3A%5B%7B%22id%22%3A248%2C%22name%22%3A%22%E4%B8%8A%E6%B5%B7%22%7D%2C%7B%22name%22%3A%22%E5%85%A7%E8%92%99%E5%8F%A4%22%2C%22id%22%3A244%7D%2C%7B%22name%22%3A%22%E5%8C%97%E4%BA%AC%22%2C%22id%22%3A240%7D%2C%7B%22id%22%3A246%2C%22name%22%3A%22%E5%90%89%E6%9E%97%22%7D%2C%7B%22name%22%3A%22%E5%9B%9B%E5%B7%9D%22%2C%22id%22%3A262%7D%2C%7B%22id%22%3A241%2C%22name%22%3A%22%E5%A4%A9%E6%B4%A5%22%7D%2C%7B%22name%22%3A%22%E5%AE%89%E5%BE%BD%22%2C%22id%22%3A251%7D%2C%7B%22name%22%3A%22%E5%AF%A7%E5%A4%8F%22%2C%22id%22%3A269%7D%2C%7B%22id%22%3A254%2C%22name%22%3A%22%E5%B1%B1%E6%9D%B1%22%7D%2C%7B%22id%22%3A243%2C%22name%22%3A%22%E5%B1%B1%E8%A5%BF%22%7D%2C%7B%22id%22%3A258%2C%22name%22%3A%22%E5%BB%A3%E6%9D%B1%22%7D%2C%7B%22name%22%3A%22%E5%BB%A3%E8%A5%BF%22%2C%22id%22%3A259%7D%2C%7B%22id%22%3A270%2C%22name%22%3A%22%E6%96%B0%E7%96%86%22%7D%2C%7B%22id%22%3A249%2C%22name%22%3A%22%E6%B1%9F%E8%98%87%22%7D%2C%7B%22id%22%3A253%2C%22name%22%3A%22%E6%B1%9F%E8%A5%BF%22%7D%2C%7B%22name%22%3A%22%E6%B2%B3%E5%8C%97%22%2C%22id%22%3A242%7D%2C%7B%22id%22%3A255%2C%22name%22%3A%22%E6%B2%B3%E5%8D%97%22%7D%2C%7B%22id%22%3A250%2C%22name%22%3A%22%E6%B5%99%E6%B1%9F%22%7D%2C%7B%22name%22%3A%22%E6%B5%B7%E5%8D%97%22%2C%22id%22%3A260%7D%2C%7B%22id%22%3A256%2C%22name%22%3A%22%E6%B9%96%E5%8C%97%22%7D%2C%7B%22name%22%3A%22%E6%B9%96%E5%8D%97%22%2C%22id%22%3A257%7D%2C%7B%22id%22%3A267%2C%22name%22%3A%22%E7%94%98%E8%82%85%22%7D%2C%7B%22id%22%3A252%2C%22name%22%3A%22%E7%A6%8F%E5%BB%BA%22%7D%2C%7B%22name%22%3A%22%E8%A5%BF%E8%97%8F%22%2C%22id%22%3A265%7D%2C%7B%22name%22%3A%22%E8%B2%B4%E5%B7%9E%22%2C%22id%22%3A263%7D%2C%7B%22id%22%3A245%2C%22name%22%3A%22%E9%81%BC%E5%AF%A7%22%7D%2C%7B%22name%22%3A%22%E9%87%8D%E6%85%B6%22%2C%22id%22%3A261%7D%2C%7B%22id%22%3A266%2C%22name%22%3A%22%E9%99%9D%E8%A5%BF%22%7D%2C%7B%22name%22%3A%22%E9%9B%B2%E5%8D%97%22%2C%22id%22%3A264%7D%2C%7B%22id%22%3A268%2C%22name%22%3A%22%E9%9D%92%E6%B5%B7%22%7D%2C%7B%22name%22%3A%22%E9%BB%91%E9%BE%8D%E6%B1%9F%22%2C%22id%22%3A247%7D%5D%2C%22%E6%BE%B3%E5%A4%A7%E5%88%A9%E4%BA%9E%22%3A%5B%7B%22name%22%3A%22Australian%20Capital%20Territory%22%2C%22id%22%3A66%7D%2C%7B%22id%22%3A67%2C%22name%22%3A%22New%20South%20Wales%22%7D%2C%7B%22id%22%3A70%2C%22name%22%3A%22North%20Territory%22%7D%2C%7B%22id%22%3A69%2C%22name%22%3A%22Queensland%22%7D%2C%7B%22name%22%3A%22South%20Australia%22%2C%22id%22%3A68%7D%2C%7B%22id%22%3A64%2C%22name%22%3A%22Tasmania%22%7D%2C%7B%22id%22%3A65%2C%22name%22%3A%22Victoria%22%7D%2C%7B%22name%22%3A%22Western%20Australia%22%2C%22id%22%3A71%7D%5D%2C%22%E5%8E%84%E7%93%9C%E5%A4%9A%22%3A%5B%5D%2C%22Bahamas%22%3A%5B%7B%22id%22%3A558%2C%22name%22%3A%22Abaco%22%7D%2C%7B%22name%22%3A%22Acklins%22%2C%22id%22%3A559%7D%2C%7B%22id%22%3A560%2C%22name%22%3A%22Andros%22%7D%2C%7B%22name%22%3A%22Berry%22%2C%22id%22%3A561%7D%2C%7B%22id%22%3A562%2C%22name%22%3A%22Bimini%22%7D%2C%7B%22id%22%3A563%2C%22name%22%3A%22Cat%22%7D%2C%7B%22name%22%3A%22Crooked%22%2C%22id%22%3A564%7D%2C%7B%22name%22%3A%22Eleuthera%22%2C%22id%22%3A565%7D%2C%7B%22id%22%3A566%2C%22name%22%3A%22Exuma%22%7D%2C%7B%22id%22%3A567%2C%22name%22%3A%22Grand%20Bahama%22%7D%2C%7B%22id%22%3A568%2C%22name%22%3A%22Grand%20Key%22%7D%2C%7B%22id%22%3A569%2C%22name%22%3A%22Green%20Turtle%20Key%22%7D%2C%7B%22name%22%3A%22Harbour%22%2C%22id%22%3A570%7D%2C%7B%22name%22%3A%22Inagua%22%2C%22id%22%3A571%7D%2C%7B%22name%22%3A%22Long%22%2C%22id%22%3A572%7D%2C%7B%22id%22%3A573%2C%22name%22%3A%22Mangrove%20Key%22%7D%2C%7B%22id%22%3A574%2C%22name%22%3A%22Mayaguana%22%7D%2C%7B%22id%22%3A575%2C%22name%22%3A%22Moore%27s%22%7D%2C%7B%22name%22%3A%22Nassau%22%2C%22id%22%3A638%7D%2C%7B%22id%22%3A576%2C%22name%22%3A%22New%20Providence%22%7D%2C%7B%22id%22%3A577%2C%22name%22%3A%22Ragged%22%7D%2C%7B%22name%22%3A%22Rum%20Cay%22%2C%22id%22%3A578%7D%2C%7B%22id%22%3A579%2C%22name%22%3A%22San%20Salvador%22%7D%5D%2C%22%E7%89%99%E8%B2%B7%E5%8A%A0%22%3A%5B%7B%22name%22%3A%22Clarendon%22%2C%22id%22%3A629%7D%2C%7B%22id%22%3A624%2C%22name%22%3A%22Hanover%22%7D%2C%7B%22id%22%3A634%2C%22name%22%3A%22Kingston%20Parish%22%7D%2C%7B%22name%22%3A%22Manchester%22%2C%22id%22%3A630%7D%2C%7B%22name%22%3A%22Portland%22%2C%22id%22%3A635%7D%2C%7B%22name%22%3A%22Saint%20Andrew%22%2C%22id%22%3A636%7D%2C%7B%22id%22%3A631%2C%22name%22%3A%22Saint%20Ann%22%7D%2C%7B%22name%22%3A%22Saint%20Catherine%22%2C%22id%22%3A632%7D%2C%7B%22name%22%3A%22Saint%20Elizabeth%22%2C%22id%22%3A625%7D%2C%7B%22id%22%3A626%2C%22name%22%3A%22Saint%20James%22%7D%2C%7B%22name%22%3A%22Saint%20Mary%22%2C%22id%22%3A633%7D%2C%7B%22name%22%3A%22Saint%20Thomas%22%2C%22id%22%3A637%7D%2C%7B%22id%22%3A627%2C%22name%22%3A%22Trelawny%22%7D%2C%7B%22name%22%3A%22Westmoreland%22%2C%22id%22%3A628%7D%5D%2C%22%E5%B7%B4%E6%8B%BF%E9%A6%AC%22%3A%5B%7B%22id%22%3A610%2C%22name%22%3A%22Bocas%20del%20Toro%22%7D%2C%7B%22name%22%3A%22Chiriqu%C3%AD%22%2C%22id%22%3A611%7D%2C%7B%22name%22%3A%22Cocl%C3%A9%22%2C%22id%22%3A612%7D%2C%7B%22name%22%3A%22Col%C3%B3n%22%2C%22id%22%3A613%7D%2C%7B%22id%22%3A614%2C%22name%22%3A%22Dari%C3%A9n%22%7D%2C%7B%22name%22%3A%22Ember%C3%A1%22%2C%22id%22%3A615%7D%2C%7B%22id%22%3A616%2C%22name%22%3A%22Herrera%22%7D%2C%7B%22name%22%3A%22Kuna%20Yala%22%2C%22id%22%3A619%7D%2C%7B%22name%22%3A%22Kuna%20de%20Madungand%C3%AD%22%2C%22id%22%3A617%7D%2C%7B%22name%22%3A%22Kuna%20de%20Wargand%C3%AD%22%2C%22id%22%3A618%7D%2C%7B%22name%22%3A%22Los%20Santos%22%2C%22id%22%3A620%7D%2C%7B%22name%22%3A%22Ng%C3%A4be%20Bugl%C3%A9%22%2C%22id%22%3A621%7D%2C%7B%22id%22%3A622%2C%22name%22%3A%22Panam%C3%A1%22%7D%2C%7B%22id%22%3A623%2C%22name%22%3A%22Veraguas%22%7D%5D%2C%22%E8%8F%B2%E5%BE%8B%E8%B3%93%22%3A%5B%7B%22id%22%3A305%2C%22name%22%3A%22Abra%22%7D%2C%7B%22name%22%3A%22Agusan%20del%20Norte%22%2C%22id%22%3A306%7D%2C%7B%22name%22%3A%22Agusan%20del%20Sur%22%2C%22id%22%3A307%7D%2C%7B%22id%22%3A308%2C%22name%22%3A%22Aklan%22%7D%2C%7B%22id%22%3A309%2C%22name%22%3A%22Albay%22%7D%2C%7B%22name%22%3A%22Antique%22%2C%22id%22%3A310%7D%2C%7B%22name%22%3A%22Apayao%22%2C%22id%22%3A311%7D%2C%7B%22name%22%3A%22Aurora%22%2C%22id%22%3A312%7D%2C%7B%22name%22%3A%22Basilan%22%2C%22id%22%3A313%7D%2C%7B%22id%22%3A314%2C%22name%22%3A%22Bataan%22%7D%2C%7B%22id%22%3A315%2C%22name%22%3A%22Batanes%22%7D%2C%7B%22id%22%3A316%2C%22name%22%3A%22Batangas%22%7D%2C%7B%22id%22%3A317%2C%22name%22%3A%22Benguet%22%7D%2C%7B%22name%22%3A%22Biliran%22%2C%22id%22%3A318%7D%2C%7B%22name%22%3A%22Bohol%22%2C%22id%22%3A319%7D%2C%7B%22name%22%3A%22Bukidnon%22%2C%22id%22%3A320%7D%2C%7B%22id%22%3A321%2C%22name%22%3A%22Bulacan%22%7D%2C%7B%22id%22%3A322%2C%22name%22%3A%22Cagayan%22%7D%2C%7B%22id%22%3A323%2C%22name%22%3A%22Camarines%20Norte%22%7D%2C%7B%22id%22%3A324%2C%22name%22%3A%22Camarines%20Sur%22%7D%2C%7B%22id%22%3A325%2C%22name%22%3A%22Camiguin%22%7D%2C%7B%22id%22%3A326%2C%22name%22%3A%22Capiz%22%7D%2C%7B%22name%22%3A%22Catanduanes%22%2C%22id%22%3A327%7D%2C%7B%22name%22%3A%22Cavite%22%2C%22id%22%3A328%7D%2C%7B%22id%22%3A329%2C%22name%22%3A%22Cebu%22%7D%2C%7B%22id%22%3A330%2C%22name%22%3A%22Compostela%20Valley%22%7D%2C%7B%22id%22%3A331%2C%22name%22%3A%22Cotabato%22%7D%2C%7B%22name%22%3A%22Davao%20Oriental%22%2C%22id%22%3A334%7D%2C%7B%22name%22%3A%22Davao%20del%20Norte%22%2C%22id%22%3A332%7D%2C%7B%22id%22%3A333%2C%22name%22%3A%22Davao%20del%20Sur%22%7D%2C%7B%22id%22%3A335%2C%22name%22%3A%22Dinagat%20Islands%22%7D%2C%7B%22id%22%3A336%2C%22name%22%3A%22Eastern%20Samar%22%7D%2C%7B%22id%22%3A337%2C%22name%22%3A%22Guimaras%22%7D%2C%7B%22name%22%3A%22Ifugao%22%2C%22id%22%3A338%7D%2C%7B%22id%22%3A339%2C%22name%22%3A%22Ilocos%20Norte%22%7D%2C%7B%22name%22%3A%22Ilocos%20Sur%22%2C%22id%22%3A340%7D%2C%7B%22id%22%3A341%2C%22name%22%3A%22Iloilo%22%7D%2C%7B%22name%22%3A%22Isabela%22%2C%22id%22%3A342%7D%2C%7B%22name%22%3A%22Kalinga%22%2C%22id%22%3A343%7D%2C%7B%22id%22%3A344%2C%22name%22%3A%22La%20Union%22%7D%2C%7B%22name%22%3A%22Laguna%22%2C%22id%22%3A345%7D%2C%7B%22name%22%3A%22Lanao%20del%20Norte%22%2C%22id%22%3A346%7D%2C%7B%22id%22%3A347%2C%22name%22%3A%22Lanao%20del%20Sur%22%7D%2C%7B%22id%22%3A348%2C%22name%22%3A%22Leyte%22%7D%2C%7B%22id%22%3A349%2C%22name%22%3A%22Maguindanao%22%7D%2C%7B%22name%22%3A%22Marinduque%22%2C%22id%22%3A350%7D%2C%7B%22name%22%3A%22Masbate%22%2C%22id%22%3A351%7D%2C%7B%22id%22%3A304%2C%22name%22%3A%22Metro%20Manila%22%7D%2C%7B%22id%22%3A385%2C%22name%22%3A%22Metropolitan%20Manila%22%7D%2C%7B%22name%22%3A%22Misamis%20Occidental%22%2C%22id%22%3A352%7D%2C%7B%22name%22%3A%22Misamis%20Oriental%22%2C%22id%22%3A353%7D%2C%7B%22name%22%3A%22Mountain%20Province%22%2C%22id%22%3A354%7D%2C%7B%22name%22%3A%22National%20Capital%20Region%22%2C%22id%22%3A386%7D%2C%7B%22id%22%3A355%2C%22name%22%3A%22Negros%20Occidental%22%7D%2C%7B%22name%22%3A%22Negros%20Oriental%22%2C%22id%22%3A356%7D%2C%7B%22id%22%3A357%2C%22name%22%3A%22Northern%20Samar%22%7D%2C%7B%22id%22%3A358%2C%22name%22%3A%22Nueva%20Ecija%22%7D%2C%7B%22name%22%3A%22Nueva%20Vizcaya%22%2C%22id%22%3A359%7D%2C%7B%22id%22%3A360%2C%22name%22%3A%22Occidental%20Mindoro%22%7D%2C%7B%22name%22%3A%22Oriental%20Mindoro%22%2C%22id%22%3A361%7D%2C%7B%22id%22%3A362%2C%22name%22%3A%22Palawan%22%7D%2C%7B%22name%22%3A%22Pampanga%22%2C%22id%22%3A363%7D%2C%7B%22name%22%3A%22Pangasinan%22%2C%22id%22%3A364%7D%2C%7B%22name%22%3A%22Quezon%22%2C%22id%22%3A365%7D%2C%7B%22name%22%3A%22Quirino%22%2C%22id%22%3A366%7D%2C%7B%22name%22%3A%22Rizal%22%2C%22id%22%3A367%7D%2C%7B%22name%22%3A%22Romblon%22%2C%22id%22%3A368%7D%2C%7B%22name%22%3A%22Samar%22%2C%22id%22%3A369%7D%2C%7B%22id%22%3A370%2C%22name%22%3A%22Sarangani%22%7D%2C%7B%22id%22%3A371%2C%22name%22%3A%22Siquijor%22%7D%2C%7B%22id%22%3A372%2C%22name%22%3A%22Sorsogon%22%7D%2C%7B%22id%22%3A373%2C%22name%22%3A%22South%20Cotabato%22%7D%2C%7B%22name%22%3A%22Southern%20Leyte%22%2C%22id%22%3A374%7D%2C%7B%22name%22%3A%22Sultan%20Kudarat%22%2C%22id%22%3A375%7D%2C%7B%22name%22%3A%22Sulu%22%2C%22id%22%3A376%7D%2C%7B%22id%22%3A377%2C%22name%22%3A%22Surigao%20del%20Norte%22%7D%2C%7B%22name%22%3A%22Surigao%20del%20Sur%22%2C%22id%22%3A378%7D%2C%7B%22name%22%3A%22Tarlac%22%2C%22id%22%3A379%7D%2C%7B%22id%22%3A380%2C%22name%22%3A%22Tawi-Tawi%22%7D%2C%7B%22name%22%3A%22Zambales%22%2C%22id%22%3A381%7D%2C%7B%22name%22%3A%22Zamboanga%20Sibugay%22%2C%22id%22%3A384%7D%2C%7B%22name%22%3A%22Zamboanga%20del%20Norte%22%2C%22id%22%3A382%7D%2C%7B%22name%22%3A%22Zamboanga%20del%20Sur%22%2C%22id%22%3A383%7D%5D%2C%22%E6%84%9B%E7%88%BE%E8%98%AD%22%3A%5B%7B%22id%22%3A582%2C%22name%22%3A%22Carlow%22%7D%2C%7B%22name%22%3A%22Cavan%22%2C%22id%22%3A580%7D%2C%7B%22id%22%3A581%2C%22name%22%3A%22Clare%22%7D%2C%7B%22name%22%3A%22Cork%22%2C%22id%22%3A583%7D%2C%7B%22name%22%3A%22Donegal%22%2C%22id%22%3A584%7D%2C%7B%22name%22%3A%22Dublin%22%2C%22id%22%3A585%7D%2C%7B%22name%22%3A%22Galway%22%2C%22id%22%3A586%7D%2C%7B%22name%22%3A%22Kerry%22%2C%22id%22%3A587%7D%2C%7B%22name%22%3A%22Kildare%22%2C%22id%22%3A588%7D%2C%7B%22name%22%3A%22Kilkenny%22%2C%22id%22%3A589%7D%2C%7B%22name%22%3A%22Laois%22%2C%22id%22%3A590%7D%2C%7B%22name%22%3A%22Leitrim%22%2C%22id%22%3A591%7D%2C%7B%22id%22%3A592%2C%22name%22%3A%22Limerick%22%7D%2C%7B%22id%22%3A593%2C%22name%22%3A%22Longford%22%7D%2C%7B%22id%22%3A594%2C%22name%22%3A%22Louth%22%7D%2C%7B%22id%22%3A595%2C%22name%22%3A%22Mayo%22%7D%2C%7B%22id%22%3A596%2C%22name%22%3A%22Meath%22%7D%2C%7B%22id%22%3A597%2C%22name%22%3A%22Monaghan%22%7D%2C%7B%22name%22%3A%22Offaly%22%2C%22id%22%3A598%7D%2C%7B%22name%22%3A%22Roscommon%22%2C%22id%22%3A599%7D%2C%7B%22id%22%3A600%2C%22name%22%3A%22Sligo%22%7D%2C%7B%22id%22%3A601%2C%22name%22%3A%22Tipperary%22%7D%2C%7B%22id%22%3A602%2C%22name%22%3A%22Waterford%22%7D%2C%7B%22id%22%3A603%2C%22name%22%3A%22Westmeath%22%7D%2C%7B%22id%22%3A604%2C%22name%22%3A%22Wexford%22%7D%2C%7B%22id%22%3A605%2C%22name%22%3A%22Wicklow%22%7D%5D%2C%22%E9%A6%99%E6%B8%AF%E7%89%B9%E5%88%A5%E8%A1%8C%E6%94%BF%E5%8D%80%22%3A%5B%7B%22id%22%3A151%2C%22name%22%3A%22%E4%B9%9D%E9%BE%8D%22%7D%2C%7B%22id%22%3A152%2C%22name%22%3A%22%E6%96%B0%E7%95%8C%22%7D%2C%7B%22id%22%3A150%2C%22name%22%3A%22%E9%A6%99%E6%B8%AF%E5%B3%B6%22%7D%5D%2C%22%E8%A5%BF%E7%8F%AD%E7%89%99%22%3A%5B%5D%2C%22%E6%96%B0%E5%8A%A0%E5%9D%A1%22%3A%5B%5D%2C%22%E8%8B%B1%E5%9C%8B%22%3A%5B%7B%22id%22%3A387%2C%22name%22%3A%22Aberdeenshire%22%7D%2C%7B%22name%22%3A%22Alderney%22%2C%22id%22%3A388%7D%2C%7B%22id%22%3A389%2C%22name%22%3A%22Anglesey%22%7D%2C%7B%22id%22%3A390%2C%22name%22%3A%22Angus%22%7D%2C%7B%22id%22%3A391%2C%22name%22%3A%22Argyllshire%22%7D%2C%7B%22name%22%3A%22Avon%22%2C%22id%22%3A392%7D%2C%7B%22name%22%3A%22Ayrshire%22%2C%22id%22%3A393%7D%2C%7B%22name%22%3A%22Banffshire%22%2C%22id%22%3A394%7D%2C%7B%22id%22%3A395%2C%22name%22%3A%22Bedfordshire%22%7D%2C%7B%22name%22%3A%22Berkshire%22%2C%22id%22%3A396%7D%2C%7B%22id%22%3A397%2C%22name%22%3A%22Berwickshire%22%7D%2C%7B%22id%22%3A399%2C%22name%22%3A%22Breconshire%22%7D%2C%7B%22id%22%3A400%2C%22name%22%3A%22Buckinghamshire%22%7D%2C%7B%22id%22%3A401%2C%22name%22%3A%22Bute%22%7D%2C%7B%22id%22%3A402%2C%22name%22%3A%22Caernarvonshire%22%7D%2C%7B%22name%22%3A%22Caithness%22%2C%22id%22%3A403%7D%2C%7B%22name%22%3A%22Cambridgeshire%22%2C%22id%22%3A404%7D%2C%7B%22id%22%3A405%2C%22name%22%3A%22Cardiganshire%22%7D%2C%7B%22name%22%3A%22Carmarthenshire%22%2C%22id%22%3A406%7D%2C%7B%22id%22%3A408%2C%22name%22%3A%22Cheshire%22%7D%2C%7B%22id%22%3A409%2C%22name%22%3A%22Clackmannanshire%22%7D%2C%7B%22name%22%3A%22Cleveland%22%2C%22id%22%3A410%7D%2C%7B%22id%22%3A411%2C%22name%22%3A%22Clwyd%22%7D%2C%7B%22id%22%3A412%2C%22name%22%3A%22Co.%20Antrim%22%7D%2C%7B%22id%22%3A413%2C%22name%22%3A%22Co.%20Armagh%22%7D%2C%7B%22id%22%3A414%2C%22name%22%3A%22Co.%20Carlow%22%7D%2C%7B%22name%22%3A%22Co.%20Cavan%22%2C%22id%22%3A415%7D%2C%7B%22id%22%3A416%2C%22name%22%3A%22Co.%20Clare%22%7D%2C%7B%22id%22%3A417%2C%22name%22%3A%22Co.%20Cork%22%7D%2C%7B%22id%22%3A418%2C%22name%22%3A%22Co.%20Donegal%22%7D%2C%7B%22name%22%3A%22Co.%20Down%22%2C%22id%22%3A419%7D%2C%7B%22id%22%3A420%2C%22name%22%3A%22Co.%20Dublin%22%7D%2C%7B%22id%22%3A421%2C%22name%22%3A%22Co.%20Durham%22%7D%2C%7B%22name%22%3A%22Co.%20Fermanagh%22%2C%22id%22%3A422%7D%2C%7B%22name%22%3A%22Co.%20Galway%22%2C%22id%22%3A423%7D%2C%7B%22name%22%3A%22Co.%20Kerry%22%2C%22id%22%3A424%7D%2C%7B%22name%22%3A%22Co.%20Kildare%22%2C%22id%22%3A425%7D%2C%7B%22name%22%3A%22Co.%20Kilkenny%22%2C%22id%22%3A426%7D%2C%7B%22id%22%3A427%2C%22name%22%3A%22Co.%20Laois%22%7D%2C%7B%22name%22%3A%22Co.%20Leitrim%22%2C%22id%22%3A428%7D%2C%7B%22id%22%3A429%2C%22name%22%3A%22Co.%20Limerick%22%7D%2C%7B%22name%22%3A%22Co.%20Londonderry%22%2C%22id%22%3A430%7D%2C%7B%22id%22%3A431%2C%22name%22%3A%22Co.%20Longford%22%7D%2C%7B%22name%22%3A%22Co.%20Louth%22%2C%22id%22%3A432%7D%2C%7B%22id%22%3A433%2C%22name%22%3A%22Co.%20Mayo%22%7D%2C%7B%22id%22%3A434%2C%22name%22%3A%22Co.%20Meath%22%7D%2C%7B%22name%22%3A%22Co.%20Monaghan%22%2C%22id%22%3A435%7D%2C%7B%22id%22%3A436%2C%22name%22%3A%22Co.%20Offaly%22%7D%2C%7B%22name%22%3A%22Co.%20Roscommon%22%2C%22id%22%3A437%7D%2C%7B%22name%22%3A%22Co.%20Sligo%22%2C%22id%22%3A438%7D%2C%7B%22id%22%3A439%2C%22name%22%3A%22Co.%20Tipperary%22%7D%2C%7B%22name%22%3A%22Co.%20Tyrone%22%2C%22id%22%3A440%7D%2C%7B%22id%22%3A441%2C%22name%22%3A%22Co.%20Waterford%22%7D%2C%7B%22name%22%3A%22Co.%20Westmeath%22%2C%22id%22%3A442%7D%2C%7B%22name%22%3A%22Co.%20Wexford%22%2C%22id%22%3A443%7D%2C%7B%22name%22%3A%22Co.%20Wicklow%22%2C%22id%22%3A444%7D%2C%7B%22id%22%3A445%2C%22name%22%3A%22Cornwall%22%7D%2C%7B%22name%22%3A%22Cumberland%22%2C%22id%22%3A446%7D%2C%7B%22name%22%3A%22Cumbria%22%2C%22id%22%3A447%7D%2C%7B%22name%22%3A%22Denbighshire%22%2C%22id%22%3A448%7D%2C%7B%22name%22%3A%22Derbyshire%22%2C%22id%22%3A449%7D%2C%7B%22id%22%3A450%2C%22name%22%3A%22Devon%22%7D%2C%7B%22name%22%3A%22Dorset%22%2C%22id%22%3A451%7D%2C%7B%22name%22%3A%22Dumfries%20and%20Galloway%22%2C%22id%22%3A452%7D%2C%7B%22name%22%3A%22Dumfries-shire%22%2C%22id%22%3A453%7D%2C%7B%22id%22%3A454%2C%22name%22%3A%22Dunbartonshire%22%7D%2C%7B%22id%22%3A455%2C%22name%22%3A%22Dyfed%22%7D%2C%7B%22id%22%3A456%2C%22name%22%3A%22East%20Lothian%22%7D%2C%7B%22id%22%3A457%2C%22name%22%3A%22East%20Riding%20of%20Yorkshire%22%7D%2C%7B%22name%22%3A%22East%20Sussex%22%2C%22id%22%3A458%7D%2C%7B%22name%22%3A%22Essex%22%2C%22id%22%3A459%7D%2C%7B%22name%22%3A%22Fife%22%2C%22id%22%3A460%7D%2C%7B%22name%22%3A%22Flintshire%22%2C%22id%22%3A461%7D%2C%7B%22name%22%3A%22Glamorgan%22%2C%22id%22%3A462%7D%2C%7B%22name%22%3A%22Gloucestershire%22%2C%22id%22%3A463%7D%2C%7B%22id%22%3A464%2C%22name%22%3A%22Grampian%22%7D%2C%7B%22name%22%3A%22Greater%20London%22%2C%22id%22%3A606%7D%2C%7B%22name%22%3A%22Greater%20Manchester%22%2C%22id%22%3A465%7D%2C%7B%22id%22%3A466%2C%22name%22%3A%22Guernsey%22%7D%2C%7B%22id%22%3A467%2C%22name%22%3A%22Gwent%22%7D%2C%7B%22id%22%3A468%2C%22name%22%3A%22Gwynedd%22%7D%2C%7B%22name%22%3A%22Hampshire%22%2C%22id%22%3A469%7D%2C%7B%22id%22%3A470%2C%22name%22%3A%22Hereford%20and%20Worcester%22%7D%2C%7B%22id%22%3A471%2C%22name%22%3A%22Herefordshire%22%7D%2C%7B%22name%22%3A%22Hertfordshire%22%2C%22id%22%3A472%7D%2C%7B%22name%22%3A%22Highland%22%2C%22id%22%3A473%7D%2C%7B%22name%22%3A%22Humberside%22%2C%22id%22%3A474%7D%2C%7B%22id%22%3A475%2C%22name%22%3A%22Huntingdonshire%22%7D%2C%7B%22name%22%3A%22Inverness-shire%22%2C%22id%22%3A476%7D%2C%7B%22name%22%3A%22Isle%20of%20Wight%22%2C%22id%22%3A477%7D%2C%7B%22id%22%3A478%2C%22name%22%3A%22Jersey%22%7D%2C%7B%22id%22%3A479%2C%22name%22%3A%22Kent%22%7D%2C%7B%22id%22%3A480%2C%22name%22%3A%22Kincardineshire%22%7D%2C%7B%22name%22%3A%22Kinross-shire%22%2C%22id%22%3A481%7D%2C%7B%22id%22%3A482%2C%22name%22%3A%22Kirkcudbrightshire%22%7D%2C%7B%22id%22%3A483%2C%22name%22%3A%22Lanarkshire%22%7D%2C%7B%22id%22%3A484%2C%22name%22%3A%22Lancashire%22%7D%2C%7B%22name%22%3A%22Leicestershire%22%2C%22id%22%3A485%7D%2C%7B%22id%22%3A486%2C%22name%22%3A%22Lincolnshire%22%7D%2C%7B%22name%22%3A%22Lothian%22%2C%22id%22%3A487%7D%2C%7B%22id%22%3A488%2C%22name%22%3A%22Merionethshire%22%7D%2C%7B%22id%22%3A489%2C%22name%22%3A%22Merseyside%22%7D%2C%7B%22name%22%3A%22Mid%20Glamorgan%22%2C%22id%22%3A490%7D%2C%7B%22id%22%3A491%2C%22name%22%3A%22Midlothian%22%7D%2C%7B%22name%22%3A%22Monmouthshire%22%2C%22id%22%3A492%7D%2C%7B%22id%22%3A493%2C%22name%22%3A%22Montgomeryshire%22%7D%2C%7B%22name%22%3A%22Morayshire%22%2C%22id%22%3A494%7D%2C%7B%22id%22%3A495%2C%22name%22%3A%22Nairn%22%7D%2C%7B%22id%22%3A496%2C%22name%22%3A%22Norfolk%22%7D%2C%7B%22id%22%3A497%2C%22name%22%3A%22North%20Riding%20of%20Yorkshire%22%7D%2C%7B%22id%22%3A498%2C%22name%22%3A%22North%20Yorkshire%22%7D%2C%7B%22name%22%3A%22Northamptonshire%22%2C%22id%22%3A499%7D%2C%7B%22name%22%3A%22Northumberland%22%2C%22id%22%3A500%7D%2C%7B%22id%22%3A501%2C%22name%22%3A%22Nottinghamshire%22%7D%2C%7B%22id%22%3A502%2C%22name%22%3A%22Orkney%22%7D%2C%7B%22name%22%3A%22Oxfordshire%22%2C%22id%22%3A503%7D%2C%7B%22name%22%3A%22Peebles-shire%22%2C%22id%22%3A504%7D%2C%7B%22id%22%3A505%2C%22name%22%3A%22Pembrokeshire%22%7D%2C%7B%22id%22%3A506%2C%22name%22%3A%22Perth%22%7D%2C%7B%22name%22%3A%22Powys%22%2C%22id%22%3A507%7D%2C%7B%22name%22%3A%22Radnorshire%22%2C%22id%22%3A508%7D%2C%7B%22id%22%3A509%2C%22name%22%3A%22Renfrewshire%22%7D%2C%7B%22name%22%3A%22Ross%20and%20Cromarty%22%2C%22id%22%3A510%7D%2C%7B%22name%22%3A%22Roxburghshire%22%2C%22id%22%3A511%7D%2C%7B%22name%22%3A%22Rutland%22%2C%22id%22%3A512%7D%2C%7B%22id%22%3A513%2C%22name%22%3A%22Sark%22%7D%2C%7B%22id%22%3A514%2C%22name%22%3A%22Selkirkshire%22%7D%2C%7B%22name%22%3A%22Shetland%22%2C%22id%22%3A515%7D%2C%7B%22id%22%3A516%2C%22name%22%3A%22Shropshire%22%7D%2C%7B%22id%22%3A517%2C%22name%22%3A%22Somerset%22%7D%2C%7B%22id%22%3A518%2C%22name%22%3A%22South%20Glamorgan%22%7D%2C%7B%22name%22%3A%22South%20Yorkshire%22%2C%22id%22%3A519%7D%2C%7B%22id%22%3A520%2C%22name%22%3A%22Staffordshire%22%7D%2C%7B%22id%22%3A521%2C%22name%22%3A%22Stirlingshire%22%7D%2C%7B%22id%22%3A522%2C%22name%22%3A%22Strathclyde%22%7D%2C%7B%22name%22%3A%22Suffolk%22%2C%22id%22%3A523%7D%2C%7B%22id%22%3A524%2C%22name%22%3A%22Surrey%22%7D%2C%7B%22id%22%3A525%2C%22name%22%3A%22Sussex%22%7D%2C%7B%22id%22%3A526%2C%22name%22%3A%22Sutherland%22%7D%2C%7B%22id%22%3A527%2C%22name%22%3A%22Tayside%22%7D%2C%7B%22id%22%3A528%2C%22name%22%3A%22Tyne%20and%20Wear%22%7D%2C%7B%22id%22%3A529%2C%22name%22%3A%22Warwickshire%22%7D%2C%7B%22name%22%3A%22West%20Glamorgan%22%2C%22id%22%3A530%7D%2C%7B%22name%22%3A%22West%20Lothian%22%2C%22id%22%3A531%7D%2C%7B%22name%22%3A%22West%20Midlands%22%2C%22id%22%3A532%7D%2C%7B%22name%22%3A%22West%20Riding%20of%20Yorkshire%22%2C%22id%22%3A533%7D%2C%7B%22id%22%3A534%2C%22name%22%3A%22West%20Sussex%22%7D%2C%7B%22id%22%3A535%2C%22name%22%3A%22West%20Yorkshire%22%7D%2C%7B%22name%22%3A%22Western%20Isles%22%2C%22id%22%3A536%7D%2C%7B%22id%22%3A537%2C%22name%22%3A%22Westmorland%22%7D%2C%7B%22name%22%3A%22Wigtownshire%22%2C%22id%22%3A538%7D%2C%7B%22name%22%3A%22Wiltshire%22%2C%22id%22%3A539%7D%2C%7B%22name%22%3A%22Worcestershire%22%2C%22id%22%3A540%7D%2C%7B%22name%22%3A%22Yorkshire%22%2C%22id%22%3A541%7D%2C%7B%22name%22%3A%22%E4%B8%AD%E7%92%B0%22%2C%22id%22%3A407%7D%2C%7B%22id%22%3A398%2C%22name%22%3A%22%E9%82%8A%E7%95%8C%22%7D%5D%2C%22%E5%A2%A8%E8%A5%BF%E5%93%A5%22%3A%5B%7B%22id%22%3A272%2C%22name%22%3A%22Aguascalientes%22%7D%2C%7B%22name%22%3A%22Baja%20California%20Norte%22%2C%22id%22%3A273%7D%2C%7B%22name%22%3A%22Baja%20California%20Sur%22%2C%22id%22%3A274%7D%2C%7B%22name%22%3A%22Campeche%22%2C%22id%22%3A275%7D%2C%7B%22name%22%3A%22Chiapas%22%2C%22id%22%3A276%7D%2C%7B%22id%22%3A277%2C%22name%22%3A%22Chihuahua%22%7D%2C%7B%22name%22%3A%22Coahuila%22%2C%22id%22%3A278%7D%2C%7B%22id%22%3A279%2C%22name%22%3A%22Colima%22%7D%2C%7B%22name%22%3A%22Distrito%20Federal%22%2C%22id%22%3A280%7D%2C%7B%22id%22%3A281%2C%22name%22%3A%22Durango%22%7D%2C%7B%22name%22%3A%22Guanajuato%22%2C%22id%22%3A282%7D%2C%7B%22id%22%3A283%2C%22name%22%3A%22Guerrero%22%7D%2C%7B%22id%22%3A284%2C%22name%22%3A%22Hidalgo%22%7D%2C%7B%22name%22%3A%22Jalisco%22%2C%22id%22%3A285%7D%2C%7B%22name%22%3A%22Michoac%C3%A1n%22%2C%22id%22%3A287%7D%2C%7B%22name%22%3A%22Morelos%22%2C%22id%22%3A288%7D%2C%7B%22name%22%3A%22M%C3%A9xico%20%28Estado%20de%29%22%2C%22id%22%3A286%7D%2C%7B%22id%22%3A289%2C%22name%22%3A%22Nayarit%22%7D%2C%7B%22name%22%3A%22Nuevo%20Le%C3%B3n%22%2C%22id%22%3A290%7D%2C%7B%22name%22%3A%22Oaxaca%22%2C%22id%22%3A291%7D%2C%7B%22id%22%3A292%2C%22name%22%3A%22Puebla%22%7D%2C%7B%22id%22%3A293%2C%22name%22%3A%22Quer%C3%A9taro%22%7D%2C%7B%22id%22%3A294%2C%22name%22%3A%22Quintana%20Roo%22%7D%2C%7B%22name%22%3A%22San%20Luis%20Potos%C3%AD%22%2C%22id%22%3A295%7D%2C%7B%22name%22%3A%22Sinaloa%22%2C%22id%22%3A296%7D%2C%7B%22id%22%3A297%2C%22name%22%3A%22Sonora%22%7D%2C%7B%22id%22%3A298%2C%22name%22%3A%22Tabasco%22%7D%2C%7B%22name%22%3A%22Tamaulipas%22%2C%22id%22%3A299%7D%2C%7B%22id%22%3A300%2C%22name%22%3A%22Tlaxcala%22%7D%2C%7B%22name%22%3A%22Veracruz%22%2C%22id%22%3A301%7D%2C%7B%22name%22%3A%22Yucat%C3%A1n%22%2C%22id%22%3A302%7D%2C%7B%22id%22%3A303%2C%22name%22%3A%22Zacatecas%22%7D%5D%2C%22%E6%99%BA%E5%88%A9%22%3A%5B%5D%2C%22%E7%B4%90%E8%A5%BF%E8%98%AD%22%3A%5B%7B%22id%22%3A543%2C%22name%22%3A%22Auckland%22%7D%2C%7B%22name%22%3A%22Bay%20of%20Plenty%22%2C%22id%22%3A545%7D%2C%7B%22name%22%3A%22Canterbury%22%2C%22id%22%3A555%7D%2C%7B%22id%22%3A546%2C%22name%22%3A%22Gisborne%22%7D%2C%7B%22id%22%3A547%2C%22name%22%3A%22Hawke%27s%20Bay%22%7D%2C%7B%22id%22%3A549%2C%22name%22%3A%22Manawatu-Wanganui%22%7D%2C%7B%22id%22%3A553%2C%22name%22%3A%22Marlborough%22%7D%2C%7B%22name%22%3A%22Nelson%22%2C%22id%22%3A552%7D%2C%7B%22id%22%3A542%2C%22name%22%3A%22Northland%22%7D%2C%7B%22id%22%3A556%2C%22name%22%3A%22Otago%22%7D%2C%7B%22name%22%3A%22Southland%22%2C%22id%22%3A557%7D%2C%7B%22name%22%3A%22Taranaki%22%2C%22id%22%3A548%7D%2C%7B%22id%22%3A551%2C%22name%22%3A%22Tasman%22%7D%2C%7B%22id%22%3A544%2C%22name%22%3A%22Waikato%22%7D%2C%7B%22name%22%3A%22Wellington%22%2C%22id%22%3A550%7D%2C%7B%22id%22%3A554%2C%22name%22%3A%22West%20Coast%22%7D%5D%2C%22%E7%BE%8E%E5%9C%8B%22%3A%5B%7B%22name%22%3A%22Alabama%22%2C%22id%22%3A1%7D%2C%7B%22name%22%3A%22Alaska%22%2C%22id%22%3A2%7D%2C%7B%22name%22%3A%22American%20Samoa%22%2C%22id%22%3A201%7D%2C%7B%22name%22%3A%22Arizona%22%2C%22id%22%3A3%7D%2C%7B%22id%22%3A4%2C%22name%22%3A%22Arkansas%22%7D%2C%7B%22name%22%3A%22Armed%20Forces%20Americas%22%2C%22id%22%3A607%7D%2C%7B%22id%22%3A608%2C%22name%22%3A%22Armed%20Forces%20Europe%22%7D%2C%7B%22id%22%3A609%2C%22name%22%3A%22Armed%20Forces%20Pacific%22%7D%2C%7B%22id%22%3A5%2C%22name%22%3A%22California%22%7D%2C%7B%22id%22%3A6%2C%22name%22%3A%22Colorado%22%7D%2C%7B%22name%22%3A%22Connecticut%22%2C%22id%22%3A7%7D%2C%7B%22id%22%3A9%2C%22name%22%3A%22D.C.%22%7D%2C%7B%22id%22%3A8%2C%22name%22%3A%22Delaware%22%7D%2C%7B%22name%22%3A%22Federated%20States%20of%20Micronesia%22%2C%22id%22%3A206%7D%2C%7B%22name%22%3A%22Florida%22%2C%22id%22%3A10%7D%2C%7B%22id%22%3A11%2C%22name%22%3A%22Georgia%22%7D%2C%7B%22id%22%3A211%2C%22name%22%3A%22Guam%22%7D%2C%7B%22id%22%3A12%2C%22name%22%3A%22Hawaii%22%7D%2C%7B%22id%22%3A13%2C%22name%22%3A%22Idaho%22%7D%2C%7B%22name%22%3A%22Illinois%22%2C%22id%22%3A14%7D%2C%7B%22name%22%3A%22Indiana%22%2C%22id%22%3A15%7D%2C%7B%22name%22%3A%22Iowa%22%2C%22id%22%3A16%7D%2C%7B%22id%22%3A17%2C%22name%22%3A%22Kansas%22%7D%2C%7B%22name%22%3A%22Kentucky%22%2C%22id%22%3A18%7D%2C%7B%22id%22%3A19%2C%22name%22%3A%22Louisiana%22%7D%2C%7B%22id%22%3A20%2C%22name%22%3A%22Maine%22%7D%2C%7B%22name%22%3A%22Marshall%20Islands%22%2C%22id%22%3A216%7D%2C%7B%22name%22%3A%22Maryland%22%2C%22id%22%3A21%7D%2C%7B%22id%22%3A22%2C%22name%22%3A%22Massachusetts%22%7D%2C%7B%22id%22%3A23%2C%22name%22%3A%22Michigan%22%7D%2C%7B%22id%22%3A24%2C%22name%22%3A%22Minnesota%22%7D%2C%7B%22name%22%3A%22Mississippi%22%2C%22id%22%3A25%7D%2C%7B%22id%22%3A26%2C%22name%22%3A%22Missouri%22%7D%2C%7B%22id%22%3A27%2C%22name%22%3A%22Montana%22%7D%2C%7B%22name%22%3A%22Nebraska%22%2C%22id%22%3A28%7D%2C%7B%22id%22%3A29%2C%22name%22%3A%22Nevada%22%7D%2C%7B%22id%22%3A30%2C%22name%22%3A%22New%20Hampshire%22%7D%2C%7B%22name%22%3A%22New%20Jersey%22%2C%22id%22%3A31%7D%2C%7B%22id%22%3A32%2C%22name%22%3A%22New%20Mexico%22%7D%2C%7B%22name%22%3A%22New%20York%22%2C%22id%22%3A33%7D%2C%7B%22id%22%3A34%2C%22name%22%3A%22North%20Carolina%22%7D%2C%7B%22name%22%3A%22North%20Dakota%22%2C%22id%22%3A35%7D%2C%7B%22id%22%3A221%2C%22name%22%3A%22Northern%20Mariana%20Islands%22%7D%2C%7B%22name%22%3A%22Ohio%22%2C%22id%22%3A36%7D%2C%7B%22name%22%3A%22Oklahoma%22%2C%22id%22%3A37%7D%2C%7B%22id%22%3A38%2C%22name%22%3A%22Oregon%22%7D%2C%7B%22name%22%3A%22Palau%22%2C%22id%22%3A226%7D%2C%7B%22name%22%3A%22Pennsylvania%22%2C%22id%22%3A39%7D%2C%7B%22name%22%3A%22Puerto%20Rico%22%2C%22id%22%3A231%7D%2C%7B%22name%22%3A%22Rhode%20Island%22%2C%22id%22%3A40%7D%2C%7B%22id%22%3A41%2C%22name%22%3A%22South%20Carolina%22%7D%2C%7B%22name%22%3A%22South%20Dakota%22%2C%22id%22%3A42%7D%2C%7B%22id%22%3A43%2C%22name%22%3A%22Tennessee%22%7D%2C%7B%22id%22%3A44%2C%22name%22%3A%22Texas%22%7D%2C%7B%22name%22%3A%22Utah%22%2C%22id%22%3A45%7D%2C%7B%22name%22%3A%22Vermont%22%2C%22id%22%3A46%7D%2C%7B%22id%22%3A236%2C%22name%22%3A%22Virgin%20Islands%22%7D%2C%7B%22id%22%3A47%2C%22name%22%3A%22Virginia%22%7D%2C%7B%22name%22%3A%22Washington%22%2C%22id%22%3A48%7D%2C%7B%22id%22%3A49%2C%22name%22%3A%22West%20Virginia%22%7D%2C%7B%22id%22%3A50%2C%22name%22%3A%22Wisconsin%22%7D%2C%7B%22id%22%3A51%2C%22name%22%3A%22Wyoming%22%7D%5D%2C%22%E7%99%BE%E6%85%95%E9%81%94%22%3A%5B%7B%22name%22%3A%22Devonshire%22%2C%22id%22%3A689%7D%2C%7B%22id%22%3A690%2C%22name%22%3A%22Hamilton%22%7D%2C%7B%22name%22%3A%22Hamilton%20Municipality%22%2C%22id%22%3A691%7D%2C%7B%22name%22%3A%22Paget%22%2C%22id%22%3A692%7D%2C%7B%22id%22%3A693%2C%22name%22%3A%22Pembroke%22%7D%2C%7B%22id%22%3A698%2C%22name%22%3A%22Saint%20George%20Municipality%22%7D%2C%7B%22id%22%3A699%2C%22name%22%3A%22Saint%20George%27s%22%7D%2C%7B%22name%22%3A%22Sandys%22%2C%22id%22%3A694%7D%2C%7B%22name%22%3A%22Smiths%22%2C%22id%22%3A695%7D%2C%7B%22id%22%3A696%2C%22name%22%3A%22Southampton%22%7D%2C%7B%22name%22%3A%22Warwick%22%2C%22id%22%3A697%7D%5D%2C%22%E5%93%A5%E6%96%AF%E5%A4%A7%E9%BB%8E%E5%8A%A0%22%3A%5B%5D%2C%22%E5%8D%B0%E5%B0%BC%22%3A%5B%7B%22name%22%3A%22Bali%22%2C%22id%22%3A640%7D%2C%7B%22id%22%3A641%2C%22name%22%3A%22Bangka%E2%80%93Belitung%20Islands%22%7D%2C%7B%22name%22%3A%22Banten%22%2C%22id%22%3A642%7D%2C%7B%22id%22%3A643%2C%22name%22%3A%22Bengkulu%22%7D%2C%7B%22name%22%3A%22Central%20Java%22%2C%22id%22%3A644%7D%2C%7B%22name%22%3A%22Central%20Kalimantan%22%2C%22id%22%3A645%7D%2C%7B%22id%22%3A646%2C%22name%22%3A%22Central%20Sulawesi%22%7D%2C%7B%22id%22%3A647%2C%22name%22%3A%22East%20Java%22%7D%2C%7B%22name%22%3A%22East%20Kalimantan%22%2C%22id%22%3A648%7D%2C%7B%22id%22%3A649%2C%22name%22%3A%22East%20Nusa%20Tenggara%22%7D%2C%7B%22id%22%3A650%2C%22name%22%3A%22Gorontalo%22%7D%2C%7B%22name%22%3A%22Jakarta%22%2C%22id%22%3A651%7D%2C%7B%22id%22%3A652%2C%22name%22%3A%22Jambi%22%7D%2C%7B%22name%22%3A%22Lampung%22%2C%22id%22%3A653%7D%2C%7B%22id%22%3A654%2C%22name%22%3A%22Maluku%22%7D%2C%7B%22name%22%3A%22North%20Kalimantan%22%2C%22id%22%3A655%7D%2C%7B%22name%22%3A%22North%20Maluku%22%2C%22id%22%3A656%7D%2C%7B%22id%22%3A657%2C%22name%22%3A%22North%20Sulawesi%22%7D%2C%7B%22name%22%3A%22North%20Sumatra%22%2C%22id%22%3A658%7D%2C%7B%22id%22%3A660%2C%22name%22%3A%22Riau%22%7D%2C%7B%22name%22%3A%22Riau%20Islands%20Province%22%2C%22id%22%3A661%7D%2C%7B%22id%22%3A663%2C%22name%22%3A%22South%20Kalimantan%22%7D%2C%7B%22id%22%3A664%2C%22name%22%3A%22South%20Sulawesi%22%7D%2C%7B%22name%22%3A%22South%20Sumatra%22%2C%22id%22%3A665%7D%2C%7B%22id%22%3A662%2C%22name%22%3A%22Southeast%20Sulawesi%22%7D%2C%7B%22name%22%3A%22Special%20Region%20of%20Aceh%22%2C%22id%22%3A639%7D%2C%7B%22id%22%3A659%2C%22name%22%3A%22Special%20Region%20of%20Papua%22%7D%2C%7B%22name%22%3A%22Special%20Region%20of%20West%20Papua%22%2C%22id%22%3A669%7D%2C%7B%22name%22%3A%22Special%20Region%20of%20Yogyakarta%22%2C%22id%22%3A672%7D%2C%7B%22name%22%3A%22West%20Java%22%2C%22id%22%3A666%7D%2C%7B%22name%22%3A%22West%20Kalimantan%22%2C%22id%22%3A667%7D%2C%7B%22name%22%3A%22West%20Nusa%20Tenggara%22%2C%22id%22%3A668%7D%2C%7B%22name%22%3A%22West%20Sulawesi%22%2C%22id%22%3A670%7D%2C%7B%22id%22%3A671%2C%22name%22%3A%22West%20Sumatra%22%7D%5D%2C%22%E5%93%A5%E5%80%AB%E6%AF%94%E4%BA%9E%22%3A%5B%5D%2C%22Malaysia%22%3A%5B%7B%22id%22%3A676%2C%22name%22%3A%22Johor%22%7D%2C%7B%22name%22%3A%22Kedah%22%2C%22id%22%3A677%7D%2C%7B%22id%22%3A678%2C%22name%22%3A%22Kelantan%22%7D%2C%7B%22id%22%3A673%2C%22name%22%3A%22Kuala%20Lumpur%22%7D%2C%7B%22name%22%3A%22Labuan%22%2C%22id%22%3A674%7D%2C%7B%22id%22%3A679%2C%22name%22%3A%22Malacca%22%7D%2C%7B%22id%22%3A680%2C%22name%22%3A%22Negeri%20Sembilan%22%7D%2C%7B%22id%22%3A681%2C%22name%22%3A%22Pahang%22%7D%2C%7B%22name%22%3A%22Penang%22%2C%22id%22%3A684%7D%2C%7B%22name%22%3A%22Perak%22%2C%22id%22%3A682%7D%2C%7B%22id%22%3A683%2C%22name%22%3A%22Perlis%22%7D%2C%7B%22id%22%3A675%2C%22name%22%3A%22Putrajaya%22%7D%2C%7B%22name%22%3A%22Sabah%22%2C%22id%22%3A685%7D%2C%7B%22name%22%3A%22Sarawak%22%2C%22id%22%3A686%7D%2C%7B%22name%22%3A%22Selangor%22%2C%22id%22%3A687%7D%2C%7B%22name%22%3A%22Terengganu%22%2C%22id%22%3A688%7D%5D%2C%22%E4%B8%AD%E8%8F%AF%E6%B0%91%E5%9C%8B%28%E8%87%BA%E7%81%A3%29%22%3A%5B%7B%22name%22%3A%22%E5%8D%97%E6%8A%95%E7%B8%A3%22%2C%22id%22%3A118%7D%2C%7B%22name%22%3A%22%E5%8D%97%E6%B5%B7%E8%AB%B8%E5%B3%B6%22%2C%22id%22%3A126%7D%2C%7B%22id%22%3A115%2C%22name%22%3A%22%E5%8F%B0%E4%B8%AD%E5%B8%82%22%7D%2C%7B%22id%22%3A106%2C%22name%22%3A%22%E5%8F%B0%E5%8C%97%E5%B8%82%22%7D%2C%7B%22id%22%3A122%2C%22name%22%3A%22%E5%8F%B0%E5%8D%97%E5%B8%82%22%7D%2C%7B%22name%22%3A%22%E5%8F%B0%E6%9D%B1%E7%B8%A3%22%2C%22id%22%3A130%7D%2C%7B%22id%22%3A119%2C%22name%22%3A%22%E5%98%89%E7%BE%A9%E5%B8%82%22%7D%2C%7B%22id%22%3A120%2C%22name%22%3A%22%E5%98%89%E7%BE%A9%E7%B8%A3%22%7D%2C%7B%22name%22%3A%22%E5%9F%BA%E9%9A%86%E5%B8%82%22%2C%22id%22%3A107%7D%2C%7B%22name%22%3A%22%E5%AE%9C%E8%98%AD%E7%B8%A3%22%2C%22id%22%3A110%7D%2C%7B%22name%22%3A%22%E5%B1%8F%E6%9D%B1%E7%B8%A3%22%2C%22id%22%3A129%7D%2C%7B%22name%22%3A%22%E5%BD%B0%E5%8C%96%E7%B8%A3%22%2C%22id%22%3A117%7D%2C%7B%22name%22%3A%22%E6%96%B0%E5%8C%97%E5%B8%82%22%2C%22id%22%3A108%7D%2C%7B%22name%22%3A%22%E6%96%B0%E7%AB%B9%E5%B8%82%22%2C%22id%22%3A111%7D%2C%7B%22name%22%3A%22%E6%96%B0%E7%AB%B9%E7%B8%A3%22%2C%22id%22%3A112%7D%2C%7B%22id%22%3A113%2C%22name%22%3A%22%E6%A1%83%E5%9C%92%E5%B8%82%22%7D%2C%7B%22id%22%3A127%2C%22name%22%3A%22%E6%BE%8E%E6%B9%96%E7%B8%A3%22%7D%2C%7B%22name%22%3A%22%E8%8A%B1%E8%93%AE%E7%B8%A3%22%2C%22id%22%3A131%7D%2C%7B%22id%22%3A114%2C%22name%22%3A%22%E8%8B%97%E6%A0%97%E7%B8%A3%22%7D%2C%7B%22id%22%3A109%2C%22name%22%3A%22%E9%80%A3%E6%B1%9F%E7%B8%A3%22%7D%2C%7B%22name%22%3A%22%E9%87%91%E9%96%80%E7%B8%A3%22%2C%22id%22%3A128%7D%2C%7B%22name%22%3A%22%E9%9B%B2%E6%9E%97%E7%B8%A3%22%2C%22id%22%3A121%7D%2C%7B%22id%22%3A124%2C%22name%22%3A%22%E9%AB%98%E9%9B%84%E5%B8%82%22%7D%5D%2C%22%E6%BE%B3%E9%96%80%E7%89%B9%E5%88%A5%E8%A1%8C%E6%94%BF%E5%8D%80%22%3A%5B%7B%22name%22%3A%22%E6%BE%B3%E9%96%80%22%2C%22id%22%3A271%7D%5D%7D";(function($) {$(".customform_tooltip").iv_tooltip();$("#form_cf_5062509").iv_customform({ajax_uri: "/website/widget",decimal_a_message:"請輸入一個有效的號碼",decimal_b_message:"小數點。例如 123.",email_message:"請輸入有效的電子郵件地址。",extension:"html",file_extension_message:"無法使用附檔名為.exe、.pif、.bat、.scr、.lnk、.com、和.vbs的檔案。",js_view:"1",number_message:"請輸入有一個有效的號碼",phone_message:"請輸入一個有效的電話號碼",regions: $.iv.customform_regions,required_message:"必填欄位。",after_submit_data:{"confirm_message":"%3Cspan%20style%3D%22font-family%3A%20%E5%BE%AE%E8%BB%9F%E6%AD%A3%E9%BB%91%E9%AB%94%3B%20font-size%3A%20medium%3B%20color%3A%20%23ffffff%3B%22%3E%E6%82%A8%E7%9A%84%E6%84%8F%E8%A6%8B%E5%B7%B2%E5%82%B3%E9%80%81%E8%87%B3%E6%88%91%E5%80%91%E7%9A%84%E7%AE%A1%E7%90%86%E7%B3%BB%E7%B5%B1%E3%80%82%3Cbr%20%2F%3E%E5%86%8D%E6%AC%A1%E6%84%9F%E8%AC%9D%E6%82%A8%E7%9A%84%E5%BB%BA%E8%AD%B0%EF%BC%8C%E6%88%91%E5%80%91%E5%B0%87%E7%9B%A1%E5%BF%AB%E7%82%BA%E6%82%A8%E5%81%9A%E5%9B%9E%E8%A6%86%E3%80%82%3C%2Fspan%3E"}});$(".datepicker", $(".customform[type='customform']")).each(function() {if($(this).has("input[name='appt_date']").length == 0) {$(this).iv_datepicker({callback         : null,locale           : "zh-TW",empty_by_default : false});}});})(jQuery);
