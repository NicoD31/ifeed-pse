import django
import os
import sys
import random


def generate(debug):
    from setup.mockObjects import createMockObjects
    from setup.defaultObjects import createDefaultObjects

    print("START generate\n#############################")
    print("START makemigrations\n+++++++++++++++++++++++++++++")
    os.system("python manage.py makemigrations")
    print("START migrate\n+++++++++++++++++++++++++++++")
    os.system("python manage.py migrate")
    print("START init\n+++++++++++++++++++++++++++++")
    createDefaultObjects()
    if debug:
        print("Generate mock-objects")
        createMockObjects()
    print("TERMINATED generate")


def init():
    from app.models import Admin, Params, Classifier, QueryStrategy, User, Dataset, Session, Setup, DatasetType


if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
    django.setup()
    if sys.argv[1] == "generate":
        generate(False)
    elif sys.argv[1] == "generate-mock":
        generate(True)
