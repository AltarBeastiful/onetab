var VQ = {
    N9: "http://www.JSON.org",
    DE: "(c)2005 JSON.org",
    u9: "http://www.crockford.com/JSON/license.html",
    /**
     * @param {?} value
     * @return {?}
     */
    o9: function(value) {
        var i;
        var n;
        var ln;
        /** @type {string} */
        var result = "";
        var c;
        switch (typeof value) {
            case "object":
                if (value) {
                    if (value instanceof Array) {
                        /** @type {number} */
                        n = 0;
                        for (; n < value.length; ++n) {
                            c = this.o9(value[n]);
                            if (result) {
                                result += ",";
                            }
                            result += c;
                        }
                        return "[" + result + "]";
                    } else {
                        if (typeof value.toString != "undefined") {
                            for (n in value) {
                                c = value[n];
                                if (typeof c != "undefined" && typeof c != "function") {
                                    c = this.o9(c);
                                    if (result) {
                                        result += ",";
                                    }
                                    result += this.o9(n) + ":" + c;
                                }
                            }
                            return "{" + result + "}";
                        }
                    }
                }
                return "null";
            case "number":
                return isFinite(value) ? String(value) : "null";
            case "string":
                /** @type {number} */
                ln = value.length;
                /** @type {string} */
                result = '"';
                /** @type {number} */
                n = 0;
                for (; n < ln; n += 1) {
                    /** @type {string} */
                    i = value.charAt(n);
                    if (i >= " ") {
                        if (i == "\\" || i == '"') {
                            result += "\\";
                        }
                        result += i;
                    } else {
                        switch (i) {
                            case "\b":
                                result += "\\b";
                                break;
                            case "\f":
                                result += "\\f";
                                break;
                            case "\n":
                                result += "\\n";
                                break;
                            case "\r":
                                result += "\\r";
                                break;
                            case "\t":
                                result += "\\t";
                                break;
                            default:
                                /** @type {number} */
                                i = i.charCodeAt();
                                result += "\\u00" + Math.floor(i / 16).toString(16) + (i % 16).toString(16);
                        }
                    }
                }
                return result + '"';
            case "boolean":
                return String(value);
            default:
                return "null";
        }
    },
    /**
     * @param {string} term
     * @return {?}
     */
    parse: function(term) {
        /**
         * @param {string} msg
         * @return {?}
         */
        function match(msg) {
            throw {
                name: "JSONError",
                message: msg,
                V9: i - 1,
                text: term
            };
        }
        /**
         * @return {?}
         */
        function next() {
            ch = term.charAt(i);
            i += 1;
            return ch;
        }
        /**
         * @return {undefined}
         */
        function complete() {
            for (; ch !== "" && ch <= " ";) {
                next();
            }
        }
        /**
         * @return {?}
         */
        function readString() {
            var aN;
            /** @type {string} */
            var string = "";
            var hex;
            var uffff;
            if (ch == '"') {
                bye: for (; next();) {
                    if (ch == '"') {
                        next();
                        return string;
                    } else {
                        if (ch == "\\") {
                            switch (next()) {
                                case "b":
                                    string += "\b";
                                    break;
                                case "f":
                                    string += "\f";
                                    break;
                                case "n":
                                    string += "\n";
                                    break;
                                case "r":
                                    string += "\r";
                                    break;
                                case "t":
                                    string += "\t";
                                    break;
                                case "u":
                                    /** @type {number} */
                                    uffff = 0;
                                    /** @type {number} */
                                    aN = 0;
                                    for (; aN < 4; aN += 1) {
                                        /** @type {number} */
                                        hex = parseInt(next(), 16);
                                        if (!isFinite(hex)) {
                                            break bye;
                                        }
                                        /** @type {number} */
                                        uffff = uffff * 16 + hex;
                                    }
                                    string += String.fromCharCode(uffff);
                                    break;
                                default:
                                    string += ch;
                            }
                        } else {
                            string += ch;
                        }
                    }
                }
            }
            match("Bad string");
        }
        /**
         * @return {?}
         */
        function get() {
            /** @type {Array} */
            var _results = [];
            if (ch == "[") {
                next();
                complete();
                if (ch == "]") {
                    next();
                    return _results;
                }
                for (; ch;) {
                    _results.push(callback());
                    complete();
                    if (ch == "]") {
                        next();
                        return _results;
                    } else {
                        if (ch != ",") {
                            break;
                        }
                    }
                    next();
                    complete();
                }
            }
            match("Bad array");
        }
        /**
         * @return {?}
         */
        function finish() {
            var name;
            var old = {};
            if (ch == "{") {
                next();
                complete();
                if (ch == "}") {
                    next();
                    return old;
                }
                for (; ch;) {
                    name = readString();
                    complete();
                    if (ch != ":") {
                        break;
                    }
                    next();
                    old[name] = callback();
                    complete();
                    if (ch == "}") {
                        next();
                        return old;
                    } else {
                        if (ch != ",") {
                            break;
                        }
                    }
                    next();
                    complete();
                }
            }
            match("Bad object");
        }
        /**
         * @return {?}
         */
        function number() {
            /** @type {string} */
            var string = "";
            var number;
            if (ch == "-") {
                /** @type {string} */
                string = "-";
                next();
            }
            for (; ch >= "0" && ch <= "9";) {
                string += ch;
                next();
            }
            if (ch == ".") {
                string += ".";
                for (; next() && (ch >= "0" && ch <= "9");) {
                    string += ch;
                }
            }
            if (ch == "e" || ch == "E") {
                string += "e";
                next();
                if (ch == "-" || ch == "+") {
                    string += ch;
                    next();
                }
                for (; ch >= "0" && ch <= "9";) {
                    string += ch;
                    next();
                }
            }
            /** @type {number} */
            number = +string;
            if (!isFinite(number)) {
                match("Bad number");
            } else {
                return number;
            }
        }
        /**
         * @return {?}
         */
        function word() {
            switch (ch) {
                case "t":
                    if (next() == "r" && (next() == "u" && next() == "e")) {
                        next();
                        return true;
                    }
                    break;
                case "f":
                    if (next() == "a" && (next() == "l" && (next() == "s" && next() == "e"))) {
                        next();
                        return false;
                    }
                    break;
                case "n":
                    if (next() == "u" && (next() == "l" && next() == "l")) {
                        next();
                        return null;
                    }
                    break;
            }
            match("Syntax error");
        }
        /**
         * @return {?}
         */
        function callback() {
            complete();
            switch (ch) {
                case "{":
                    return finish();
                case "[":
                    return get();
                case '"':
                    return readString();
                case "-":
                    return number();
                default:
                    return ch >= "0" && ch <= "9" ? number() : word();
            }
        }
        /** @type {number} */
        var i = 0;
        /** @type {string} */
        var ch = " ";
        return callback();
    }
};

// Start of code
/**
 * @return {undefined}
 */
function YV() {
    /** @type {null} */
    this.bE = null;
    /** @type {null} */
    this.fE = null;
    /** @type {null} */
    this.OE = null;
    /** @type {null} */
    this.g9 = null;
    /** @type {null} */
    this.EE = null;
    /** @type {null} */
    this.dE = null;
    /** @type {boolean} */
    this.wE = false;
    /** @type {Array} */
    this.L9 = new Array;
    /** @type {null} */
    this.j9 = null;
    /** @type {null} */
    this.G9 = null;
}
/** @type {number} */
YV.m9 = 3;
/**
 * @param {Object} selector
 * @param {?} opt_attributes
 * @param {Node} elem
 * @param {string} theTitle
 * @param {Function} $sanitize
 * @param {Function} Application
 * @param {Function} forOwn
 * @param {Function} main_callback
 * @param {Function} makeIterator
 * @return {undefined}
 */
YV.prototype.M9 = function(selector, opt_attributes, elem, theTitle, $sanitize, Application, forOwn, main_callback, makeIterator) {
    var self = this;
    /**
     * @param {Object} e
     * @return {undefined}
     */
    selector.onmousedown = function(e) {
        /** @type {boolean} */
        var callback = false;
        NV(e, selector, null, function(dataAndEvents, deepDataAndEvents, ignoreMethodDoesntExist, textAlt) {
            if (makeIterator) {
                callback = makeIterator();
            }
        }, function(dataAndEvents, deepDataAndEvents, adjust, wheelDeltaY, ignoreMethodDoesntExist, textAlt, maxWidth, result) {
            if (!self.wE && !callback) {
                if (Math.abs(adjust) > YV.m9 || Math.abs(wheelDeltaY) > YV.m9) {
                    /** @type {boolean} */
                    self.wE = true;
                    /** @type {Array} */
                    self.L9 = new Array;
                    self.bE = opt_attributes;
                    self.OE = elem.offsetWidth;
                    self.g9 = elem.offsetHeight;
                    self.j9 = elem.parentNode;
                    self.G9 = elem.nextSibling;
                    elem.parentNode.removeChild(elem);
                    /** @type {Node} */
                    self.fE = elem;
                    /** @type {string} */
                    self.EE = theTitle;
                    /** @type {Element} */
                    self.dE = document.createElement("div");
                    self.dE.style.zIndex = A;
                    /** @type {string} */
                    self.dE.style.position = "absolute";
                    /** @type {string} */
                    self.dE.style.width = self.OE + "px";
                    /** @type {string} */
                    self.dE.style.height = self.g9 + "px";
                    self.dE.appendChild(self.fE);
                    TE().appendChild(self.dE);
                    $sanitize();
                }
            }
            if (self.wE) {
                /** @type {string} */
                self.dE.style.left = maxWidth + 7 + "px";
                /** @type {string} */
                self.dE.style.top = result - 16 + "px";
            }
        }, function(dataAndEvents, deepDataAndEvents, ignoreMethodDoesntExist, textAlt, keepData, opt_attributes) {
            if (!self.wE) {
                Application();
            } else {
                /** @type {boolean} */
                self.wE = false;
                TE().removeChild(self.dE);
                if (self.z9) {
                    self.z9(self.bE);
                } else {
                    forOwn();
                }
                var idx;
                for (idx in self.L9) {
                    var next = self.L9[idx];
                    /** @type {string} */
                    next.style.display = "none";
                }
                /** @type {Array} */
                self.L9 = new Array;
                main_callback();
            }
        });
    };
};
/**
 * @param {Element} element
 * @param {string} dataAndEvents
 * @param {Element} el
 * @param {Function} version
 * @return {undefined}
 */
YV.prototype.IE = function(element, dataAndEvents, el, version) {
    var item = this;
    wV(element, function(params) {
        /** @type {boolean} */
        params.event.cancelBubble = true;
        if (item.wE) {
            if (element != item.fE) {
                /** @type {string} */
                el.style.display = "block";
                /** @type {string} */
                el.style.width = item.OE - (hQ ? 0 : 2) + "px";
                /** @type {string} */
                el.style.height = item.g9 - (hQ ? 0 : 2) + "px";
                el.style.border = "1px dashed #" + dQ;
                /** @type {Function} */
                item.z9 = version;
                var name;
                for (name in item.L9) {
                    var body = item.L9[name];
                    if (EV(body.parentNode, el) && el != body) {
                        /** @type {string} */
                        body.style.display = "none";
                    }
                }
                if (!HV(item.L9, el)) {
                    item.L9.push(el);
                }
            }
        }
    });
    WE(element, function(params) {
        /** @type {boolean} */
        params.event.cancelBubble = true;
        if (item.wE) {
            if (element != item.fE) {
                /** @type {string} */
                el.style.display = "none";
                /** @type {null} */
                item.z9 = null;
                NE(el, item.L9);
            }
        }
    });
};
/**
 * @param {Element} element
 * @return {?}
 */
YV.prototype.H9 = function(element) {
    /** @type {Element} */
    var newElement = document.createElement("div");
    element.appendChild(newElement);
    return newElement;
};
/**
 * @param {Element} dataAndEvents
 * @param {(RegExp|string)} encoder
 * @param {string} val
 * @param {(number|string)} deepDataAndEvents
 * @param {string} value
 * @param {(number|string)} ignoreMethodDoesntExist
 * @param {?} textAlt
 * @param {?} keepData
 * @return {undefined}
 */
function JQ(dataAndEvents, encoder, val, deepDataAndEvents, value, ignoreMethodDoesntExist, textAlt, keepData) {
    var data = this;
    /** @type {Element} */
    this.parentElement = dataAndEvents;
    /**
     * @return {undefined}
     */
    this.U9 = function() {};
    this.Z9 = keepData;
    /** @type {string} */
    this.value = val;
    /** @type {(number|string)} */
    this.a9 = deepDataAndEvents;
    /** @type {string} */
    this.fontWeight = value;
    /** @type {(number|string)} */
    this.s9 = ignoreMethodDoesntExist;
    this.e9 = textAlt;
    /** @type {boolean} */
    this.W9 = false;
    /** @type {boolean} */
    this.v9 = false;
    /** @type {Element} */
    this.Q9 = document.createElement("div");
    /** @type {string} */
    this.Q9.style.display = "inline-block";
    /** @type {string} */
    this.Q9.style.position = "relative";
    /** @type {string} */
    this.Q9.style.overflow = "hidden";
    /** @type {Element} */
    this.KE = document.createElement("div");
    /** @type {string} */
    this.KE.style.textDecoration = "none";
    /** @type {string} */
    this.KE.style.display = "block";
    this.KE.className = this.s9;
    /** @type {string} */
    this.KE.style.whiteSpace = "nowrap";
    /** @type {string} */
    this.KE.style.fontSize = this.a9 + "px";
    this.KE.style.fontWeight = this.fontWeight;
    /** @type {string} */
    this.KE.style.overflow = "hidden";
    this.w9(this.value, false, true);
    /** @type {(RegExp|string)} */
    this.U9 = encoder;
    this.Q9.appendChild(this.KE);
    this.parentElement.appendChild(this.Q9);
    /**
     * @return {?}
     */
    var init = function() {
        if (data.W9) {
            return;
        }
        if (data.Z9) {
            data.Z9();
        }
        /** @type {boolean} */
        data.W9 = true;
        /** @type {Element} */
        var element = document.createElement("input");
        element.setAttribute("autocomplete", "off");
        element.setAttribute("spellcheck", "false");
        /** @type {string} */
        element.style.position = "absolute";
        /** @type {string} */
        element.style.left = "0px";
        /** @type {string} */
        element.style.top = "0px";
        /** @type {string} */
        element.style.width = data.KE.offsetWidth + "px";
        /** @type {string} */
        element.style.height = data.KE.offsetHeight + 0 + "px";
        /** @type {string} */
        element.style.overflow = "hidden";
        /** @type {string} */
        element.style.border = "none";
        /** @type {string} */
        element.style.paddingTop = "0px";
        /** @type {string} */
        element.style.paddingLeft = "0px";
        /** @type {string} */
        element.style.paddingRight = "0px";
        /** @type {string} */
        element.style.paddingBottom = "0px";
        /** @type {string} */
        element.style.marginTop = "0px";
        /** @type {string} */
        element.style.marginLeft = "0px";
        /** @type {string} */
        element.style.marginRight = "0px";
        /** @type {string} */
        element.style.marginBottom = "0px";
        /** @type {string} */
        element.style.background = "transparent";
        O(data.KE);
        /** @type {string} */
        data.KE.innerHTML = "&nbsp;";
        /** @type {string} */
        data.KE.style.width = "1px";
        element.className = data.s9;
        /** @type {string} */
        element.style.fontSize = data.a9 + "px";
        element.style.fontWeight = data.fontWeight;
        data.Q9.appendChild(element);
        element.value = data.value;
        /**
         * @return {?}
         */
        element.onblur = function() {
            data.Q9.removeChild(element);
            data.w9(data.value, false, false);
            setTimeout(function() {
                /** @type {boolean} */
                data.W9 = false;
            }, 300);
            return false;
        };
        /**
         * @param {Object} event
         * @return {?}
         */
        element.onkeyup = function(event) {
            /** @type {Object} */
            var originalEvent = event;
            if (!originalEvent) {
                originalEvent = window.event;
            }
            if (originalEvent) {
                if (originalEvent.keyCode == 13) {
                    element.blur();
                    return;
                }
            }
            data.value = element.value;
            var s = S(data.value, data.s9, data.a9, data.fontWeight, false);
            /** @type {string} */
            element.style.width = s + 30 + "px";
            /** @type {string} */
            data.Q9.style.width = s + 30 + "px";
            encoder(element.value, false, s + 30);
            return false;
        };
        /** @type {function (Object): ?} */
        element.onmouseup = element.onkeyup;
        element.onkeyup();
        setTimeout(function() {
            element.focus();
        }, 100);
        return false;
    };
    /** @type {function (): ?} */
    this.T9 = init;
    /**
     * @param {?} evt
     * @return {undefined}
     */
    this.KE.onmousedown = function(evt) {};
    /**
     * @param {?} evt
     * @return {?}
     */
    this.KE.onmouseup = function(evt) {
        if (data.W9) {
            return true;
        }
        /** @type {boolean} */
        var uN = false;
        if (data.e9) {
            uN = data.e9();
        }
        if (!uN) {
            init();
        }
        return false;
    };
}
/**
 * @return {?}
 */
JQ.prototype._9 = function() {
    var val = S(this.value, this.s9, this.a9, this.fontWeight, false);
    /** @type {number} */
    val = Math.max(val, 20);
    /** @type {string} */
    this.KE.style.width = val + "px";
    /** @type {string} */
    this.Q9.style.width = val + "px";
    return val;
};
/**
 * @param {string} val
 * @param {boolean} recurring
 * @param {boolean} v33
 * @return {undefined}
 */
JQ.prototype.w9 = function(val, recurring, v33) {
    /** @type {string} */
    this.value = val;
    if (val == "" || hE(val) == "") {
        /** @type {string} */
        this.KE.innerHTML = "&nbsp;";
    } else {
        O(this.KE);
        this.KE.appendChild(document.createTextNode(val));
    }
    var r20 = this._9();
    if (!v33) {
        this.U9(val, !recurring, r20);
    }
};
/** @type {null} */
var WQ = null;
/** @type {Array} */
var vE = new Array;
/**
 * @param {?} text
 * @param {string} s
 * @param {?} val
 * @param {string} m
 * @param {boolean} recurring
 * @return {?}
 */
function S(text, s, val, m, recurring) {
    if (!m) {
        /** @type {string} */
        m = "normal";
    }
    if (m === true) {
        /** @type {string} */
        m = "bold";
    }
    if (m === false) {
        /** @type {string} */
        m = "normal";
    }
    var control;
    for (control in vE) {
        var options = vE[control];
        if (options.text == text) {
            if (options.className == s && (options.x9 == val && (options.fontWeight == m && !!options.VE == !!recurring))) {
                return options.width;
            }
        }
    }
    if (WQ == null) {
        /** @type {Element} */
        WQ = document.createElement("div");
        /** @type {Element} */
        var el = WQ;
        /** @type {string} */
        el.style.visibility = "hidden";
        /** @type {string} */
        el.style.position = "absolute";
        /** @type {string} */
        el.style.left = "-8000px";
        /** @type {string} */
        el.style.top = "-8000px";
        /** @type {string} */
        el.style.whiteSpace = "nowrap";
        TE().appendChild(el);
    }
    /** @type {Element} */
    el = WQ;
    /** @type {string} */
    el.className = s;
    /** @type {string} */
    el.style.fontSize = val + "px";
    /** @type {string} */
    el.style.fontStyle = recurring ? "italic" : "normal";
    if (m) {
        /** @type {string} */
        el.style.fontWeight = m;
    }
    el.appendChild(document.createTextNode(text));
    var width = el.offsetWidth;
    O(el);
    /** @type {Object} */
    options = new Object;
    options.text = text;
    /** @type {string} */
    options.className = s;
    options.x9 = val;
    /** @type {string} */
    options.fontWeight = m;
    /** @type {boolean} */
    options.VE = !!recurring;
    options.width = width;
    vE.push(options);
    return width;
}
/** @type {boolean} */
var hQ = false;
/** @type {boolean} */
var OQ = true;
/** @type {boolean} */
var QV = false;
/** @type {boolean} */
var gQ = false;
/** @type {string} */
var vV = "onmousemove";
/** @type {string} */
var UE = "onmousedown";
/** @type {string} */
var uV = "onmouseover";
/** @type {string} */
var $Q = "onmouseup";
/** @type {string} */
var C = "onmouseout";
/** @type {string} */
var XQ = "onclick";
/** @type {string} */
var SE = "ondblclick";
/** @type {string} */
var VV = "onmouseleave";
/** @type {string} */
var rE = "mousemove";
/** @type {string} */
var mV = "mousedown";
/** @type {string} */
var XV = "mouseover";
/** @type {string} */
var _E = "mouseup";
/** @type {string} */
var qV = "mouseout";
/** @type {string} */
var QQ = "click";
/** @type {string} */
var N = "dblclick";
var LQ = new YV;
/** @type {boolean} */
var xV = !!("ontouchstart" in window);
/** @type {number} */
var A = 100006;
/**
 * @return {?}
 */
function TE() {
    return document.body;
}
/** @type {string} */
var dQ = "aaa";
/** @type {string} */
var eE = "1.7";
var iQ = window["chrome"]["runtime"]["getURL"]("onetab.html");
/**
 * @param {string} cmd
 * @return {?}
 */
function g(cmd) {
    return cmd.indexOf(iQ) == 0;
}
/**
 * @return {?}
 */
function LE() {
    var whitespace = rV("availableVersion");
    if (!whitespace) {
        return false;
    }
    /** @type {number} */
    var left = parseInt(eE.substring(0, eE.indexOf(".")));
    /** @type {number} */
    var low = parseInt(eE.substring(eE.indexOf(".") + 1));
    /** @type {number} */
    var right = parseInt(whitespace.substring(0, whitespace.indexOf(".")));
    /** @type {number} */
    var high = parseInt(whitespace.substring(whitespace.indexOf(".") + 1));
    /** @type {boolean} */
    var LE = false;
    if (left < right) {
        /** @type {boolean} */
        LE = true;
    }
    if (left == right) {
        if (low < high) {
            /** @type {boolean} */
            LE = true;
        }
    }
    return LE;
}
/**
 * @param {Function} fn
 * @return {undefined}
 */
var D = function(fn) {
    window["chrome"]["tabs"]["query"]({
        "active": true,
        "currentWindow": true
    }, function(context) {
        if (context && context.length == 1) {
            fn(context[0]);
        }
    });
};
/**
 * @return {undefined}
 */
var TV = function() {
    vQ();
};
/**
 * @param {?} deepDataAndEvents
 * @return {undefined}
 */
var _Q = function(deepDataAndEvents) {
    D(function(inplace) {
        mQ(inplace, function($sanitize) {
            fQ();
            $sanitize();
        }, deepDataAndEvents);
    });
};
/**
 * @param {string} deepDataAndEvents
 * @param {?} dataAndEvents
 * @return {undefined}
 */
var zQ = function(deepDataAndEvents, dataAndEvents) {
    /** @type {string} */
    var errStr = "";
    if (deepDataAndEvents == GE) {
        errStr = IQ;
    } else {
        /** @type {string} */
        errStr = deepDataAndEvents;
    }
    bQ(deepDataAndEvents, errStr, function($sanitize) {
        fQ();
        $sanitize();
    }, dataAndEvents);
};
/**
 * @param {?} walkers
 * @return {undefined}
 */
var cV = function(walkers) {
    window["chrome"]["windows"]["getLastFocused"](undefined, function(done) {
        tV(done["id"], function(until) {
            vQ(true, until);
        }, walkers);
    });
};
/**
 * @param {?} walkers
 * @return {undefined}
 */
var d = function(walkers) {
    window["chrome"]["windows"]["getLastFocused"](undefined, function(done) {
        window["chrome"]["tabs"]["query"]({
            "windowId": done["id"]
        }, function(keys) {
            /** @type {Array} */
            var matched = [];
            var status;
            var i;
            for (i in keys) {
                if (keys[i]["active"]) {
                    status = keys[i];
                }
            }
            if (status) {
                for (i in keys) {
                    if (parseInt(keys[i]["index"]) != parseInt(status["index"])) {
                        matched.push(keys[i]);
                    }
                }
                if (matched.length > 0) {
                    cQ(matched, true, function($sanitize) {
                        fQ();
                        $sanitize();
                    }, walkers);
                }
            } else {
                alert("no active tab");
            }
        });
    });
};
/**
 * @param {?} walkers
 * @return {undefined}
 */
var UV = function(walkers) {
    window["chrome"]["windows"]["getLastFocused"](undefined, function(done) {
        window["chrome"]["tabs"]["query"]({
            "windowId": done["id"]
        }, function(keys) {
            /** @type {Array} */
            var matched = [];
            var status;
            var i;
            for (i in keys) {
                if (keys[i]["active"]) {
                    status = keys[i];
                }
            }
            if (status) {
                for (i in keys) {
                    if (parseInt(keys[i]["index"]) < parseInt(status["index"])) {
                        matched.push(keys[i]);
                    }
                }
                if (matched.length > 0) {
                    cQ(matched, true, function($sanitize) {
                        fQ();
                        $sanitize();
                    }, walkers);
                }
            }
        });
    });
};
/**
 * @param {?} walkers
 * @return {undefined}
 */
var zV = function(walkers) {
    window["chrome"]["windows"]["getLastFocused"](undefined, function(done) {
        window["chrome"]["tabs"]["query"]({
            "windowId": done["id"]
        }, function(keys) {
            /** @type {Array} */
            var matched = [];
            var status;
            var i;
            for (i in keys) {
                if (keys[i]["active"]) {
                    status = keys[i];
                }
            }
            if (status) {
                for (i in keys) {
                    if (parseInt(keys[i]["index"]) > parseInt(status["index"])) {
                        matched.push(keys[i]);
                    }
                }
                if (matched.length > 0) {
                    cQ(matched, true, function($sanitize) {
                        fQ();
                        $sanitize();
                    }, walkers);
                }
            }
        });
    });
};
/**
 * @param {?} walkers
 * @return {undefined}
 */
var tQ = function(walkers) {
    window["chrome"]["windows"]["getAll"]({}, function(streams) {
        /** @type {Array} */
        var map = [];
        /** @type {Array} */
        var items = [];
        var name;
        for (name in streams) {
            items.push(streams[name]["id"]);
        }
        for (name in items) {
            var windowId = items[name];
            tV(windowId, function(spaceName) {
                map.push(spaceName);
            }, walkers);
        }
        vQ(true, function() {
            var letter;
            for (letter in map) {
                map[letter]();
            }
        });
    });
};
/**
 * @param {?} $sanitize
 * @return {undefined}
 */
function fQ($sanitize) {
    window["chrome"]["tabs"]["query"]({}, function(codeSegments) {
        var u = undefined;
        /** @type {number} */
        var i = 0;
        for (; i < codeSegments.length; i++) {
            var v = codeSegments[i];
            var wanted = v["url"];
            if (wanted.indexOf(window["chrome"]["runtime"]["getURL"]("onetab.html")) == 0) {
                u = v;
                break;
            }
        }
        if (u) {
            window["chrome"]["tabs"]["reload"](u["id"], {}, function() {
                if ($sanitize) {
                    $sanitize();
                }
            });
        }
    });
}
/**
 * @return {undefined}
 */
function yV() {
    var tabGroups = lQ();
    var resultItems = tabGroups["tabGroups"];
    if (!resultItems) {
        /** @type {Array} */
        resultItems = [];
    }
    /** @type {number} */
    var prevChunksLen = 0;
    /** @type {number} */
    var i = 0;
    for (; i < resultItems.length; i++) {
        var result = resultItems[i];
        prevChunksLen += result["tabsMeta"].length;
    }
    if (prevChunksLen == 0) {
        window["chrome"]["tabs"]["query"]({}, function(map) {
            var letter;
            for (letter in map) {
                if (g(map[letter]["url"])) {
                    window["chrome"]["tabs"]["remove"](map[letter]["id"], function() {
                        window["chrome"]["runtime"]["getBackgroundPage"](function(dataAndEvents) {
                            dataAndEvents["updateContextMenuState"]();
                        });
                    });
                }
            }
        });
    }
}
/**
 * @param {boolean} dataAndEvents
 * @param {Function} until
 * @return {undefined}
 */
function vQ(dataAndEvents, until) {
    window["chrome"]["tabs"]["query"]({}, function(codeSegments) {
        var u = undefined;
        /** @type {number} */
        var i = 0;
        for (; i < codeSegments.length; i++) {
            var v = codeSegments[i];
            var wanted = v["url"];
            if (wanted.indexOf(window["chrome"]["runtime"]["getURL"]("onetab.html")) == 0) {
                if (u) {
                    window["chrome"]["tabs"]["remove"](u["id"]);
                } else {
                    u = v;
                }
            }
        }
        if (u) {
            if (dataAndEvents) {
                window["chrome"]["tabs"]["reload"](u["id"], {}, function() {
                    if (until) {
                        until();
                    }
                });
            }
            window["chrome"]["tabs"]["update"](u["id"], {
                "active": true
            }, function() {
                window["chrome"]["windows"]["update"](u["id"], {
                    "focused": true
                }, function() {
                    if (until) {
                        until();
                    }
                });
            });
        } else {
            window["chrome"]["tabs"]["create"]({
                "url": window["chrome"]["runtime"]["getURL"]("onetab.html")
            }, function() {
                if (until) {
                    until();
                }
            });
        }
    });
}
/**
 * @param {string} line
 * @return {?}
 */
function jV(line) {
    /** @type {Element} */
    var div = document.createElement("div");
    /** @type {string} */
    div.style.paddingTop = "40px";
    /** @type {string} */
    div.style.paddingBottom = "24px";
    /** @type {string} */
    div.style.paddingLeft = "268px";
    /** @type {string} */
    div.style.fontSize = "18px";
    /** @type {string} */
    div.style.color = "#777";
    /** @type {string} */
    div.style.fontWeight = "300";
    /** @type {string} */
    div.style.borderBottom = "1px dashed #ddd";
    /** @type {string} */
    div.style.marginBottom = "10px";
    div.appendChild(document.createTextNode(line));
    return div;
}
/**
 * @return {?}
 */
function uE() {
    /** @type {Element} */
    var image = document.createElement("img");
    /** @type {string} */
    image.style.height = 114 / 2 + "px";
    /** @type {string} */
    image.style.width = 414 / 2 + "px";
    /** @type {string} */
    image.style.position = "absolute";
    /** @type {string} */
    image.style.top = "16px";
    /** @type {string} */
    image.style.left = "22px";
    /** @type {string} */
    image.src = "images/top-left-logo.png";
    return image;
}
/**
 * @param {boolean} visible
 * @param {?} line
 * @param {?} code
 * @return {?}
 */
function aE(visible, line, code) {
    /** @type {Element} */
    var ele = document.createElement("div");
    /** @type {Element} */
    var div = document.createElement("div");
    /** @type {string} */
    div.style.paddingLeft = "30px";
    /** @type {string} */
    div.style.position = "relative";
    /** @type {string} */
    div.style.color = "#777";
    /** @type {Element} */
    var img = document.createElement("img");
    /** @type {string} */
    img.src = visible ? "images/twister-open.png" : "images/twister-closed.png";
    /** @type {string} */
    img.style.width = 48 / 2 + "px";
    /** @type {string} */
    img.style.height = 50 / 2 + "px";
    /** @type {string} */
    img.style.position = "absolute";
    /** @type {string} */
    img.style.left = "0px";
    /** @type {string} */
    img.style.top = "0px";
    div.appendChild(document.createTextNode(line));
    /** @type {string} */
    div.style.fontSize = "16px";
    /** @type {string} */
    div.style.cursor = "pointer";
    ele.appendChild(div);
    div.appendChild(img);
    /** @type {Element} */
    var el = document.createElement("div");
    /** @type {string} */
    el.style.paddingLeft = "30px";
    /** @type {string} */
    el.style.paddingTop = "10px";
    el.appendChild(code);
    /** @type {string} */
    el.style.display = visible ? "block" : "none";
    ele.appendChild(el);
    /**
     * @return {undefined}
     */
    div.onclick = function() {
        /** @type {boolean} */
        visible = !visible;
        /** @type {string} */
        img.src = visible ? "images/twister-open.png" : "images/twister-closed.png";
        /** @type {string} */
        el.style.display = visible ? "block" : "none";
    };
    return ele;
}
/**
 * @param {?} s
 * @param {number} mid
 * @param {Function} fn
 * @param {boolean} loose
 * @return {?}
 */
function ZV(s, mid, fn, loose) {
    /** @type {Element} */
    var el = document.createElement("div");
    /** @type {string} */
    el.style.fontSize = mid + "px";
    /** @type {string} */
    el.className = "clickable";
    /** @type {Element} */
    var e = document.createElement("span");
    if (loose) {
        /** @type {Element} */
        var j = document.createElement("span");
        /** @type {string} */
        j.style.color = "#f00";
        j.appendChild(document.createTextNode("NEW "));
        e.appendChild(j);
    }
    if (typeof s == "string") {
        e.appendChild(document.createTextNode(s));
    } else {
        e.appendChild(s);
    }
    /** @type {string} */
    e.style.verticalAlign = "middle";
    /**
     * @return {undefined}
     */
    e.onclick = function() {
        fn(e);
    };
    el.appendChild(e);
    return el;
}
/**
 * @param {?} arr
 * @return {undefined}
 */
function RV(arr) {
    arr.sort(function(a, b) {
        if (a["starred"] || b["starred"]) {
            if (!b["starred"]) {
                return -1;
            } else {
                if (!a["starred"]) {
                    return 1;
                } else {
                    if (a["starredDate"] > b["starredDate"]) {
                        return 1;
                    }
                    if (a["starredDate"] < b["starredDate"]) {
                        return -1;
                    }
                    return 0;
                }
            }
        } else {
            if (a["createDate"] > b["createDate"]) {
                return -1;
            }
            if (a["createDate"] < b["createDate"]) {
                return 1;
            }
            return 0;
        }
    });
}
/**
 * @return {undefined}
 */
var uQ = function() {
    window["_gaq"] = window["_gaq"] || [];
    window["_gaq"].push(["_setAccount", "UA-38573374-2"]);
    window["_gaq"].push(["_trackPageview"]);
    /** @type {Element} */
    var script = document.createElement("script");
    /** @type {string} */
    script["type"] = "text/javascript";
    /** @type {boolean} */
    script["async"] = true;
    /** @type {string} */
    script["src"] = "https://ssl.google-analytics.com/ga.js";
    var insertAt = document.getElementsByTagName("script")[0];
    insertAt.parentNode.insertBefore(script, insertAt);
};
/**
 * @param {string} pair
 * @param {?} endTag
 * @return {?}
 */
function yQ(pair, endTag) {
    pair = pair.substring(pair.indexOf("?") + 1);
    var map = pair.split("&");
    var letter;
    for (letter in map) {
        var match = map[letter].split("=");
        if (match[0] == endTag) {
            return decodeURIComponent(match[1]);
        }
    }
    return undefined;
}
/**
 * @param {string} html
 * @return {?}
 */
function FQ(html) {
    if (html.indexOf("://") == -1) {
        /** @type {string} */
        html = "http://" + html;
    }
    html = html.substring(html.indexOf("://") + "://".length);
    if (html.indexOf("/") != -1) {
        html = html.substring(0, html.indexOf("/"));
    }
    return html.toLowerCase();
}
/**
 * @param {Object} map
 * @param {Element} clicked
 * @return {?}
 */
function HV(map, clicked) {
    var letter;
    for (letter in map) {
        if (map[letter] == clicked) {
            return true;
        }
    }
    return false;
}
/**
 * @param {Element} el
 * @return {undefined}
 */
function O(el) {
    if (typeof el == "string") {
        /** @type {(HTMLElement|null)} */
        el = document.getElementById(el);
    }
    if (!el) {
        return;
    }
    for (; el.childNodes.length > 0;) {
        el.removeChild(el.childNodes[0]);
    }
}
/**
 * @param {number} a
 * @return {?}
 */
function M(a) {
    /** @type {Element} */
    var content = document.createElement("div");
    /** @type {string} */
    content.style.fontSize = "1px";
    /** @type {string} */
    content.style.height = a + "px";
    /** @type {string} */
    content.style.width = 1 + "px";
    return content;
}
/**
 * @param {Element} elt
 * @param {Array} drop
 * @return {undefined}
 */
function NE(elt, drop) {
    /** @type {number} */
    var i = 0;
    for (; i < drop.length; i++) {
        if (drop[i] == elt) {
            drop.splice(i, 1);
            i--;
        }
    }
}
/**
 * @param {Object} e
 * @return {?}
 */
function $(e) {
    var ev = e ? e : window.event;
    /** @type {number} */
    var shift = 0;
    /** @type {number} */
    var altKey = 0;
    /** @type {number} */
    var shift_status = 0;
    /** @type {number} */
    var mousedown = 0;
    if (ev != null) {
        if (hQ) {
            shift_status = ev.shiftKey;
            altKey = ev.altKey;
            shift = ev.ctrlKey;
        } else {
            shift_status = ev.shiftKey;
            shift = ev.ctrlKey;
            altKey = ev.altKey;
            mousedown = ev.metaKey;
        }
    }
    return shift || (mousedown || shift_status);
}
/**
 * @param {Object} e
 * @return {?}
 */
function FV(e) {
    var ev = e ? e : window.event;
    /** @type {number} */
    var shift = 0;
    /** @type {number} */
    var altKey = 0;
    /** @type {number} */
    var shift_status = 0;
    /** @type {number} */
    var mousedown = 0;
    if (ev != null) {
        if (hQ) {
            shift_status = ev.shiftKey;
            altKey = ev.altKey;
            shift = ev.ctrlKey;
        } else {
            shift_status = ev.shiftKey;
            shift = ev.ctrlKey;
            altKey = ev.altKey;
            mousedown = ev.metaKey;
        }
    }
    return shift || mousedown;
}
/**
 * @param {string} e
 * @return {?}
 */
function wQ(e) {
    var ev = e ? e : window.event;
    /** @type {number} */
    var mousedown = 0;
    /** @type {number} */
    var altKey = 0;
    /** @type {number} */
    var shift = 0;
    /** @type {number} */
    var dragOY = 0;
    if (ev != null) {
        if (hQ) {
            shift = ev.shiftKey;
            altKey = ev.altKey;
            mousedown = ev.ctrlKey;
        } else {
            shift = ev.shiftKey;
            mousedown = ev.ctrlKey;
            altKey = ev.altKey;
            dragOY = ev.metaKey;
        }
    }
    return shift;
}
/**
 * @param {?} _xhr
 * @return {undefined}
 */
function hV(_xhr) {
    _xhr["noCacheRandom"] = I();
}
/**
 * @return {?}
 */
function I() {
    return (new Date).getTime() + Math.round(Math.random() * 1E4) + "";
}
/**
 * @param {string} deepDataAndEvents
 * @param {?} data
 * @param {Function} cb
 * @return {undefined}
 */
function YQ(deepDataAndEvents, data, cb) {
    hV(data);
    var msgs = VQ.o9(data);
    nV(deepDataAndEvents, msgs, function(t) {
        if (cb) {
            cb(VQ.parse(t));
        }
    });
}
/**
 * @param {string} deepDataAndEvents
 * @param {(Object|boolean|number|string)} data
 * @param {Function} on
 * @return {undefined}
 */
function nV(deepDataAndEvents, data, on) {
    var xhr = jE();
    xhr.open(data == null ? "GET" : "POST", deepDataAndEvents, true);
    xhr.setRequestHeader("Content-Type", "text/xml");
    /**
     * @return {undefined}
     */
    xhr.onreadystatechange = function() {
        /** @type {boolean} */
        var Mi = false;
        /** @type {boolean} */
        Mi = xhr.readyState == 4;
        if (Mi) {
            var failuresLink = xhr.responseText;
            on(failuresLink);
        }
    };
    xhr.send(data);
}
/**
 * @return {?}
 */
function jE() {
    /** @type {XMLHttpRequest} */
    var req = new XMLHttpRequest;
    return req;
}
/**
 * @return {?}
 */
function U() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        /** @type {number} */
        var r = Math.random() * 16 | 0;
        /** @type {number} */
        var v = c == "x" ? r : r & 3 | 8;
        return v.toString(16);
    });
}
/**
 * @param {string} input
 * @return {?}
 */
function hE(input) {
    if (!input == null || input == undefined) {
        return "";
    }
    return input.replace(/^\s+/, "").replace(/\s+$/, "");
}
/**
 * @return {?}
 */
function PV() {
    /** @type {Element} */
    var ret = document.createElement("span");
    /** @type {Element} */
    var span = document.createElement("span");
    /** @type {string} */
    span.style.fontStyle = "italic";
    span.appendChild(document.createTextNode("One"));
    ret.appendChild(span);
    ret.appendChild(document.createTextNode("Tab"));
    return ret;
}
/**
 * @param {string} pair
 * @return {?}
 */
function PQ(pair) {
    var match = pair.split("OneTab");
    /** @type {Element} */
    var ret = document.createElement("span");
    var key;
    for (key in match) {
        if (match[key] == "") {
            ret.appendChild(PV());
        } else {
            ret.appendChild(document.createTextNode(match[key]));
        }
    }
    return ret;
}
var L;
var oV;
var X;
var pQ;
var aV;
var IV;
var AV;
var zE;
var PE;
/**
 * @param {Object} e
 * @param {Object} s
 * @param {(number|string)} recurring
 * @param {?} deepDataAndEvents
 * @param {?} dataAndEvents
 * @param {?} triggerRoute
 * @return {undefined}
 */
function NV(e, s, recurring, deepDataAndEvents, dataAndEvents, triggerRoute) {
    /** @type {Object} */
    L = s;
    /** @type {(number|string)} */
    oV = recurring;
    X = deepDataAndEvents;
    pQ = dataAndEvents;
    aV = triggerRoute;
    /** @type {number} */
    zE = 0;
    /** @type {number} */
    PE = 0;
    if (xV && e instanceof TouchEvent) {
        if (e.touches.length > 1) {
            return;
        }
        /** @type {number} */
        IV = e.touches.item(0).pageX;
        /** @type {number} */
        AV = e.touches.item(0).pageY;
        document.addEventListener("touchmove", rQ, false);
        document.addEventListener("touchend", lV, false);
        e.preventDefault();
    } else {
        if (hQ || gQ) {
            IV = window.event.clientX + (gQ ? 0 : document.documentElement.scrollLeft) + document.body.scrollLeft;
            AV = window.event.clientY + (gQ ? 0 : document.documentElement.scrollTop) + document.body.scrollTop;
        } else {
            IV = e.clientX + window.scrollX;
            AV = e.clientY + window.scrollY;
        }
        if (hQ) {
            document.attachEvent(vV, rQ);
            document.attachEvent($Q, lV);
            /** @type {boolean} */
            window.event.cancelBubble = true;
            /** @type {boolean} */
            window.event.returnValue = false;
        } else {
            document.addEventListener(rE, rQ, false);
            document.addEventListener(_E, lV, false);
            e.preventDefault();
        }
    }
    X(L, oV, IV, AV);
}
/**
 * @param {Object} e
 * @return {?}
 */
function rQ(e) {
    var posx;
    var currY;
    var z0;
    var r20;
    if (xV && e instanceof TouchEvent) {
        if (e.touches.length > 1) {
            /** @type {number} */
            z0 = 0;
            /** @type {number} */
            r20 = 0;
            pQ(L, oV, z0, r20, IV, AV, posx, currY);
            return lV(e);
        }
        /** @type {number} */
        posx = e.touches.item(0).pageX;
        /** @type {number} */
        currY = e.touches.item(0).pageY;
    } else {
        if (hQ || gQ) {
            posx = window.event.clientX + (gQ ? 0 : document.documentElement.scrollLeft) + document.body.scrollLeft;
            currY = window.event.clientY + (gQ ? 0 : document.documentElement.scrollTop) + document.body.scrollTop;
        } else {
            posx = e.clientX + window.scrollX;
            currY = e.clientY + window.scrollY;
        }
    }
    /** @type {number} */
    z0 = posx - IV;
    /** @type {number} */
    r20 = currY - AV;
    /** @type {boolean} */
    var kC = false;
    if (zE != z0 || PE != r20) {
        /** @type {boolean} */
        kC = true;
    }
    /** @type {number} */
    zE = z0;
    /** @type {number} */
    PE = r20;
    if (kC) {
        pQ(L, oV, z0, r20, IV, AV, posx, currY);
    }
    if (hQ) {
        /** @type {boolean} */
        window.event.cancelBubble = true;
        /** @type {boolean} */
        window.event.returnValue = false;
    } else {
        e.preventDefault();
    }
}
/**
 * @param {?} edge
 * @return {undefined}
 */
function lV(edge) {
    if (xV && edge instanceof TouchEvent) {
        document.removeEventListener("touchmove", rQ, false);
        document.removeEventListener("touchend", lV, false);
    } else {
        if (hQ) {
            document.detachEvent(vV, rQ);
            document.detachEvent($Q, lV);
        } else {
            document.removeEventListener(rE, rQ, false);
            document.removeEventListener(_E, lV, false);
        }
    }
    aV(L, oV, zE, PE, IV, AV);
}
/**
 * @param {EventTarget} dataAndEvents
 * @param {string} eventType
 * @param {?} deepDataAndEvents
 * @param {?} ignoreMethodDoesntExist
 * @return {undefined}
 */
function HQ(dataAndEvents, eventType, deepDataAndEvents, ignoreMethodDoesntExist) {
    /** @type {EventTarget} */
    this.r9 = dataAndEvents;
    /** @type {string} */
    this.type = eventType;
    this.C9 = deepDataAndEvents;
    this.qE = ignoreMethodDoesntExist;
}
/**
 * @return {undefined}
 */
HQ.prototype.remove = function() {
    if (hQ) {
        this.r9.detachEvent(this.type, this.C9);
    } else {
        this.r9.removeEventListener(this.type, this.C9, this.qE);
    }
};
/**
 * @param {Array} d
 * @param {?} callback
 * @return {undefined}
 */
function P(d, callback) {
    /**
     * @param {Array} e
     * @return {undefined}
     */
    d.onmousemove = function(e) {
        callback(new cE(d, e));
    };
}
/**
 * @param {Object} dataAndEvents
 * @param {Function} dothis
 * @return {undefined}
 */
function KV(dataAndEvents, dothis) {
    /**
     * @param {Array} evt
     * @return {undefined}
     */
    dataAndEvents.onmousedown = function(evt) {
        dothis(new cE(dataAndEvents, evt));
    };
}
/**
 * @param {Array} a
 * @param {?} callback
 * @return {undefined}
 */
function J(a, callback) {
    /**
     * @param {Array} e
     * @return {undefined}
     */
    a.onmouseover = function(e) {
        callback(new cE(a, e));
    };
}
/**
 * @param {Object} body
 * @param {?} callback
 * @return {undefined}
 */
function kV(body, callback) {
    /**
     * @param {Array} e
     * @return {undefined}
     */
    body.onmouseup = function(e) {
        callback(new cE(body, e));
    };
}
/**
 * @param {Array} obj
 * @param {?} callback
 * @return {undefined}
 */
function _(obj, callback) {
    /**
     * @param {Array} e
     * @return {undefined}
     */
    obj.onmouseout = function(e) {
        callback(new cE(obj, e));
    };
}
/**
 * @param {Element} test
 * @param {?} callback
 * @return {undefined}
 */
function nQ(test, callback) {
    /**
     * @param {number} e
     * @return {undefined}
     */
    test.onclick = function(e) {
        callback(new cE(test, e));
    };
}
/**
 * @param {Array} err
 * @param {?} done
 * @return {undefined}
 */
function pV(err, done) {
    /**
     * @param {Array} inEvent
     * @return {undefined}
     */
    err.ondblclick = function(inEvent) {
        done(new cE(err, inEvent));
    };
}
/**
 * @param {Object} frame
 * @param {Function} deepDataAndEvents
 * @return {undefined}
 */
function ZQ(frame, deepDataAndEvents) {
    SQ(frame, QQ, XQ, deepDataAndEvents);
}
/**
 * @param {Object} frame
 * @param {Function} deepDataAndEvents
 * @return {undefined}
 */
function aQ(frame, deepDataAndEvents) {
    SQ(frame, N, SE, deepDataAndEvents);
}
/**
 * @param {Element} value
 * @param {Function} deepDataAndEvents
 * @return {?}
 */
function wV(value, deepDataAndEvents) {
    return SQ(value, XV, uV, deepDataAndEvents);
}
/**
 * @param {Object} frame
 * @param {Function} deepDataAndEvents
 * @return {?}
 */
function GV(frame, deepDataAndEvents) {
    return SQ(frame, _E, $Q, deepDataAndEvents);
}
/**
 * @param {Object} object
 * @param {Function} callback
 * @return {?}
 */
function WE(object, callback) {
    var handler;
    if (hQ) {
        /**
         * @param {Array} err
         * @return {undefined}
         */
        handler = function(err) {
            callback(new cE(object, err));
        };
        object.attachEvent(VV, handler);
        return new HQ(object, VV, handler, false);
    } else {
        /**
         * @param {Object} ev
         * @return {undefined}
         */
        handler = function(ev) {
            var t;
            var which;
            t = ev.currentTarget;
            which = ev.relatedTarget;
            if (t == object && (t != which && !EV(t, which))) {
                callback(new cE(object, ev));
            }
        };
        object.addEventListener(qV, handler, false);
        return new HQ(object, qV, handler, false);
    }
}
/**
 * @param {string} e
 * @param {?} callback
 * @return {undefined}
 */
function V(e, callback) {
    if (hQ) {
        /**
         * @param {Function} err
         * @return {undefined}
         */
        e.onmouseleave = function(err) {
            callback(new cE(e, err));
        };
    } else {
        /**
         * @param {Object} ev
         * @return {undefined}
         */
        e.onmouseout = function(ev) {
            var t;
            var which;
            t = ev.currentTarget;
            which = ev.relatedTarget;
            if (t == e && (t != which && !EV(t, which))) {
                callback(new cE(e, ev));
            }
        };
    }
}
/**
 * @param {Object} map
 * @param {?} next_callback
 * @return {undefined}
 */
function mE(map, next_callback) {
    if (hQ) {
        var key;
        for (key in map) {
            var node = map[key];
            node.onmouseleave = eV(node, map, next_callback);
        }
    } else {
        for (key in map) {
            node = map[key];
            node.onmouseout = TQ(node, map, next_callback);
        }
    }
}
/**
 * @param {string} b
 * @param {Object} map
 * @param {?} callback
 * @return {?}
 */
function TQ(b, map, callback) {
    return function(e) {
        var t;
        var s;
        t = e.currentTarget;
        s = e.relatedTarget;
        if (t == b && (t != s && !EV(t, s))) {
            var letter;
            for (letter in map) {
                if (s == map[letter]) {
                    return;
                }
            }
            callback(new cE(b, e));
        }
    };
}
/**
 * @param {string} dataAndEvents
 * @param {Object} map
 * @param {?} callback
 * @return {?}
 */
function eV(dataAndEvents, map, callback) {
    return function() {
        var letter;
        for (letter in map) {
            if (window.event.toElement == map[letter]) {
                return;
            }
        }
        callback(new cE(dataAndEvents, window.event));
    };
}
/**
 * @param {?} term
 * @param {Element} object
 * @return {?}
 */
function EV(term, object) {
    try {
        if (!object) {
            return false;
        }
        for (; object.parentNode;) {
            if ((object = object.parentNode) == term) {
                return true;
            }
        }
        return false;
    } catch (Ol) {
        return false;
    }
}
/**
 * @param {?} deepDataAndEvents
 * @param {Object} event
 * @return {undefined}
 */
function cE(deepDataAndEvents, event) {
    this.FE = deepDataAndEvents;
    /** @type {Object} */
    this.event = event;
    /** @type {null} */
    this.YE = null;
    /** @type {null} */
    this.nE = null;
    /**
     * @return {?}
     */
    this.p9 = function() {
        if (this.YE == null) {
            var e = dV(deepDataAndEvents, event);
            this.YE = e.x;
            this.nE = e.y;
        }
        return this.YE;
    };
    /**
     * @return {?}
     */
    this.y9 = function() {
        if (this.YE == null) {
            this.p9();
        }
        return this.nE;
    };
}
/**
 * @param {Object} frame
 * @param {string} name
 * @param {string} element
 * @param {Function} deepDataAndEvents
 * @return {?}
 */
function SQ(frame, name, element, deepDataAndEvents) {
    /**
     * @param {Array} timeout
     * @return {undefined}
     */
    var callback = function(timeout) {
        var waitsFunc = new cE(frame, timeout);
        deepDataAndEvents(waitsFunc);
    };
    if (hQ) {
        frame.attachEvent(element, callback);
        return new HQ(frame, element, callback, false);
    } else {
        frame.addEventListener(name, callback, false);
        return new HQ(frame, name, callback, false);
    }
}
/**
 * @param {Object} node
 * @param {(number|string)} recurring
 * @param {?} deepDataAndEvents
 * @param {?} dataAndEvents
 * @param {?} triggerRoute
 * @return {undefined}
 */
function CV(node, recurring, deepDataAndEvents, dataAndEvents, triggerRoute) {
    KV(node, function(e) {
        NV(e.event, node, recurring, deepDataAndEvents, dataAndEvents, triggerRoute);
    });
}
/**
 * @param {Event} completeEvent
 * @return {?}
 */
function sQ(completeEvent) {
    return W(completeEvent);
}
/**
 * @param {?} deepDataAndEvents
 * @param {string} startEvent
 * @return {?}
 */
function dV(deepDataAndEvents, startEvent) {
    if (hQ || iye) {
        return new Eye(window.event.offsetX, window.event.offsetY);
    }
    return W(startEvent).d9(MV(deepDataAndEvents));
}
/**
 * @param {Event} e
 * @return {?}
 */
function W(e) {
    if (hQ || gQ) {
        var il = window.event.clientX + (gQ ? 0 : document.documentElement.scrollLeft) + document.body.scrollLeft;
        var ll = window.event.clientY + (gQ ? 0 : document.documentElement.scrollTop) + document.body.scrollTop;
    } else {
        il = e.clientX + window.scrollX;
        ll = e.clientY + window.scrollY;
    }
    return new Eye(il, ll);
}
/**
 * @param {Object} deepDataAndEvents
 * @return {?}
 */
function MV(deepDataAndEvents) {
    /** @type {Object} */
    var element = deepDataAndEvents;
    /** @type {number} */
    var absLeft = 0;
    /** @type {number} */
    var absTop = 0;
    for (; true;) {
        var parent = element.offsetParent;
        if (parent == undefined) {
            break;
        }
        absLeft += element.offsetLeft;
        absTop += element.offsetTop;
        element = parent;
    }
    return new Eye(absLeft, absTop);
}
/**
 * @param {Element} el
 * @param {number} value
 * @param {?} d
 * @return {undefined}
 */
function z(el, value, d) {
    if (!d) {
        if (!Dye()) {
            return;
        }
    }
    try {
        if (value == 100) {
            /** @type {string} */
            el.style.filter = "";
            /** @type {string} */
            el.style.HE = "";
            /** @type {string} */
            el.style.opacity = "";
        } else {
            /** @type {string} */
            el.style.filter = "alpha(opacity=" + value + ")";
            /** @type {number} */
            el.style.HE = value / 100;
            /** @type {number} */
            el.style.opacity = value / 100;
        }
    } catch (z0) {}
}
/**
 * @return {?}
 */
function QE() {
    if (hQ || gQ) {
        return (gQ ? 0 : document.documentElement.scrollTop) + document.body.scrollTop;
    } else {
        return window.scrollY;
    }
}
/**
 * @return {?}
 */
function LV() {
    if (hQ || gQ) {
        return (gQ ? 0 : document.documentElement.scrollLeft) + document.body.scrollLeft;
    } else {
        return window.scrollX;
    }
}
/**
 * @return {?}
 */
function $V() {
    if (!window["localStorage"]["settings"]) {
        return {};
    } else {
        return VQ.parse(window["localStorage"]["settings"]);
    }
}
/**
 * @param {string} key
 * @param {number} value
 * @return {undefined}
 */
function eQ(key, value) {
    var memory = $V();
    /** @type {number} */
    memory[key] = value;
    bV(memory);
}
/**
 * @param {?} obj
 * @return {undefined}
 */
function bV(obj) {
    window["localStorage"]["settings"] = VQ.o9(obj);
}
var RE = {
    "restoreWindow": "newWindow",
    "pinnedTabs": "ignore",
    "startupLaunch": "displayOneTab",
    "restoreRemoval": "default",
    "duplicates": "allow"
};
/**
 * @param {string} off
 * @return {?}
 */
function rV(off) {
    var buf = $V();
    if (buf[off]) {
        return buf[off];
    } else {
        return RE[off];
    }
}
/**
 * @return {?}
 */
function lQ() {
    if (!window["localStorage"]["state"]) {
        return {};
    } else {
        return VQ.parse(window["localStorage"]["state"]);
    }
}
/** @type {Array} */
var jQ = [];
/**
 * @param {?} value
 * @return {undefined}
 */
function sV(value) {
    var ariaState = window["localStorage"]["state"];
    var drop = value["tabGroups"];
    /** @type {number} */
    var i = 0;
    for (; i < drop.length; i++) {
        if (drop[i]["tabsMeta"].length == 0) {
            drop.splice(i, 1);
            i--;
        }
    }
    window["localStorage"]["state"] = VQ.o9(value);
    for (i in jQ) {
        jQ[i](value);
    }
    try {
        VQ.parse(window["localStorage"]["state"]);
    } catch (_0) {
        window["localStorage"]["state"] = ariaState;
        alert("Out of local storage memory - could not store extension state");
    }
}
/**
 * @param {?} s
 * @param {?} value
 * @return {undefined}
 */
function h(s, value) {
    var cache = lQ();
    cache[s] = value;
    sV(cache);
}
/**
 * @param {?} off
 * @return {?}
 */
function yE(off) {
    var buf = lQ();
    if (!buf[off]) {
        /** @type {Array} */
        buf[off] = [];
    }
    return buf[off];
}
/**
 * @param {string} m
 * @param {?} x
 * @return {undefined}
 */
function K(m, x) {
    var diff = lQ();
    if (!diff[m]) {
        /** @type {Array} */
        diff[m] = [];
    }
    diff[m].push(x);
    sV(diff);
}
/**
 * @return {?}
 */
function OV() {
    if (!window["localStorage"]["idCounter"]) {
        /** @type {number} */
        window["localStorage"]["idCounter"] = 0;
    }
    /** @type {string} */
    window["localStorage"]["idCounter"] = parseInt(window["localStorage"]["idCounter"]) + 1 + "";
    return parseInt(window["localStorage"]["idCounter"]);
}
/**
 * @param {string} deepDataAndEvents
 * @param {string} str
 * @param {Function} $sanitize
 * @param {?} dataAndEvents
 * @return {undefined}
 */
function bQ(deepDataAndEvents, str, $sanitize, dataAndEvents) {
    var expected = {
        "id": OV(),
        "url": deepDataAndEvents,
        "title": str
    };
    iV(expected, dataAndEvents);
    $sanitize(function() {});
}
/**
 * @param {Object} data
 * @param {Function} $sanitize
 * @param {?} deepDataAndEvents
 * @return {undefined}
 */
function mQ(data, $sanitize, deepDataAndEvents) {
    if (g(data["url"])) {
        $sanitize(function() {});
        return;
    }
    var expected = {
        "id": OV(),
        "url": data["url"],
        "title": data["title"]
    };
    if (data["pinned"]) {
        /** @type {boolean} */
        expected["pinned"] = true;
    }
    iV(expected, deepDataAndEvents);
    $sanitize(function() {
        window["chrome"]["tabs"]["remove"]([data["id"]], function() {
            window["chrome"]["runtime"]["getBackgroundPage"](function(dataAndEvents) {
                dataAndEvents["updateContextMenuState"]();
            });
        });
    });
}
/**
 * @param {?} obj
 * @param {?} deepDataAndEvents
 * @return {undefined}
 */
function iV(obj, deepDataAndEvents) {
    var udataCur = lQ();
    var ca = udataCur["tabGroups"];
    RV(ca);
    var data = undefined;
    if (typeof deepDataAndEvents === "undefined") {
        /** @type {number} */
        var i = 0;
        for (; i < ca.length; i++) {
            var c = ca[i];
            if (c["starred"] || c["locked"]) {
                continue;
            }
            data = c;
            data["tabsMeta"].splice(0, 0, obj);
            break;
        }
    } else {
        /** @type {number} */
        i = 0;
        for (; i < ca.length; i++) {
            c = ca[i];
            if (c["id"] == deepDataAndEvents) {
                data = c;
                data["tabsMeta"].splice(0, 0, obj);
                break;
            }
        }
    }
    if (!data) {
        var pageId = OV();
        ca.push({
            "id": pageId,
            "tabsMeta": [obj],
            "createDate": (new Date).getTime()
        });
    }
    sV(udataCur);
}
/**
 * @param {?} windowId
 * @param {Function} until
 * @param {?} obj
 * @return {undefined}
 */
function tV(windowId, until, obj) {
    window["chrome"]["tabs"]["query"]({
        "windowId": windowId
    }, function(elements) {
        cQ(elements, true, until, obj);
    });
}
/**
 * @param {Object} elems
 * @param {boolean} dataAndEvents
 * @param {Function} until
 * @param {?} obj
 * @return {undefined}
 */
function cQ(elems, dataAndEvents, until, obj) {
    var udataCur = lQ();
    var list = udataCur["tabGroups"];
    RV(list);
    /** @type {Array} */
    var nodes = [];
    var i;
    for (i in elems) {
        if (!dataAndEvents) {
            nodes.push(elems[i]);
        } else {
            if (!$E(elems[i]["url"])) {
                nodes.push(elems[i]);
            }
        }
    }
    /** @type {Array} */
    var map = [];
    /** @type {Array} */
    var items = [];
    /** @type {number} */
    i = 0;
    for (; i < nodes.length; i++) {
        var node = nodes[i];
        var item = node["url"];
        if (item.indexOf("://tabmemfree.appspot.com") != -1) {
            alert("The OneTab extension is not compatible with TabMemFree. Please ensure that none of your tabs are parked with TabMemFree, then uninstall the TabMemFree extension and restart your web browser before using OneTab.");
            return;
        }
    }
    /** @type {number} */
    i = 0;
    bye: for (; i < nodes.length; i++) {
        node = nodes[i];
        item = node["url"];
        if (node["pinned"] && rV("pinnedTabs") == "ignore") {
            continue;
        }
        if (g(item)) {
            continue;
        }
        if (item == "chrome://newtab/") {
            items.push(node["id"]);
            continue;
        }
        if (item.indexOf("chrome-devtools://") == 0) {
            continue;
        }
        if (rV("duplicates") == "reject") {
            var j;
            for (j in list) {
                var letter;
                for (letter in list[j]["tabsMeta"]) {
                    if (list[j]["tabsMeta"][letter]["url"] == item) {
                        items.push(node["id"]);
                        continue bye;
                    }
                }
            }
            for (j in map) {
                if (map[j]["url"] == item) {
                    items.push(node["id"]);
                    continue bye;
                }
            }
        }
        items.push(node["id"]);
        var author = {
            "id": OV(),
            "url": item,
            "title": node["title"]
        };
        if (node["pinned"]) {
            /** @type {boolean} */
            author["pinned"] = true;
        }
        map.push(author);
    }
    if (typeof obj === "undefined") {
        var pageId = OV();
        K("tabGroups", {
            "id": pageId,
            "tabsMeta": map,
            "createDate": (new Date).getTime()
        });
    } else {
        /** @type {number} */
        j = 0;
        for (; j < list.length; j++) {
            var el = list[j];
            if (el["id"] == obj) {
                var d = el;
                for (letter in map) {
                    d["tabsMeta"].push(map[letter]);
                }
                break;
            }
        }
        sV(udataCur);
    }
    until(function() {
        window["chrome"]["tabs"]["remove"](items, function() {
            window["chrome"]["runtime"]["getBackgroundPage"](function(dataAndEvents) {
                dataAndEvents["updateContextMenuState"]();
            });
        });
    });
}
/**
 * @param {string} props
 * @return {?}
 */
function $E(props) {
    return UQ(FQ(props));
}
/**
 * @param {?} elt
 * @return {?}
 */
function UQ(elt) {
    var parent = $V();
    if (parent["excludedDomains"]) {
        var i;
        for (i in parent["excludedDomains"]) {
            if (parent["excludedDomains"][i] == elt) {
                return true;
            }
        }
    }
    return false;
}
/**
 * @param {?} k
 * @return {undefined}
 */
function q(k) {
    var suiteView = $V();
    if (!UQ(k)) {
        if (!suiteView["excludedDomains"]) {
            /** @type {Array} */
            suiteView["excludedDomains"] = [];
        }
        suiteView["excludedDomains"].push(k);
        bV(suiteView);
    }
}
/**
 * @param {?} elt
 * @return {undefined}
 */
function oE(elt) {
    var callbacks = $V();
    if (!callbacks["excludedDomains"]) {
        return;
    }
    /** @type {number} */
    var i = 0;
    for (; i < callbacks["excludedDomains"].length; i++) {
        if (callbacks["excludedDomains"][i] == elt) {
            callbacks["excludedDomains"].splice(i, 1);
            bV(callbacks);
            return;
        }
    }
}
uQ();
document.addEventListener("DOMContentLoaded", function() {
    fV();
});
var NQ = undefined;
/** @type {number} */
var H = 11;
/**
 * @return {undefined}
 */
function DQ() {
    if (NQ) {
        /** @type {string} */
        NQ.style.display = "none";
    }
    NQ = undefined;
}
/**
 * @param {Object} obj
 * @param {Function} $sanitize
 * @return {undefined}
 */
function EQ(obj, $sanitize) {
    var memory = {};
    memory["key"] = window["localStorage"]["extensionKey"];
    /** @type {Array} */
    var core = [];
    /** @type {Array} */
    memory["tabList"] = core;
    var i;
    for (i in obj) {
        core.push({
            "url": obj[i]["url"],
            "title": obj[i]["title"]
        });
    }
    YQ("http://www.one-tab.com/api/createPage", memory, function(urls) {
        window["chrome"]["tabs"]["create"]({
            "active": true,
            "url": urls["url"]
        });
        $sanitize();
    });
}
/**
 * @param {Element} docFrag
 * @param {?} line
 * @param {number} topOffset
 * @param {?} callback
 * @param {boolean} dataAndEvents
 * @param {?} deepDataAndEvents
 * @return {undefined}
 */
function xQ(docFrag, line, topOffset, callback, dataAndEvents, deepDataAndEvents) {
    var self = this;
    /** @type {Element} */
    this.Q9 = document.createElement("div");
    /** @type {string} */
    this.Q9.style.paddingRight = topOffset + "px";
    /** @type {string} */
    this.Q9.style.display = "inline-block";
    /** @type {string} */
    this.Q9.style.fontSize = "11px";
    /** @type {string} */
    this.Q9.className = "clickable";
    this.Q9.appendChild(document.createTextNode(line));
    this.c9(dataAndEvents);
    /**
     * @param {?} e
     * @return {undefined}
     */
    this.Q9.onclick = function(e) {
        if (self.P9) {
            callback(e, self.Q9);
        } else {
            if (self.S9) {
                self.S9(e);
            }
        }
    };
    docFrag.appendChild(this.Q9);
    this.S9 = deepDataAndEvents;
}
/**
 * @param {boolean} dataAndEvents
 * @return {undefined}
 */
xQ.prototype.c9 = function(dataAndEvents) {
    /** @type {boolean} */
    this.P9 = dataAndEvents;
    if (!this.P9) {
        /** @type {string} */
        this.Q9.style.color = "#999";
    } else {
        delete this.Q9.style.color;
    }
};
/**
 * @param {string} data
 * @return {?}
 */
function GQ(data) {
    /** @type {Array} */
    var map = [];
    /**
     * @param {?} details
     * @return {undefined}
     */
    var report = function(details) {
        var letter;
        for (letter in map) {
            map[letter](details);
        }
    };
    /**
     * @return {undefined}
     */
    var verifyCheckboxRadio = function() {
        var udataCur = lQ();
        var codeSegments = udataCur["tabGroups"];
        /** @type {number} */
        var i = 0;
        for (; i < codeSegments.length; i++) {
            var config = codeSegments[i];
            if (config["id"] == data["id"]) {
                /** @type {boolean} */
                config["locked"] = !!data["locked"];
                /** @type {boolean} */
                config["starred"] = !!data["starred"];
                config["starredDate"] = data["starredDate"];
                config["label"] = data["label"];
                break;
            }
        }
        sV(udataCur);
    };
    /** @type {Element} */
    var obj = document.createElement("div");
    /** @type {string} */
    obj.style.paddingTop = "15px";
    /** @type {string} */
    obj.style.paddingLeft = "0px";
    /** @type {Element} */
    var select = document.createElement("div");
    obj.appendChild(select);
    /** @type {string} */
    select.style.paddingLeft = "20px";
    /** @type {Element} */
    var span = document.createElement("div");
    select.appendChild(span);
    /** @type {string} */
    span.style.display = "inline-block";
    /** @type {string} */
    span.style.verticalAlign = "middle";
    /** @type {string} */
    span.style.paddingLeft = "16px";
    var cnl = data["tabsMeta"].length;
    var appendChildren;
    var element;
    var model;
    var image;
    var testElement;
    span.appendChild(function() {
        /** @type {Element} */
        var img = document.createElement("img");
        /** @type {string} */
        img.style.display = "inline";
        /** @type {string} */
        img.style.verticalAlign = "middle";
        /** @type {string} */
        img.src = "images/star.png";
        /** @type {string} */
        img.style.width = "22px";
        /** @type {string} */
        img.style.height = "21px";
        /** @type {string} */
        img.style.paddingRight = "11px";
        /** @type {string} */
        img.style.position = "relative";
        /** @type {string} */
        img.style.left = "-2px";
        /** @type {Element} */
        image = img;
        return img;
    }());
    span.appendChild(function() {
        /** @type {Element} */
        var img = document.createElement("img");
        /** @type {string} */
        img.style.display = "inline";
        /** @type {string} */
        img.style.verticalAlign = "middle";
        /** @type {string} */
        img.src = "images/lock.png";
        /** @type {string} */
        img.style.width = "14px";
        /** @type {string} */
        img.style.height = "18px";
        /** @type {string} */
        img.style.paddingRight = "19px";
        /** @type {string} */
        img.style.position = "relative";
        /** @type {string} */
        img.style.left = "2px";
        /** @type {Element} */
        testElement = img;
        return img;
    }());
    /** @type {string} */
    image.style.display = data["starred"] ? "inline" : "none";
    /** @type {string} */
    testElement.style.display = data["locked"] ? "inline" : "none";
    span.appendChild(function() {
        /** @type {Element} */
        var div = document.createElement("div");
        /** @type {string} */
        div.style.display = "inline-block";
        /** @type {string} */
        div.style.fontSize = "0px";
        /** @type {string} */
        div.style.color = "#444";
        /** @type {string} */
        div.style.fontWeight = "300";
        /** @type {string} */
        div.style.verticalAlign = "middle";
        /** @type {Element} */
        element = document.createElement("div");
        /** @type {string} */
        element.style.fontSize = "0px";
        /** @type {string} */
        element.style.display = "none";
        /** @type {string} */
        element.style.paddingRight = "30px";
        model = new JQ(element, function(value, dataAndEvents) {
            if (dataAndEvents) {
                /** @type {string} */
                element.style.display = hE(value) != "" ? "inline-block" : "none";
                data["label"] = hE(value) == "" ? "" : value;
                verifyCheckboxRadio();
                window["chrome"]["runtime"]["getBackgroundPage"](function(dataAndEvents) {
                    dataAndEvents["recreateContextMenus"]();
                });
            }
        }, data["label"] ? data["label"] : "", 26, "300", "tabGroupTitleText", function() {
            return data["locked"];
        }, undefined);
        div.appendChild(element);
        return div;
    }());
    /** @type {string} */
    element.style.display = data["label"] && hE(data["label"]) != "" ? "inline-block" : "none";
    span.appendChild(function() {
        /** @type {Element} */
        var div = document.createElement("div");
        /** @type {string} */
        div.style.display = "inline-block";
        /** @type {string} */
        div.style.fontSize = "26px";
        /** @type {string} */
        div.style.color = "#777";
        /** @type {string} */
        div.style.fontWeight = "300";
        /** @type {string} */
        div.style.verticalAlign = "middle";
        /**
         * @return {undefined}
         */
        div.onclick = function() {
            /** @type {string} */
            element.style.display = "inline-block";
            model.T9();
        };
        /**
         * @return {undefined}
         */
        appendChildren = function() {
            O(div);
            /** @type {string} */
            var line = cnl + " " + (cnl == 1 ? "tab" : "tabs");
            div.appendChild(document.createTextNode(line));
        };
        appendChildren();
        return div;
    }());
    span.appendChild(function() {
        /** @type {Element} */
        var div = document.createElement("div");
        /** @type {string} */
        div.style.display = "inline-block";
        /** @type {string} */
        div.style.paddingLeft = "28px";
        /** @type {string} */
        div.style.verticalAlign = "middle";
        /** @type {string} */
        div.style.fontSize = "0px";
        div.appendChild(function() {
            /** @type {Element} */
            var div = document.createElement("div");
            /** @type {string} */
            div.style.fontSize = "11px";
            /** @type {string} */
            div.style.fontWeight = "400";
            /** @type {string} */
            div.style.color = "#888";
            /** @type {string} */
            div.style.paddingTop = "0px";
            /** @type {string} */
            div.style.paddingBottom = "2px";
            div.appendChild(document.createTextNode("Created " + (new Date(data["createDate"])).toLocaleString()));
            return div;
        }());
        new xQ(div, "Restore all", 30, function(ele) {
            if ($(ele) || (data["locked"] || rV("restoreRemoval") == "keep")) {
                test(data["id"]);
            } else {
                fn(data["id"], true);
                obj.parentNode.removeChild(obj);
            }
        }, true);
        var element = new xQ(div, "Delete all", 30, function(dataAndEvents) {
            /** @type {string} */
            var warning = "Are you sure you want to delete " + (cnl >= 2 ? "these " + cnl + " tabs?" : "this tab?");
            if (confirm(warning)) {
                fn(data["id"], false);
                obj.parentNode.removeChild(obj);
            }
        }, !data["locked"], function(dataAndEvents) {
            alert('To delete this tab group, you must unlock it first (via the "More..." button)');
        });
        map.push(function(dataAndEvents) {
            element.c9(!dataAndEvents);
        });
        new xQ(div, "Share as web page", 30, function(dataAndEvents, h2) {
            O(h2);
            h2.appendChild(document.createTextNode("Please wait..."));
            EQ(data["tabsMeta"], function() {
                O(h2);
                h2.appendChild(document.createTextNode("Share as web page"));
            });
        }, true);
        div.appendChild(function() {
            /** @type {Element} */
            var d = document.createElement("div");
            /** @type {string} */
            d.style.display = "inline-block";
            /** @type {string} */
            d.style.position = "relative";
            d.style.fontSize = H + "px";
            /** @type {string} */
            d.className = "clickable";
            d.appendChild(document.createTextNode("More..."));
            /** @type {Element} */
            var div = document.createElement("div");
            d.appendChild(div);
            /** @type {string} */
            div.style["box-shadow"] = "rgb(221, 221, 221) 1px 1px 1px 1px";
            /** @type {string} */
            div.style.backgroundColor = "#fff";
            /** @type {string} */
            div.style.paddingTop = "11px";
            /** @type {string} */
            div.style.paddingLeft = "18px";
            /** @type {string} */
            div.style.paddingRight = "16px";
            /** @type {string} */
            div.style.paddingBottom = "11px";
            /** @type {string} */
            div.style.display = "none";
            /** @type {string} */
            div.style.position = "absolute";
            /** @type {string} */
            div.style.top = "-11px";
            /** @type {string} */
            div.style.left = "-18px";
            /** @type {number} */
            div.style.zIndex = 1E4;
            /**
             * @param {string} text
             * @param {number} outstandingDataSize
             * @param {Function} ready
             * @return {?}
             */
            var create = function(text, outstandingDataSize, ready) {
                /** @type {Element} */
                var el = document.createElement("div");
                /** @type {string} */
                el.style.display = "inline-block";
                /** @type {string} */
                el.style.paddingBottom = outstandingDataSize + "px";
                el.style.fontSize = H + "px";
                /** @type {string} */
                el.style.whiteSpace = "pre";
                /** @type {string} */
                el.className = "clickable";
                el.appendChild(document.createTextNode(text));
                /**
                 * @param {?} child
                 * @return {undefined}
                 */
                var add = function(child) {
                    O(el);
                    el.appendChild(document.createTextNode(child));
                };
                el.addEventListener("mousedown", function(e) {
                    e.stopPropagation();
                    DQ();
                    ready(e, add);
                }, false);
                return el;
            };
            div.appendChild(create("Name this tab group", 6, function(dataAndEvents) {
                if (!data["label"]) {
                    model.w9("", false, true);
                }
                /** @type {string} */
                element.style.display = "inline-block";
                model.T9();
            }));
            div.appendChild(create(data["locked"] ? "Un-Lock this tab group" : "Lock this tab group", 6, function(dataAndEvents, $sanitize) {
                /** @type {boolean} */
                data["locked"] = !data["locked"];
                verifyCheckboxRadio();
                $sanitize(data["locked"] ? "Un-Lock this tab group" : "Lock this tab group");
                /** @type {string} */
                testElement.style.display = data["locked"] ? "inline" : "none";
                report(data["locked"]);
            }));
            div.appendChild(create(data["starred"] ? "Un-Star this tab group" : "Star this tab group", 6, function(dataAndEvents, $sanitize) {
                /** @type {boolean} */
                data["starred"] = !data["starred"];
                if (data["starred"]) {
                    /** @type {number} */
                    data["starredDate"] = (new Date).getTime();
                }
                verifyCheckboxRadio();
                $sanitize(data["starred"] ? "Un-Star this tab group" : "Star this tab group");
                /** @type {string} */
                image.style.display = data["starred"] ? "inline" : "none";
                window.scrollTo(0, 0);
                document.location.reload();
            }));
            div.appendChild(create("Help", 0, function(dataAndEvents) {
                window["chrome"]["tabs"]["create"]({
                    "url": "http://www.one-tab.com/help"
                });
            }));
            /**
             * @return {undefined}
             */
            d.onclick = function() {
                /** @type {string} */
                div.style.display = "block";
                /** @type {Element} */
                NQ = div;
            };
            return d;
        }());
        return div;
    }());
    /**
     * @param {?} id
     * @param {?} p
     * @return {?}
     */
    var callback = function(id, p) {
        var resource = {};
        var udataCur = lQ();
        var drop = udataCur["tabGroups"];
        /** @type {number} */
        var i = 0;
        for (; i < drop.length; i++) {
            var attr = drop[i];
            if (attr["id"] == id) {
                /** @type {number} */
                var it = 0;
                for (; it < attr["tabsMeta"].length; it++) {
                    if (attr["tabsMeta"][it]["id"] == p) {
                        attr["tabsMeta"].splice(it, 1);
                        data = attr;
                        if (attr["tabsMeta"].length == 0) {
                            /** @type {boolean} */
                            resource.JE = true;
                            drop.splice(i, 1);
                        }
                        break;
                    }
                }
                break;
            }
        }
        sV(udataCur);
        return resource;
    };
    /**
     * @param {Array} resultItems
     * @return {undefined}
     */
    var t = function(resultItems) {
        var restoreWindow = rV("restoreWindow");
        window["chrome"]["windows"]["getLastFocused"]({
            "populate": true
        }, function(parent) {
            if (restoreWindow == "currentWindow" || restoreWindow == "newWindow" && (parent["tabs"].length == 1 && g(parent["tabs"][0]["url"]))) {
                /** @type {number} */
                var i = 0;
                for (; i < resultItems.length; i++) {
                    var result = resultItems[i];
                    window["chrome"]["tabs"]["create"]({
                        "windowId": parent["id"],
                        "pinned": !!result["pinned"],
                        "active": false,
                        "url": result["url"]
                    }, function() {
                        window["chrome"]["runtime"]["getBackgroundPage"](function(dataAndEvents) {
                            dataAndEvents["updateContextMenuState"]();
                        });
                    });
                }
            } else {
                window["chrome"]["windows"]["create"]({
                    "focused": true,
                    "url": resultItems[0]["url"]
                }, function(done) {
                    window["chrome"]["tabs"]["query"]({
                        "windowId": done["id"]
                    }, function(v) {
                        window["chrome"]["tabs"]["update"](v[0]["id"], {
                            "pinned": !!resultItems[0]["pinned"]
                        }, function() {
                            /** @type {number} */
                            var i = 1;
                            for (; i < resultItems.length; i++) {
                                var result = resultItems[i];
                                window["chrome"]["tabs"]["create"]({
                                    "windowId": done["id"],
                                    "pinned": !!result["pinned"],
                                    "active": false,
                                    "url": result["url"]
                                }, function() {
                                    window["chrome"]["runtime"]["getBackgroundPage"](function(dataAndEvents) {
                                        dataAndEvents["updateContextMenuState"]();
                                    });
                                });
                            }
                        });
                    });
                });
            }
        });
        setTimeout(function() {
            yV();
        }, 200);
    };
    /**
     * @param {?} component
     * @return {undefined}
     */
    var test = function(component) {
        var tabGroups = lQ();
        var codeSegments = tabGroups["tabGroups"];
        var changingDoneCallback;
        /** @type {number} */
        var i = 0;
        for (; i < codeSegments.length; i++) {
            var done = codeSegments[i];
            if (done["id"] == component) {
                changingDoneCallback = done;
                break;
            }
        }
        t(changingDoneCallback["tabsMeta"]);
    };
    /**
     * @param {?} component
     * @param {boolean} recurring
     * @return {undefined}
     */
    var fn = function(component, recurring) {
        var udataCur = lQ();
        var drop = udataCur["tabGroups"];
        var changingDoneCallback;
        /** @type {number} */
        var i = 0;
        for (; i < drop.length; i++) {
            var done = drop[i];
            if (done["id"] == component) {
                changingDoneCallback = done;
                break;
            }
        }
        if (recurring) {
            setTimeout(function() {
                t(changingDoneCallback["tabsMeta"]);
            }, 100);
        }
        drop.splice(i, 1);
        sV(udataCur);
    };
    /** @type {Element} */
    var innerWrapper = document.createElement("div");
    obj.appendChild(innerWrapper);
    /** @type {string} */
    innerWrapper.style.paddingRight = "20px";
    /** @type {string} */
    innerWrapper.style.paddingLeft = "12px";
    /** @type {string} */
    innerWrapper.style.paddingTop = "12px";
    var key;
    for (key in data["tabsMeta"]) {
        var localStorage = data["tabsMeta"][key];
        /** @type {Element} */
        var info = document.createElement("div");
        /** @type {Element} */
        var wrapper = document.createElement("div");
        var sourceEl = LQ.H9(wrapper);
        /** @type {string} */
        sourceEl.style.marginLeft = "20px";
        wrapper.appendChild(info);
        innerWrapper.appendChild(wrapper);
        /** @type {string} */
        info.style.display = "inline-block";
        /** @type {string} */
        info.style.paddingLeft = "55px";
        /** @type {string} */
        info.style.paddingTop = "8px";
        /** @type {string} */
        info.style.position = "relative";
        /** @type {string} */
        info.style.fontSize = "13px";
        /** @type {string} */
        var new_image_url = "https://www.google.com/s2/favicons?domain=" + FQ(localStorage["url"]);
        /** @type {Array} */
        var types = ["news.ycombinator.com", "www.bbc.co.uk"];
        var cons = FQ(localStorage["url"]);
        for (key in types) {
            if (cons == types[key]) {
                new_image_url = "chrome://favicon/size/16@1x/" + localStorage["url"];
            }
        }
        /** @type {Element} */
        var img = document.createElement("img");
        img.src = new_image_url;
        /** @type {string} */
        img.style.position = "absolute";
        /** @type {string} */
        img.style.top = "9px";
        /** @type {string} */
        img.style.left = "25px";
        /** @type {string} */
        img.style.width = "16px";
        /** @type {string} */
        img.style.height = "16px";
        /** @type {string} */
        img.style.cursor = data["locked"] ? "default" : "move";
        info.appendChild(img);
        var prev = function(element) {
            map.push(function(dataAndEvents) {
                /** @type {string} */
                element.style.cursor = data["locked"] ? "auto" : "move";
            });
        }(img);
        /** @type {Element} */
        var a = document.createElement("a");
        /** @type {string} */
        a.className = "clickable";
        /** @type {string} */
        a.style.paddingRight = "12px";
        /** @type {string} */
        a.style.textDecoration = "none";
        a.appendChild(document.createTextNode(localStorage["title"] ? localStorage["title"] : "Untitled"));
        a.innerHTML += "&nbsp";
        var url = localStorage["url"];
        if (url.indexOf("://") == -1) {
            /** @type {string} */
            url = "http://" + url;
        }
        url = _V(url);
        a.href = url;
        a.onclick = function(localStorage, message, uri) {
            return function(datum) {
                if ($(datum) || (data["locked"] || rV("restoreRemoval") == "keep")) {
                    if (wQ(datum)) {
                        if (!localStorage["pinned"]) {
                            return true;
                        } else {
                            window["chrome"]["windows"]["create"]({
                                "focused": true,
                                "url": uri
                            }, function(done) {
                                window["chrome"]["tabs"]["query"]({
                                    "windowId": done["id"]
                                }, function(v) {
                                    window["chrome"]["tabs"]["update"](v[0]["id"], {
                                        "pinned": !!localStorage["pinned"]
                                    }, function() {});
                                });
                            });
                        }
                    } else {
                        window["chrome"]["tabs"]["create"]({
                            "pinned": !!localStorage["pinned"],
                            "active": false,
                            "url": uri
                        });
                    }
                    return false;
                } else {
                    var current = callback(data["id"], localStorage["id"]);
                    cnl--;
                    appendChildren();
                    message.parentNode.removeChild(message);
                    if (current.JE) {
                        obj.parentNode.removeChild(obj);
                    }
                    window["chrome"]["tabs"]["create"]({
                        "pinned": !!localStorage["pinned"],
                        "active": false,
                        "url": uri
                    });
                    setTimeout(function() {
                        yV();
                    }, 200);
                    return false;
                }
            };
        }(localStorage, info, url);
        info.appendChild(a);
        /** @type {Element} */
        var el = document.createElement("img");
        /** @type {string} */
        el.src = "images/cross.png";
        /** @type {string} */
        el.style.position = "absolute";
        /** @type {string} */
        el.style.top = "10px";
        /** @type {string} */
        el.style.left = "0px";
        /** @type {string} */
        el.style.width = 28 / 2 + "px";
        /** @type {string} */
        el.style.height = 26 / 2 + "px";
        /** @type {string} */
        el.style.verticalAlign = "middle";
        /** @type {string} */
        el.style.paddingTop = "2px";
        /** @type {string} */
        el.style.visibility = "hidden";
        /** @type {string} */
        el.style.cursor = "pointer";
        info.appendChild(el);
        el.onclick = function(localStorage, message) {
            return function() {
                var current = callback(data["id"], localStorage["id"], false);
                cnl--;
                appendChildren();
                message.parentNode.removeChild(message);
                if (current.JE) {
                    obj.parentNode.removeChild(obj);
                }
            };
        }(localStorage, info);
        wV(info, function(el) {
            return function(dataAndEvents) {
                if (!data["locked"]) {
                    if (!LQ.wE) {
                        /** @type {string} */
                        el.style.visibility = "visible";
                    }
                }
            };
        }(el));
        WE(info, function(el) {
            return function(dataAndEvents) {
                /** @type {string} */
                el.style.visibility = "hidden";
            };
        }(el));
        prev = function(dest, localStorage) {
            LQ.M9(dest, {
                kE: data["id"],
                iE: localStorage["id"],
                gE: obj,
                ZE: localStorage
            }, dest, "tabLink", function() {}, function() {}, function() {
                LQ.j9.insertBefore(LQ.fE, LQ.G9);
            }, function() {}, function() {
                return !!data["locked"];
            });
        }(info, localStorage);
        prev = function(ids) {
            LQ.IE(wrapper, "tabLink", sourceEl, function(completeEvent) {
                var id = ids["id"];
                destroy(id, completeEvent);
            });
        }(localStorage);
    }
    /**
     * @param {?} id
     * @param {?} e
     * @return {undefined}
     */
    var destroy = function(id, e) {
        var l = e.kE;
        var element = e.gE;
        var parent = element.parentNode;
        var tail;
        var r = data["id"];
        /** @type {Element} */
        var node = obj;
        /** @type {(Node|null)} */
        var pn = node.parentNode;
        var s;
        var udataCur = lQ();
        var caches = udataCur["tabGroups"];
        /** @type {number} */
        var type = 0;
        bye: for (; type < caches.length; type++) {
                var cache = caches[type];
                /** @type {number} */
                var i = 0;
                for (; i < cache["tabsMeta"].length; i++) {
                    if (cache["tabsMeta"][i]["id"] == e.iE) {
                        cache["tabsMeta"].splice(i, 1);
                        tail = cache;
                        break bye;
                    }
                }
            }
            /** @type {number} */
        type = 0;
        bye: for (; type < caches.length; type++) {
            cache = caches[type];
            if (cache["id"] != data["id"]) {
                continue;
            }
            if (id) {
                /** @type {number} */
                i = 0;
                for (; i < cache["tabsMeta"].length; i++) {
                    if (cache["tabsMeta"][i]["id"] == id) {
                        cache["tabsMeta"].splice(i, 0, e.ZE);
                        s = cache;
                        break bye;
                    }
                }
            } else {
                cache["tabsMeta"].push(e.ZE);
                s = cache;
                break bye;
            }
        }
        sV(udataCur);
        pn.insertBefore(GQ(s), node);
        pn.removeChild(node);
        if (l != r) {
            if (tail["tabsMeta"].length > 0) {
                parent.insertBefore(GQ(tail), element);
            }
            parent.removeChild(element);
        }
    };
    /** @type {Element} */
    var div = document.createElement("div");
    /** @type {string} */
    div.style.height = "19px";
    /** @type {string} */
    div.style.paddingTop = "3px";
    /** @type {string} */
    div.style.paddingLeft = "20px";
    obj.appendChild(div);
    var marker = LQ.H9(div);
    /** @type {string} */
    marker.style.marginLeft = "10px";
    LQ.IE(div, "tabLink", marker, function(completeEvent) {
        var id = undefined;
        destroy(id, completeEvent);
    });
    return obj;
}
/**
 * @param {?} line
 * @param {?} dataAndEvents
 * @param {?} $
 * @return {?}
 */
function gV(line, dataAndEvents, $) {
    /** @type {Element} */
    var ele = document.createElement("div");
    /** @type {Element} */
    var el = document.createElement("input");
    /** @type {string} */
    el.type = "checkbox";
    /** @type {string} */
    el.className = "cssCheckbox";
    /** @type {string} */
    el.style.verticalAlign = "middle";
    /** @type {string} */
    el.style.cursor = "pointer";
    /** @type {boolean} */
    el.checked = !!dataAndEvents;
    /** @type {Element} */
    var div = document.createElement("span");
    div.appendChild(document.createTextNode(line));
    /** @type {string} */
    div.style.cursor = "pointer";
    /** @type {string} */
    div.style.verticalAlign = "middle";
    /**
     * @return {undefined}
     */
    div.onclick = function() {
        /** @type {boolean} */
        el.checked = !el.checked;
        $(el.checked);
    };
    ele.appendChild(el);
    ele.appendChild(div);
    /**
     * @return {undefined}
     */
    el.onchange = function() {
        $(el.checked);
    };
    return ele;
}
/**
 * @param {number} mid
 * @param {number} yPos
 * @return {?}
 */
function CQ(mid, yPos) {
    /** @type {Element} */
    var span = document.createElement("span");
    span.appendChild(document.createTextNode("\u2261"));
    /** @type {string} */
    span.style.fontSize = mid + "px";
    /** @type {number} */
    span.style.fontWeight = 400;
    /** @type {string} */
    span.style.position = "relative";
    /** @type {string} */
    span.style.top = yPos + "px";
    return span;
}
/**
 * @return {?}
 */
function SV() {
    /** @type {(HTMLElement|null)} */
    var obj = document.getElementById("settingsDiv");
    O("div");
    /** @type {string} */
    obj.style.position = "absolute";
    /** @type {string} */
    obj.style.top = "9px";
    /** @type {string} */
    obj.style.right = "5px";
    /** @type {string} */
    obj.style.paddingTop = "10px";
    /** @type {string} */
    obj.style.paddingBottom = "10px";
    /** @type {string} */
    obj.style.paddingLeft = "20px";
    /** @type {string} */
    obj.style.paddingRight = "20px";
    /** @type {string} */
    obj.style.backgroundColor = "#fff";
    obj.appendChild(function() {
        /** @type {Element} */
        var div = document.createElement("div");
        /** @type {Element} */
        var line = document.createElement("div");
        line.appendChild(document.createTextNode("Bring all tabs into "));
        line.appendChild(PV());
        div.appendChild(ZV(line, 14, function() {
            tQ();
            B();
        }));
        return div;
    }());
    /** @type {number} */
    var url = 11;
    obj.appendChild(function() {
        /** @type {Element} */
        var t = document.createElement("div");
        t.appendChild(ZV("Share all as web page", url, function(h2) {
            O(h2);
            h2.appendChild(document.createTextNode("Please wait..."));
            /** @type {Array} */
            var results = [];
            var names = lQ();
            var parts = names["tabGroups"];
            if (!parts) {
                /** @type {Array} */
                parts = [];
            }
            /** @type {number} */
            var i = 0;
            for (; i < parts.length; i++) {
                var part = parts[i];
                if (!part["createDate"]) {
                    /** @type {number} */
                    part["createDate"] = (new Date).getTime();
                }
            }
            RV(parts);
            /** @type {number} */
            i = 0;
            for (; i < parts.length; i++) {
                part = parts[i];
                var index;
                for (index in part["tabsMeta"]) {
                    results.push(part["tabsMeta"][index]);
                }
            }
            if (results.length == 0) {
                alert("You do not yet have any tabs in OneTab");
            } else {
                EQ(results, function() {
                    O(h2);
                    h2.appendChild(document.createTextNode("Share all as web page"));
                });
            }
        }));
        return t;
    }());
    obj.appendChild(function() {
        /** @type {Element} */
        var t = document.createElement("div");
        t.appendChild(ZV("Export / Import URLs", url, function() {
            window["chrome"]["tabs"]["create"]({
                "url": window["chrome"]["runtime"]["getURL"]("import-export.html")
            });
        }));
        return t;
    }());
    // recover all
    obj.appendChild(function(){
        var div = document.createElement("div");
        div.className = "clickable";
        div.style.fontSize = "12.25px";
        var span = document.createElement("span");
        span.style.verticalAlign = "middle";
        span.innerText = "Recover All";
        span.onclick = function(){
            var aElems = document.getElementById("contentAreaDiv").getElementsByTagName("a");
            for (var i = 0, len = aElems.length; i < len; i++) {
                aElems[i].onclick();
            }

            setTimeout(function() {
                var contentAreaDiv = document.getElementById("contentAreaDiv");
                divChildren = contentAreaDiv.children;
                for (var i = 3, len = divChildren.length - 1; i < len; i++) {
                    var elem = divChildren[3];
                    elem.parentNode.removeChild(elem);
                }
                divChildren[1].innerText = "Total：0 tab";
                localStorage.setItem("state", JSON.stringify({
                    "tabGroups": []
                }));
                localStorage.setItem("topSites", null);
            }, 200)
        }
        div.appendChild(span);
        return div;
    }());
    // delete all
    obj.appendChild(function(){
        var div = document.createElement("div");
        div.className = "clickable";
        div.style.fontSize = "12.25px";
        var span = document.createElement("span");
        span.style.verticalAlign = "middle";
        span.innerText = "Delete All";
        span.onclick = function(){
            if(confirm("Are you sure you want to delete all？")){
                var contentAreaDiv = document.getElementById("contentAreaDiv");
                    divChildren = contentAreaDiv.children;
                for(var i=3,len=divChildren.length-1;i<len;i++){
                    var elem = divChildren[3];
                    elem.parentNode.removeChild(elem);
                }
                divChildren[2].innerText = "Total：0 tab";
                localStorage.setItem("state",JSON.stringify({
                    "tabGroups":[]
                }));
                localStorage.setItem("topSites",null);

            }
        }
        div.appendChild(span);
        return div;
    }());
    obj.appendChild(function() {
        /** @type {Element} */
        var t = document.createElement("div");
        t.appendChild(ZV("Options", url, function() {
            window["chrome"]["tabs"]["create"]({
                "url": window["chrome"]["runtime"]["getURL"]("options.html")
            });
        }));
        return t;
    }());
    obj.appendChild(function() {
        /** @type {Element} */
        var t = document.createElement("div");
        var udataCur = rV("may2013NewFeaturesIndicatorDisplayDate");
        if (!udataCur) {
            /** @type {number} */
            udataCur = (new Date).getTime();
            eQ("may2013NewFeaturesIndicatorDisplayDate", udataCur);
        }
        /** @type {boolean} */
        var loose = (new Date).getTime() - udataCur < 1E3 * 3600 * 24 * 10;
        t.appendChild(ZV("Features / Help", url, function() {
            window["chrome"]["tabs"]["create"]({
                "url": "http://www.one-tab.com/help"
            });
        }, loose));
        return t;
    }());
    obj.appendChild(function() {
        /** @type {Element} */
        var t = document.createElement("div");
        t.appendChild(ZV("About / Feedback", url, function() {
            window["chrome"]["tabs"]["create"]({
                "url": "http://www.one-tab.com"
            });
        }));
        return t;
    }());
    return obj;
}
/** @type {boolean} */
var G = false;
/**
 * @return {undefined}
 */
function fV() {
    window["WebFontConfig"] = {
        "google": {
            "families": ["Open Sans:400,600,300,700"]
        },
        /**
         * @return {undefined}
         */
        "active": function() {
            /** @type {boolean} */
            G = true;
        },
        /**
         * @return {undefined}
         */
        "inactive": function() {
            /** @type {boolean} */
            G = true;
        }
    };
    var qz = function() {
        /** @type {Element} */
        var wf = document.createElement("script");
        /** @type {string} */
        wf.src = "webfont.js";
        /** @type {string} */
        wf.type = "text/javascript";
        /** @type {string} */
        wf.async = "true";
        var insertAt = document.getElementsByTagName("script")[0];
        insertAt.parentNode.insertBefore(wf, insertAt);
    }();
    /** @type {number} */
    var frequency = 1E3 * 3600 * 24 * 2;
    /** @type {number} */
    var SAMPLE_RATE = 1E3 * 3600 * 2;
    /**
     * @return {undefined}
     */
    var tick = function() {
        setTimeout(function() {
            YQ("http://www.one-tab.com/api/newVersionCheck", {
                "version": eE,
                "extensionKey": window["localStorage"]["extensionKey"]
            }, function(dataAndEvents) {
                if (dataAndEvents["upgradeAvailable"]) {
                    eQ("availableVersion", dataAndEvents["availableVersion"]);
                    RQ();
                }
            });
            eQ("nextVersionCheckDate", (new Date).getTime() + frequency);
        }, parseInt(Math.random() * SAMPLE_RATE));
    };
    var linesPerPage = rV("nextVersionCheckDate");
    if (!linesPerPage) {
        /** @type {number} */
        linesPerPage = (new Date).getTime() - 1E3;
    }
    setTimeout(function() {
        tick();
        setInterval(function() {
            tick();
        }, frequency);
    }, Math.max(linesPerPage - (new Date).getTime(), 1));
    Z();
}
/**
 * @return {undefined}
 */
function RQ() {
    if (LE()) {
        /** @type {(HTMLElement|null)} */
        var el = document.getElementById("updateAvailableMsgDiv");
        O(el);
        /** @type {string} */
        el.style.paddingLeft = "30px";
        /** @type {string} */
        el.style.color = "#c00000";
        /** @type {string} */
        el.style.maxWidth = "600px";
        /** @type {string} */
        el.style.lineHeight = "2em";
        el.appendChild(document.createTextNode("An update for "));
        el.appendChild(PV());
        el.appendChild(document.createTextNode(" is available - please click the "));
        el.appendChild(CQ(28, 3));
        el.appendChild(document.createTextNode(' menu button in the top right of your browser and then click "Update Google Chrome". If that option is not available, click "About Google Chrome" followed by "Relaunch".'));
    }
}
/**
 * @return {undefined}
 */
function Z() {
    if (!G) {
        setTimeout(function() {
            Z();
        }, 1);
        return;
    }
    B();
    SV();
    document.addEventListener("mousedown", function() {
        DQ();
    }, false);
}
/**
 * @return {undefined}
 */
function B() {
    /** @type {(HTMLElement|null)} */
    var div = document.getElementById("contentAreaDiv");
    O(div);
    /** @type {string} */
    div.style.paddingTop = "0px";
    /** @type {string} */
    div.style.paddingLeft = "0px";
    div.appendChild(uE());
    var cardArray = lQ();
    var lines = cardArray["tabGroups"];
    if (!lines) {
        /** @type {Array} */
        lines = [];
    }
    /** @type {number} */
    var i = 0;
    for (; i < lines.length; i++) {
        var line = lines[i];
        if (!line["createDate"]) {
            /** @type {number} */
            line["createDate"] = (new Date).getTime();
        }
    }
    /** @type {number} */
    var prevChunksLen = 0;
    /** @type {number} */
    i = 0;
    for (; i < lines.length; i++) {
        line = lines[i];
        prevChunksLen += line["tabsMeta"].length;
    }
    RV(lines);
    /** @type {string} */
    var result = "Total: " + prevChunksLen + " " + (prevChunksLen == 1 ? "tab" : "tabs");
    var frag = jV(result);
    div.appendChild(frag);
    /** @type {Element} */
    var div2 = document.createElement("div");
    /** @type {string} */
    div2.id = "updateAvailableMsgDiv";
    div.appendChild(div2);
    RQ();
    /** @type {Array} */
    jQ = [];
    jQ.push(function(actualObject) {
        /** @type {Object} */
        var object = actualObject;
        var branchDataJSON = object["tabGroups"];
        if (!branchDataJSON) {
            /** @type {Array} */
            branchDataJSON = [];
        }
        /** @type {number} */
        var i = 0;
        /** @type {number} */
        var conditionIndex = 0;
        for (; conditionIndex < branchDataJSON.length; conditionIndex++) {
            var condition = branchDataJSON[conditionIndex];
            i += condition["tabsMeta"].length;
        }
        /** @type {string} */
        var text = "Total: " + i + " " + (i == 1 ? "tab" : "tabs");
        O(frag);
        frag.appendChild(document.createTextNode(text));
    });
    /** @type {number} */
    i = 0;
    for (; i < lines.length; i++) {
        line = lines[i];
        div.appendChild(GQ(line));
    }
    if (lines.length == 0) {
        div.appendChild(function() {
            /** @type {Element} */
            var div = document.createElement("div");
            /** @type {string} */
            div.style.paddingTop = "30px";
            /** @type {string} */
            div.style.paddingLeft = "30px";
            /** @type {string} */
            div.style.width = "500px";
            div.appendChild(document.createTextNode("When you have multiple tabs open, click the OneTab icon on your browser toolbar and your open tabs will appear here."));
            return div;
        }());
    }
    div.appendChild(function() {
        /** @type {Element} */
        var el = document.createElement("div");
        /** @type {string} */
        el.style.paddingTop = "30px";
        return el;
    }());
}
/**
 * @param {?} queryStr
 * @return {?}
 */
function _V(queryStr) {
    return queryStr;
};