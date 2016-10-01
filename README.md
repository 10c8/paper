# Paper
## Develop applications for Pythonista using web tools.

Paper is a library that allows Pythonista users to develop aplications using HTML, CSS and JavaScript.

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