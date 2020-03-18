from flask import Flask, render_template, g, request
import sqlite3
import re

app = Flask(__name__)
DATABASE = 'database/database.db'


def show_db():
    print("DB person content:")
    db = sqlite3.connect(DATABASE)
    c = db.cursor()
    c.execute("select * from Person")
    print(c.fetchall())


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
    data = request.get_json(force=True)
    db = sqlite3.connect(DATABASE)
    c = db.cursor()
    faulty = check_signup_data(data)
    print(faulty)
    if not faulty:
        """
        try:
            c.execute("insert into Person (name, info) \
                    values ('%s', 'Testdata')" % data['name'])
            db.commit()
        except sqlite3.IntegrityError:
            # TODO: Send error to html page? (Mark area red) Or do that check earlier (js)?
            print("That person already signed up!")
        # TODO: Except name error (wrong json...)
        """
        return "OK", 200
    else:
        # TODO: Jsonify faulty
        return faulty, 418

    show_db()
    return render_template("anmal_ny.html"), 200


@app.route('/allaanmalda')
def list_page():
    return render_template("allaanmalda.html")


### OTHER

def check_signup_data(data):
    faulty = {}
    ok_email = re.compile("[A-z0-9]+@[A-z0-9]+\.[A-z0-9]+")
    if not data['name']:
        faulty['name'] = "Du måste ange ditt fullständiga namn!"
    # TODO: Namnet redan anmält
    if not ok_email.fullmatch(data['email']):
        faulty['email'] = "'" + data['email'] + "' är inte en giltig e-postadress."
    return faulty


if __name__ == '__main__':
    app.run()
