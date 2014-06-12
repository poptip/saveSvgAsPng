(function() {
  var out$ = typeof exports != 'undefined' && exports || this;

  function inlineImages(callback) {
    var images = document.querySelectorAll('svg image');
    var left = images.length;
    if (left == 0) {
      callback();
    }
    for (var i = 0; i < images.length; i++) {
      (function(image) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var img = new Image();
        img.src = image.getAttribute('xlink:href');
        img.onload = function() {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          image.setAttribute('xlink:href', canvas.toDataURL('image/png'));
          left--;
          if (left == 0) {
            callback();
          }
        }
      })(images[i]);
    }
  }

  function styles(dom) {
    var tmp = document.createElement("div");
    tmp.style.position = "absolute";
    tmp.style.left = "-10000px";
    tmp.style.top = "-10000px";
    tmp.appendChild(dom);
    document.body.appendChild(tmp);

    var used = "";
    var everything = dom.getElementsByTagName("*");
    for (var i = 0, len = everything.length; i < len; i++) {
      var el = everything[i];
      var style = getComputedStyle(el);
      var elcss = "";

      for (var j = 0, len2 = style.length; j < len2; j++) {
        var key = style[j];
        var val = style[key];
        if (val) {
          elcss += key + ":" + val + "; ";
        }
      }

      if (elcss) {
        var className = "_saveAsPng-" + i;
        used += "." + className + " { " + elcss + "}\n";
        el.classList.add(className);
      }
    }

    document.body.removeChild(tmp);

    var s = document.createElement("style");
    s.setAttribute("type", "text/css");
    s.innerHTML = used;

    var defs = document.createElement("defs");
    defs.appendChild(s);
    return defs;
  }

  out$.svgAsDataUri = function(el, scaleFactor, cb) {
    scaleFactor = scaleFactor || 1;

    inlineImages(function() {
      var clone = el.cloneNode(true);
      var width = parseInt(clone.getAttribute("width"));
      var height = parseInt(clone.getAttribute("height"));

      clone.setAttribute("version", "1.1");
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
      clone.setAttribute("width", width * scaleFactor);
      clone.setAttribute("height", height * scaleFactor);
      clone.setAttribute("viewBox", "0 0 " + width + " " + height);

      clone.insertBefore(styles(clone), clone.firstChild);

      var svg = (new XMLSerializer()).serializeToString(clone);
      var uri = "data:image/svg+xml;utf8," + svg;
      if (cb) {
        cb(uri);
      }
    });
  }

  out$.saveSvgAsPng = function(el, name, scaleFactor) {
    out$.svgAsDataUri(el, scaleFactor, function(uri) {
      var image = new Image();
      image.src = uri;
      image.onerror = function() {
        console.error("There was an error creating the image");
      };
      image.onload = function() {
        var canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        var context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);

        var a = document.createElement('a');
        a.style.position = 'absolute';
        a.style.left = '-10000px';
        a.style.top = '-10000px';
        a.download = name;
        a.href = canvas.toDataURL('image/png');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    });
  }
})();
