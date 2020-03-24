from flask import Flask, render_template, g, request, json
import sqlite3
import re

app = Flask(__name__)
DATABASE = 'database/database.db'


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
    faulty = check_signup_data(data)
    db = sqlite3.connect(DATABASE)
    c = db.cursor()

    try:
        c.execute("insert into Person (name, info) \
                values ('%s', 'Testdata')" % data['name'])
        # Save data if no data check has gone wrong
        if not faulty:
            db.commit()
    except sqlite3.IntegrityError:
        faulty['name'] = "'" + data['name'] + "' är redan anmäld. \
        Kontakta sidansvarig om du misstänker att något inte stämmer."
        return json.jsonify(faulty), 418

    # TODO: Except name error (wrong json...)

    if faulty:
        return json.jsonify(faulty), 418
    else:
        print(get_db_content()) # DEBUG
        return render_template("anmal_ny.html"), 200


@app.route('/allaanmalda')
def list_page():
    content = []
    # TODO: Wipe DB and add email column
    titles = ("name", "info",
              "gluten", "laktos", "vegetarian", "vegan", "other_allergy")
    for entry in get_db_content():
       content.append(dict(zip(titles, entry)))
    #content = dict(enumerate(content))
    return render_template("allaanmalda.html", data=content)


### OTHER


def get_db_content():
    db = sqlite3.connect(DATABASE)
    c = db.cursor()
    c.execute("select * from Person")
    return c.fetchall()


def check_signup_data(data):
    """ Examines entered data and returns a dictionary as {field: error_message} """
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
