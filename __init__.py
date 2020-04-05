from flask import Flask, render_template, g, request, json
import sqlite3
import re
from passwords import PASSWORDS

app      = Flask(__name__)
DATABASE = 'database/database.db'
SCHEMA   = 'database/schema.sql'
NAME_LENGTH     = 100
EMAIL_LENGTH    = 100
INFO_LENGTH     = 500
ALLERGY_LENGTH  = 200
LOCAL = "[A-z0-9!#$%&'*+-/=?^_`{|}~\.]+"
DOMAIN = "[A-z0-9]+\.[A-z0-9\-\.]*[A-z0-9]"
OK_EMAIL = re.compile(LOCAL + "@" + DOMAIN) # Not entirely correct, but almost
OK_NAME = re.compile(".+ .+")


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
    data['name'] = data['name'].title().strip()
    data['email'] = data['email'].lower().strip()
    faulty = check_signup_data(data)
    db = sqlite3.connect(DATABASE)
    c = db.cursor()

    try:
        # This way of calling execute (execute(sql,args)) also should escape input
        c.execute("INSERT INTO Person \
                    (name, email, info, gluten, laktos, vegetarian, vegan, allergy) \
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)", (
                    data['name'],
                    data['email'],
                    data['other'],
                    data['gluten'],
                    data['laktos'],
                    data['vegetarian'],
                    data['vegan'],
                    data['allergy']
                    ))
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
        #print(get_db_content()) # DEBUG
        return "Tack för din anmälan, {}!".format(data["name"]), 200


@app.route('/allaanmalda', methods=["GET"])
def list_page():
    def to_person_dict(data):
        titles = ("name", "email", "info", "time",
              "gluten", "laktos", "vegetarian", "vegan", "other_allergy")
        new = dict(zip(titles, data))
        time = new["time"]
        time = time[8:10] + "/" + time[6:7]
        new["time"] = time
        return new

    content = [to_person_dict(entry) for entry in get_db_content()]
    for i in range(len(content)):
        content[i] = dict(zip(("number", "person"), (i + 1, content[i])))
    return render_template("allaanmalda.html", data=content)


@app.route('/allaanmalda', methods=["POST"])
def route_allaanmalda():
    """Passes the call to correct function."""
    data = request.get_json(force=True)
    if "enter_password" in data:
        if not correct_password(data["enter_password"], "enter"):
            return "Fel lösenord", 401
        else:
            return "Rätt lösenord", 200
    if "remove_password" in data:
        return remove_entries(data["remove_password"], data["remove"])
    return "Ogiltigt data skickades.", 401


### OTHER


def remove_entries(password, to_remove):
    """Removes requested entries if authorized."""
    if not correct_password(password, "remove"):
        return "Fel lösenord. Inga ändringar gjordes.", 401

    db = sqlite3.connect(DATABASE)
    c = db.cursor()
    try:
        for name in to_remove:
            c.execute("DELETE FROM Person WHERE name=?", (name,))
        db.commit()
    # Should be no possible errors, but...
    except:
        return "Något gick fel.", 501
    return "Alla markerade anmälningar togs bort.", 200


def get_db_content():
    """Returns everything in the database."""
    db = sqlite3.connect(DATABASE)
    c = db.cursor()
    c.execute("SELECT * FROM Person")
    return c.fetchall()


def init_db():
    """Creates a database if none exists."""
    db = sqlite3.connect(DATABASE)
    with app.open_resource(SCHEMA, mode='r') as f:
        db.cursor().executescript(f.read())
    db.commit()


def correct_password(entered, occasion):
    """Checks if a password is valid according to the password array."""
    return entered == PASSWORDS[occasion]


def check_signup_data(data):
    """Examines entered data and returns a dictionary as {field: error_message}."""
    faulty = {}
    # Lengths
    name_diff = len(data['name']) - NAME_LENGTH
    email_diff = len(data['email']) - EMAIL_LENGTH
    info_diff = len(data['other']) - INFO_LENGTH
    allergy_diff = len(data['allergy']) - ALLERGY_LENGTH
    if name_diff > 0:
        faulty['name'] = "Ditt namn är {} tecken för långt.".format(name_diff)
    if email_diff > 0:
        faulty['email'] = "Din e-post är {} tecken för lång.".format(email_diff)
    if info_diff > 0:
        faulty['info'] = "Ditt meddelande är {} tecken för långt.".format(info_diff)
    if allergy_diff > 0:
        faulty['allergy'] = "Texten är {} tecken för lång.".format(allergy_diff)

    # Format
    if not OK_NAME.fullmatch(data['name']):
        faulty['name'] = "Du måste ange ditt fullständiga namn!"
    if not OK_EMAIL.fullmatch(data['email']):
        faulty['email'] = "'{}' är inte en giltig e-postadress.".format(data['email'])

    return faulty


if __name__ == '__main__':
    init_db()
    app.run()
