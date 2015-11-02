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
            var Gr;
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
                                    Gr = 0;
                                    for (; Gr < 4; Gr += 1) {
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
        var Cr = false;
        /** @type {boolean} */
        Cr = xhr.readyState == 4;
        if (Cr) {
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
 * @param {?} off
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
    } catch (_d) {
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
    var a = udataCur["tabGroups"];
    RV(a);
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
            for (j in a) {
                var letter;
                for (letter in a[j]["tabsMeta"]) {
                    if (a[j]["tabsMeta"][letter]["url"] == item) {
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
        for (; j < a.length; j++) {
            var arr = a[j];
            if (arr["id"] == obj) {
                var merged = arr;
                for (letter in map) {
                    merged["tabsMeta"].push(map[letter]);
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
 * @param {string} message
 * @return {?}
 */
function jV(message) {
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
    div.appendChild(document.createTextNode(message));
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
    content.appendChild(jV("Options"));
    /** @type {Element} */
    var innerWrapper = document.createElement("div");
    content.appendChild(innerWrapper);
    /** @type {string} */
    innerWrapper.style.paddingTop = "24px";
    /** @type {string} */
    innerWrapper.style.paddingLeft = "36px";
    innerWrapper.appendChild(pE("restoreWindow", "When a tab group is restored, send the tabs to:", [{
        t9: "newWindow",
        title: "A new window, unless OneTab is the only tab in the current window"
    }, {
        t9: "newWindowAlways",
        title: "Always a new window"
    }, {
        t9: "currentWindow",
        title: "Always the current window"
    }]));
    innerWrapper.appendChild(pE("pinnedTabs", "Pinned tabs:", [{
        t9: "ignore",
        title: "Don't send pinned tabs to OneTab",
        R9: "You can still manually send a pinned tab to OneTab by right clicking within the web page to access the OneTab menu, and then clicking 'Send only this tab to OneTab'"
    }, {
        t9: "allow",
        title: "Allow pinned tabs to be sent to OneTab"
    }], "Note:  A tab becomes 'pinned' when you right click on the tab and click 'Pin tab'. Some people like to make sites such as Facebook or Gmail pinned so they can easily locate them. OneTab will remember whether a tab was pinned when you restore it."));
    innerWrapper.appendChild(pE("startupLaunch", "Startup:", [{
        t9: "displayOneTab",
        title: "Display OneTab whenever you start your web browser for the first time"
    }, {
        t9: "none",
        title: "Do not open OneTab automatically",
        R9: "To open it manually, use the right click menu and choose 'Display OneTab'"
    }]));
    innerWrapper.appendChild(pE("restoreRemoval", "On clicking 'restore all' or restoring a single tab:", [{
        t9: "default",
        title: "Open the tab(s) and remove them from your OneTab list",
        R9: "You still can press ctrl, cmd or shift to restore the tab(s) without removing them from OneTab. If you set any of your tab groups as 'locked' then the tabs will not be removed from OneTab unless you unlock that tab group first."
    }, {
        t9: "keep",
        title: "Keep them in your OneTab list",
        R9: "You can manually delete entries by hovering over them and clicking the X icon, or by clicking the 'delete all' button"
    }]));
    innerWrapper.appendChild(pE("duplicates", "Duplicates:", [{
        t9: "allow",
        title: "Allow duplicates"
    }, {
        t9: "reject",
        title: "Silently reject duplicates",
        R9: "If OneTab already contains the URL of a tab, it will not be added again. This only applies when you click the OneTab icon or use the right click menu to send multiple tabs to OneTab. If you use the right click OneTab menu to send only a specific tab to OneTab, then the duplicate will be allowed for that specific tab."
    }]));
}
/** @type {number} */
var MQ = 0;
/**
 * @param {string} obj
 * @param {string} line
 * @param {Array} opt_attributes
 * @param {string} script
 * @return {?}
 */
function pE(obj, line, opt_attributes, script) {
    /** @type {Element} */
    var el = document.createElement("div");
    /** @type {string} */
    el.style.paddingBottom = "40px";
    /** @type {string} */
    el.style.maxWidth = "600px";
    /** @type {Element} */
    var e = document.createElement("div");
    el.appendChild(e);
    /** @type {string} */
    e.style.fontSize = "14px";
    /** @type {string} */
    e.style.paddingBottom = "0px";
    e.appendChild(document.createTextNode(line));
    /** @type {string} */
    var udataCur = "optionGroup" + MQ++;
    var unlock;
    for (unlock in opt_attributes) {
        el.appendChild(Q(obj, udataCur, opt_attributes[unlock]));
    }
    if (script) {
        /** @type {Element} */
        var div = document.createElement("div");
        el.appendChild(div);
        /** @type {string} */
        div.style.fontSize = "12px";
        /** @type {string} */
        div.style.color = "#666";
        /** @type {string} */
        div.style.paddingTop = "10px";
        /** @type {string} */
        div.style.paddingLeft = "0px";
        div.appendChild(document.createTextNode(script));
    }
    return el;
}
/** @type {number} */
var Y = 0;
/**
 * @param {string} name
 * @param {string} value
 * @param {Element} target
 * @return {?}
 */
function Q(name, value, target) {
    /** @type {string} */
    var id = "optionId" + Y++;
    var node = target.t9;
    /** @type {Element} */
    var wrapper = document.createElement("div");
    /** @type {string} */
    wrapper.style.paddingBottom = "0px";
    /** @type {Element} */
    var input = document.createElement("input");
    /** @type {string} */
    input.type = "radio";
    /** @type {string} */
    input.name = value;
    /** @type {string} */
    input.id = id;
    /** @type {string} */
    input.style.cursor = "pointer";
    if (rV([name]) == node) {
        /** @type {boolean} */
        input.checked = true;
    }
    input.addEventListener("click", function() {
        var seen = $V();
        seen[name] = node;
        bV(seen);
    });
    /** @type {Element} */
    var element = document.createElement("label");
    /** @type {string} */
    element["htmlFor"] = id;
    /** @type {string} */
    element.style.fontSize = "13px";
    element.appendChild(document.createTextNode(target.title));
    /** @type {string} */
    element.style.cursor = "pointer";
    wrapper.appendChild(input);
    wrapper.appendChild(element);
    /** @type {Element} */
    var div = document.createElement("div");
    /** @type {string} */
    div.style.color = "#666";
    /** @type {string} */
    div.style.fontSize = "12px";
    /** @type {string} */
    div.style.paddingTop = "4px";
    /** @type {string} */
    div.style.paddingLeft = "25px";
    if (target.R9) {
        div.appendChild(document.createTextNode(target.R9));
    }
    wrapper.appendChild(div);
    return wrapper;
};