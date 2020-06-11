/* Gamepad class */
const Gamepad = class {
    constructor(options) {
        options = options || {};

        // set the managers
        this.worker = new Gamepad.Worker();
        this.blocklyManager = new Gamepad.BlocklyManager(options);
        this.jsonManager = new Gamepad.JsonManager();

        this['magicJson'] = options['magicJson'] === true;
        this['highlight'] = options['customHighlight'] !== undefined;

        this.reset();
        this.worker.onRequest(this, this.onRequest);
    }

    // level getter
    get level() {
        return this.jsonManager.observer;
    }

    // level setter
    set level(level) {
        this.jsonManager.init([level]);
    }

    // levels getter
    get levels() {
        return this.jsonManager.observers;
    }

    // levels setter
    set levels(levels) {
        if (!Array.isArray(levels))
            throw new Error('levels argument must be an array');
        this.jsonManager.init(levels);
    }

    // worker requests's handler
    onRequest(request, back, old) {
        // if the workspace has changed since the last time the code was loaded
        // the block is not highlighted
        if (!this.blocklyManager.isCoding && this.highlight) this.blocklyManager.setHighlight(request.id);

        // if the current level is finished and there's a forward 'START' request (must be forward) the next level is loaded
        // if there's only one level this method is never triggered
        if (request.method == Gamepad['STATES']['STARTED'] &&
            (this.state == Gamepad['STATES']['FINISHED'] || this.state == Gamepad['STATES']['COMPLETED']) &&
            !back) this.jsonManager.loadNext();

        // if the current level is started and there's a 'FINISHED' request (must be backward) the prior level is loaded
        // if there's only one level this method is never triggered
        if ((request.method == Gamepad['STATES']['FINISHED'] || request.method == Gamepad['STATES']['COMPLETED']) &&
            this.state == Gamepad['STATES']['STARTED'] &&
            back) this.jsonManager.loadPrior();

        // if the request is not old and magicJson is enabled
        if (this['magicJson'] && old && request.method != Gamepad['STATES']['COMPLETED']) {
            // if it's a backward request
            if (back)
                // unload the changes
                this.jsonManager.unloadChanges();
            // if this is a forward request
            else
                // load the changes
                this.jsonManager.loadChanges();
        }

        // send the request to the game
        let result = this.game(request, back, old);

        // update the state 
        if (request.method == Gamepad['STATES']['STARTED'] ||
            request.method == Gamepad['STATES']['FINISHED'] ||
            request.method == Gamepad['STATES']['COMPLETED']
        ) this.state = request.method;

        // if there's the json manager and the request is not old the changes are saved
        if (this['magicJson'] && !old && request.method != Gamepad['STATES']['COMPLETED'])
            this.jsonManager.commit();

        // return the game result
        return result;
    }

    // set the requests's handler
    setGame(thisArg, method) {
        // it must be a function
        if (typeof method != 'function') throw new Error('method is not a function');

        this.game = function () {
            return method.apply(thisArg, [...arguments]);
        }
    }

    // load the code n times
    load(times) {
        // reset the state of the game
        this.state = Gamepad['STATES']['STARTED'];

        // if times is setted it must be a number greater than 0
        if ((times !== undefined) && (isNaN(times) || times < 1))
            throw new Error('times must be a number greater than 0.');

        // if times is not setted load code 1 times
        times = times || 1;

        // reset the workspace
        this.worker.reset();
        // get the code
        let code = this.blocklyManager.code(times);

        // reset the jsonManager
        this.jsonManager.reset();

        // load the code
        Gamepad.evalContext(code, this.worker.getInstance());

        // return the blocks number
        return this.blocklyManager.getBlocksNumber();
    }

    // reset the gamepad
    reset() {
        // reset the state of the game
        this.state = Gamepad['STATES']['STARTED'];
        // reset the jsonManager
        this.jsonManager.reset();
        // reset the worker
        this.worker.reset();
        // reset the blocklyManager
        this.blocklyManager.reset();
    }

    // update the toolbox
    setToolbox(options) {
        this.blocklyManager.setToolbox(options);
    }

    // generate a forward request
    forward() {
        // stop the worker if it was running
        this.worker.stop();
        // send a forward request
        return this.worker.go(false);
    }

    // create a backward request
    backward() {
        // stop the worker if it was running
        this.worker.stop();
        // send a backward request
        return this.worker.go(true);
    }

    // play the game (back ? backward : forward)
    play(back) {
        // remove the breakpoint
        this.worker.removeBreakpoint();
        // free the queue of requests
        this.worker.freeQueue();
        // start the worker
        this.worker.start(back);
    }

    // pause the game
    pause() {
        // stop the worker
        this.worker.stop();
        // free the queue of requests
        this.worker.freeQueue();
    }

    // toggle play
    togglePlay() {
        if (this.worker.isRunning) this.pause();
        else this.play(this.worker.back);
    }

    // reach a breakpoint
    debug(id, back) {
        let promise = this.worker.setBreakpoint(id);
        this.worker.start(back);
        return promise;
    }

    // save the workspace
    save(name) {
        this.blocklyManager.save(name);
    }

    // restore the workspace
    restore(name) {
        this.blocklyManager.restore(name);
    }

    // version
    static version() {
        return '1.0.1';
    }
}

/* Gamepad symbol */
// a global symbol (used in Observer and Asynchronizer classes)
Gamepad['SYMBOL'] = Symbol('blockly-gamepad');

/* Gamebad toolbox */
// will contain a json that represent the toolbox
Gamepad['TOOLBOX'] = {}

/* Gamebad context */
// global context that the code generator can access
Gamepad['CONTEXT'] = {}

/* Gamebad inputs */
// will contain some inputs
Gamepad['INPUTS'] = {}

/* Gamepad errors */
// strings that represents errors
Gamepad['ERRORS'] = {
    // this error means that the instance that throw it has been resetted
    // used by Asynchronizer and the Queue
    'CLOSED': 'CLOSED',
    // this error is throwed by the Worker to end a level
    'FINISHED': 'FINISHED',
    // this error is throwed by the Worker to end all the levels
    'COMPLETED': 'COMPLETED'
}

/* Gamepad states */
// states are passed in the request .method field
Gamepad['STATES'] = {
    // a level is started
    'STARTED': 'STARTED',
    // a level is finished
    'FINISHED': 'FINISHED',
    // all the levels are finished
    'COMPLETED': 'COMPLETED'
}

/* Gamepad blocks */
Gamepad['BLOCKS'] = {
    // the type of the start block
    'START': 'start'
}

/* Gamepad templates */
// templates are used to generate custom blocks
Gamepad['TEMPLATES'] = {
    'WHILE': 'while',
    'DO_WHILE': 'do_while',
    'IF': 'if',
    'IF_ELSE': 'if_else'
}

/* Gamepad utils */
Gamepad.utils = {
    /* xml to json */
    xml2json: function (xml, tab) {
        var X = {
            toObj: function (xml) {
                var o = {}
                if (xml.nodeType == 1) {
                    if (xml.attributes.length)
                        for (var i = 0; i < xml.attributes.length; i++)
                            o["@" + xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || "").toString();
                    if (xml.firstChild) {
                        var textChild = 0,
                            cdataChild = 0,
                            hasElementChild = false;
                        for (var n = xml.firstChild; n; n = n.nextSibling) {
                            if (n.nodeType == 1) hasElementChild = true;
                            else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++;
                            else if (n.nodeType == 4) cdataChild++;
                        }
                        if (hasElementChild) {
                            if (textChild < 2 && cdataChild < 2) {
                                X.removeWhite(xml);
                                for (var n = xml.firstChild; n; n = n.nextSibling) {
                                    if (n.nodeType == 3)
                                        o["#text"] = X.escape(n.nodeValue);
                                    else if (n.nodeType == 4)
                                        o["#cdata"] = X.escape(n.nodeValue);
                                    else if (o[n.nodeName]) {
                                        if (o[n.nodeName] instanceof Array)
                                            o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                        else
                                            o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                                    } else
                                        o[n.nodeName] = X.toObj(n);
                                }
                            } else {
                                if (!xml.attributes.length)
                                    o = X.escape(X.innerXml(xml));
                                else
                                    o["#text"] = X.escape(X.innerXml(xml));
                            }
                        } else if (textChild) {
                            if (!xml.attributes.length)
                                o = X.escape(X.innerXml(xml));
                            else
                                o["#text"] = X.escape(X.innerXml(xml));
                        } else if (cdataChild) {
                            if (cdataChild > 1)
                                o = X.escape(X.innerXml(xml));
                            else
                                for (var n = xml.firstChild; n; n = n.nextSibling)
                                    o["#cdata"] = X.escape(n.nodeValue);
                        }
                    }
                    if (!xml.attributes.length && !xml.firstChild) o = null;
                } else if (xml.nodeType == 9) {
                    o = X.toObj(xml.documentElement);
                }
                return o;
            },
            toJson: function (o, name, ind) {
                var json = name ? ("\"" + name + "\"") : "";
                if (o instanceof Array) {
                    for (var i = 0, n = o.length; i < n; i++)
                        o[i] = X.toJson(o[i], "", ind + "\t");
                    json += (name ? ":[" : "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]";
                } else if (o == null)
                    json += (name && ":") + "null";
                else if (typeof (o) == "object") {
                    var arr = [];
                    for (var m in o)
                        arr[arr.length] = X.toJson(o[m], m, ind + "\t");
                    json += (name ? ":{" : "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}";
                } else if (typeof (o) == "string")
                    json += (name && ":") + "\"" + o.toString() + "\"";
                else
                    json += (name && ":") + o.toString();
                return json;
            },
            innerXml: function (node) {
                var s = ""
                if ("innerHTML" in node)
                    s = node.innerHTML;
                else {
                    var asXml = function (n) {
                        var s = "";
                        if (n.nodeType == 1) {
                            s += "<" + n.nodeName;
                            for (var i = 0; i < n.attributes.length; i++)
                                s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
                            if (n.firstChild) {
                                s += ">";
                                for (var c = n.firstChild; c; c = c.nextSibling)
                                    s += asXml(c);
                                s += "</" + n.nodeName + ">";
                            } else
                                s += "/>";
                        } else if (n.nodeType == 3)
                            s += n.nodeValue;
                        else if (n.nodeType == 4)
                            s += "<![CDATA[" + n.nodeValue + "]]>";
                        return s;
                    }
                    for (var c = node.firstChild; c; c = c.nextSibling)
                        s += asXml(c);
                }
                return s;
            },
            escape: function (txt) {
                return txt.replace(/[\\]/g, "\\\\")
                    .replace(/[\"]/g, '\\"')
                    .replace(/[\n]/g, '\\n')
                    .replace(/[\r]/g, '\\r');
            },
            removeWhite: function (e) {
                e.normalize();
                for (var n = e.firstChild; n;) {
                    if (n.nodeType == 3) {
                        if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) {
                            var nxt = n.nextSibling;
                            e.removeChild(n);
                            n = nxt;
                        } else
                            n = n.nextSibling;
                    } else if (n.nodeType == 1) {
                        X.removeWhite(n);
                        n = n.nextSibling;
                    } else
                        n = n.nextSibling;
                }
                return e;
            }
        }
        if (xml.nodeType == 9)
            xml = xml.documentElement;
        var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
        return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
    },
    /* json to xml */
    json2xml: function (o, tab) {
        var toXml = function (v, name, ind) {
            var xml = "";
            if (v instanceof Array) {
                for (var i = 0, n = v.length; i < n; i++)
                    xml += ind + toXml(v[i], name, ind + "\t") + "\n";
            } else if (typeof (v) == "object") {
                var hasChild = false;
                xml += ind + "<" + name.toLowerCase();
                for (var m in v) {
                    if (m.charAt(0) == "@")
                        xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
                    else
                        hasChild = true;
                }
                xml += hasChild ? ">" : "/>";
                if (hasChild) {
                    for (var m in v) {
                        if (m == "#text")
                            xml += v[m];
                        else if (m == "#cdata")
                            xml += "<![CDATA[" + v[m] + "]]>";
                        else if (m.charAt(0) != "@")
                            xml += toXml(v[m], m, ind + "\t");
                    }
                    xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "") + "</" + name.toLowerCase() + ">";
                }
            } else {
                xml += ind + "<" + name + ">" + v.toString() + "</" + name + ">";
            }
            return xml;
        },
            xml = "";
        for (var m in o)
            xml += toXml(o[m], m.toString().toLowerCase(), "");
        return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
    },
    /* filter the toolbox json */
    filter: function (json, options) {
        let hasCategory = false,
            hasBlock = false;

        // show/hide PROCEDURE custom category
        if (json['@custom'] == "PROCEDURE") {
            return options.procedure !== false;
        }

        // show/hide VARIABLE custom category
        if (json['@custom'] == "VARIABLE") {
            return options.variable !== false;
        }

        if (json.CATEGORY) {
            let i;
            for (i = 0; i < json.CATEGORY.length; i++) {
                if (!Gamepad.utils.filter(json.CATEGORY[i], options)) {
                    json.CATEGORY.splice(i, 1);
                    i--;
                }
            }

            // there's at least one category
            if (i > 0) hasCategory = true;
        }

        if (json.BLOCK) {
            let i;
            for (i = 0; i < json.BLOCK.length; i++) {
                // if the block has to be visualized
                if (!options.blocks.includes(json.BLOCK[i]['@type'])) {
                    json.BLOCK.splice(i, 1);
                    i--;
                }
            }

            // there's at least one block
            if (i > 0) hasBlock = true;
        }

        // there's something to render in the toolbox
        return hasCategory || hasBlock;
    },
    /* block generator */
    blocks: function (blocks) {
        let jsonArray = [];

        for (let type in blocks) {
            let block = blocks[type],
                hasStatements = false,
                hastemplate = false;

            if ('statements' in block) {
                // statements must be an array of string
                if (!Array.isArray(block.statements) || block.statements.length == 0)
                    throw new Error('statements must be an array of string');

                hasStatements = true;
            }

            if ('template' in block) {
                // template must be one of the Gamepad['TEMPLATES']
                if (!Object.values(Gamepad['TEMPLATES']).includes(block.template))
                    throw new Error('template must be one of Gamepad[\'TEMPLATES\']');

                hastemplate = true;
            }

            // a block must have both or none
            if (hastemplate && !hasStatements) throw new Error('a template block require at least a statement');
            if (!hastemplate && hasStatements) throw new Error('statements setted without the template');

            // load the javascript
            Blockly.JavaScript['' + type] = Gamepad.utils.js(block.method, block.args, block.order, block.template, block.statements);

            // init the block with the json or the javascript
            if ('json' in block) {
                block.json.type = type;
                jsonArray.push(block.json);
            } else if ('javascript' in block) {
                Blockly.Blocks[type] = block.javascript;
            }
        }

        Blockly.defineBlocksWithJsonArray(jsonArray);
    },
    /* wrap standard blocks to generate requests */
    wrap: function (blocks) {
        if (!Array.isArray(blocks)) throw new Error('blocks must be an array of block types');

        for (let type of blocks) {
            if (!(type in Blockly.JavaScript)) throw new Error('The following type does not exist: ' + type);

            let oldGenerator = Blockly.JavaScript[type];

            switch (type) {
                // procedures wrap
                case 'procedures_defnoreturn': ;
                case 'procedures_defreturn': Blockly.JavaScript[type] = function (a) {
                    var b = Blockly.JavaScript.variableDB_.getName(a.getFieldValue("NAME"), Blockly.Procedures.NAME_TYPE),
                        c = Blockly.JavaScript.statementToCode(a, "STACK");
                    if (Blockly.JavaScript.STATEMENT_PREFIX) {
                        var d = a.id.replace(/\$/g, "$$$$");
                        c = Blockly.JavaScript.prefixLines(Blockly.JavaScript.STATEMENT_PREFIX.replace(/%1/g, "'" + d + "'"), Blockly.JavaScript.INDENT) + c
                    }
                    Blockly.JavaScript.INFINITE_LOOP_TRAP && (c = Blockly.JavaScript.INFINITE_LOOP_TRAP.replace(/%1/g, "'" + a.id + "'") +
                        c);
                    (d = Blockly.JavaScript.valueToCode(a, "RETURN", Blockly.JavaScript.ORDER_NONE) || "") && (d = Blockly.JavaScript.INDENT + "return " + d + ";\n");
                    for (var e = [], f = 0; f < a.arguments_.length; f++) e[f] = Blockly.JavaScript.variableDB_.getName(a.arguments_[f], Blockly.Variables.NAME_TYPE);

                    c = "async function " + b + "(" + e.join(", ") + ") {\n" +
                        Gamepad.utils.request(type, [b], a.id) +
                        c + d + "\n" +
                        "}";
                    c = Blockly.JavaScript.scrub_(a, c);
                    Blockly.JavaScript.definitions_["%" + b] = c;

                    return null
                }; break;
                // default wrap
                default: Blockly.JavaScript[type] = function (block) {
                    let result = oldGenerator.apply(this, [...arguments]),
                        request = Gamepad.utils.request(type, [], block.id);

                    // if there's a order
                    Array.isArray(result)
                        ? result[0] = request.slice(0, -1) + '.then(async () => ' + result[0] + ' )\n'
                        : result = request + result;

                    return result;
                }
            }
        }
    },
    /* build a request object */
    build: function (method, args, id, data) {
        // check the arguments
        if (typeof method != 'string') method = '';
        if (!Array.isArray(args)) args = [];
        if (typeof method != 'string') id = '';

        return data ? { method, args, id, data } : { method, args, id }
    },
    /* request string builder */
    request: function (method, args, id, order) {
        // check the arguments
        let request = Gamepad.utils.build(method, args, id);

        method = `method: \'${request.method}\'`;
        args = `args: ${JSON.stringify(request.args)}`;
        id = `id: \'${request.id}\'`;

        // build the request
        let result = `await worker.setRequest({ ${method}, ${args}, ${id} })\n`;

        return (order != undefined) ? [result, order] : result;
    },
    /* javascript string builder */
    js: function (method, args, order, template, statements) {
        // check the arguments
        args = Array.isArray(args) ? args : [];
        statements = Array.isArray(statements) ? statements : [];

        // code generator function
        return function (block) {
            let _args = [],
                _statements = [];

            // build the args
            for (let arg of args) {
                let get = (typeof arg.get == 'function') ? arg.get : _ => _;

                // field
                if (arg.field != undefined) {
                    _args.push(get(block.getFieldValue(arg.field)));
                    // input
                } else if (arg.input != undefined) {
                    _args.push(get(Gamepad['INPUTS'][arg.input]));
                    // value
                } else if (arg.value != undefined) {
                    _args.push(get(arg.value));
                }
            }

            // get the code from the input_statement fields
            for (let statement of statements) {
                _statements.push(Blockly.JavaScript.statementToCode(block, statement));
            }

            // build the template
            switch (template) {
                case Gamepad['TEMPLATES']['WHILE']:
                    return 'while(' + Gamepad.utils.request(method, _args, block.id) + '){\n' + _statements[0] + '}';
                case Gamepad['TEMPLATES']['DO_WHILE']:
                    return 'do{' + _statements[0] + '}while{\n' + Gamepad.utils.request(method, _args, block.id) + '}';
                case Gamepad['TEMPLATES']['IF']:
                    return 'if(' + Gamepad.utils.request(method, _args, block.id) + '){\n' + _statements[0] + '}';
                case Gamepad['TEMPLATES']['IF_ELSE']:
                    return 'if(' + Gamepad.utils.request(method, _args, block.id) + '){\n' + _statements[0] + '}else{' + _statements[1] + '}';
                // simple request
                default:
                    return Gamepad.utils.request(method, _args, block.id, order);
            }
        }
    },
    /* code string builder */
    code: function (code, times) {
        // throwing Gamepad["ERRORS"]["FINISHED"] will end a level
        // throwing Gamepad["ERRORS"]["COMPLETED"] will end all the levels

        //  try{
        //
        //      try{
        //          await worker.setRequest({method: Gamepad["STATES"]["STARTED"], id: Gamepad["STATES"]["STARTED"]});
        //          ...
        //          await worker.setRequest({method: Gamepad["STATES"]["FINISHED"], id: Gamepad["STATES"]["FINISHED"]});
        //      }catch(error){ 
        //          if(error != Gamepad["ERRORS"]["FINISHED"]) throw error; 
        //      }
        //
        //      try{
        //          await worker.setRequest({method: Gamepad["STATES"]["STARTED"], id: Gamepad["STATES"]["STARTED"]});
        //          ...
        //          await worker.setRequest({method: Gamepad["STATES"]["FINISHED"], id: Gamepad["STATES"]["FINISHED"]});
        //      }catch(error){ 
        //          if(error != Gamepad["ERRORS"]["FINISHED"]) throw error; 
        //      }
        //
        //      await worker.setRequest({method: Gamepad["STATES"]["COMPLETED"], id: Gamepad["STATES"]["COMPLETED"]});
        //
        //  }catch(error){
        //      if(error != Gamepad["ERRORS"]["COMPLETED"]) throw error;
        //  }

        code = ('try {\n' +
            Gamepad.utils.request(Gamepad['STATES']['STARTED'], [], Gamepad['STATES']['STARTED']) +
            code +
            Gamepad.utils.request(Gamepad['STATES']['FINISHED'], [], Gamepad['STATES']['FINISHED']) +
            '} catch(error) { if(error != Gamepad["ERRORS"]["FINISHED"]) throw error; }\n').repeat(times);

        return ('async function f() {\n' +
            '   try{\n' +
            code +
            // send the COMPLETED request only if there are more levels
            (times > 1 ? Gamepad.utils.request(Gamepad['STATES']['COMPLETED'], [], Gamepad["STATES"]["COMPLETED"]) : '') +
            '       worker.close();\n' +
            '   }catch(error){ if(error != Gamepad["ERRORS"]["COMPLETED"]) { throw error; } }\n' +
            '   }\n' +
            'f();');
    },
    /* promise wrapper */
    promiseWrapper: function () {

        let resolve,
            promise = new Promise(res => {
                resolve = res
            });

        var isPending = true;
        var isFulfilled = false;

        // if the promise is fulfilled
        promise.isFulfilled = function () {
            return isFulfilled;
        }
        // if the promise is pending
        promise.isPending = function () {
            return isPending;
        }
        // resolve the promise
        promise.resolve = function (value) {
            isPending = false;
            isFulfilled = true;
            resolve(value);
        }

        return promise;
    },
    /* error handler */
    errorHandler: function (error) {
        if (error !== Gamepad['ERRORS']['CLOSED'])
            throw error;
    }
}

/* Gamepad settings loader */
Gamepad.setting = function () {
    // add clear method to the trashcan
    Blockly.Trashcan.prototype.clear = function () {
        this.contents_ = new Array();
    }

    // set scrollbar thickness
    Blockly.Scrollbar.scrollbarThickness = 12;

    // custom code generators for procedures
    Blockly.JavaScript.procedures_defreturn = function (a) {
        var b = Blockly.JavaScript.variableDB_.getName(a.getFieldValue("NAME"), Blockly.Procedures.NAME_TYPE),
            c = Blockly.JavaScript.statementToCode(a, "STACK");
        if (Blockly.JavaScript.STATEMENT_PREFIX) {
            var d = a.id.replace(/\$/g, "$$$$");
            c = Blockly.JavaScript.prefixLines(Blockly.JavaScript.STATEMENT_PREFIX.replace(/%1/g, "'" + d + "'"), Blockly.JavaScript.INDENT) + c
        }
        Blockly.JavaScript.INFINITE_LOOP_TRAP && (c = Blockly.JavaScript.INFINITE_LOOP_TRAP.replace(/%1/g, "'" + a.id + "'") +
            c);
        (d = Blockly.JavaScript.valueToCode(a, "RETURN", Blockly.JavaScript.ORDER_NONE) || "") && (d = Blockly.JavaScript.INDENT + "return " + d + ";\n");
        for (var e = [], f = 0; f < a.arguments_.length; f++) e[f] = Blockly.JavaScript.variableDB_.getName(a.arguments_[f], Blockly.Variables.NAME_TYPE);

        c = "async function " + b + "(" + e.join(", ") + ") {\n" +
            c + d + "\n" +
            "}";
        c = Blockly.JavaScript.scrub_(a, c);
        Blockly.JavaScript.definitions_["%" + b] = c;

        return null;
    }
    Blockly.JavaScript.procedures_defnoreturn = Blockly.JavaScript.procedures_defreturn;
    Blockly.JavaScript.procedures_callreturn = function (a) {
        for (var b = Blockly.JavaScript.variableDB_.getName(a.getFieldValue("NAME"), Blockly.Procedures.NAME_TYPE), c = [], d = 0; d < a.arguments_.length; d++) c[d] = Blockly.JavaScript.valueToCode(a, "ARG" + d, Blockly.JavaScript.ORDER_COMMA) || "null";
        return ["await " + b + "(" + c.join(", ") + ")", Blockly.JavaScript.ORDER_FUNCTION_CALL]
    }
    Blockly.JavaScript.procedures_callnoreturn = function (a) {
        for (var b = Blockly.JavaScript.variableDB_.getName(a.getFieldValue("NAME"), Blockly.Procedures.NAME_TYPE), c = [], d = 0; d < a.arguments_.length; d++) c[d] = Blockly.JavaScript.valueToCode(a, "ARG" + d, Blockly.JavaScript.ORDER_COMMA) || "null";
        return "await " + b + "(" + c.join(", ") + ");\n"
    }

    Blockly.JavaScript[Gamepad['BLOCKS']['START']] = function () {
        return '';
    }

    // set reserved words
    Blockly.JavaScript.addReservedWords('Blockly,CONTEXT,worker,code,reject,resolve,f');

    // define the start block
    Blockly.defineBlocksWithJsonArray([{
        "type": Gamepad['BLOCKS']['START'],
        "message0": "Start",
        "deletable_": false,
        "lastDummyAlign0": "CENTRE",
        "nextStatement": null,
        "style": "hat_blocks"
    }]);
}

/* Gamepad init function */
Gamepad.init = function (options) {
    if (!Blockly) throw new Error('Blockly library not included');
    if (!Blockly.hasOwnProperty('JavaScript')) throw new Error('JavaScript generator library not included');

    // options check
    if (options === undefined) throw new Error('options must not be undefined');

    // load the inputs
    if (options.hasOwnProperty('inputs')) this['INPUTS'] = options.inputs;
    // load the toolbox
    if (options.hasOwnProperty('toolbox')) this['TOOLBOX'] = Gamepad.utils.xml2json(options.toolbox, "");
    // load the context
    if (options.hasOwnProperty('context')) this['CONTEXT'] = options.context;

    // load the blocks
    if (options.hasOwnProperty('blocks')) Gamepad.utils.blocks(options.blocks, "");
    // wrap standar blocks
    if (options.hasOwnProperty('wrap')) Gamepad.utils.wrap(options.wrap, "");
}

/* Gamepad BlocklyManager */
// this class manage the workspace and the code generation
Gamepad.BlocklyManager = class {
    constructor(options) {
        options = options || {}

        // if someone is changing the workspace
        this.isCoding = false;
        // if use the strat block
        this.start = options.start === true;
        // set custom highlight
        this.customHighlight = options.customHighlight === true;
        // set the workspace, default is Blockly.getMainWorkspace()
        this.workspace = options.workspace || Blockly.getMainWorkspace();

        this.workspace.addChangeListener((event) => {
            if (event.type == Blockly.Events.BLOCK_MOVE) {
                // update codinge state and remove block highlight
                if (!this.isCoding) this.removeHighlight();
                this.isCoding = true;
            }
        });

        this.reset();
    }

    // get the code
    code(times) {
        // update coding state
        this.isCoding = false;
        // clear the workspace
        if (this.start) this.clear();

        // get the code
        let code = Blockly.JavaScript.workspaceToCode(this.workspace);
        code = Gamepad.utils.code(code, times);

        return code;
    }

    // clear the workspace
    clear() {
        let blocks = this.workspace.getTopBlocks();
        // remove all the blocks expect the start block and the functions
        for (let block of blocks) {
            if (!block.type.includes('procedures_def') && (!this.start || (block.type != Gamepad['BLOCKS']['START'])))
                block.dispose(false);
        }
    }

    // reset the workspace
    reset() {
        this.workspace.clear();
        setTimeout(() => {
            // clear the trashcan
            if (this.workspace.trashcan) this.workspace.trashcan.clear();
        });

        // if start is enabled the block is generated
        if (this.start) {
            this.parentBlock = this.workspace.newBlock(Gamepad['BLOCKS']['START'], Gamepad['STATES']['STARTED']);
            this.parentBlock.setDeletable(false);
            this.parentBlock.startHat_ = true;
            this.parentBlock.initSvg();
            this.parentBlock.render();
            this.parentBlock.setMovable(false);
            this.parentBlock.moveBy(20, 20);
        }

        this.workspace.scrollX = 15;
        this.workspace.scrollY = 15;

        // avoid ctrl+z to restore the old workspace
        this.workspace.undoStack_ = [];
    }

    // update the toolbox
    setToolbox(options) {
        if (!options) return;
        // get the toolbox object
        let toolbox = JSON.parse(Gamepad['TOOLBOX']);

        // show some blocks
        if ('blocks' in options) {
            if (!Array.isArray(options.blocks)) throw new Error('options.blocks must be an array.');

            // filter the json
            Gamepad.utils.filter(toolbox.XML, options);

            this.workspace.updateToolbox(Gamepad.utils.json2xml(toolbox));
            // show all blocks
        } else if ('all' in options) {
            this.workspace.updateToolbox(Gamepad.utils.json2xml(toolbox));
        }
    }

    // highlight a block
    setHighlight(id) {
        if (this.customHighlight) {
            this.removeHighlight();
            try {
                document.querySelector("[data-id='" + id + "']").classList.add('blocklySelected');
            } catch (error) { }
        } else {
            this.workspace.highlightBlock(id);
        }
    }

    // remove the highlight from all the blocks
    removeHighlight() {
        if (this.customHighlight) {
            let blocks = document.getElementsByClassName("blocklySelected");
            for (let i = blocks.length; i > 0; i--) blocks[i - 1].classList.remove('blocklySelected');
        } else {
            this.workspace.highlightBlock();
        }
    }

    // get the blocks number { total: 10, move_up: 2, ...}
    getBlocksNumber() {
        let blocks = this.workspace.getAllBlocks(),
            result = {
                total: 0
            }

        for (let block of blocks) {
            if (result[block.type] == undefined) result[block.type] = 0;
            result[block.type]++;
            result.total++;
        }

        return result;
    }

    // save the workspace in the local storage
    save(name) {
        if (typeof (Storage) !== "undefined") {
            let xml = Blockly.Xml.workspaceToDom(this.workspace);
            localStorage.setItem(name, Blockly.Xml.domToText(xml));
        }
    }

    // restore the workspace from the local storage
    restore(name) {
        if (typeof (Storage) !== "undefined") {
            if (localStorage.getItem(name) != null) {
                this.workspace.clear();
                try {
                    let xml = Blockly.Xml.textToDom(localStorage.getItem(name));
                    Blockly.Xml.domToWorkspace(xml, this.workspace);
                } catch (error) {
                    this.reset()
                }
            }

            if (this.workspace.trashcan)
                this.workspace.trashcan.clear();

            if (this.start) {
                let blocks = this.workspace.getTopBlocks();

                for (let block of blocks) {
                    if (block.type == Gamepad['BLOCKS']['START']) return;
                }

                this.reset();
            }
        }
    }

    // resize the workspace
    resize() {
        Blockly.svgResize(this.workspace);
    }
}

/* Gamepad History */
// this class manage a simple history of events
Gamepad.History = class {
    constructor() {
        this.reset();
    }

    // get the length
    get length() {
        return this.history.length;
    }

    // add an event
    add(event, update) {
        // remove the events after the current
        this.history.splice(this.index + 1);
        // push the event
        this.history.push(event);
        // update the index
        if (update) this.index = this.length - 1;
    }

    // update the current element and return it
    get next() {
        if (this.index < this.length - 1)
            return this.history[++this.index];
    }

    // update the current element and return it
    // if the current is the first one it becomes undefined
    get prior() {
        if (this.index > -1)
            return this.history[--this.index];
    }

    // get the current event
    get current() {
        if (this.index > -1) return this.history[this.index];
    }

    // reset
    reset() {
        this.index = -1;
        this.history = [];
    }
}

/* Gamepad Queue */
// this class manage an asynchronous queue
Gamepad.Queue = class {
    constructor() {
        // requests
        this.requests = [];
        // if the queue is closed
        this.closed = false;
        // set the listener
        this.setListener();
    }

    // set the listener, once a request is setted the listener is resolved
    setListener() {
        // set the listener
        this.listener = new Promise((resolve, reject) => {
            // once a request has been setted this method is called and the listener will manage the get function
            this.setted = (options) => {
                // if there's no options a request has been setted and can be returned by the get method
                if (!options) return resolve();
                // if the queue has been closed the get method will return undefined
                if (options.close) return resolve(true);
                // if the queue has been resetted throw the closed error
                if (options.reset) return reject(Gamepad['ERRORS']['CLOSED']);

                resolve();
            }
        });

        // wrap it to avoid the console.error if it'll be rejected
        this.listener.then(() => { }, () => { });
    }

    // reset the queue
    reset() {
        this.requests = [];
        this.closed = false;

        // resolve the listener with the reset event
        this.setted({
            reset: true
        });
        // set the listener
        this.setListener();
    }

    // close the queue, get function will return undefined
    close() {
        this.closed = true;
        // resolve the listener with the close event
        this.setted({
            close: true
        });
    }

    // open the queue, get function will work normally
    open() {
        this.closed = false;
    }

    // get the current request
    //
    // if there's no request the set event is awaited
    //
    // if there are more calls to this method when the request is not setted 
    // all the callers will receive the same result
    get() {
        // if the queue is closed return undefined
        if (this.closed) return Promise.resolve();

        // set the result and return it
        return this.listener.then(
            closed => {
                // if the queue is closed return undefined
                if (closed) {
                    this.setListener();
                    return;
                }
                // resolve the request
                let request = this.requests.shift();

                // set the listener
                this.setListener();
                // if there's at least one request resolve the listener
                if (this.requests.length != 0) this.setted();

                return request;
            }
        );
    }

    // set the request
    set(request) {
        this.requests.push(request);
        // if there's al least one request resolve the listener
        this.setted();
    }
}

/* Gamepad Asynchronizer */
// this class generate .async instances of a given target
Gamepad.Asynchronizer = class {
    constructor(sync, onRun, onReset) {
        this.sync = sync || {}
        this.async = {}
        this.onRun = onRun || function () { }
        this.onReset = onReset || function () { }

        // set the state
        this.state = Gamepad.utils.promiseWrapper();
        this.state.resolve();

        // the proxy handler
        this.handler = {
            // set the getter
            get: function (obj, prop) {
                // if has been resetted
                if (Object.getOwnPropertySymbols(obj).includes(Gamepad['SYMBOL']))
                    // throw Gamepad['ERRORS']['CLOSED']
                    throw Gamepad['ERRORS']['CLOSED'];
                else
                    // normal getter
                    return obj[prop];
            }
        }
    }

    // kill the .async instance
    reset() {
        // if the asynchronizer is resetting
        if (this.state.isPending()) return;

        // set the state
        this.state = Gamepad.utils.promiseWrapper();

        // set the symbol to check if the async has been resetted
        this.async[Gamepad['SYMBOL']] = true;

        // call the onReset function
        return this.onReset.apply(this.sync, [...arguments]);
    }

    // generate the .async instance
    run() {
        // if the asynchronizer is running
        if (this.state.isFulfilled()) return;

        // set the .async copying the properties
        this.async = new Proxy(this.sync && this.sync.prototype
            ? new this.sync()
            : Object.defineProperties(Object.assign({}, this.sync), Object.getOwnPropertyDescriptors(this.sync)), this.handler);

        // call the onRun
        let result = this.onRun.apply(this.async, [...arguments]);

        // if the result is a Promise
        if (result instanceof Promise) {
            return result.then(result => {
                // resolve the state
                this.state.resolve();
                // return the result
                return result;
            });
        } else {
            // resolve the listener
            this.state.resolve();
            // return the result
            return result;
        }
    }
}

/* Gamepad Worker */
// The worker manage the request from the blocks
Gamepad.Worker = function () {
    const asynchronizer = new Gamepad.Asynchronizer(
        {
            // history for the old requests
            history: new Gamepad.History(),
            // queue for forward/backward requests
            queue: new Gamepad.Queue(),
            // queue for blocks's requests
            requests: new Gamepad.Queue(),
            // debugger
            debugger: {
                // id of the block used as breakpoint
                id: null,
                // promise resolved on breakpoint reached
                promise: Gamepad.utils.promiseWrapper()
            },
            // if the worker is running
            isRunning: false,
            // running direction
            back: false,
            // create a forward/backward request
            go: function (back) {
                return new Promise(resolve => {
                    this.queue.set({
                        back: back === true,
                        resolve
                    });
                })
            },
            // free the queue
            freeQueue: function () {
                // get the requests
                this.queue.close();
                const requests = this.queue.requests;
                this.queue.reset();
                // resolve each request
                requests.forEach(request => request && request.resolve && request.resolve(false));
            },
            // start the worker
            start: function (back) {
                this.back = back === true;
                // if it is running
                if (this.isRunning) return;
                // update running state
                this.isRunning = true;
                // free the queue getter (.get())
                this.queue.close();
                this.queue.open();
            },
            // stop the worker
            stop: function () {
                this.isRunning = false;
                this.removeBreakpoint();
            },
            // set a request from the blocks
            setRequest: function (request) {
                return new Promise((resolve, reject) => {
                    this.requests.set({
                        request,
                        resolve,
                        reject
                    });
                });
            },
            // close the worker, requests are not passed anymore
            close: function () {
                this.requests.close();
            },
            // open the worker
            open: function () {
                this.requests.open();
            },
            // set as breakpoint the request with the passed id
            setBreakpoint: function (id) {
                if (id === undefined) return;
                if (id === null && this.debugger.id === null) return;
                // end old debugger
                if (this.debugger.promise.isPending())
                    this.debugger.promise.resolve(false);
                // set the debugger
                this.debugger.id = id;
                this.debugger.promise = Gamepad.utils.promiseWrapper();

                // don't return the wrapped promise
                return this.debugger.promise.then(result => result);
            },
            // remove the current breakpoint
            removeBreakpoint: function () {
                this.setBreakpoint(null);
            }
        },
        function () {
            // start the flow or requests
            const start = async () => {
                try {
                    while (true) {
                        // if is running load a forward request
                        // else get from the queue
                        let request = this.isRunning
                            ? { back: this.back }
                            : await this.queue.get() || { p: 'p', back: this.back }

                        // backward or forward
                        request.back
                            ? await backward()
                            : await forward();

                        // resolve the forward/backward request
                        if (request.resolve) request.resolve(true);
                    }
                } catch (error) {
                    // don't throw the error if the worker has been resetted
                    Gamepad.utils.errorHandler(error);
                }
            }

            // backward manager
            const backward = async () => {
                // get the request from the history
                let request = this.history.current;
                // load prior request
                this.history.prior;

                // the first history item is undefined
                if (request !== undefined) {
                    await this.manage(request, true, true);
                    // debug check
                    debug(request.id);
                } else {
                    this.stop();
                }
            }

            // forward manager
            const forward = async () => {
                let request, result;

                // if there's a request in the history
                if ((request = this.history.next) !== undefined) {
                    await this.manage(request, false, true);
                    // debug check
                    debug(request.id);
                    return;
                }

                // get the request from the queue
                request = await this.requests.get();

                // if the worker has been closed the request will be undefined
                if (request === undefined) {
                    this.stop();
                    return;
                }

                if (this.history.current) {
                    // it's possible that a block pass the 'FINISHED' state
                    // when it's passed the upcoming requests need to be killed until the next 'STARTED' state
                    if (this.history.current.method == Gamepad['STATES']['FINISHED']) {
                        if (request.request.method != Gamepad['STATES']['STARTED'] && request.request.method != Gamepad['STATES']['COMPLETED']) {
                            // throwing Gamepad['STATES']['FINISHED'] will kill all the requests until the next 'STARTED' state 
                            request.reject(Gamepad['ERRORS']['FINISHED']);
                            return;
                        }
                    }

                    // it's possible that a block pass the 'COMPLETED' state
                    // when it's passed all the requests need to be killed
                    if (this.history.current.method == Gamepad['STATES']['COMPLETED']) {
                        // throwing Gamepad['STATES']['COMPLETED'] will kill all the requests
                        request.reject(Gamepad['ERRORS']['COMPLETED']);
                        this.stop();
                        return;
                    }
                }

                // manage the request
                result = await this.manage(request.request, false, false);
                if (result === undefined) result = {}

                // add the request to the history
                this.history.add(request.request, true);

                // debug check
                debug(request.request.id);

                if (result.finished) {
                    // if result.finished reject the 'FINISHED' error
                    // all the upcoming requests are killed until the next 'STARTED' state
                    // the current request is now the 'FINISHED' one but it is not passed to the game
                    this.history.add(
                        Gamepad.utils.build(Gamepad['STATES']['FINISHED'], [], Gamepad['STATES']['FINISHED'], { generated: true }),
                        true
                    );
                    // load the request
                    this.history.next;

                    // debug check because that request is loaded but it is not passed to the game
                    debug(Gamepad['STATES']['FINISHED']);

                    // throw the error
                    request.reject(Gamepad['ERRORS']['FINISHED']);

                } else if (result.completed) {
                    // if result.finished reject the 'COMPLETED' error
                    // all the requests are killed
                    // the current request is now the 'COMPLETED' one but it is not passed to the game
                    this.history.add(
                        Gamepad.utils.build(Gamepad['STATES']['COMPLETED'], [], Gamepad['STATES']['COMPLETED'], { generated: true }),
                        true
                    );
                    // load the request
                    this.history.next;

                    // debug check because that request is loaded but it is not passed to the game
                    debug(Gamepad['STATES']['COMPLETED']);

                    // throw the error
                    request.reject(Gamepad['ERRORS']['COMPLETED']);

                    // close the worker
                    this.close();
                } else {
                    request.resolve(result.return);
                }
            }

            // debug check
            const debug = (id) => {
                if (this.debugger.id !== null && this.debugger.id == id) {
                    this.debugger.promise.resolve(true);
                    this.freeQueue();
                    this.stop();
                }
            }

            start();
        },
        function () {
            // free the queue
            this.freeQueue();
            // reset
            this.queue.reset();
            this.requests.reset();
            this.history.reset();
            // remove the breakpoint
            this.removeBreakpoint();
        });

    // methods
    Object.assign(this, {
        // reset
        reset: function () {
            asynchronizer.reset();
            asynchronizer.run();
        },
        // request manager
        onRequest: function (thisArg, method) {
            asynchronizer.sync.manage = function (request, back, old) {
                return method.apply(thisArg, [request, back, old]);
            }
        },
        // return the current async
        // the .async will be used by the code generators
        getInstance: function () {
            return asynchronizer.async;
        }
    });

    // link the async methods
    for (const method of [
        'go',
        'setRequest',
        'start',
        'stop',
        'close',
        'freeQueue',
        'setBreakpoint',
        'removeBreakpoint'
    ]) {
        this[method] = function () {
            let ac = asynchronizer.async;
            try {
                return ac[method].apply(ac, [...arguments]);
            } catch (error) {
                Gamepad.utils.errorHandler(error);
            }
        }
    }

    // link the async properties
    for (const property of [
        'isRunning',
        'back'
    ]) {
        Object.defineProperty(this, property, {
            get: function () {
                try { return asynchronizer.async[property]; }
                catch (error) { }
            }
        });
    }

    this.reset();
}

/* eval function */
Gamepad.evalContext = function (code, worker) {
    try {
        let CONTEXT = Gamepad['CONTEXT'];
        eval(code);
    } catch (err) {
        console.error('There\'s an error in the code: \n', code);
        console.error(err);
    }
}

/* Gamepad observer */
// the observer instances are used to manage the magicJson options
Gamepad.observer = {
    // insert event
    INSERT: 'insert',
    // update event
    UPDATE: 'update',
    // delete event
    DELETE: 'delete',
    // pop event
    POP: 'pop',
    // push event
    PUSH: 'push',
    // shift event
    SHIFT: 'shift',
    // unshift event
    UNSHIFT: 'unshift',
    // reverse event
    REVERSE: 'reverse',
    // non observable object
    nonObservables: {
        Date: true,
        Blob: true,
        Number: true,
        String: true,
        Boolean: true,
        Error: true,
        SyntaxError: true,
        TypeError: true,
        URIError: true,
        Function: true,
        Promise: true,
        RegExp: true
    },
    // observable definition
    observableDefinition: {
        // reverse
        revoke: {
            value: function () {
                this[Gamepad['SYMBOL']].revoke();
            }
        },
        // observe changes
        observe: {
            value: function (observer, options) {
                let systemObserver = this[Gamepad['SYMBOL']],
                    observers = systemObserver.observers;

                if (typeof observer !== 'function') {
                    throw new Error('observer parameter MUST be a function');
                }

                if (!observers.has(observer)) {
                    observers.set(observer, Object.assign({}, options));
                }
            }
        },
        // unobserve
        unobserve: {
            value: function () {
                let systemObserver = this[Gamepad['SYMBOL']],
                    observers = systemObserver.observers,
                    l;
                if (observers.size) {
                    l = arguments.length;
                    if (l) {
                        while (l--) {
                            observers.delete(arguments[l]);
                        }
                    } else {
                        observers.clear();
                    }
                }
            }
        }
    },
    // load the array
    prepareArray: function (source, observer) {
        let l = source.length,
            item;
        let target = new Array(source.length);
        // bind the observer
        target[Gamepad['SYMBOL']] = observer;
        // prepare the children
        while (l--) {
            item = source[l];
            if (item && typeof item === 'object' && !Gamepad.observer.nonObservables.hasOwnProperty(item.constructor.name)) {
                target[l] = Array.isArray(item) ?
                    new Gamepad.ArrayObserver({
                        target: item,
                        ownKey: l,
                        parent: observer
                    }).proxy :
                    new Gamepad.ObjectObserver({
                        target: item,
                        ownKey: l,
                        parent: observer
                    }).proxy;
            } else {
                target[l] = item;
            }
        }
        return target;
    },
    // load the object
    prepareObject: function (source, observer) {
        let keys = Object.keys(source),
            l = keys.length,
            key, item;
        let target = {
            // bind the observer
            [Gamepad['SYMBOL']]: observer
        }
        // prepare the children
        while (l--) {
            key = keys[l];
            item = source[key];
            if (item && typeof item === 'object' && !Gamepad.observer.nonObservables.hasOwnProperty(item.constructor.name)) {
                target[key] = Array.isArray(item) ?
                    new Gamepad.ArrayObserver({
                        target: item,
                        ownKey: key,
                        parent: observer
                    }).proxy :
                    new Gamepad.ObjectObserver({
                        target: item,
                        ownKey: key,
                        parent: observer
                    }).proxy;
            } else {
                target[key] = item;
            }
        }
        return target;
    },
    // call the observers
    callObservers: function (observers, changes) {
        for (let target of observers.keys()) {
            try {
                let relevantChanges = changes;
                target(relevantChanges);
            } catch (e) {
                console.error('failed to deliver changes to listener ' + target, e);
            }
        }
    },
    // get ancestor info
    getAncestorInfo: function (self) {
        let tmp = [],
            result, l1 = 0,
            l2 = 0;

        // if the object is revoked return undefined
        if (self.isRevoked) {
            return;
        }
        // find the first parent
        while (self.parent) {
            tmp[l1++] = self.ownKey;
            self = self.parent;
            if (self.isRevoked) {
                return;
            }
        }
        result = new Array(l1);
        while (l1--) result[l2++] = tmp[l1];
        return {
            observers: self.observers,
            path: result
        }
    },
    // get the last property 
    // (target, ['a', 'b', 'c']) => { target: target.a.b, key: 'c'}
    getLastProp: function (target, path) {
        for (let i = 0; i < path.length - 1; i++)
            target = target[path[i]];

        return {
            key: path[path.length - 1],
            target
        }
    },
    // load single change
    loadChange: function (observer, change) {
        let { target, key } = Gamepad.observer.getLastProp(observer, change.path);
        // objects and arrays need different changes with the INSERT and DELETE events
        if (Array.isArray(target)) {
            if (change.type == Gamepad.observer.INSERT) {
                // if the key isn't a number the if is false and it will set the value correctly
                if (target.length > key)
                    target.splice(key, 0, change.value);
                else
                    target[key] = change.value;
            }
            if (change.type == Gamepad.observer.DELETE) target.splice(key, 1);
        } else {
            if (change.type == Gamepad.observer.INSERT) target[key] = change.value;
            if (change.type == Gamepad.observer.DELETE) delete target[key];
        }

        // array only changes
        if (change.type == Gamepad.observer.PUSH) target[key].push.apply(target, change.value);
        if (change.type == Gamepad.observer.POP) target[key].pop();
        if (change.type == Gamepad.observer.UNSHIFT) target[key].unshift.apply(target, change.value);
        if (change.type == Gamepad.observer.SHIFT) target[key].shift();
        if (change.type == Gamepad.observer.REVERSE) target[key].reverse();
        // common changes
        if (change.type == Gamepad.observer.UPDATE) target[key] = change.value;
    },
    // unload single change
    unloadChange: function (observer, change) {
        let { target, key } = Gamepad.observer.getLastProp(observer, change.path);
        // objects and arrays need different changes with the INSERT and DELETE events
        if (Array.isArray(target)) {
            if (change.type == Gamepad.observer.INSERT) {
                // if the key isn't a number the if is false and it will set the value correctly
                if (target.length > key)
                    target.splice(key, 1);
                else
                    delete target[key];
            }
            if (change.type == Gamepad.observer.DELETE) target.splice(key, 0, change.oldValue);
        } else {
            if (change.type == Gamepad.observer.INSERT) delete target[key];
            if (change.type == Gamepad.observer.DELETE) target[key] = change.oldValue;
        }

        // array only changes
        if (change.type == Gamepad.observer.PUSH) {
            for (let i = 0; i < change.value.length; i++) target[key].pop();
        }
        if (change.type == Gamepad.observer.POP) target[key].push(change.oldValue);
        if (change.type == Gamepad.observer.UNSHIFT) {
            for (let i = 0; i < change.value.length; i++) target[key].shift();
        }
        if (change.type == Gamepad.observer.SHIFT) target[key].unshift(change.oldValue);
        if (change.type == Gamepad.observer.REVERSE) target[key].reverse();
        // common changes
        if (change.type == Gamepad.observer.UPDATE) target[key] = change.oldValue;
    },
    // observe a json
    observeJson: function (target) {
        if (target && typeof target === 'object' && !Gamepad.observer.nonObservables.hasOwnProperty(target.constructor.name) && !
            ('observe' in target) && !('unobserve' in target) && !('revoke' in target)) {
            let observed = Array.isArray(target) ?
                new Gamepad.ArrayObserver({
                    target: target,
                    ownKey: null,
                    parent: null
                }) :
                new Gamepad.ObjectObserver({
                    target: target,
                    ownKey: null,
                    parent: null
                });
            return observed.proxy;
        } else {
            if (!target || typeof target !== 'object') {
                throw new Error('observable MAY ONLY be created from non-null object only');
            } else if ('observe' in target || 'unobserve' in target || 'revoke' in target) {
                throw new Error(
                    'target object MUST NOT have nor own neither inherited properties from the following list: "observe", "unobserve", "revoke"'
                );
            } else if (Gamepad.observer.nonObservables.hasOwnProperty(target.constructor.name)) {
                throw new Error(target + ' found to be one of non-observable object types: ' + Gamepad.observer.nonObservables);
            }
        }
    }
}

/* Observer class */
// the observer class generate a Proxy that wrap a target object
// It's possible to bind a listener to the changes of the proxy
Gamepad.Observer = class {
    constructor(properties, cloningFunction) {
        // prepare the source
        let source = properties.target,
            targetClone = cloningFunction(source, this);
        // bind to parents
        if (properties.parent === null) {
            this.isRevoked = false;
            Object.defineProperty(this, 'observers', {
                value: new Map()
            });
            Object.defineProperties(targetClone, Gamepad.observer.observableDefinition);
        } else {
            this.parent = properties.parent;
            this.ownKey = properties.ownKey;
        }
        // set the proxy
        this.revokable = Proxy.revocable(targetClone, this);
        this.proxy = this.revokable.proxy;
        this.target = targetClone;
    }

    // set trap
    set(target, key, value) {
        // if the proxy is revoked it will work as a normal object
        if (this.isRevoked) {
            target[key] = value;
            return true;
        }

        let newValue, oldValue = target[key],
            ad, changes;

        // prepare the value
        if (value && typeof value === 'object' && !Gamepad.observer.nonObservables.hasOwnProperty(value.constructor.name)) {
            newValue = Array.isArray(value) ?
                new Gamepad.ArrayObserver({
                    target: value,
                    ownKey: key,
                    parent: this
                }).proxy :
                new Gamepad.ObjectObserver({
                    target: value,
                    ownKey: key,
                    parent: this
                }).proxy;
        } else {
            newValue = value;
        }
        target[key] = newValue;

        // revoke the old object
        if (oldValue && typeof oldValue === 'object') {
            let tmpObserved = oldValue[Gamepad['SYMBOL']];
            if (tmpObserved) {
                oldValue = tmpObserved.revoke();
            }
        }

        // push changes
        ad = Gamepad.observer.getAncestorInfo(this);
        if (!ad) return;
        if (ad.observers.size) {
            ad.path.push(key);
            changes = typeof oldValue === 'undefined' ? [{
                type: Gamepad.observer.INSERT,
                path: ad.path,
                value: newValue,
                object: this.proxy
            }] : [{
                type: Gamepad.observer.UPDATE,
                path: ad.path,
                value: newValue,
                oldValue: oldValue,
                object: this.proxy
            }];
            Gamepad.observer.callObservers(ad.observers, changes);
        }
        return true;
    }

    // delete trap
    deleteProperty(target, key) {
        let oldValue = target[key],
            ad, changes;

        if (delete target[key]) {
            // revoke the old object
            if (oldValue && typeof oldValue === 'object') {
                let tmpObserved = oldValue[Gamepad['SYMBOL']];
                if (tmpObserved) {
                    oldValue = tmpObserved.revoke();
                }
            }

            // push changes
            ad = Gamepad.observer.getAncestorInfo(this);
            if (!ad) return;
            if (ad.observers.size) {
                ad.path.push(key);
                changes = [{
                    type: Gamepad.observer.DELETE,
                    path: ad.path,
                    oldValue: oldValue,
                    object: this.proxy
                }];
                Gamepad.observer.callObservers(ad.observers, changes);
            }
            return true;
        } else {
            return false;
        }
    }
}

/* Array observer class */
// observer for arrays
Gamepad.ArrayObserver = class extends Gamepad.Observer {
    constructor(properties) {
        super(properties, Gamepad.observer.prepareArray);
    }

    // revoke the observer, now it will work as a normal object
    revoke() {
        // set isRevoked prop
        this.isRevoked = true;

        let target = this.target,
            l = target.length,
            item;
        // revoke children
        while (l--) {
            item = target[l];
            // send revoke event to all sons
            if (item && typeof item === 'object') {
                let tmpObserved = item[Gamepad['SYMBOL']];
                if (tmpObserved) {
                    target[l] = tmpObserved.revoke();
                }
            }
        }
        return target;
    }

    // get trap
    get(target, key) {
        // array methods
        const proxiedArrayMethods = {
            pop: function proxiedPop(target, observed) {
                if (target.length == 0) return;
                let popResult;
                popResult = target.pop();
                if (popResult && typeof popResult === 'object') {
                    let tmpObserved = popResult[Gamepad['SYMBOL']];
                    if (tmpObserved) {
                        popResult = tmpObserved.revoke();
                    }
                }

                let ad = Gamepad.observer.getAncestorInfo(observed);
                if (!ad) return;
                if (ad.observers.size) {
                    Gamepad.observer.callObservers(ad.observers, [{
                        type: Gamepad.observer.POP,
                        path: ad.path,
                        oldValue: popResult,
                        object: observed.proxy
                    }]);
                }
                return popResult;
            },
            push: function proxiedPush(target, observed) {
                let i, l = arguments.length - 2,
                    item, pushContent = new Array(l),
                    pushResult, changes,
                    initialLength, ad = Gamepad.observer.getAncestorInfo(observed);
                initialLength = target.length;

                for (i = 0; i < l; i++) {
                    item = arguments[i + 2];
                    if (item && typeof item === 'object' && !Gamepad.observer.nonObservables.hasOwnProperty(item
                        .constructor.name)) {
                        item = Array.isArray(item) ?
                            new Gamepad.ArrayObserver({
                                target: item,
                                ownKey: initialLength + i,
                                parent: observed
                            }).proxy :
                            new Gamepad.ObjectObserver({
                                target: item,
                                ownKey: initialLength + i,
                                parent: observed
                            }).proxy;
                    }
                    pushContent[i] = item;
                }
                pushResult = Reflect.apply(target.push, target, pushContent);

                if (!ad) return;
                if (ad.observers.size) {
                    changes = [{
                        type: Gamepad.observer.PUSH,
                        path: ad.path,
                        value: pushContent,
                        object: observed.proxy
                    }]
                    Gamepad.observer.callObservers(ad.observers, changes);
                }
                return pushResult;
            },
            shift: function proxiedShift(target, observed) {
                if (target.length == 0) return;
                let shiftResult, i, l, item, ad, changes;

                shiftResult = target.shift();
                if (shiftResult && typeof shiftResult === 'object') {
                    let tmpObserved = shiftResult[Gamepad['SYMBOL']];
                    if (tmpObserved) {
                        shiftResult = tmpObserved.revoke();
                    }
                }

                for (i = 0, l = target.length; i < l; i++) {
                    item = target[i];
                    if (item && typeof item === 'object') {
                        let tmpObserved = item[Gamepad['SYMBOL']];
                        if (tmpObserved) {
                            tmpObserved.ownKey = i;
                        }
                    }
                }

                ad = Gamepad.observer.getAncestorInfo(observed);
                if (!ad) return;
                if (ad.observers.size) {
                    changes = [{
                        type: Gamepad.observer.SHIFT,
                        path: ad.path,
                        oldValue: shiftResult,
                        object: observed.proxy
                    }];
                    Gamepad.observer.callObservers(ad.observers, changes);
                }
                return shiftResult;
            },
            unshift: function proxiedUnshift(target, observed) {
                let unshiftContent, unshiftResult, ad, changes;
                unshiftContent = Array.from(arguments);
                unshiftContent.splice(0, 2);
                unshiftContent.forEach((item, index) => {
                    if (item && typeof item === 'object' && !Gamepad.observer.nonObservables.hasOwnProperty(item
                        .constructor.name)) {
                        unshiftContent[index] = Array.isArray(item) ?
                            new Gamepad.ArrayObserver({
                                target: item,
                                ownKey: index,
                                parent: observed
                            }).proxy :
                            new Gamepad.ObjectObserver({
                                target: item,
                                ownKey: index,
                                parent: observed
                            }).proxy;
                    }
                });
                unshiftResult = Reflect.apply(target.unshift, target, unshiftContent);
                for (let i = 0, l = target.length, item; i < l; i++) {
                    item = target[i];
                    if (item && typeof item === 'object') {
                        let tmpObserved = item[Gamepad['SYMBOL']];
                        if (tmpObserved) {
                            tmpObserved.ownKey = i;
                        }
                    }
                }

                ad = Gamepad.observer.getAncestorInfo(observed);
                if (!ad) return;
                if (ad.observers.size) {
                    changes = [{
                        type: Gamepad.observer.UNSHIFT,
                        path: ad.path,
                        value: unshiftContent,
                        object: observed.proxy
                    }]

                    Gamepad.observer.callObservers(ad.observers, changes);
                }
                return unshiftResult;
            },
            reverse: function proxiedReverse(target, observed) {
                let i, l, item, ad, changes;
                target.reverse();
                for (i = 0, l = target.length; i < l; i++) {
                    item = target[i];
                    if (item && typeof item === 'object') {
                        let tmpObserved = item[Gamepad['SYMBOL']];
                        if (tmpObserved) {
                            tmpObserved.ownKey = i;
                        }
                    }
                }

                ad = Gamepad.observer.getAncestorInfo(observed);
                if (!ad) return;
                if (ad.observers.size) {
                    changes = [{
                        type: Gamepad.observer.REVERSE,
                        path: ad.path,
                        object: observed.proxy
                    }];
                    Gamepad.observer.callObservers(ad.observers, changes);
                }
                return observed.proxy;
            },
            sort: function proxiedSort(target, observed, comparator) {
                let i, l, item, ad, changes, oldValue = target.slice(0);
                target.sort(comparator);
                for (i = 0, l = target.length; i < l; i++) {
                    item = target[i];
                    if (item && typeof item === 'object') {
                        let tmpObserved = item[Gamepad['SYMBOL']];
                        if (tmpObserved) {
                            tmpObserved.ownKey = i;
                        }
                    }
                }

                ad = Gamepad.observer.getAncestorInfo(observed);
                if (!ad) return;
                if (ad.observers.size) {
                    changes = [{
                        type: Gamepad.observer.UPDATE,
                        value: target,
                        oldValue,
                        path: ad.path,
                        object: observed.proxy
                    }];
                    Gamepad.observer.callObservers(ad.observers, changes);
                }
                return observed.proxy;
            },
            fill: function proxiedFill(target, observed) {
                let ad = Gamepad.observer.getAncestorInfo(observed),
                    normArgs, argLen,
                    start, end, changes = [],
                    prev, tarLen = target.length,
                    path;
                normArgs = Array.from(arguments);
                normArgs.splice(0, 2);
                argLen = normArgs.length;
                start = argLen < 2 ? 0 : (normArgs[1] < 0 ? tarLen + normArgs[1] : normArgs[1]);
                end = argLen < 3 ? tarLen : (normArgs[2] < 0 ? tarLen + normArgs[2] : normArgs[2]);
                prev = target.slice(0);
                Reflect.apply(target.fill, target, normArgs);

                for (let i = start, item, tmpTarget; i < end; i++) {
                    item = target[i];
                    if (item && typeof item === 'object' && !Gamepad.observer.nonObservables.hasOwnProperty(item
                        .constructor.name)) {
                        target[i] = Array.isArray(item) ?
                            new Gamepad.ArrayObserver({
                                target: item,
                                ownKey: i,
                                parent: observed
                            }).proxy :
                            new Gamepad.ObjectObserver({
                                target: item,
                                ownKey: i,
                                parent: observed
                            }).proxy;
                    }
                    if (prev.hasOwnProperty(i)) {
                        tmpTarget = prev[i];
                        if (tmpTarget && typeof tmpTarget === 'object') {
                            let tmpObserved = tmpTarget[Gamepad['SYMBOL']];
                            if (tmpObserved) {
                                tmpTarget = tmpObserved.revoke();
                            }
                        }

                        path = ad.path.slice(0);
                        path.push(i);
                        changes.push({
                            type: Gamepad.observer.UPDATE,
                            path: path,
                            value: target[i],
                            oldValue: tmpTarget,
                            object: observed.proxy
                        });
                    } else {
                        path = ad.path.slice(0);
                        path.push(i);
                        changes.push({
                            type: Gamepad.observer.INSERT,
                            path: path,
                            value: target[i],
                            object: observed.proxy
                        });
                    }
                }

                if (!ad) return;
                if (ad.observers.size) {
                    Gamepad.observer.callObservers(ad.observers, changes);
                }
                return observed.proxy;
            },
            splice: function proxiedSplice(target, observed) {
                let ad = Gamepad.observer.getAncestorInfo(observed),
                    spliceContent, spliceResult, changes = [],
                    tmpObserved,
                    startIndex, removed, inserted, splLen, tarLen = target.length;

                spliceContent = Array.from(arguments);
                spliceContent.splice(0, 2);
                splLen = spliceContent.length;

                for (let i = 2, item; i < splLen; i++) {
                    item = spliceContent[i];
                    if (item && typeof item === 'object' && !Gamepad.observer.nonObservables.hasOwnProperty(item
                        .constructor.name)) {
                        spliceContent[i] = Array.isArray(item) ?
                            new Gamepad.ArrayObserver({
                                target: item,
                                ownKey: i,
                                parent: observed
                            }).proxy :
                            new Gamepad.ObjectObserver({
                                target: item,
                                ownKey: i,
                                parent: observed
                            }).proxy;
                    }
                }

                startIndex = splLen === 0 ? 0 : (spliceContent[0] < 0 ? tarLen + spliceContent[0] :
                    spliceContent[0]);
                removed = splLen < 2 ? tarLen - startIndex : spliceContent[1];
                inserted = Math.max(splLen - 2, 0);
                spliceResult = Reflect.apply(target.splice, target, spliceContent);
                tarLen = target.length;

                for (let i = 0, item; i < tarLen; i++) {
                    item = target[i];
                    if (item && typeof item === 'object') {
                        tmpObserved = item[Gamepad['SYMBOL']];
                        if (tmpObserved) {
                            tmpObserved.ownKey = i;
                        }
                    }
                }

                let i, l, item;
                for (i = 0, l = spliceResult.length; i < l; i++) {
                    item = spliceResult[i];
                    if (item && typeof item === 'object') {
                        tmpObserved = item[Gamepad['SYMBOL']];
                        if (tmpObserved) {
                            spliceResult[i] = tmpObserved.revoke();
                        }
                    }
                }

                if (!ad) return;
                if (ad.observers.size) {
                    let index, path;
                    for (index = 0; index < removed; index++) {
                        path = ad.path.slice(0);
                        path.push(startIndex + index);
                        if (index < inserted) {
                            changes.push({
                                type: Gamepad.observer.UPDATE,
                                path: path,
                                value: target[startIndex + index],
                                oldValue: spliceResult[index],
                                object: observed.proxy
                            });
                        } else {
                            changes.push({
                                type: Gamepad.observer.DELETE,
                                path: path,
                                oldValue: spliceResult[index],
                                object: observed.proxy
                            });
                        }
                    }
                    for (; index < inserted; index++) {
                        path = ad.path.slice(0);
                        path.push(startIndex + index);
                        changes.push({
                            type: Gamepad.observer.INSERT,
                            path: path,
                            value: target[startIndex + index],
                            object: observed.proxy
                        });
                    }
                    Gamepad.observer.callObservers(ad.observers, changes);
                }
                return spliceResult;
            }
        }
        if (proxiedArrayMethods.hasOwnProperty(key)) {
            return proxiedArrayMethods[key].bind(undefined, target, this);
        } else {
            return target[key];
        }
    }
}

/* Object observer class */
// observer for objects
Gamepad.ObjectObserver = class extends Gamepad.Observer {
    constructor(properties) {
        super(properties, Gamepad.observer.prepareObject);
    }

    // revoke the observer, now it will work as a normal object
    revoke() {
        // set isRevoked prop
        this.isRevoked = true;

        let target = this.target,
            keys = Object.keys(target),
            l = keys.length,
            key, item;
        // revoke each children
        while (l--) {
            key = keys[l];
            item = target[key];
            if (item && typeof item === 'object') {
                let tmpObserved = item[Gamepad['SYMBOL']];
                if (tmpObserved) {
                    target[key] = tmpObserved.revoke();
                }
            }
        }
        return target;
    }
}

/* Gamepad Store */
// this class manage the changes of a single observer
Gamepad.Store = class {
    constructor(json) {
        // the changes observer
        this.observer = Gamepad.observer.observeJson(json);
        // history of changes
        this.history = [];
        // history index
        this.index = -1;
        // current changes
        this.changes = [];

        // observe the json
        this.observer.observe(changes => {
            changes.forEach(change => {
                //  update this part.
                // the values are not saved directly because they can change
                if ('value' in change && change.value != undefined)
                    change.value = JSON.parse(JSON.stringify(change.value));

                if ('oldValue' in change && change.oldValue != undefined)
                    change.oldValue = JSON.parse(JSON.stringify(change.oldValue));

                this.changes.push(change);
            });
        });
    }

    // commit changes
    commit() {
        // update the history
        this.history.splice(this.index + 1);
        this.history.push(this.changes);
        this.index = this.history.length - 1;
        // remove changes
        this.changes = [];
    }

    // unload all changes that have not been committed
    restore() {
        let changes = this.changes.slice(0);
        while (changes.length > 0)
            Gamepad.observer.unloadChange(this.observer, changes.pop());

        this.changes = [];
    }

    // load all changes
    loadChanges() {
        // remove useless changes
        this.restore();

        // if there are change to load
        if (this.index < this.history.length - 1) {
            // change store
            this.index++;

            let changes = this.history[this.index],
                i = -1;

            // load all changes
            while (++i < changes.length)
                Gamepad.observer.loadChange(this.observer, changes[i]);

            // remove the changes that this process has created
            this.changes = [];
        }
    }

    // unload all changes
    unloadChanges() {
        // remove useless changes
        this.restore();

        // if there are changes to unload
        if (this.index > -1) {
            let changes = this.history[this.index],
                i = changes.length;

            // unload all changes
            while (--i >= 0)
                Gamepad.observer.unloadChange(this.observer, changes[i]);

            // change store
            this.index--;

            // remove the changes that this process has created
            this.changes = [];
        }
    }
}

/* Gamepad JsonManager */
// this class manage multiple stores
Gamepad.JsonManager = class {
    constructor(json) {
        this.init(json || {});
    }

    // reset the stores
    reset() {
        this.init();
    }

    // init a new json
    init(json) {
        // update the old json
        if (json !== undefined) this.json = json;

        // stores
        this.stores = [];
        // stores index
        this.index = 0;

        // load the stores
        if (Array.isArray(this.json)) {
            for (let value of this.json)
                this.stores.push(new Gamepad.Store(value));
        } else {
            this.stores.push(new Gamepad.Store(this.json));
        }

        // the stores should not be changed here
        Object.freeze(this.stores);
    }

    // get the current store
    get store() {
        return this.stores[this.index];
    }
    // get the current observer
    get observer() {
        return this.store.observer;
    }
    // get the observers
    get observers() {
        return this.stores.map(store => store.observer);
    }
    // get the current history
    get history() {
        return this.store.history;
    }
    // get the current changes
    get changes() {
        return this.store.changes;
    }
    // set the current changes
    set changes(changes) {
        this.store.changes = changes;
    }

    // save changes
    commit() {
        this.store.commit();
    }

    // load all changes
    loadChanges() {
        this.store.loadChanges();
    }

    // unload all changes
    unloadChanges() {
        this.store.unloadChanges();
    }

    // load the next json
    loadNext() {
        if (this.index < this.stores.length - 1) this.index++;
    }

    // load the prior json
    loadPrior() {
        if (this.index > 0) this.index--;
    }
}

/* Global */
;(function () {

    // Establish the root object, `window` in the browser, or `global` on the server.
    var root = this;

    // Export the Underscore object for **CommonJS**, with backwards-compatibility
    // for the old `require()` API. If we're not in CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        const Blockly = require('blockly');

        module.exports = Gamepad;
        root.Blockly = Blockly;
        Blockly.Gamepad = Gamepad;
    } else {
        if(typeof Blockly !== undefined) 
            Blockly.Gamepad = Gamepad;
    }
})();

/* load the setting */
Gamepad.setting();