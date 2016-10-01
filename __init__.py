#: vim set encoding=utf-8 :
##
 # Paper
 # Develop apps for Pythonista using HTML, CSS and JavaScript
 #
 # author 0x77
 # version 0.1
##

# Imports
import os
import sys
import json
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

    _root = None
    _exposed = {}
    _ignored_imports = ['__name__', '__doc__', '__file__', '__package__', '__builtins__']

    def __init__(self, root):
        self._root = root

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
        Start the application
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
            is_call    = ('call' in request.json)

            if is_builtin:
                if request.json['builtin'] == 'import':
                    module = request.json['module']

                    result = {
                        '__name__': module
                    }

                    mod = __import__(module)
                    names = dir(mod)

                    # Fetch the imported names
                    for name in names:
                        if name in self._ignored_imports:
                            continue

                        value = getattr(mod, name)

                        if type(value) == str:
                            result[name] = {
                                'type': 'str',
                                'value': value
                            }
                        elif callable(value):
                            result[name] = {
                                'type': 'function',
                                'name': name
                            }

                    data = json.dumps(result)
            elif is_call:
                call = request.json['call']

                print('Calling {}.'.format(call))

                data = {}

            return {
                'result': data
            }

        # Start the server
        run(host='127.0.0.1', port=1406, quiet=True)


def app(root):
    return PaperApp(root)
