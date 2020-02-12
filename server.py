from flask import Flask, render_template, g
import sqlite3

app = Flask(__name__)
DATABASE = 'database/database.db'

# DB FUNCTIONS
# From https://flask.palletsprojects.com/en/1.1.x/patterns/sqlite3/

def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('database/schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db


def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv


### ROUTES

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

@app.route('/allaanmalda')
def list_page():
    return render_template("allaanmalda.html")

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


if __name__ == '__main__':
    app.run()
