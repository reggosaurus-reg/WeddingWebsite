#!/bin/bash
source venv/bin/activate
pip3 install -r requirements.txt
gunicorn --bind $1 wsgi:app
