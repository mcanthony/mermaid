/**
 * Created by knut on 14-11-23.
 */
var log = require('./logger').create();
/**
 * @function detectType
 * Detects the type of the graph text.
 * ```mermaid
 * graph LR
 *  a-->b
 *  b-->c
 *  c-->d
 *  d-->e
 *  e-->f
 *  f-->g
 *  g-->h
 * ```
 *
 * @param {string} text The text defining the graph
 * @param {string} text The second text defining the graph
 * @returns {string} A graph definition key
 */
module.exports.detectType = function(text,a){
    if(text.match(/^\s*sequenceDiagram/)){
        return "sequenceDiagram";
    }

    if(text.match(/^\s*sequence/)){
    /* ```mermaid
     graph TB
        a-->b
        b-->c
        ``` 
     */
        return "sequence";
    }

    if(text.match(/^\s*digraph/)) {
        //log.debug('Detected dot syntax');
        return "dotGraph";
    }

    if(text.match(/^\s*info/)) {
        //log.debug('Detected info syntax');
        return "info";
    }

    if(text.match(/^\s*gantt/)) {
        //log.debug('Detected info syntax');
        return "gantt";
    }

    return "graph";
};

/**
 * Copies all relevant CSS content into the graph SVG.
 * This allows the SVG to be copied as is while keeping class based styling
 * @param {element} svg The root element of the SVG
 * @param {object} Hash table of class definitions from the graph definition
 */
module.exports.cloneCssStyles = function(svg, classes){
    var usedStyles = "";
    var sheets = document.styleSheets;
    for (var i = 0; i < sheets.length; i++) {
        // Avoid multiple inclusion on pages with multiple graphs
        if (sheets[i].title !== 'mermaid-svg-internal-css') {
            try {

                var rules = sheets[i].cssRules;
                if (rules !== null) {
                    for (var j = 0; j < rules.length; j++) {
                        var rule = rules[j];
                        if (typeof(rule.style) !== 'undefined') {
                            var elems;
                            elems = svg.querySelectorAll(rule.selectorText);
                            if (elems.length > 0) {
                                usedStyles += rule.selectorText + " { " + rule.style.cssText + " }\n";
                            }
                        }
                    }
                }
            }
            catch(err) {
                if(typeof console !== 'undefined'){
                    if(console.warn !== 'undefined'){
                        if(rule !== 'undefined'){
                            console.warn('Invalid CSS selector "' + rule.selectorText + '"', err);
                        }
                    }
                }
            }
        } 
    }

    var defaultStyles = "";
    var embeddedStyles = "";

    for (var className in classes) {
        if (classes.hasOwnProperty(className) && typeof(className) != "undefined") {
            if (className === 'default') {
                if (classes.default.styles instanceof Array) {
                    defaultStyles += "#" + svg.id.trim() + ' .node' + '>rect { ' + classes[className].styles.join("; ") + '; }\n';
                }
                if (classes.default.nodeLabelStyles instanceof Array) {
                    defaultStyles += "#" + svg.id.trim() + ' .node text ' + ' { ' + classes[className].nodeLabelStyles.join("; ") + '; }\n';
                }
                if (classes.default.edgeLabelStyles instanceof Array) {
                    defaultStyles += "#" + svg.id.trim() + ' .edgeLabel text ' + ' { ' + classes[className].edgeLabelStyles.join("; ") + '; }\n';
                }
                if (classes.default.clusterStyles instanceof Array) {
                    defaultStyles += "#" + svg.id.trim() + ' .cluster rect ' + ' { ' + classes[className].clusterStyles.join("; ") + '; }\n';
                }
            } else {
                if (classes[className].styles instanceof Array) {
                    embeddedStyles += "#" + svg.id.trim() + ' .' + className + '>rect { ' + classes[className].styles.join("; ") + '; }\n';
                }
            }
        }
    }

    if (usedStyles !== "" || defaultStyles !== "" || embeddedStyles !== "") {
        var s = document.createElement('style');
        s.setAttribute('type', 'text/css');
        s.setAttribute('title', 'mermaid-svg-internal-css');
        s.innerHTML = "/* <![CDATA[ */\n";
        // Make this CSS local to this SVG
        if (defaultStyles !== "") {
            s.innerHTML += defaultStyles;
        }
        if (usedStyles !== "") {
            s.innerHTML += usedStyles;
        }
        if (embeddedStyles !== "") {
            s.innerHTML += embeddedStyles;
        }
        s.innerHTML += "/* ]]> */\n";
        svg.insertBefore(s, svg.firstChild);
    }
};
