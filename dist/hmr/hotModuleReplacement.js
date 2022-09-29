"use strict";

/* eslint-env browser */

/*
  eslint-disable
  no-console,
  func-names
*/

/** @typedef {any} TODO */
var normalizeUrl = require("./normalize-url");

var srcByModuleId = Object.create(null);
var noDocument = typeof document === "undefined";
var forEach = Array.prototype.forEach;
/**
 * @param {function} fn
 * @param {number} time
 * @returns {(function(): void)|*}
 */

function debounce(fn, time) {
  var timeout = 0;
  return function () {
    // @ts-ignore
    var self = this; // eslint-disable-next-line prefer-rest-params

    var args = arguments;

    var functionCall = function functionCall() {
      return fn.apply(self, args);
    };

    clearTimeout(timeout); // @ts-ignore

    timeout = setTimeout(functionCall, time);
  };
}

function noop() { }
/**
 * @param {TODO} moduleId
 * @returns {TODO}
 */


function getCurrentScriptUrl(moduleId) {
  var src = srcByModuleId[moduleId];

  if (!src) {
    if (document.currentScript) {
      src =
        /** @type {HTMLScriptElement} */
        document.currentScript.src;
    } else {
      var scripts = document.getElementsByTagName("script");
      var lastScriptTag = scripts[scripts.length - 1];

      if (lastScriptTag) {
        src = lastScriptTag.src;
      }
    }

    srcByModuleId[moduleId] = src;
  }
  /**
   * @param {string} fileMap
   * @returns {null | string[]}
   */


  return function (fileMap) {
    if (!src) {
      return null;
    }

    var splitResult = src.split(/([^\\/]+)\.js$/);
    var filename = splitResult && splitResult[1];

    if (!filename) {
      return [src.replace(".js", ".css")];
    }

    if (!fileMap) {
      return [src.replace(".js", ".css")];
    }

    return fileMap.split(",").map(function (mapRule) {
      var reg = new RegExp("".concat(filename, "\\.js$"), "g");
      return normalizeUrl(src.replace(reg, "".concat(mapRule.replace(/{fileName}/g, filename), ".css")));
    });
  };
}
/**
 * @param {TODO} el
 * @param {string} [url]
 */

const getAttributeBoolean = function (el, anme) {
  const val = el.getAttribute(anme)
  if (typeof val === "string") {
    return val === 'true' ? true : false
  }
  return val
}

const deleDom = function (el, newEl) {
  const load = getAttributeBoolean(newEl, "isLoaded")
  if (load) {
    return;
  }

  newEl.setAttribute('isLoaded', 'true')
  el.parentNode.removeChild(el);
}

function updateCss(el, url) {
  console.log('------------------------')
  if (!url) {
    const href = el.getAttribute('href')
    if (!href) {
      return;
    } // eslint-disable-next-line


    url = href.split("?")[0];
  }

  if (!isUrlRequest(
    /** @type {string} */
    url)) {
    return;
  }

  if (getAttributeBoolean(el, 'isLoaded') === false) {
    // We seem to be about to replace a css link that hasn't loaded yet.
    // We're probably changing the same file more than once.
    return;
  }

  if (!url || !(url.indexOf(".css") > -1)) {
    return;
  } // eslint-disable-next-line no-param-reassign


  el.setAttribute('visited', 'true')


  var newEl = el.cloneNode && typeof el.cloneNode === 'function' ? el.cloneNode() : document.createElement('link');
  newEl.setAttribute('rel', "stylesheet")
  newEl.setAttribute('isLoaded', 'false')
  // newEl.addEventListener("load", function () {
  //   deleDom(el, newEl)
  // });
  // newEl.addEventListener("error", function () {
  //   deleDom(el, newEl)
  // });
  const newHref = "".concat(url, "?").concat(Date.now());
  newEl.setAttribute('href', newHref)
  const parentNode = el.parentNode;
  if (el.nextSibling) {
    deleDom(el, newEl)
    parentNode.insertBefore(newEl, el.nextSibling);
    location.reload()
  } else {
    deleDom(el, newEl)
    parentNode.appendChild(newEl);
    location.reload()
  }

}
/**
 * @param {string} href
 * @param {TODO} src
 * @returns {TODO}
 */


function getReloadUrl(href, src) {
  var ret; // eslint-disable-next-line no-param-reassign

  href = normalizeUrl(href);
  src.some(
    /**
     * @param {string} url
     */
    // eslint-disable-next-line array-callback-return
    function (url) {
      if (href.indexOf(src) > -1) {
        ret = url;
      }
    });
  return ret;
}
/**
 * @param {string} [src]
 * @returns {boolean}
 */


function reloadStyle(src) {
  if (!src) {
    return false;
  }

  var elements = document.querySelectorAll("link");
  var loaded = false;
  forEach.call(elements, function (el) {
    const href = el.getAttribute('href')
    if (!href) {
      return;
    }

    var url = getReloadUrl(href, src);

    if (!isUrlRequest(url)) {
      return;
    }

    if (el.visited === true) {
      return;
    }

    if (url) {
      updateCss(el, url);
      loaded = true;
    }
  });
  return loaded;
}

function reloadAll() {
  var elements = document.querySelectorAll("link");
  forEach.call(elements, function (el) {
    const visited = el.getAttribute('visited')
    if (visited === true) {
      return;
    }

    updateCss(el);
  });
}
/**
 * @param {string} url
 * @returns {boolean}
 */


function isUrlRequest(url) {
  // An URL is not an request if
  // It is not http or https
  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) {
    return false;
  }

  return true;
}
/**
 * @param {TODO} moduleId
 * @param {TODO} options
 * @returns {TODO}
 */


module.exports = function (moduleId, options) {
  if (noDocument) {
    console.log("no window.document found, will not HMR CSS");
    return noop;
  }

  var getScriptSrc = getCurrentScriptUrl(moduleId);

  function update() {
    var src = getScriptSrc(options.filename);
    var reloaded = reloadStyle(src);

    if (options.locals) {
      console.log("[HMR] Detected local css modules. Reload all css");
      reloadAll();

      return;
    }

    if (reloaded) {
      console.log("[HMR] css reload %s", src.join(" "));
    } else {
      console.log("[HMR] Reload all css");
      reloadAll();
    }

  }

  return debounce(update, 50);
};
