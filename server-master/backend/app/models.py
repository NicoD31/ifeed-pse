from django.db import models
from django.contrib.postgres.fields import JSONField, ArrayField
from enum import Enum
from .ocal import Ocal

MAX_DIGITS = 30
DECIMAL_PLACES = 20

class FeedbackModes(Enum):
    """There are three different feedback modes. The feedback mode decides how the next
    object should be chosen.

    system: 
        The system decides which object should be labeled next (by using a
        certain query strategy stored in the attribute queryStrategy).
    user: 
        The User chooses the next object himself.
    hybrid: 
        The system gives a recommendation about which object should be labeled
        next, but the User can decide whether he follows the suggestion or chooses a
        different object. The query strategy in queryStrategy is used to give the
        recommendation.

    """
    SYSTEM = "system"
    USER = "user"
    HYBRID = "hybrid"


class HistoryModes(Enum):
    """There are three different history modes. The history mode decides if and what
    information should be given to the User about the past iterations.

    noHistory: 
        The User gets no information about his past iterations.
    decisions: 
        The User can look up his past decisions (which label was chosen during
        which iteration).
    heatmaps: 
        The User can look up the state of the heatmaps at the beginning of
        each iteration. He can also see how he labeled the object in this very iteration.
    """
    NO_HISTORY = "noHistory"
    DECISIONS = "decisions"
    HEATMAPS = "heatmaps"


class Labels(Enum):
    """Represents the different possible labels of an element.

    U:
        Elements labeled “U” have not yet been labeled.
    inlier: 
        Elements labeled “inlier” have been labeled to be a “normal” element.
    outlier: 
        Elements labeled “outlier” dont fit to the majority of other elements of the dataset.

    """
    U = {'user': "U", 'final': "NOT DEFINED"}
    INLIER = {'user': "Lin", 'final': "inlier"}
    OUTLIER = {'user': "Lout", 'final': "outlier"}


class DatasetType(models.Model):
    """Parameters which objects can be assigned.

    name = models.CharField(max_length=10, unique=True)
        Name of the Type.
    """
    name = models.CharField(max_length=30, unique=True)


class Params(models.Model):
    """Parameters which objects can be assigned.

    name = models.CharField(max_length=10, unique=True)
        Name of the parameter.
    type = models.CharField(choices=[("int", "int"), ("double", "double"), ("string", "string")], max_length=10)
        Datatype of the parameter.
    regex = models.CharField(max_length=30)
        Specify the data type using a regex.
    """
    name = models.CharField(max_length=10, unique=True)
    type = models.CharField(
        choices=[("int", "int"), ("double", "double"), ("string", "string")], max_length=10)
    regex = models.CharField(max_length=30)


class Classifier(models.Model):
    """Classifier for the OcalAPI.

    name = models.CharField(max_length=20, unique=True)
        name of the classifier.
    params = models.ManyToManyField(Params)
        parameter of the classifier.
    """
    name = models.CharField(max_length=20, unique=True)
    params = models.ManyToManyField(Params)


class QueryStrategy(models.Model):
    """Querystrategy for the OcalAPU

    name = models.CharField(max_length=30, unique=True)
        name of the query strategy.
    params = models.ManyToManyField(Params)
        parameter of the query strategy.
    """
    name = models.CharField(max_length=30, unique=True)
    params = models.ManyToManyField(Params)


class Dataset(models.Model):
    """Class Dataset describes a Dataset, its type, a description, its name and a groundtruth.

    Attributes
    ----------
    name: models.TextField()
        The name of the Dataset
    type: models.TextField()
        The type of the Dataset.
    description: models.TextField()
        A description of the Dataset and what it represents.
    dataset: JSONField()
        Feature data of the Dataset.
    rawData: JSONField()
        The raw data of the Dataset. This is to help the User with his decisions.
    groundTrouth: JSONField()
        A Dataset specific groundtrouth. This is used to determine whether or not active learning is practical.
    normalizeFactor = models.DecimalField()
        The factor the dataset is normalized.
    """

    name = models.CharField(max_length=30, unique=True)
    type = models.ForeignKey(
        DatasetType, related_name='type', on_delete=models.CASCADE)
    description = models.TextField()
    dataset = JSONField()
    datasetNormalized = JSONField()
    rawData = JSONField()
    groundtruth = JSONField()
    normalizeFactor = ArrayField(ArrayField(
        models.DecimalField(max_digits=MAX_DIGITS, decimal_places=DECIMAL_PLACES)))


class Person(models.Model):
    """Describes a Person interacting with the system.

    name = models.CharField(unique=True, max_length=40)
        The unique name of a Person. The uniqueness is
        guaranteed by the field ünique=True". If you try to create an object with the
        attribute name already existing a django.db.IntegrityError will be thrown.
    isDeactivated = models.BooleanField(default=False)
        whether this Person is deactivated or not.

    """
    name = models.CharField(unique=True, max_length=40)
    isDeactivated = models.BooleanField(default=False)


class Admin(Person):
    """An Admin has control over the system. He can create, delete and edit Users, Sessions, Setups and Datasets.

    password = models.CharField(max_length=128)
        The password for an Admin to log in to the system.
    """
    # where will we hash this?
    password = models.CharField(max_length=128)


class User(Person):
    """A User is an active participant of one or more Sessions."""
    pass


class Setup(models.Model):
    """Class for modelling a Setup on the dataserver. The attributes are the parameters, which
    an Admin has chosen during the Setup-creation, the metadata and the average values
    over all Sessions, which are gathered automatically by the system and cannot be
    manipulated by the Admin. The following attributes are metadata:
    • creationTime
    • creator
    The remaining attributes are the following parameters.

    Attributes
    ----------
    name: models.TextField()
        The unique name of the Setup
    description: models.TextField()
        A description of the Setup.
    params: JSONField()
        The needed parameter for the classifier.
    rawData: models.BooleanField()
        Determines whether or not the User is allowed to see the raw data.
    rewindable: models.BooleanField()
        Determines whether or not the User is allowed to rewind his last input..
    subspaces: models.IntegerField()
        The number of subspaces the User is allowed to see.
    subspaceGrids: ArrayField(ArrayField(models.DecimalField()))
        The scalingfactor of the heatmap grid.
    subspaceGridsNormalized = ArrayField(ArrayField(ArrayField(
        models.DecimalField(max_digits=10, decimal_places=6))))
        The scalingfactor of the heatmap grid normalized.
    maxAnswereTime: models.IntegerField()
        The maximum time for a User to select his label.
    creationTime: models.IntegerField()
        The time when the Setup was created.
    finishedCreation: models.BooleanField()
        whether the setup creation is final or not.
    creator: models.ForeignKey(Admin, related_name='admDatasetTypein', on_delete=models.CASCADE)
        The creator of this setup.
    iterations: models.IntegerField()
        The number of iterations a session need.
    queryStrategy = models.ForeignKey(QueryStrategy, related_name='setups', on_delete=models.CASCADE)
        The queryStrategy of the session for the OcalAPI.
    historyMode = models.CharField(choices=[(tag.value, tag.name) for tag in HistoryModes], max_length=30)
        The history mode of the session.
    feedbackMode = models.CharField(choices=[(tag.value, tag.name) for tag in FeedbackModes], max_length=30)
        The feedback mode of the session.
    dataset = models.ForeignKey(Dataset, related_name='setups', on_delete=models.CASCADE)
        The dataset over which the session is to run.
    classifier = models.ForeignKey(Classifier, related_name='setups', on_delete=models.CASCADE)
        The classifier for the OcalAPI.
    """
    name = models.CharField(max_length=30, unique=True)
    description = models.TextField()
    params = JSONField()
    rawData = models.BooleanField()
    rewindable = models.BooleanField()
    subspacesShown = models.IntegerField()
    subspaces = ArrayField(ArrayField(
        models.IntegerField()))
    subspaceGrids = ArrayField(ArrayField(ArrayField(
        models.DecimalField(max_digits=MAX_DIGITS, decimal_places=DECIMAL_PLACES))))
    subspaceGridsNormalized = ArrayField(ArrayField(ArrayField(
        models.DecimalField(max_digits=MAX_DIGITS, decimal_places=DECIMAL_PLACES))))
    maxAnswerTime = models.IntegerField()
    creationTime = models.IntegerField()
    finishedCreation = models.BooleanField()
    creator = models.ForeignKey(
        Admin, related_name='admin', on_delete=models.CASCADE)
    iterations = models.IntegerField()
    queryStrategy = models.ForeignKey(
        QueryStrategy, related_name='setups', on_delete=models.CASCADE)
    historyMode = models.CharField(
        choices=[(tag.value, tag.name) for tag in HistoryModes], max_length=30)
    feedbackMode = models.CharField(
        choices=[(tag.value, tag.name) for tag in FeedbackModes], max_length=30)
    dataset = models.ForeignKey(
        Dataset, related_name='setups', on_delete=models.CASCADE)
    classifier = models.ForeignKey(
        Classifier, related_name='setups', on_delete=models.CASCADE)

    def get_ocal(self):
        val = self.dataset.datasetNormalized["values"]
        o = Ocal()
        return o.get_ocal(self, val, list(map(lambda x: "U", val)), [])


class Session(models.Model):
    """A Session object represents a single Session. Each Session belongs to exactly one
    Setup and one User. The Session object contains all data collected for this Session: The
    time spent editing, the number of iterations, the number of pauses, the number of
    undone labels, the heatmaps of each iteration, as well as the chosen label of each
    iteration.

    inProgress = models.IntegerField()
        The time passed since the Session has been started.
    iteration = models.IntegerField()
        The current iteration.
    pauses = models.IntegerField()
        The number of pauses the User has made.
    rewinds = models.IntegerField()
        The number of rewinds the User has made.
    heatmaps = ArrayField(ArrayField(JSONField()))
        A set of heatmaps for this and previous iterations.
    finished = models.BooleanField()
        Truth value whether the session has ended.
    setup = models.ForeignKey(Setup, related_name='sessions', on_delete=models.CASCADE)
        Reference to the setup for this session.
    user = models.ForeignKey(User, related_name='sessions', on_delete=models.CASCADE)
        The user who conducts the session.
    labels = ArrayField(models.CharField(choices=[(tag.value['label'], tag.name) for tag in Labels], max_length=30))
        The current status of the user classification.
    history = ArrayField(ArrayField(models.IntegerField()))
        List of the ID's of the points which were chosen.
    userlabelMatchesAPI = ArrayField(ArrayField(models.BooleanField()))
        stores if user matches API
    """
    inProgress = models.IntegerField()
    iteration = models.IntegerField()
    pauses = models.IntegerField()
    rewinds = models.IntegerField()
    heatmaps = ArrayField(ArrayField(models.TextField()))
    finished = models.BooleanField()
    setup = models.ForeignKey(
        Setup, related_name='sessions', on_delete=models.CASCADE)
    user = models.ForeignKey(
        User, related_name='sessions', on_delete=models.CASCADE)
    labels = ArrayField(models.CharField(
        choices=[(tag.value['user'], tag.name) for tag in Labels], max_length=30))
    finalLabels = ArrayField(models.CharField(
        choices=[(tag.value['final'], tag.name) for tag in Labels], max_length=30))
    history = ArrayField(ArrayField(models.IntegerField()))
    userlabelMatchesAPI = ArrayField(ArrayField(models.BooleanField()))

    def get_name(self):
        return self.user.name + "_" + self.setup.name + "_s" + str(self.pk)

    def get_ocal(self):
        o = Ocal()
        ret = o.get_ocal(
            self.setup, self.setup.dataset.datasetNormalized["values"], self.labels, self.history)
        if 'prediction_global' in ret:
            self.finalLabels = ret['prediction_global']
            self.save()
        return ret
