/*
  Creative Commons Legal Code Errata Tool
  Written in 2012 by Jonathan Palecek, Creative Commons.
  
  To the extent possible under law, the author(s) have dedicated all copyright
  and related and neighboring rights to this software to the public domain
  worldwide. This software is distributed without any warranty.

  You should have received a copy of the CC0 Public Domain Dedication along
  with this software. If not, see: 
  http://creativecommons.org/publicdomain/zero/1.0/
 */


ANNO.init = (function () {
    if (!!ANNO.DEBUG) {
	console.info("Starting errata tool.");
    }

    // * --- Add in extra controls and cache the clean page --- * //

    var cache = {
	"errata_free" : "",
	"errata_applied" : "",
    };
    var css_prefixing = function (prefixes, css, indent) {
	var ret = "";
	var __indent = indent ? "    " : "";
	for (var i=0; i<prefixes.length; i+=1) {
	    ret += __indent + prefixes[i] + css;
	}
	return ret;
    };
    var transition = function (css) {
	var prefixes = ['', '-moz-', '-webkit-', '-o-'];
	return css_prefixing(prefixes, "transition: " + css + ";\n", true);
    };
    var keyframes = function (name, start, finish) {
	var prefixes = ['@', '@-moz-', '@-webkit-'];
	var css = "";
	css += "keyframes " + name + " {\n";
	css += "    from {" + start + ";}\n";
	css += "    to {" + finish + ";}\n";
	css += "}\n";
	return css_prefixing(prefixes, css, false);
    };
    var animation = function (name) {
	var prefixes = ['', '-moz-', '-webkit-'];
	return css_prefixing(prefixes, "animation: " + name + ";\n", true);
    };
    var extra = "";
    extra += "<style type='text/css'>\n";
    extra += "body {\n";
    extra +=      transition("margin 1s");
    extra += "}\n";
    extra += "body.errata_tool {\n";
    extra += "    margin-top: 30px;\n";
    extra += "    padding-top: 10px;\n";
    extra += "}\n";
    extra += "del {\n";
    extra += "    background-color: #f4ada6;\n";
    extra += "    color: #7e0c00;\n";
    extra += "}\n";
    extra += "ins {\n";
    extra += "    background-color: #8eda81;\n";
    extra += "    color: black;\n";
    extra += "    text-decoration: none;\n";
    extra += "    text-shadow: 0px 0px 4px white, 0px 0px 4px white;\n";
    extra += "}\n";
    extra += "del, ins {\n";
    extra += "    border-radius: .5em;\n";
    extra += "    padding-left: .5em;\n";
    extra += "    padding-right: .5em;\n";
    extra += "}\n";
    extra += "del.clean {\n";
    extra += "    display: none;\n";
    extra += "}\n";
    extra += "ins.clean {\n";
    extra += "    background-color: transparent;\n";
    extra += "    color: #333;\n";
    extra += "    text-shadow: none;\n";
    extra += "    padding: 0px;\n";
    extra += "}\n";
    extra += "#annotation_toolbar {\n";
    extra += "    display: block;\n";
    extra += "    position: fixed;\n";
    extra += "    top: 0px;\n";
    extra += "    left: 0px;\n";
    extra += "    right: 0px;\n";
    extra += "    height: 30px;\n";
    extra += "    background-color: #222;\n";
    extra += "    color: #ccc;\n";
    extra += "    border-bottom: 1px solid #444;\n";
    extra += "    padding-left: 40px;\n";
    extra += "    padding-right: 40px;\n";
    extra += "    padding-top: 10px;\n";
    extra += "    padding-bottom: -10px;\n";
    extra += "    text-align: left;\n";
    extra += "}\n";
    extra += keyframes("reveal", "top: -31px", "top: 0px");
    extra += "#annotation_toolbar.reveal {\n";
    extra +=      animation("reveal 1s");
    extra += "}\n";
    extra += "</style>\n";
    extra += "<div id='annotation_toolbar'>Please wait...</div>\n";




    // * --- Cache the modified page and setup the toolbar controls --- * //

    $.getJSON(ANNO.errata_json(), function (errata) {
	if (!errata || errata.length == 0) {
	    return;
	}
	else {
	    document.body.innerHTML += extra;
	    cache.errata_free = document.body.innerHTML;
	}
	var rewrite = function (path, html, attrs) {
	    var node = $(path)[0];
	    if (!!node) {
		if (!!attrs) {
		    for (var i=0; i<attrs.length; i+=1) {
			node.setAttribute(attrs[i][0], attrs[i][1]);
		    }
		}
		if (!!html) {
		    node.innerHTML = html;
		}
	    }
	    else {
		console.warn("Selector not found: " + path);
	    }
	};	
	for (var i=0; i<errata.length; i+=1) {
	    rewrite(
		errata[i][0], 
		errata[i][1], 
		errata[i][2] //might be undefined
	    );
	}

	cache.errata_applied = document.body.innerHTML;
	var view_data = {
	    "applied_errata" : {
		"name" : "Apply Errata",
		"cache" : cache.errata_applied,
		"caption" : "Errata has been applied to the text below.",
		"actions" : ["annotated_errata", "original_page"],
		"extra" : function () {
		    $("del, ins").addClass("clean");
		},
	    },
	    "annotated_errata" : {
		"name" : "Highlight Errata",
		"cache" : cache.errata_applied,
		"caption" : "Errata has been applied to the text below.",
		"actions" : ["applied_errata", "original_page"],
	    },
	    "original_page" : {
		"name" : "Remove Errata",
		"cache" : cache.errata_free,
		"caption" : "Below is the original license.",
		"actions" : ["applied_errata"],
	    }
	};
	ANNO.apply_view = function (view_name) {
	    // retrieve view configuration
	    var select = view_data[view_name];
	    
	    // display a cached version of the page
	    document.body.innerHTML = select.cache;
	    
	    // run any post processing code
	    if (!!select.extra) {
		select.extra();
	    }
	    
	    // regenerate the toolbar
	    var scratch = select.caption;
	    scratch += "<span style='float:right;'>"
	    for (var a=0; a<select.actions.length; a+=1) {
		var action = select.actions[a];
		if (a !== 0) {
		    scratch += " - ";
		}
		scratch += "<a href=\"javascript:ANNO.apply_view('";
		scratch += action + "');\">";
		scratch += view_data[action].name + "</a>";
	    }
	    scratch += "</span>";
	    document.getElementById("annotation_toolbar").innerHTML = scratch;
	};
	
	// Activate the default view:
	ANNO.apply_view("applied_errata");
	$('body').addClass("errata_tool");
	$("#annotation_toolbar").addClass("reveal");
    });
});

(function () {
    // Compensates for inconsistent browser behavior :(

    var setup = function setup () {
	// wait for jquery
	if (!!window.console && !!ANNO.DEBUG) {
	    console.info("Waiting for jquery...");
	}
	if (!!window.$) {
	    $(document).ready(ANNO.init());
	}
	else {
	    setTimeout(setup, 100);
	}
    }
    if (!!window.addEventListener) {
	window.addEventListener("load", setup);
    }
    else if (!!window.$) {
	$(document).ready(ANNO.init());
    }
    else {
	setup();
    }
})();