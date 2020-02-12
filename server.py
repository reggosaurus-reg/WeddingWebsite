from flask import Flask, render_template
app = Flask(__name__)

@app.route('/')
@app.route('/valkomna')
def welcome_page():
    return "HEllo worLD"
    #return render_template("index.html")

if __name__ == '__main__':
    app.run()
