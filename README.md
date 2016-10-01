# Paper
## Develop applications for Pythonista using web tools.

Paper is a library that allows Pythonista users to develop aplications using HTML, CSS and JavaScript.

# Todo
Modules:
- [x] Import Python modules from JavaScript.
- [ ] `import x.y`

Types:
- [x] Convert basic Python types to JavaScript equivalents (`int`, `float`, `string`, `list`, `dict` and `tuple`).
- [x] Convert basic JavaScript types to Python equivalents (`int`, `float`, `string` `array` and `object`.
- [x] Create JavaScript objects from Python objects.
- [ ] Create Python objects from JavaScript objects.
- [ ] Pass Python objects created from JavaScript as arguments to Python function calls.

Classes:
- [ ] Actually start implementing classes.

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