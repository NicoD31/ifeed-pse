import django
from app.models import *
from .helper import *


def create_dataset_types():
    datasetType = [
        DatasetType(name="image"),
        DatasetType(name="timeline")
    ]
    save(DatasetType, "DatasetType", datasetType)


def create_params():
    params = [
        Params(name="C", type="double", regex="^(0(\.\d+)?)|(1(\.0+)?)"),
        Params(
            name="gamma", type="double", regex="^([+-]?([0-9]*[.])?[0-9]+)$"),
    ]
    save(Params, "Params", params)


def create_classifier():
    classifier = [
        Classifier(name="VanillaSVDD"),
        Classifier(name="SVDDNeg"),
        Classifier(name="SSAD"),
    ]
    save(Classifier, "Classifier", classifier)


def create_query_strategy():
    queryStrategy = [
        QueryStrategy(name="MinimumMarginQs"),
        QueryStrategy(
            name="ExpectedMinimumMarginQs"),
        QueryStrategy(name="MaximumEntropyQs"),
        QueryStrategy(name="MinimumLossQs"),
        QueryStrategy(name="HighConfidenceQs"),
        QueryStrategy(name="DecisionBoundaryQs"),
        QueryStrategy(name="NeighborhoodBasedQs"),
        QueryStrategy(
            name="BoundaryNeighborCombination"),
        QueryStrategy(name="RandomQs"),
        QueryStrategy(name="RandomOutlierQs"),
    ]
    save(QueryStrategy, "QueryStrategie", queryStrategy)

# password = root
def create_admin():
    admins = [
        Admin(name="admin", password="72,19,73,77,19,126,22,49,187,163,1,213,172,171,110,123,183,170,116,206,17,133,212,86,86,94,245,29,115,118,119,178")
    ]
    save(Admin, "Admin", admins)


def create_user():
    pass


def create_datasets():
    pass


def create_setups():
    pass


def create_sessions():
    pass


def createDefaultObjects():
    delete_tables()
    create_dataset_types()
    create_params()
    create_classifier()
    create_query_strategy()
    create_admin()
    create_user()
    create_datasets()
    create_setups()
    create_sessions
    print("Connect Classifier And Params")
    for c in Classifier.objects.all():
        for p in Params.objects.all():
            c.params.add(p)
