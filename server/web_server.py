from flask import Flask, render_template

app = Flask(__name__, static_folder="../dist/static", template_folder="../dist")
app.config['SECRET_KEY'] = "keysecret!"


@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=8080)
