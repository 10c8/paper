/*
 * Paper JS API
 * Bridge between Python and JavaScript
 *
 * author 0x77
 * version 0.4
*/

// Utils
function _callPython(call) {
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

function PyCall(callType, owner, name) {
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
                            'type': 'tuple',
                            'data': arg.data
                        };
                    } else {
                        newArg = {
                            'type': 'object',
                            'value': arg
                        };
                    }
                } else {
                    newArg = {
                        'type': argType,
                        'value': arg
                    };
                }

                newArgs.push(newArg);
            });
        }

        result = _callPython({
            'type': callType,
            'call': name,
            'owner': owner,
            'args': newArgs
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
        else if (result.type == 'function')
            return PyCall('func', '__anon__', result.name);
        else
            return result.value;
    };

    return kwargs(call);
}

function PyObj(data) {
    /*
    Creates a reference to a Python object
    */

    object = {};
    for(var name in data) {
        if (name == '__id__' || name == '__name__') {
            object[name] = data[name];
            continue;
        }

        item = data[name];

        if (item.type == 'function') {
            if (item.__id__ == '__anon__')
                (function(obj, id, this_name) {
                    Object.defineProperty(obj, this_name, {
                        get: function() {
                            return PyCall('func', '__anon__', id, this_name);
                        }
                    });
                })(object, data.__id__, name);
            else
                (function(obj, id, this_name, call_name) {
                    Object.defineProperty(obj, this_name, {
                        get: function() {
                            return PyCall('func', id, this_name, call_name);
                        }
                    });
                })(object, data.__id__, name, item.name);
        } else {
            (function(obj, id, this_name) {
                Object.defineProperty(obj, this_name, {
                    get: function() {
                        return PyCall('attr', id, this_name)();
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

Paper.VERSION = '0.4';
Paper.VALID   = ['str', 'int', 'float', 'tuple', 'list', 'dict', 'bool'];

/*
Import a Python module as a PyObj
*/
Paper.import = function(name) {
    result = _callPython({
        builtin: 'import',
        module: name
    });

    window[name] = new PyObj(result);
};

// Add it to the global scope
window.paper = Paper;
