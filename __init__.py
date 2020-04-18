from flask import Flask, render_template, g, request, json, send_file
import sqlite3
import csv
import re
from passwords import PASSWORDS

app      = Flask(__name__)
DATABASE = 'database/database.db'
SCHEMA   = 'database/schema.sql'
CSV_FILE = 'database/database.csv'
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

@app.route('/onskelista', methods=["GET"])
def wishlist_page():
    return render_template("onskelista.html", data=get_wishlist_content())

@app.route('/onskelista', methods=["POST"])
def reserve():
    data = request.get_json(force=True)
    if "numbers" in data and "items" in data:
        items = data["items"]
        numbers = data["numbers"]
        db = sqlite3.connect(DATABASE)
        c = db.cursor()
        for i in range(len(items)):
            try:
                number = int(numbers[i])
            except ValueError:
                return numbers[i] + " är ingen siffra.", 418
            # TODO: Lock this
            try:
                c.execute("SELECT nr_wished FROM Wishlist WHERE name=?", (items[i],))
                wished = c.fetchall()[0][0]
                c.execute("SELECT nr_to_buy FROM Wishlist WHERE name=?", (items[i],))
                free = c.fetchall()[0][0]
            except IndexError:
                return "Något gick fel. Ladda om sidan och försök igen!", 418
            if number > free:
                err = "Så många behövs inte! Reservera {} eller färre.".format(free)
                return err, 418
            query = "UPDATE Wishlist SET nr_to_buy=? WHERE name=?"
            c.execute(query, (free - number, items[i]))
            db.commit()
            # Unlock here (could do in db, but... mhe)
        return "Registrerat!", 200
    return "Inte implementerat än", 501

@app.route('/onskelistaadmin', methods=["GET"])
def modify_wishlist_page():
    return render_template("onskelista_admin.html", data=get_wishlist_content())

@app.route('/onskelistaadmin', methods=["POST"])
def add_to_wishlist():
    data = request.get_json(force=True)
    # Password check is duplicated code from allaanmalda
    if "enter_password" in data:
        if not correct_password(data["enter_password"], "enter"):
            return "Fel lösenord", 401
        else:
            return "Rätt lösenord", 200
    if "add_item" in data:
        items = data["add_item"]["items"]
        descriptions = data["add_item"]["descriptions"]
        cathegories = data["add_item"]["cathegories"]
        urls = data["add_item"]["urls"]
        numbers = data["add_item"]["numbers"]
	# TODO: Check valid input
        db = sqlite3.connect(DATABASE)
        c = db.cursor()
        try:
            for i in range(len(items)):
                if not (numbers[i] and items[i] and cathegories[i]):
                    return "Fyll i alla obligatoriska fält.", 418
                # TODO Kat excist
                # TODO antal be int
                c.execute("INSERT INTO Wishlist\
                        (name, description, cathegory, url, nr_wished, nr_to_buy) \
                        VALUES (?, ?, ?, ?, ?, ?)", (
                        items[i],
                        descriptions[i],
                        cathegories[i],
                        urls[i],
                        numbers[i],
                        numbers[i]))
                db.commit()
        except sqlite3.IntegrityError as e:
            return "Den saken finns redan.", 418
        # TODO: Foreign key error
        return "Lade till {} saker i önskelistan.".format(len(items)), 200
    if "add_cathegory" in data:
        cat = data["add_cathegory"]
        if not cat:
            return "Fyll i alla obligatoriska fält.", 418
        db = sqlite3.connect(DATABASE)
        c = db.cursor()
        try:
            c.execute("INSERT INTO Cathegory (name) VALUES (?)", (cat,))
            db.commit()
        except sqlite3.IntegrityError as e:
            return "Den kategorin finns redan.", 418
        return "Lade till en kategori i önskelistan.", 200
    if "remove" in data:
        return remove_entries("Wishlist", data["remove_password"], data["remove"])


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
                    (name, email, gluten, laktos, vegetarian, vegan, allergy, info) \
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)", (
                    data['name'],
                    data['email'],
                    data['gluten'],
                    data['laktos'],
                    data['vegetarian'],
                    data['vegan'],
                    data['allergy'],
                    data['other'],
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
        return "Tack för din anmälan, {}!".format(data["name"]), 200


@app.route('/anmalanadmin', methods=["GET"])
def list_page():
    def to_person_dict(data):
        titles = ("time", "name", "email", "gluten", "laktos",
                "vegetarian", "vegan", "other_allergy", "info")
        new = dict(zip(titles, data))
        time = new["time"]
        time = time[8:10] + "/" + time[6:7]
        new["time"] = time
        return new

    content = [to_person_dict(entry) for entry in get_db_content("Person")]
    for i in range(len(content)):
        content[i] = dict(zip(("number", "person"), (i + 1, content[i])))
    return render_template("anmalan_admin.html", data=content)


@app.route('/anmalanadmin', methods=["POST"])
def route_allaanmalda():
    """Passes the call to correct function."""
    data = request.get_json(force=True)
    if "enter_password" in data:
        if not correct_password(data["enter_password"], "enter"):
            return "Fel lösenord", 401
        else:
            return "Rätt lösenord", 200
    if "remove_password" in data:
        return remove_entries("Person", data["remove_password"], data["remove"])
    if "fetch_csv" in data:
        # Update and send csv-file
        titles = ("Anmäld", "Namn", "E-post", "Gluten", "Laktos",
                "Vegetarian", "Vegan", "Andra allergier", "Övrigt")
        content = [titles] + get_db_content("Person")
        csv.writer(open(CSV_FILE,"w+")).writerows(content)
        return send_file(CSV_FILE), 200
    return "Ogiltigt data skickades.", 401


### OTHER


def remove_entries(table, password, to_remove):
    """Removes requested entries if authorized."""
    if not correct_password(password, "remove"):
        return "Fel lösenord. Inga ändringar gjordes.", 401

    db = sqlite3.connect(DATABASE)
    c = db.cursor()
    request = "DELETE FROM {} WHERE name=?".format(table)
    try:
        for name in to_remove:
            c.execute(request, (name,))
        db.commit()
    # Should be no possible errors, but...
    except:
        return "Något gick fel.", 501
    return "Alla markerade anmälningar togs bort.", 200


def get_wishlist_content():
    def to_wish_dict(data):
        titles = ("name", "description", "cathegory", "url", "wished", "left_to_buy")
        return dict(zip(titles, data))

    content = [to_wish_dict(entry) for entry in get_db_content("Wishlist")]
    for i in range(len(content)):
        content[i] = dict(zip(("number", "wish"), (i + 1, content[i])))
    return content


def get_db_content(table):
    """Returns everything from table in the database."""
    db = sqlite3.connect(DATABASE)
    c = db.cursor()
    request = "SELECT * FROM {}".format(table)
    c.execute(request)
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
        faulty['name'] = "Du måste ange ditt fullständiga namn (dvs för- och efternamn)!"
    if not OK_EMAIL.fullmatch(data['email']):
        faulty['email'] = "'{}' är inte en giltig e-postadress.".format(data['email'])

    return faulty


if __name__ == '__main__':
    init_db()
    app.run(host="0.0.0.0")
