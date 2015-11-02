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
     * @param {?} term
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
            var Ca;
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
                                    Ca = 0;
                                    for (; Ca < 4; Ca += 1) {
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
 * @param {Object} walkers
 * @param {?} msg
 * @param {Element} el
 * @param {?} e
 * @param {?} $sanitize
 * @param {?} Application
 * @param {?} forOwn
 * @param {?} main_callback
 * @param {?} makeIterator
 * @return {undefined}
 */
YV.prototype.M9 = function(walkers, msg, el, e, $sanitize, Application, forOwn, main_callback, makeIterator) {
    var that = this;
    /**
     * @param {Object} e
     * @return {undefined}
     */
    walkers.onmousedown = function(e) {
        /** @type {boolean} */
        var callback = false;
        NV(e, walkers, null, function(dataAndEvents, deepDataAndEvents, ignoreMethodDoesntExist, textAlt) {
            if (makeIterator) {
                callback = makeIterator();
            }
        }, function(dataAndEvents, deepDataAndEvents, adjust, wheelDeltaY, ignoreMethodDoesntExist, textAlt, maxWidth, result) {
            if (!that.wE && !callback) {
                if (Math.abs(adjust) > YV.m9 || Math.abs(wheelDeltaY) > YV.m9) {
                    /** @type {boolean} */
                    that.wE = true;
                    /** @type {Array} */
                    that.L9 = new Array;
                    that.bE = msg;
                    that.OE = el.offsetWidth;
                    that.g9 = el.offsetHeight;
                    that.j9 = el.parentNode;
                    that.G9 = el.nextSibling;
                    el.parentNode.removeChild(el);
                    /** @type {Element} */
                    that.fE = el;
                    that.EE = e;
                    /** @type {Element} */
                    that.dE = document.createElement("div");
                    that.dE.style.zIndex = A;
                    /** @type {string} */
                    that.dE.style.position = "absolute";
                    /** @type {string} */
                    that.dE.style.width = that.OE + "px";
                    /** @type {string} */
                    that.dE.style.height = that.g9 + "px";
                    that.dE.appendChild(that.fE);
                    TE().appendChild(that.dE);
                    $sanitize();
                }
            }
            if (that.wE) {
                /** @type {string} */
                that.dE.style.left = maxWidth + 7 + "px";
                /** @type {string} */
                that.dE.style.top = result - 16 + "px";
            }
        }, function(dataAndEvents, deepDataAndEvents, ignoreMethodDoesntExist, textAlt, keepData, opt_attributes) {
            if (!that.wE) {
                Application();
            } else {
                /** @type {boolean} */
                that.wE = false;
                TE().removeChild(that.dE);
                if (that.z9) {
                    that.z9(that.bE);
                } else {
                    forOwn();
                }
                var key;
                for (key in that.L9) {
                    var label = that.L9[key];
                    /** @type {string} */
                    label.style.display = "none";
                }
                /** @type {Array} */
                that.L9 = new Array;
                main_callback();
            }
        });
    };
};
/**
 * @param {?} expression
 * @param {?} dataAndEvents
 * @param {Element} node
 * @param {?} version
 * @return {undefined}
 */
YV.prototype.IE = function(expression, dataAndEvents, node, version) {
    var meta = this;
    wV(expression, function(params) {
        /** @type {boolean} */
        params.event.cancelBubble = true;
        if (meta.wE) {
            if (expression != meta.fE) {
                /** @type {string} */
                node.style.display = "block";
                /** @type {string} */
                node.style.width = meta.OE - (hQ ? 0 : 2) + "px";
                /** @type {string} */
                node.style.height = meta.g9 - (hQ ? 0 : 2) + "px";
                node.style.border = "1px dashed #" + dQ;
                meta.z9 = version;
                var i;
                for (i in meta.L9) {
                    var child = meta.L9[i];
                    if (EV(child.parentNode, node) && node != child) {
                        /** @type {string} */
                        child.style.display = "none";
                    }
                }
                if (!HV(meta.L9, node)) {
                    meta.L9.push(node);
                }
            }
        }
    });
    WE(expression, function(params) {
        /** @type {boolean} */
        params.event.cancelBubble = true;
        if (meta.wE) {
            if (expression != meta.fE) {
                /** @type {string} */
                node.style.display = "none";
                /** @type {null} */
                meta.z9 = null;
                NE(node, meta.L9);
            }
        }
    });
};
/**
 * @param {Element} docFrag
 * @return {?}
 */
YV.prototype.H9 = function(docFrag) {
    /** @type {Element} */
    var div = document.createElement("div");
    docFrag.appendChild(div);
    return div;
};
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
    var a = parseInt(eE.substring(0, eE.indexOf(".")));
    /** @type {number} */
    var left = parseInt(eE.substring(eE.indexOf(".") + 1));
    /** @type {number} */
    var b = parseInt(whitespace.substring(0, whitespace.indexOf(".")));
    /** @type {number} */
    var right = parseInt(whitespace.substring(whitespace.indexOf(".") + 1));
    /** @type {boolean} */
    var LE = false;
    if (a < b) {
        /** @type {boolean} */
        LE = true;
    }
    if (a == b) {
        if (left < right) {
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
 * @param {string} line
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
 * @param {string} str
 * @param {number} mid
 * @param {Function} fn
 * @param {?} dataAndEvents
 * @return {?}
 */
function ZV(str, mid, fn, dataAndEvents) {
    /** @type {Element} */
    var el = document.createElement("div");
    /** @type {string} */
    el.style.fontSize = mid + "px";
    /** @type {string} */
    el.className = "clickable";
    /** @type {Element} */
    var e = document.createElement("span");
    if (dataAndEvents) {
        /** @type {Element} */
        var j = document.createElement("span");
        /** @type {string} */
        j.style.color = "#f00";
        j.appendChild(document.createTextNode("NEW "));
        e.appendChild(j);
    }
    if (typeof str == "string") {
        e.appendChild(document.createTextNode(str));
    } else {
        e.appendChild(str);
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
 * @param {Element} dataAndEvents
 * @return {?}
 */
function HV(map, dataAndEvents) {
    var letter;
    for (letter in map) {
        if (map[letter] == dataAndEvents) {
            return true;
        }
    }
    return false;
}
/**
 * @param {HTMLElement} desc
 * @return {undefined}
 */
function O(desc) {
    if (typeof desc == "string") {
        /** @type {(HTMLElement|null)} */
        desc = document.getElementById(desc);
    }
    if (!desc) {
        return;
    }
    for (; desc.childNodes.length > 0;) {
        desc.removeChild(desc.childNodes[0]);
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
 * @param {Element} dataAndEvents
 * @param {Array} drop
 * @return {undefined}
 */
function NE(dataAndEvents, drop) {
    /** @type {number} */
    var i = 0;
    for (; i < drop.length; i++) {
        if (drop[i] == dataAndEvents) {
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
 * @param {Object} e
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
 * @param {?} isXML
 * @return {undefined}
 */
function hV(isXML) {
    isXML["noCacheRandom"] = I();
}
/**
 * @return {?}
 */
function I() {
    return (new Date).getTime() + Math.round(Math.random() * 1E4) + "";
}
/**
 * @param {?} deepDataAndEvents
 * @param {?} isXML
 * @param {?} cb
 * @return {undefined}
 */
function YQ(deepDataAndEvents, isXML, cb) {
    hV(isXML);
    var pdataCur = VQ.o9(isXML);
    nV(deepDataAndEvents, pdataCur, function(t) {
        if (cb) {
            cb(VQ.parse(t));
        }
    });
}
/**
 * @param {?} deepDataAndEvents
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
        var U1 = false;
        /** @type {boolean} */
        U1 = xhr.readyState == 4;
        if (U1) {
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
 * @param {Object} obj
 * @param {(number|string)} recurring
 * @param {?} deepDataAndEvents
 * @param {?} dataAndEvents
 * @param {?} triggerRoute
 * @return {undefined}
 */
function NV(e, obj, recurring, deepDataAndEvents, dataAndEvents, triggerRoute) {
    /** @type {Object} */
    L = obj;
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
    var AW = false;
    if (zE != z0 || PE != r20) {
        /** @type {boolean} */
        AW = true;
    }
    /** @type {number} */
    zE = z0;
    /** @type {number} */
    PE = r20;
    if (AW) {
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
 * @param {Object} obj
 * @param {Function} callback
 * @return {undefined}
 */
function KV(obj, callback) {
    /**
     * @param {Array} e
     * @return {undefined}
     */
    obj.onmousedown = function(e) {
        callback(new cE(obj, e));
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
 * @param {Object} value
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
 * @param {number} object
 * @param {Function} callback
 * @return {?}
 */
function WE(object, callback) {
    var handler;
    if (hQ) {
        /**
         * @param {number} err
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
            var uncaughtException;
            var which;
            uncaughtException = ev.currentTarget;
            which = ev.relatedTarget;
            if (uncaughtException == e && (uncaughtException != which && !EV(uncaughtException, which))) {
                callback(new cE(e, ev));
            }
        };
    }
}
/**
 * @param {Object} map
 * @param {?} deepDataAndEvents
 * @return {undefined}
 */
function mE(map, deepDataAndEvents) {
    if (hQ) {
        var key;
        for (key in map) {
            var node = map[key];
            node.onmouseleave = eV(node, map, deepDataAndEvents);
        }
    } else {
        for (key in map) {
            node = map[key];
            node.onmouseout = TQ(node, map, deepDataAndEvents);
        }
    }
}
/**
 * @param {string} value
 * @param {Object} map
 * @param {?} deepDataAndEvents
 * @return {?}
 */
function TQ(value, map, deepDataAndEvents) {
    return function(ev) {
        var el;
        var which;
        el = ev.currentTarget;
        which = ev.relatedTarget;
        if (el == value && (el != which && !EV(el, which))) {
            var letter;
            for (letter in map) {
                if (which == map[letter]) {
                    return;
                }
            }
            deepDataAndEvents(new cE(value, ev));
        }
    };
}
/**
 * @param {string} dataAndEvents
 * @param {Object} map
 * @param {?} deepDataAndEvents
 * @return {?}
 */
function eV(dataAndEvents, map, deepDataAndEvents) {
    return function() {
        var letter;
        for (letter in map) {
            if (window.event.toElement == map[letter]) {
                return;
            }
        }
        deepDataAndEvents(new cE(dataAndEvents, window.event));
    };
}
/**
 * @param {?} e
 * @param {Element} object
 * @return {?}
 */
function EV(e, object) {
    try {
        if (!object) {
            return false;
        }
        for (; object.parentNode;) {
            if ((object = object.parentNode) == e) {
                return true;
            }
        }
        return false;
    } catch (IB) {
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
 * @param {Object} walkers
 * @param {(number|string)} recurring
 * @param {?} deepDataAndEvents
 * @param {?} dataAndEvents
 * @param {?} triggerRoute
 * @return {undefined}
 */
function CV(walkers, recurring, deepDataAndEvents, dataAndEvents, triggerRoute) {
    KV(walkers, function(e) {
        NV(e.event, walkers, recurring, deepDataAndEvents, dataAndEvents, triggerRoute);
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
        var $F = window.event.clientX + (gQ ? 0 : document.documentElement.scrollLeft) + document.body.scrollLeft;
        var oF = window.event.clientY + (gQ ? 0 : document.documentElement.scrollTop) + document.body.scrollTop;
    } else {
        $F = e.clientX + window.scrollX;
        oF = e.clientY + window.scrollY;
    }
    return new Eye($F, oF);
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
    } catch (_F) {}
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
 * @param {?} key
 * @param {?} value
 * @return {undefined}
 */
function eQ(key, value) {
    var memory = $V();
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
 * @param {(Error|string)} value
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
    } catch (cF) {
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
    var keys = udataCur["tabGroups"];
    RV(keys);
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
    var iterable = [];
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
            var index;
            for (index in keys) {
                var key;
                for (key in keys[index]["tabsMeta"]) {
                    if (keys[index]["tabsMeta"][key]["url"] == item) {
                        items.push(node["id"]);
                        continue bye;
                    }
                }
            }
            for (index in iterable) {
                if (iterable[index]["url"] == item) {
                    items.push(node["id"]);
                    continue bye;
                }
            }
        }
        items.push(node["id"]);
        var params = {
            "id": OV(),
            "url": item,
            "title": node["title"]
        };
        if (node["pinned"]) {
            /** @type {boolean} */
            params["pinned"] = true;
        }
        iterable.push(params);
    }
    if (typeof obj === "undefined") {
        var pageId = OV();
        K("tabGroups", {
            "id": pageId,
            "tabsMeta": iterable,
            "createDate": (new Date).getTime()
        });
    } else {
        /** @type {number} */
        index = 0;
        for (; index < keys.length; index++) {
            var c = keys[index];
            if (c["id"] == obj) {
                var rv = c;
                for (key in iterable) {
                    rv["tabsMeta"].push(iterable[key]);
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
/**
 * @return {undefined}
 */
function fV() {
    B();
}
/**
 * @return {undefined}
 */
function B() {
    /** @type {(HTMLElement|null)} */
    var content = document.getElementById("contentAreaDiv");
    O(content);
    /** @type {string} */
    content.style.paddingTop = "0px";
    /** @type {string} */
    content.style.paddingLeft = "0px";
    content.appendChild(uE());
    content.appendChild(jV("Import / Export"));
    /** @type {Element} */
    var innerWrapper = document.createElement("div");
    content.appendChild(innerWrapper);
    /** @type {string} */
    innerWrapper.style.paddingTop = "14px";
    /** @type {string} */
    innerWrapper.style.paddingLeft = "36px";
    innerWrapper.appendChild(aE(false, "Import URLs", function() {
        /** @type {Element} */
        var wrapper = document.createElement("div");
        /** @type {Element} */
        var info = document.createElement("div");
        info.appendChild(document.createTextNode("Paste in a list of URLs and then click Import below"));
        /** @type {string} */
        info.style.color = "#777";
        /** @type {string} */
        info.style.paddingBottom = "10px";
        wrapper.appendChild(info);
        /** @type {Element} */
        var field = document.createElement("textArea");
        /** @type {string} */
        field.style.width = "800px";
        /** @type {string} */
        field.style.height = "200px";
        wrapper.appendChild(field);
        var udataCur = lQ();
        if (!udataCur["tabGroups"]) {
            /** @type {Array} */
            udataCur["tabGroups"] = [];
        }
        var configList = udataCur["tabGroups"];
        /** @type {number} */
        var A1 = (new Date).getTime();
        /**
         * @return {?}
         */
        var getName = function() {
            var done = {};
            /** @type {number} */
            done["createDate"] = A1--;
            /** @type {Array} */
            done["tabsMeta"] = [];
            done["id"] = OV();
            return done;
        };
        var print = ZV("Import", 16, function() {
            var map = field.value.split("\n");
            var name = getName();
            var letter;
            for (letter in map) {
                var val = map[letter];
                if (!val) {
                    if (name["tabsMeta"].length > 0) {
                        configList.push(name);
                        name = getName();
                    }
                } else {
                    var r;
                    var id;
                    if (val.indexOf(" | ") != -1) {
                        r = val.substring(0, val.indexOf(" | "));
                        id = val.substring(val.indexOf(" | ") + " | ".length);
                    } else {
                        r = val;
                        id = FQ(val);
                    }
                    if (r.indexOf("://") == -1) {
                        /** @type {string} */
                        r = "http://" + r;
                    }
                    var data = {};
                    data["id"] = OV();
                    data["url"] = r;
                    data["title"] = id;
                    name["tabsMeta"].push(data);
                }
            }
            if (name["tabsMeta"].length > 0) {
                configList.push(name);
            }
            sV(udataCur);
            setTimeout(function() {
                window["close"]();
            }, 100);
            vQ(true);
        });
        wrapper.appendChild(print);
        /** @type {string} */
        wrapper.style.paddingBottom = "30px";
        return wrapper;
    }()));
    innerWrapper.appendChild(M(16));
    innerWrapper.appendChild(aE(true, "Export URLs", function() {
        /** @type {Element} */
        var wrapper = document.createElement("div");
        /** @type {Element} */
        var info = document.createElement("div");
        info.appendChild(document.createTextNode("The following list of URLs can also be imported back into OneTab on this or a different computer"));
        /** @type {string} */
        info.style.color = "#777";
        /** @type {string} */
        info.style.paddingBottom = "10px";
        wrapper.appendChild(info);
        /** @type {Element} */
        var field = document.createElement("textArea");
        /** @type {string} */
        field.style.width = "800px";
        /** @type {string} */
        field.style.height = "500px";
        var tabGroups = lQ();
        var resultItems = tabGroups["tabGroups"];
        if (!resultItems) {
            /** @type {Array} */
            resultItems = [];
        }
        RV(resultItems);
        /** @type {number} */
        var i = 0;
        for (; i < resultItems.length; i++) {
            var result = resultItems[i];
            var actor;
            for (actor in result["tabsMeta"]) {
                var params = result["tabsMeta"][actor];
                var url = params["url"];
                if (FQ(url) != params["title"]) {
                    url = url + " | " + params["title"];
                }
                /** @type {string} */
                field.value = field.value + url + "\n";
            }
            if (i != resultItems.length - 1) {
                /** @type {string} */
                field.value = field.value + "\n";
            }
        }
        wrapper.appendChild(field);
        /** @type {string} */
        wrapper.style.paddingBottom = "30px";
        return wrapper;
    }()));
    content.appendChild(function() {
        /** @type {Element} */
        var el = document.createElement("div");
        /** @type {string} */
        el.style.paddingTop = "30px";
        return el;
    }());
};