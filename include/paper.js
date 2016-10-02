/*
 * Paper JS API
 * Bridge between Python and JavaScript
 *
 * author 0x77
 * version 0.2
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

function PyCall(owner, name) {
    var call = function(args) {
        result = _callPython({
            'call': name,
            'owner': owner,
            'args': args
        });

        if ('exception' in result) {
            console.error('[Paper] '+ result.exception)
            console.warn(result.traceback);
            return null;
        }

        if (result.type == 'object')
            return new PyObj(result.value);
        else
            return result.value;
    };

    return kwargs(call);
}

function PyObj(data) {
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

function PyType(type, data) {
    if (!(Paper.valid.indexOf(type) > -1)) {
        console.error('[PyType] Invalid type "'+ type +'"!');
        return null;
    }

    this.type = type;
    this.data = data;
}
PyType.prototype.toString = function() {
    return JSON.stringify(this.data);
};
PyType.prototype.inspect = function() {
    return '<PyType '+ this.type +'>';
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

// API code
var Paper = {
    'VERSION': '0.1',
    'py': {},

    // Types
    'valid': ['str', 'int', 'float', 'tuple', 'list', 'dict']
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

/*
Create a Python tuple
*/
Paper._tuple = function(kwargs) {
    items = [];
    kwargs.forEach(function(item) {
        items.push(item);
    });

    _ = new PyType('tuple', {'items': items});
    return _;
};
Paper.Tuple = kwargs(Paper._tuple);

// Why not?
var paper = Paper;
