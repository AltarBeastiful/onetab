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
            var xZ;
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
                                    xZ = 0;
                                    for (; xZ < 4; xZ += 1) {
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
 * @param {string} name
 * @return {?}
 */
function FQ(name) {
    if (name.indexOf("://") == -1) {
        /** @type {string} */
        name = "http://" + name;
    }
    name = name.substring(name.indexOf("://") + "://".length);
    if (name.indexOf("/") != -1) {
        name = name.substring(0, name.indexOf("/"));
    }
    return name.toLowerCase();
}
/**
 * @param {Object} map
 * @param {?} dataAndEvents
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
 * @param {HTMLElement} elt
 * @return {undefined}
 */
function O(elt) {
    if (typeof elt == "string") {
        /** @type {(HTMLElement|null)} */
        elt = document.getElementById(elt);
    }
    if (!elt) {
        return;
    }
    for (; elt.childNodes.length > 0;) {
        elt.removeChild(elt.childNodes[0]);
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
 * @param {?} elt
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
 * @param {HTMLElement} e
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
 * @param {HTMLElement} e
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
 * @param {HTMLElement} e
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
        var aZ = false;
        /** @type {boolean} */
        aZ = xhr.readyState == 4;
        if (aZ) {
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
    } catch (vf) {
        window["localStorage"]["state"] = ariaState;
        alert("Out of local storage memory - could not store extension state");
    }
}
/**
 * @param {?} g
 * @param {?} s
 * @return {undefined}
 */
function h(g, s) {
    var udataCur = lQ();
    udataCur[g] = s;
    sV(udataCur);
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
    var parameters = udataCur["tabGroups"];
    RV(parameters);
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
            var p;
            for (p in parameters) {
                var letter;
                for (letter in parameters[p]["tabsMeta"]) {
                    if (parameters[p]["tabsMeta"][letter]["url"] == item) {
                        items.push(node["id"]);
                        continue bye;
                    }
                }
            }
            for (p in map) {
                if (map[p]["url"] == item) {
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
        p = 0;
        for (; p < parameters.length; p++) {
            var o = parameters[p];
            if (o["id"] == obj) {
                var objects = o;
                for (letter in map) {
                    objects["tabsMeta"].push(map[letter]);
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
 * @param {string} tag
 * @return {?}
 */
function $E(tag) {
    return UQ(FQ(tag));
}
/**
 * @param {?} obj
 * @return {?}
 */
function UQ(obj) {
    var parent = $V();
    if (parent["excludedDomains"]) {
        var i;
        for (i in parent["excludedDomains"]) {
            if (parent["excludedDomains"][i] == obj) {
                return true;
            }
        }
    }
    return false;
}
/**
 * @param {?} obj
 * @return {undefined}
 */
function q(obj) {
    var suiteView = $V();
    if (!UQ(obj)) {
        if (!suiteView["excludedDomains"]) {
            /** @type {Array} */
            suiteView["excludedDomains"] = [];
        }
        suiteView["excludedDomains"].push(obj);
        bV(suiteView);
    }
}
/**
 * @param {?} obj
 * @return {undefined}
 */
function oE(obj) {
    var callbacks = $V();
    if (!callbacks["excludedDomains"]) {
        return;
    }
    /** @type {number} */
    var i = 0;
    for (; i < callbacks["excludedDomains"].length; i++) {
        if (callbacks["excludedDomains"][i] == obj) {
            callbacks["excludedDomains"].splice(i, 1);
            bV(callbacks);
            return;
        }
    }
}
var CE = {};
/**
 * @return {undefined}
 */
var WV = function() {
    CE.O9 = undefined;
    CE.k9 = undefined;
    /** @type {Array} */
    CE.lE = [];
    /** @type {Array} */
    CE.h9 = [];
    /** @type {Array} */
    CE.sE = [];
    /** @type {Array} */
    CE.AE = [];
    /** @type {Array} */
    CE.tE = [];
    /** @type {Array} */
    CE.B9 = [];
    /** @type {Array} */
    CE.XE = [];
    CE.q9 = undefined;
};
/**
 * @param {Array} map
 * @param {boolean} recurring
 * @return {undefined}
 */
var kQ = function(map, recurring) {
    var letter;
    for (letter in map) {
        var a = map[letter];
        var prefix;
        for (prefix in a) {
            DV(a[prefix], recurring);
        }
    }
};
/**
 * @param {?} data
 * @param {boolean} recurring
 * @return {undefined}
 */
var DV = function(data, recurring) {
    window["chrome"]["contextMenus"]["update"](data, {
        "enabled": recurring
    }, function() {});
};
/**
 * @param {?} data
 * @param {Object} value
 * @return {undefined}
 */
var qQ = function(data, value) {
    window["chrome"]["contextMenus"]["update"](data, {
        "checked": value,
        "type": "checkbox"
    }, function() {});
};
/**
 * @param {?} data
 * @param {string} newTitle
 * @return {undefined}
 */
var JV = function(data, newTitle) {
    window["chrome"]["contextMenus"]["update"](data, {
        "title": newTitle
    }, function() {});
};
/**
 * @return {undefined}
 */
function T() {
    window["chrome"]["windows"]["getLastFocused"](undefined, function(done) {
        window["chrome"]["tabs"]["query"]({}, function(config) {
            var props;
            var i;
            for (i in config) {
                if (config[i]["windowId"] == done["id"]) {
                    if (config[i]["active"]) {
                        props = config[i];
                    }
                }
            }
            if (!props) {
                return;
            }
            var p = props["url"];
            var d = g(p);
            DV(CE.O9, !d);
            var xA = lQ();
            window["chrome"]["contextMenus"]["update"](CE.q9, {
                "type": "checkbox",
                "checked": $E(p),
                "enabled": !d,
                "title": "Exclude " + (props["url"] && props["url"].toLowerCase().indexOf("http") == 0 ? FQ(props["url"]) : "web site") + " from OneTab"
            }, function() {});
            kQ([CE.lE, CE.h9, CE.sE, CE.AE, CE.tE, CE.B9], true);
            /** @type {boolean} */
            var MA = false;
            /** @type {boolean} */
            var $A = false;
            /** @type {boolean} */
            var SA = false;
            /** @type {boolean} */
            var hA = false;
            /** @type {boolean} */
            var PA = false;
            for (i in config) {
                if (config[i]["windowId"] == done["id"]) {
                    if (props) {
                        if (parseInt(config[i]["index"]) < parseInt(props["index"])) {
                            if (config[i]["url"]) {
                                if (!g(config[i]["url"])) {
                                    /** @type {boolean} */
                                    MA = true;
                                }
                            }
                        }
                        if (parseInt(config[i]["index"]) > parseInt(props["index"])) {
                            if (config[i]["url"]) {
                                if (!g(config[i]["url"])) {
                                    /** @type {boolean} */
                                    $A = true;
                                }
                            }
                        }
                        if (!g(config[i]["url"])) {
                            /** @type {boolean} */
                            hA = true;
                            if (config[i]["id"] != props["id"]) {
                                /** @type {boolean} */
                                SA = true;
                            }
                        }
                    }
                } else {
                    if (!g(config[i]["url"])) {
                        /** @type {boolean} */
                        PA = true;
                    }
                }
            }
            if (!hA) {
                kQ([CE.lE], false);
            }
            if (d || !hA) {
                kQ([CE.h9], false);
            }
            if (!MA) {
                kQ([CE.sE], false);
            }
            if (!$A) {
                kQ([CE.AE], false);
            }
            if (!PA) {
                kQ([CE.tE], false);
            }
            if (!SA) {
                kQ([CE.B9], false);
            }
        });
    });
}
/** @type {function (): undefined} */
window["updateContextMenuState"] = T;
/**
 * @return {undefined}
 */
function F() {
    window["chrome"]["contextMenus"]["removeAll"](function() {
        WV();
        KQ();
        T();
    });
}
/** @type {function (): undefined} */
window["recreateContextMenus"] = F;
/**
 * @return {undefined}
 */
function KQ() {
    CE.O9 = window["chrome"]["contextMenus"]["create"]({
        "type": "normal",
        "title": "Display OneTab",
        "contexts": ["all"],
        /**
         * @param {?} evt
         * @param {?} event
         * @return {undefined}
         */
        "onclick": function(evt, event) {
            TV();
        }
    });
    var copies = window["chrome"]["contextMenus"]["create"]({
        "type": "normal",
        "title": "Send all tabs to OneTab",
        "contexts": ["all"],
        /**
         * @param {?} evt
         * @param {?} event
         * @return {undefined}
         */
        "onclick": function(evt, event) {
            cV();
        }
    });
    CE.lE.push(copies);
    var templatePromise = window["chrome"]["contextMenus"]["create"]({
        "type": "normal",
        "title": "Send this web link to OneTab",
        "contexts": ["link"],
        /**
         * @param {Object} evt
         * @param {?} event
         * @return {undefined}
         */
        "onclick": function(evt, event) {
            zQ(evt["linkUrl"]);
        }
    });
    CE.XE.push(templatePromise);
    window["chrome"]["contextMenus"]["create"]({
        "type": "separator",
        "contexts": ["all"]
    });
    var modId = window["chrome"]["contextMenus"]["create"]({
        "type": "normal",
        "title": "Send only this tab to OneTab",
        "contexts": ["all"],
        /**
         * @param {?} evt
         * @param {?} event
         * @return {undefined}
         */
        "onclick": function(evt, event) {
            _Q();
        }
    });
    CE.h9.push(modId);
    var vvar = window["chrome"]["contextMenus"]["create"]({
        "type": "normal",
        "title": "Send all tabs except this tab to OneTab",
        "contexts": ["all"],
        /**
         * @param {?} evt
         * @param {?} event
         * @return {undefined}
         */
        "onclick": function(evt, event) {
            d();
        }
    });
    CE.B9.push(vvar);
    var toPush = window["chrome"]["contextMenus"]["create"]({
        "type": "normal",
        "title": "Send tabs on the left to OneTab",
        "contexts": ["all"],
        /**
         * @param {?} evt
         * @param {?} event
         * @return {undefined}
         */
        "onclick": function(evt, event) {
            UV();
        }
    });
    CE.sE.push(toPush);
    var stringOptions = window["chrome"]["contextMenus"]["create"]({
        "type": "normal",
        "title": "Send tabs on the right to OneTab",
        "contexts": ["all"],
        /**
         * @param {?} evt
         * @param {?} event
         * @return {undefined}
         */
        "onclick": function(evt, event) {
            zV();
        }
    });
    CE.AE.push(stringOptions);
    var normalizedMap = window["chrome"]["contextMenus"]["create"]({
        "type": "normal",
        "title": "Send all tabs from all windows to OneTab",
        "contexts": ["all"],
        /**
         * @param {?} evt
         * @param {?} event
         * @return {undefined}
         */
        "onclick": function(evt, event) {
            tQ();
        }
    });
    CE.tE.push(normalizedMap);
    window["chrome"]["contextMenus"]["create"]({
        "type": "separator",
        "contexts": ["all"]
    });
    CE.q9 = window["chrome"]["contextMenus"]["create"]({
        "type": "checkbox",
        "checked": false,
        "contexts": ["all"],
        "title": "Exclude this web site from OneTab",
        /**
         * @param {?} evt
         * @param {?} event
         * @return {undefined}
         */
        "onclick": function(evt, event) {
            var suiteView = FQ(ME["url"]);
            var kZ = UQ(suiteView);
            if (kZ) {
                oE(suiteView);
            } else {
                q(suiteView);
            }
        }
    });
    /** @type {boolean} */
    var ZJ = false;
    var tabGroups = lQ();
    var resultItems = tabGroups["tabGroups"];
    if (!resultItems) {
        /** @type {Array} */
        resultItems = [];
    }
    /** @type {number} */
    var i = 0;
    for (; i < resultItems.length; i++) {
        var result = resultItems[i];
        if (result["label"] && hE(result["label"]) != "") {
            /** @type {boolean} */
            ZJ = true;
            break;
        }
    }
    if (ZJ) {
        window["chrome"]["contextMenus"]["create"]({
            "type": "separator",
            "contexts": ["all"]
        });
        CE.k9 = window["chrome"]["contextMenus"]["create"]({
            "type": "normal",
            "contexts": ["all"],
            "title": "Named tab groups"
        }, function() {
            /** @type {number} */
            var i = 0;
            for (; i < resultItems.length; i++) {
                var result = resultItems[i];
                if (result["label"] && hE(result["label"]) != "") {
                    var dependentResult = function(item) {
                        var parentId = window["chrome"]["contextMenus"]["create"]({
                            "parentId": CE.k9,
                            "type": "normal",
                            "contexts": ["all"],
                            "title": item["label"]
                        }, function() {
                            CE.lE.push(window["chrome"]["contextMenus"]["create"]({
                                "parentId": parentId,
                                "type": "normal",
                                "title": 'Send all tabs to "' + item["label"] + '"',
                                "contexts": ["all"],
                                /**
                                 * @param {?} evt
                                 * @param {?} event
                                 * @return {undefined}
                                 */
                                "onclick": function(evt, event) {
                                    cV(item["id"]);
                                }
                            }));
                            CE.XE.push(window["chrome"]["contextMenus"]["create"]({
                                "parentId": parentId,
                                "type": "normal",
                                "title": 'Send this web link to "' + item["label"] + '"',
                                "contexts": ["link"],
                                /**
                                 * @param {Object} evt
                                 * @param {?} event
                                 * @return {undefined}
                                 */
                                "onclick": function(evt, event) {
                                    zQ(evt["linkUrl"], item["id"]);
                                }
                            }));
                            CE.h9.push(window["chrome"]["contextMenus"]["create"]({
                                "parentId": parentId,
                                "type": "normal",
                                "title": 'Send only this tab to "' + item["label"] + '"',
                                "contexts": ["all"],
                                /**
                                 * @param {?} evt
                                 * @param {?} event
                                 * @return {undefined}
                                 */
                                "onclick": function(evt, event) {
                                    _Q(item["id"]);
                                }
                            }));
                            CE.B9.push(window["chrome"]["contextMenus"]["create"]({
                                "parentId": parentId,
                                "type": "normal",
                                "title": 'Send all tabs except this tab to "' + item["label"] + '"',
                                "contexts": ["all"],
                                /**
                                 * @param {?} evt
                                 * @param {?} event
                                 * @return {undefined}
                                 */
                                "onclick": function(evt, event) {
                                    d(item["id"]);
                                }
                            }));
                            CE.sE.push(window["chrome"]["contextMenus"]["create"]({
                                "parentId": parentId,
                                "type": "normal",
                                "title": 'Send tabs on the left to "' + item["label"] + '"',
                                "contexts": ["all"],
                                /**
                                 * @param {?} evt
                                 * @param {?} event
                                 * @return {undefined}
                                 */
                                "onclick": function(evt, event) {
                                    UV(item["id"]);
                                }
                            }));
                            CE.AE.push(window["chrome"]["contextMenus"]["create"]({
                                "parentId": parentId,
                                "type": "normal",
                                "title": 'Send tabs on the right to "' + item["label"] + '"',
                                "contexts": ["all"],
                                /**
                                 * @param {?} evt
                                 * @param {?} event
                                 * @return {undefined}
                                 */
                                "onclick": function(evt, event) {
                                    zV(item["id"]);
                                }
                            }));
                            CE.tE.push(window["chrome"]["contextMenus"]["create"]({
                                "parentId": parentId,
                                "type": "normal",
                                "title": 'Send all tabs from all windows to "' + item["label"] + '"',
                                "contexts": ["all"],
                                /**
                                 * @param {?} evt
                                 * @param {?} event
                                 * @return {undefined}
                                 */
                                "onclick": function(evt, event) {
                                    tQ(item["id"]);
                                }
                            }));
                        });
                    }(result)
                }
            }
        });
    }
    window["chrome"]["contextMenus"]["create"]({
        "type": "separator",
        "contexts": ["all"]
    });
    var KJ = window["chrome"]["contextMenus"]["create"]({
        "type": "normal",
        "title": "Help",
        "contexts": ["all"],
        /**
         * @param {?} evt
         * @param {?} event
         * @return {undefined}
         */
        "onclick": function(evt, event) {
            window["chrome"]["tabs"]["create"]({
                "url": "http://www.one-tab.com/help"
            });
        }
    });
}
/** @type {string} */
var eE = "1.7";
var iQ = window["chrome"]["runtime"]["getURL"]("onetab.html");
/**
 * @param {string} s
 * @return {?}
 */
function g(s) {
    return s.indexOf(iQ) == 0;
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
 * @param {?} line
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
 * @param {?} line
 * @param {number} scale
 * @param {?} fn
 * @param {?} dataAndEvents
 * @return {?}
 */
function ZV(line, scale, fn, dataAndEvents) {
    /** @type {Element} */
    var el = document.createElement("div");
    /** @type {string} */
    el.style.fontSize = scale + "px";
    /** @type {string} */
    el.className = "clickable";
    /** @type {Element} */
    var div = document.createElement("span");
    if (dataAndEvents) {
        /** @type {Element} */
        var txt = document.createElement("span");
        /** @type {string} */
        txt.style.color = "#f00";
        txt.appendChild(document.createTextNode("NEW "));
        div.appendChild(txt);
    }
    if (typeof line == "string") {
        div.appendChild(document.createTextNode(line));
    } else {
        div.appendChild(line);
    }
    /** @type {string} */
    div.style.verticalAlign = "middle";
    /**
     * @return {undefined}
     */
    div.onclick = function() {
        fn(div);
    };
    el.appendChild(div);
    return el;
}
/**
 * @param {Array} key
 * @return {undefined}
 */
function RV(key) {
    key.sort(function(a, b) {
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
uQ();
if (!window["localStorage"]["extensionKey"]) {
    window["localStorage"]["extensionKey"] = U();
}
/**
 * @return {undefined}
 */
var oQ = function() {
    var udataCur = lQ();
    if (!udataCur["tabGroups"]) {
        /** @type {Array} */
        udataCur["tabGroups"] = [];
        sV(udataCur);
    }
};
oQ();
window["chrome"]["browserAction"]["onClicked"]["addListener"](function(dataAndEvents) {
    cV();
});
window["chrome"]["tabs"]["query"]({}, function(dataAndEvents) {
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
    if (prevChunksLen > 0 && rV("startupLaunch") == "displayOneTab") {
        var lastSeenVersion = window["localStorage"]["lastSeenVersion"];
        if (eE != lastSeenVersion) {
            window["localStorage"]["lastSeenVersion"] = eE;
        } else {
            vQ();
        }
    }
});
F();
var IQ;
var GE;
window["chrome"]["runtime"]["onMessage"]["addListener"](function(suite, dataAndEvents, deepDataAndEvents) {
    if (suite.type == "linkRightClick") {
        GE = suite.url;
        IQ = suite.title;
    }
});
window["chrome"]["commands"]["onCommand"]["addListener"](function(dataAndEvents) {
    if (dataAndEvents == "display-onetab") {
        vQ();
    }
    if (dataAndEvents == "send-current-tab-to-onetab") {
        _Q();
    }
    if (dataAndEvents == "send-all-tabs-in-current-window-to-onetab") {
        cV();
    }
    if (dataAndEvents == "send-all-tabs-in-all-windows-to-onetab") {
        tQ();
    }
    if (dataAndEvents == "send-all-tabs-except-this-to-onetab") {
        d();
    }
});
var AQ = {};
var ME = undefined;
var xE = undefined;
window["chrome"]["tabs"]["onActivated"]["addListener"](function(tabs) {
    window["chrome"]["tabs"]["get"](tabs["tabId"], function(dataAndEvents) {
        if (!dataAndEvents) {
            return;
        }
        var data = ME ? ME : undefined;
        /** @type {(Object|string)} */
        AQ[dataAndEvents["windowId"]] = dataAndEvents;
        if (typeof xE === "undefined") {
            xE = dataAndEvents["windowId"];
        }
        if (xE == dataAndEvents["windowId"]) {
            /** @type {(Object|string)} */
            ME = dataAndEvents;
        }
        if (data != ME["id"]) {
            T();
        }
    });
});
window["chrome"]["windows"]["onFocusChanged"]["addListener"](function(dataAndEvents) {
    var data = ME ? ME["id"] : undefined;
    /** @type {(Object|string)} */
    xE = dataAndEvents;
    if (AQ.hasOwnProperty(xE)) {
        ME = AQ[xE];
    }
    if (ME && data != ME["id"]) {
        T();
    }
});
window["chrome"]["tabs"]["onCreated"]["addListener"](function(done) {
    window["chrome"]["tabs"]["get"](done["id"], function(dataAndEvents) {
        T();
    });
});
window["chrome"]["tabs"]["onUpdated"]["addListener"](function(dataAndEvents, deepDataAndEvents, ignoreMethodDoesntExist) {
    T();
});
window["chrome"]["tabs"]["onMoved"]["addListener"](function(dataAndEvents, deepDataAndEvents) {
    T();
});
window["chrome"]["tabs"]["onRemoved"]["addListener"](function(dataAndEvents, deepDataAndEvents) {
    T();
});
window["chrome"]["tabs"]["onReplaced"]["addListener"](function(dataAndEvents, deepDataAndEvents) {
    T();
});
window["chrome"]["tabs"]["onDetached"]["addListener"](function(dataAndEvents, deepDataAndEvents) {
    T();
});
window["chrome"]["tabs"]["onAttached"]["addListener"](function(dataAndEvents, deepDataAndEvents) {
    T();
});