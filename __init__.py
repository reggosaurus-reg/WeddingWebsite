from flask import Flask, render_template, g, request
import sqlite3

app = Flask(__name__)
DATABASE = 'database/database.db'
db = sqlite3.connect(DATABASE)
cursor = db.cursor()

def test_db():
    #cursor.execute("insert into Person (name, info) values ('Test Testsson', 'Hej jag testar')")
    db.commit()
    cursor.execute("select * from Person")
    print(cursor.fetchall())

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

@app.route('/anmalan', methods=["GET"])
def signup_page():
    return render_template("anmalan.html")

@app.route('/anmalan', methods=["POST"])
def sign_another_page():
    data = request.get_json()
    print("Data from post:", data)
    return render_template("anmal_ny.html")

@app.route('/allaanmalda')
def list_page():
    return render_template("allaanmalda.html")


if __name__ == '__main__':
    app.run()
    test_db()
