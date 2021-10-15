import django
import random
import csv
import itertools
import json
from app.models import *

INITIAL_DATE = 1551254068

tables = [DatasetType, Classifier, QueryStrategy, Params,
          Dataset, Setup, Session, Person]


def delete_tables():
    print("Delete all")
    for table in tables:
        for o in table.objects.all():
            o.delete()


def save(model, modelName, list):
    if len(model.objects.all()) == 0:
        print("Add "+modelName+" Object")
        for m in list:
            m.save()


def generate_setup(name, rawData, rewindable, params, dimSubspaces, queryStrategy, historyMode, feedbackMode, dataset, classifier, iterations, maxtime=-1):
    grids = []
    nGrids = []
    for i in range(-10, 11):
        for j in range(-10, 11):
            grids.append([i * 0.7, j * 0.7])
            nGrids.append([abs(i * 0.1), abs(j * 0.1)])
    subspaces = [list(x) for x in itertools.combinations(
        range(1, dimSubspaces + 1), 2)]
    finalGrids = []
    nFinalGrids = []
    for i in subspaces:
        finalGrids.append(grids)
        nFinalGrids.append(nGrids)
    return Setup(name=name, description="...", rawData=rawData, rewindable=rewindable,
                 params=params,
                 subspacesShown=dimSubspaces,
                 subspaces=subspaces,
                 subspaceGrids=finalGrids,
                 subspaceGridsNormalized=nFinalGrids,
                 maxAnswerTime=maxtime, creationTime=INITIAL_DATE, finishedCreation=True,
                 creator=Admin.objects.get(name="admin"),
                 iterations=iterations,
                 queryStrategy=QueryStrategy.objects.get(
                     name=queryStrategy),
                 historyMode=historyMode, feedbackMode=feedbackMode,
                 dataset=Dataset.objects.get(name=dataset),
                 classifier=Classifier.objects.get(name=classifier))


def load_JSON(file):
    with open(file) as f:
        return json.load(f)


def generate_session_by_json(file, setup, user):
    val = load_JSON(file)
    return Session(
        inProgress=val["inProgress"],
        iteration=val["iteration"],
        pauses=val["pauses"],
        rewinds=val["rewinds"],
        heatmaps=val["heatmaps"],
        finished=val["finished"],
        setup=setup,
        user=user,
        finalLabels=val["finalLabels"],
        labels=val["labels"],
        history=val["history"],
        userlabelMatchesAPI=val["userlabelMatchesAPI"],
    )


def generate_session(setup, user, labels):
    return Session(inProgress=0, iteration=0, pauses=0, rewinds=0,
                   heatmaps=[], finished=False,
                   setup=Setup.objects.get(name=setup),
                   user=User.objects.get(name=user), finalLabels=[],
                   labels=labels, history=[], userlabelMatchesAPI=[])


def generate_MNIST_dataset():
    rawData = load_JSON('setup/data/mnist_raw.json')
    with open('setup/data/mnist_features.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        line_count = 0
        labels = []
        stringDataset = []
        normalizeFactor = []
        for row in csv_reader:
            if line_count == 0:
                titles = row
                for t in titles:
                    normalizeFactor.append([-7, 7])
                line_count += 1
            else:
                stringDataset.append(row)
                labels.append("U")
                line_count += 1
        dataset = []
        for line in stringDataset:
            datasetLine = []
            for e in line:
                datasetLine.append(float(e))
            dataset.append(datasetLine)
    return {
        "dataset": Dataset(name="MNIST", type=DatasetType.objects.get(name="image"),
                           description="This is the MNIST data set.",
                           dataset={
                               "titles": titles,
                               "preInformation": [],
                               "values": dataset,
        }, datasetNormalized={
                               "titles": titles,
                               "preInformation": [],
                               "values": dataset,
        },
            rawData=rawData,
            groundtruth={},
            normalizeFactor=normalizeFactor),
        "labels": labels
    }


def generate_dataset(name, dim, num, titlePraefix, type):
    from app.models import Admin, Params, Classifier, QueryStrategy, User, Dataset, Session, Setup
    titles = []
    values = []
    rawData = []
    labels = []
    normalizeFactor = []
    for i in range(dim):
        titles.append(titlePraefix + str(i))
        normalizeFactor.append([-7, 7])
    for m in range(num):
        dataList = []
        rawDataList = []
        for i in range(dim):
            x = random.randint(-7, 8)
            dataList.append(x / 7)
            rawDataList.append(x)
        values.append(dataList)
        rawData.append(rawDataList)
        labels.append("U")
    return {
        "dataset": Dataset(name=name, type=type,
                           description="This is automatic generated Test Dataset",
                           dataset={
                               "titles": titles,
                               "preInformation": [],
                               "values": values,
                           }, datasetNormalized={
                               "titles": titles,
                               "preInformation": [],
                               "values": values,
                           },
                           rawData=rawData,
                           groundtruth={},
                           normalizeFactor=normalizeFactor),
        "labels": labels,
    }
