document.addEventListener("mousedown", function(event) {
  if (event.button == 2) {
    /** @type {(EventTarget|null)} */
    var link = event.target;
    for (;link;) {
      if (link instanceof HTMLAnchorElement) {
        /** @type {HTMLAnchorElement} */
        var linkemail = link;
        var href = link["href"];
        var text = link.innerText;
        if (!text) {
          /** @type {string} */
          text = "";
        }
        if (text.length > 0) {
          if (text.charAt(0) == " ") {
            text = text.substr(1);
          }
        }
        if (text == "") {
          text = href;
        }
        var MSG_CLOSURE_CUSTOM_COLOR_BUTTON = text;
        window["chrome"]["runtime"]["sendMessage"](undefined, {
          type : "linkRightClick",
          url : href,
          title : MSG_CLOSURE_CUSTOM_COLOR_BUTTON
        }, function(dataAndEvents) {
        });
        break;
      } else {
        link = link.parentNode;
      }
    }
  }
}, true);
