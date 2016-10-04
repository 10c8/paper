# Paper
> Develop applications for Pythonista using web tools.

Paper is a library that allows Pythonista users to develop aplications using HTML, CSS and JavaScript.

# Usage
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

# Features
Important:
- [x] Return exceptions to JavaScript instead of crashing the server.
- [ ] Garbage collection for Python objects and references.
- [x] Good performance when working with heavy data.

Modules:
- [x] Import Python modules from JavaScript.
- [x] `import x.y`

Functions:
- [x] Convert Python built-in functions to JavaScript functions.
    - [ ] Call Python function with `kwargs`.
- [ ] Convert a JavaScript function to a Python function.

Types:
- [x] Create JavaScript references of Python objects.
- [x] Convert basic Python types to JavaScript equivalents (`int`, `float`, `string`, `complex`, `list`, `dict` and `tuple`).
- [x] Convert basic JavaScript types to Python equivalents (`int`, `float`, `string` `array` and `object`.
- [x] Create JavaScript objects from Python objects.
- [x] Create Python objects from JavaScript objects.

Classes:
- [x] Create Python class instances using JavaScript.
- [x] Convert Python class instances to JavaScript objects.
- [ ] Create Python classes using JavaScript.
    - [ ] Expand Python classes using JavaScript.

## Contribute
Suggestions, as well as pull requests and bug reports are welcome.

## License
MIT
