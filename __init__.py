#!/usr/bin/env python3
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

from bottle import run, route, get, post, static_file

try:
    import webbrowser

    safe_env = True
except ImportError:
    # We're not on Pythonista
    safe_env = False

    pass

# Settings
__all__ = ['Paper']


# Library code
class Paper(object):
    '''
    Where all the magic happens
    '''

    def __init__(self):
        pass

    def run(self):
        '''
        Starts the web interface
        '''

        # Open web browser
        if safe_env:
            webbrowser.open('http://127.0.0.1:1406/')

        # Initialize the server
        @get('/<filename:re:.*\.(js)>')
        def includes(filename):
            return static_file(filename, root='./include')

        run(host='127.0.0.1', port=1406, quiet=True)
