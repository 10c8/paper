/*
 * Paper JS API
 * Bridge between Python and JavaScript
 *
 * author 0x77
 * version 0.5
*/

// Utils
function _callPython(call) {
    /*
    Communicates with the Python side
    */

    result = $.ajax({
        url: '/api',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(call),
        async: false
    }).responseText;

    return JSON.parse(result);
}

function _listenRequest() {
    /*
    Handles call requests from the Python side

    TODO: Make it work...
    */

    var socket = py.__import__('socket');

    var sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM);
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1);

    sock.bind(py.tuple(['127.0.0.1', 2703]));
    sock.listen(1);

    var loop = setInterval(function(){
        accept = sock.accept();
        conn = accept.get(0);

        console.log(JSON.parse(conn.recv(1024)));

        sock.close();

        py.free('sock');
        py.free('socket');

        clearInterval(loop);
    }, 1000);
}

function PyCall(callType, owner, name, listen) {
    /*
    Makes a call for a Python function
    */

    var call = function(args) {
        var newArgs = [];

        if (callType == 'func') {
            args.forEach(function(arg) {
                var argType = toType(arg);
                var newArg = null;

                if (argType == 'object') {
                    if (arg.constructor.name == 'PyTuple') {
                        newArg = {
                            type: 'tuple',
                            data: arg.data
                        };
                    } else if (arg.constructor.name == 'PyComplexNumber') {
                        newArg = {
                            type: 'complex',
                            real: arg.real,
                            imag: arg.imag
                        };
                    } else {
                        newArg = {
                            type: 'object',
                            id: arg.__id__,
                            data: arg
                        };
                    }
                } else if (argType == 'function') {
                    newArg = {
                        type: 'function',
                        scope: 'window'
                    };
                } else if (argType == 'null') {
                    newArg = {
                        type: 'none'
                    };
                } else {
                    newArg = {
                        type: argType,
                        value: arg
                    };
                }

                newArgs.push(newArg);
            });
        }

        // if (listen)
        //     _listenRequest();

        result = _callPython({
            type: callType,
            call: name,
            owner: owner,
            args: newArgs
        });

        if ('exception' in result) {
            console.error('[Paper] '+ result.exception);
            console.warn(result.traceback);
            return null;
        }

        if ('null' in result)
            return null;

        if (result.type == 'object')
            return new PyObj(result.value);
        else if (result.type == 'tuple')
            return new PyTuple(result.data);
        else if (result.type == 'complex')
            return new PyComplexNumber(result.real, result.imag);
        else if (result.type == 'function')
            return PyCall('func', '__anon__', result.name, true);
        else if (result.type == 'none')
            return null;
        else
            return result.value;
    };

    return kwargs(call);
}

// Python type definitions
var _extended = {};

function PyObj(data) {
    /*
    Creates a reference to a Python object
    */

    object = {
        '_paper_type': 'PyObj'
    };

    for(var name in data) {
        if (name == '__id__' || name == '__name__') {
            object[name] = data[name];
            continue;
        }

        item = data[name];

        if (item.type == 'function') {
            if (item.__id__ == '__anon__')
                (function(obj, id) {
                    Object.defineProperty(obj, {
                        get: function() {
                            return PyCall('func', '__anon__', id, true);
                        }
                    });
                })(object, data.__id__);
            else
                (function(obj, id, this_name) {
                    Object.defineProperty(obj, this_name, {
                        get: function() {
                            return PyCall('func', id, this_name, false);
                        }
                    });
                })(object, data.__id__, name);
        } else {
            (function(obj, id, this_name) {
                Object.defineProperty(obj, this_name, {
                    get: function() {
                        return PyCall('attr', id, this_name, false)();
                    }
                });
            })(object, data.__id__, name);
        }
    }

    return object;
}

function PyTuple(data) {
    /*
    Helper to create Python tuples
    */

    this.data = data;
}
PyTuple.prototype.get = function(index) {
    return this.data[index];
};

function PyComplexNumber(real, imag) {
    /*
    Helper to create Python complex numbers
    */

    this.real = real;
    this.imag = imag;
}
PyComplexNumber.prototype.inspect = function() {
    return ('('+ this.real +'+'+ this.imag +'j)');
};
PyComplexNumber.prototype.toString = PyComplexNumber.prototype.inspect;

// Helper functions
function kwargs(fn) {
    return function() {
        var args_in  = Array.prototype.slice.call(arguments);
        var required = args_in.slice(0, fn.length-1);
        var optional = args_in.slice(fn.length-1);
        var args_out = required;

        args_out.push(optional);
        return fn.apply(0, args_out);
    };
}

function toType(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

// API code
/*
Import Python builtins
*/
var Paper = new PyObj(_callPython({
    builtin: 'init'
}));

var PaperUtil = new PyObj(_callPython({
    builtin: 'utils'
}));

Paper.VERSION = '0.5';

/*
Import a Python module as a PyObj
*/
Paper.import = function(name) {
    result = _callPython({
        builtin: 'import',
        module: name
    });

    if ('exception' in result) {
        console.error('[Paper] '+ result.exception);
        console.warn(result.traceback);
        return false;
    }

    window[name] = new PyObj(result);
    return true;
};

/*
Extend the type-conversion engine

TODO: Make it work?
*/
Paper.extend = function(type, names) {
    _extended[type] = kwargs(function(args) {
        for (var i=0; i < names.length; i++)
            this[names[i]] = args[i];
    });

    _callPython({
        builtin: 'extend',
        fields: {
            'type': '<type \''+ type +'>',
            'names': names
        }
    });
};

/*
Garbage collect a Python object and destroy it's JavaScript reference
*/
Paper.free = function(obj) {
    if (!('__id__' in window[obj])) {
        console.error('Invalid PyObj: '+ obj +'.');
        return false;
    }

    _callPython({
        builtin: 'free',
        id: window[obj].__id__
    });

    delete window[obj];
    return true;
};

// Add it to the global scope
window.paper = window.py = Paper;
window.paperutil = window.pyutil = PaperUtil;
