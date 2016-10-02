#: vim set encoding=utf-8 :
##
 # Paper
 # Develop apps for Pythonista using HTML, CSS and JavaScript
 #
 # author 0x77
 # version 0.4
##

# Imports
import os
import sys
import json
import traceback
import webbrowser

from bottle import run, route, get, post, static_file, request


__all__ = ['app']

# Is this Python 2 or 3?
py_three = (sys.version_info > (3, 0))

# Are we being run from Pythonista?
safe_env = (sys.platform == 'ios')


# Library code
class PaperApp(object):
    '''
    Where all the magic happens
    '''

    # Application root directory
    _root = None
    # Functions exposed to the JS API
    _exposed = {}
    # Names ignored on imports
    _ignored_imports = [
        '__name__', '__doc__', '__file__', '__package__', '__builtins__'
    ]
    # Built-in names that should be available at the JS API
    _allowed_builtins = [
        '__import__', 'abs', 'all', 'any', 'bin', 'bytearray', 'bytes',
        'callable', 'chr', 'cmp', 'coerce', 'enumerate', 'execfile', 'filter',
        'format', 'hash', 'hex', 'id', 'print', 'range', 'tuple'
    ]
    # Objects created by JavaScript
    _py_objs = {
        '__anon__': {}
    }

    def __init__(self, root):
        self._root = root

    def _js_obj(self, owner, obj):
        '''
        Convert a Python object to a JavaScript reference
        '''

        value = getattr(owner, obj)

        if type(value) in [str, int, float, list, dict, tuple, bool]:
            result = {
                'type': str(type(value))[7:-2]
            }
        elif callable(value):
            result = {
                'type': 'function'
            }
        else:
            result = {
                'type': 'unknown'
            }

        return result

    def expose(self, function, alias=None):
        '''
        Expose a Python function to the JS API
        '''

        if py_three:
            f_alias = alias or function.__name__
        else:
            f_alias = alias or function.func_name

        self._exposed[f_alias] = {'name': function}

        return function

    def run(self):
        '''
        Serves as a bridge from Python to JavaScript (and vice-versa)
        '''

        # Open web browser
        if safe_env:
            webbrowser.open('http://127.0.0.1:1406/')

        # Serve static files (actually, just the API and jQuery)
        @get('/<filename:re:.*\.(js)>')
        def includes(filename):
            return static_file(filename, root='./include')

        # Serve the app
        @get('/')
        def index():
            return static_file('index.html', root='./app')

        # Handle API calls
        @post('/api')
        def api():
            is_builtin = ('builtin' in request.json)
            is_call = ('call' in request.json)

            data = {
                'null': True
            }

            if is_builtin:
                builtin = request.json['builtin']

                if builtin == 'init':
                    if py_three:
                        module = 'builtins'
                    else:
                        module = '__builtin__'

                    builtin_import = __import__(module)
                    builtins = dir(builtin_import)

                    obj_name = id(builtin_import)
                    self._py_objs[obj_name] = builtin_import

                    data = {
                        '__id__': obj_name
                    }

                    for name in builtins:
                        if name in self._ignored_imports:
                            continue

                        if name not in self._allowed_builtins:
                            continue

                        data[name] = self._js_obj(builtin_import, name)
                elif builtin == 'free':
                    obj_id = request.json['id']

                    if obj_id in self._py_objs:
                        del self._py_objs[obj_id]

                        result = {}
                    else:
                        result = {
                            'exception': '<type \'exceptions.PaperError\'>',
                            'traceback': 'Traceback (most recent call last):\n'
                                         'PaperError: Unknown PyObj "{}".'\
                                         .format(obj_id)
                        }
                elif builtin == 'import':
                    module = request.json['module']

                    result = {
                        '__name__': module
                    }

                    try:
                        mod = __import__(module)
                        names = dir(mod)

                        # Fetch the imported names
                        for name in names:
                            if name in self._ignored_imports:
                                continue

                            result[name] = self._js_obj(mod, name)

                        # Save the newly created object
                        obj_name = id(mod)
                        self._py_objs[obj_name] = mod

                        result['__id__'] = obj_name

                        # Return a reference to that object
                        data = result
                    except:
                        exc_type, exc_value, exc_traceback = sys.exc_info()
                        tb = traceback.format_exc(exc_traceback)

                        data = {
                            'exception': str(exc_type),
                            'traceback': tb
                        }
            elif is_call:
                c_type = request.json['type']
                call = request.json['call']
                owner = request.json['owner']
                args = request.json['args']

                for i, arg in enumerate(args):
                    if arg['type'] in ['string', 'number', 'array', 'object',
                                       'boolean']:
                        args[i] = arg['value']
                    elif arg['type'] == 'tuple':
                        args[i] = tuple(arg['data'])

                try:
                    if c_type == 'func':
                        if owner == '__anon__':
                            result = self._py_objs[owner][call](*args)
                        else:
                            result = getattr(self._py_objs[owner], call)(*args)
                    elif c_type == 'attr':
                        result = getattr(self._py_objs[owner], call)

                    if type(result) in [str, int, float, list, dict, bool]:
                        data = {
                            'type': str(type(result))[7:-2],
                            'value': result
                        }
                    elif type(result) == tuple:
                        data = {
                            'type': 'tuple',
                            'data': result
                        }
                    elif callable(result):
                        func_id = id(result)
                        self._py_objs['__anon__'][func_id] = result

                        data = {
                            '__id__': '__anon__',
                            'type': 'function',
                            'name': func_id
                        }
                    else:
                        data = {
                            'type': 'object',
                            'value': {}
                        }

                        # Save the newly created object
                        obj_name = id(result)
                        self._py_objs[obj_name] = result

                        data['value']['__id__'] = obj_name

                        for name in dir(result):
                            if name.startswith('__'):
                                continue

                            data['value'][name] = self._js_obj(result, name)
                except KeyboardInterrupt:
                    sys.exit()
                except:
                    exc_type, exc_value, exc_traceback = sys.exc_info()
                    tb = traceback.format_exc(exc_traceback)

                    data = {
                        'exception': str(exc_type),
                        'traceback': tb
                    }

            try:
                return json.dumps(data)
            except:
                exc_type, exc_value, exc_traceback = sys.exc_info()
                tb = traceback.format_exc(exc_traceback)

                data = {
                    'exception': str(exc_type),
                    'traceback': tb
                }

                return json.dumps(data)

        # Start the server
        run(host='127.0.0.1', port=1406, quiet=True)


def app(root):
    return PaperApp(root)
