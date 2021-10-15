# Server
## Setup & Installation (tested with Ubuntu)
The following steps must be followed to set up the system:
* First create a postgres database ('NAME': 'backendpse', 'USER': 'admin', 'PASSWORD': 'password'). 
* Correct the host in the backend/backend/setting.py file. The default value is "localhost".
* Now generate a virtual environment in the folder "server/backend" with the command "python3 -m venv myvenv". After successful creation, start the virtual environment with "source myvenv/bin/activate". 
* Install all packages with the command "pip install -r requirements.txt".
* Run "python manage.py makemigrations app"
* Start the script setup.py with the command "python setup.py generate". This command generates the migrations and adds all required objects to the database.
* Now your project should be executable.

## Runserver
* Start the virtual environment with "source myvenv/bin/activate". 
* Execute the command "python3 manage.py runserver".

## Reset Database
* Delete file "backend/app/migrations/0001_initial.py"
* Log in to the Postres database.
* Start the input with "psql".
* Execute the command "drop database backendpse;".
* Execute the command "create database backendpse with owner admin;".
* Start the virtual environment with "source myvenv/bin/activate". 
* Start the script setup.py with the command "python setup.py generate". This command generates the migrations and adds all required objects to the database.
