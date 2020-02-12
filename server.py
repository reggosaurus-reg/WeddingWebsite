from flask import Flask, render_template
app = Flask(__name__)

@app.route('/')
@app.route('/valkomna')
def welcome_page():
    return render_template("index.html")

@app.route('/viktiginformation')
def info_page():
    return render_template("viktiginformation.html")

@app.route('/vardar')
def tm_page():
    return render_template("vardar.html")

@app.route('/onskelista')
def wishlist_page():
    return render_template("onskelista.html")

@app.route('/boende')
def hotels_page():
    return render_template("boende.html")

@app.route('/anmalan')
def general_page():
    return render_template("anmalan.html")

if __name__ == '__main__':
    app.run()
