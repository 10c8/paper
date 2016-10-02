# Paper
## Develop applications for Pythonista using web tools.

Paper is a library that allows Pythonista users to develop aplications using HTML, CSS and JavaScript.

# Todo
Important:
- [x] Return exceptions to JavaScript instead of crashing the server.
- [ ] Implement garbage collection for Python objects and references.
- [ ] Improve performance when working with heavy data.

Modules:
- [x] Import Python modules from JavaScript.
- [ ] `import x.y`

Functions:
- [x] Convert Python builtin functions to JavaScript functions.
- [ ] Convert a JavaScript function to a Python function.
    - [ ] Pass those functions as arguments to Python function calls.
- [x] Handle anonymous functions returned from Python functions correctly.

Types:
- [x] Implement `__getattr__` for JavaScript references of Python objects.
- [x] Convert basic Python types to JavaScript equivalents (`int`, `float`, `string`, `list`, `dict`, `bool` and `tuple`).
- [x] Convert basic JavaScript types to Python equivalents (`string`, `number`, `array`, `boolean` and `object`).
- [x] Create JavaScript objects from Python objects.
- [x] Create Python objects from JavaScript objects.
    - [x] Pass those objects as arguments to Python function calls.

Classes:
- [ ] Create Python class instances using JavaScript.
- [ ] Convert Python class instances to JavaScript objects.
- [ ] Create new Python classes using JavaScript.
    - [ ] Expand Python classes using JavaScript.

# How can I use it?
Initialize the library:
```python
import paper

# Initialize Paper
app = paper.app('./app')

# Expose the function 'hello' to the JS API
@app.expose
def hello():
    return 'Oh, hi!'

# Run your app
app.run()
```

Make your app (inside “app” folder):
```html
<!DOCTYPE html>
<html>
<head>
    <title>Paper</title>

    <!-- Paper API -->
    <script src="./jquery.min.js"></script>
    <script src=“./paper.js”></script>
</head>
<body>
    <h1>Hello, Paper!</h1>
    <button onclick=“sayHello()”>Hello!</button>

    <script>
    function sayHello() {
        response = paper.py.hello();
        alert(response);
    }
    </script>
</body>
</html>
```

_Voilá._

# How does it work?
### 1. The server:
…

### 2. The JS API:
…

## Contribute
Suggestions, as well as pull requests and bug reports are welcome.