/*
 * Paper JS API
 * Bridge between Python and JavaScript
 *
 * author 0x77
 * version 0.3
*/

// Utils
function _callPython(call) {
    result = $.ajax({
        url: '/api',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(call),
        async: false,
        timeout: 0
    }).responseText;

    return JSON.parse(result);
}

function PyCall(owner, name) {
    /*
    Makes a call for a Python function
    */

    var call = function(args) {
        var newArgs = [];
        args.forEach(function(arg) {
            var argType = toType(arg);
            var newArg = null;

            if (argType == 'object') {
                if (arg.constructor.name == 'PyTuple') {
                    newArg = {
                        'type': 'tuple',
                        'data': arg.data
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

        result = _callPython({
            'call': name,
            'owner': owner,
            'args': newArgs
        });

        if ('exception' in result) {
            console.error('[Paper] '+ result.exception)
            console.warn(result.traceback);
            return null;
        }

        if (result.type == 'object')
            return new PyObj(result.value);
        else if (result.type == 'tuple')
            return new PyTuple(result.data);
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

        if (item.type == 'function')
            object[name] = PyCall(data.__id__, item.name);
        else
            object[name] = item.value;
    }

    return object;
}

function PyTuple(data) {
    /*
    Helper to create Python tuples
    */

    this.data = data;
}

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
var Paper = {
    'VERSION': '0.3',

    // Types
    'valid': ['str', 'int', 'float', 'tuple', 'list', 'dict']
};

/*
Import Python builtins
*/
Paper.init = function() {
    result = _callPython({
        builtin: 'init'
    });

    var builtins = new PyObj(result);
    for (var name in builtins) {
        this[name] = builtins[name];
    }
};

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

// Initialize the library (load builtins)
Paper.init();

// Add it to the global scope
window.paper = Paper;
