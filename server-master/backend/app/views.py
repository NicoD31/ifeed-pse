from django.shortcuts import render
from rest_framework.generics import RetrieveUpdateDestroyAPIView, ListCreateAPIView, ListAPIView
from .models import Dataset
from .serializer import *


class OcalAPISetup(RetrieveUpdateDestroyAPIView):
    """Class to delete, display and edit setup objects. 
    With additional attribute which provides the evaluation of the OcalAPI.
    serializer_class = OcalAPISetupSerializer
        The class that defines how to serialize.
    lookup_field = 'pk'
        The field by which the objects are identified.
    queryset = Setup.objects.get_queryset()
        The list from which the objects to be sent originate.
    """
    serializer_class = OcalAPISetupSerializer
    lookup_field = 'pk'
    queryset = Setup.objects.get_queryset()


class OcalAPI(RetrieveUpdateDestroyAPIView):
    """Class to delete, display and edit session objects. 
    With additional attribute which provides the evaluation of the OcalAPI.

    serializer_class = OcalAPISerializer
        The class that defines how to serialize.
    lookup_field = 'pk'
        The field by which the objects are identified.
    queryset = Session.objects.all()
        The list from which the objects to be sent originate.
    """
    serializer_class = OcalAPISerializer
    lookup_field = 'pk'
    queryset = Session.objects.get_queryset()


class ListFeedbackModes(ListAPIView):
    serializer_class = EnumSerializer
    queryset = [f for f in FeedbackModes]


class ListHistoryModes(ListAPIView):
    serializer_class = EnumSerializer
    queryset = [f for f in HistoryModes]


class ListLabels(ListAPIView):
    serializer_class = EnumWithJSONSerializer
    queryset = [f for f in Labels]


class ListDatasetType(ListCreateAPIView):
    """Class for listing and filtering Param objects.

    serializer_class = ParamsSerializer
        The class that defines how to serialize.
    queryset = Params.objects.all()
        The list from which the objects to be sent originate.
    filter_fields = ('id', 'name')
        The filters by which the list can be searched.
    """
    serializer_class = DatasetTypeSerializer
    queryset = DatasetType.objects.get_queryset()
    filter_fields = ('id', 'name')


class ListParams(ListCreateAPIView):
    """Class for listing and filtering Param objects.

    serializer_class = ParamsSerializer
        The class that defines how to serialize.
    queryset = Params.objects.all()
        The list from which the objects to be sent originate.
    filter_fields = ('id', 'name', 'type')
        The filters by which the list can be searched.
    """
    serializer_class = ParamsSerializer
    queryset = Params.objects.get_queryset()
    filter_fields = ('id', 'name', 'type')


class ListClassifier(ListCreateAPIView):
    """Class for listing and filtering Classifier objects.

    serializer_class = ClassifierSerializer
        The class that defines how to serialize.
    queryset = Classifier.objects.all()
        The list from which the objects to be sent originate.
    filter_field = ('id', 'name')
        The filters by which the list can be searched.
    """
    serializer_class = ClassifierSerializer
    queryset = Classifier.objects.get_queryset()
    filter_field = ('id', 'name')


class ListQueryStrategy(ListCreateAPIView):
    """Class for listing and filtering query strategy objects.

    serializer_class = QueryStrategySerializer
        The class that defines how to serialize.
    queryset = QueryStrategy.objects.all()
        The list from which the objects to be sent originate.
    filter_field = ('id', 'name')
        The filters by which the list can be searched.
    """
    serializer_class = QueryStrategySerializer
    queryset = QueryStrategy.objects.get_queryset()
    filter_field = ('id', 'name')


class ListDataset(ListCreateAPIView):
    """Class for listing and filtering Dataset objects.

    serializer_class = DatasetSerializer
        The class that defines how to serialize.
    queryset = Dataset.objects.all()
        The list from which the objects to be sent originate.
    filter_fields = ('id', 'name')
        The filters by which the list can be searched.
    """
    serializer_class = DatasetSerializer
    queryset = Dataset.objects.get_queryset()
    filter_fields = ('id', 'name')


class ModifyDataset(RetrieveUpdateDestroyAPIView):
    """Class to delete, display and edit dataset objects.

    serializer_class = DatasetSerializer
        The class that defines how to serialize.
    lookup_field = 'pk'
        The field by which the objects are identified.
    queryset = Dataset.objects.all()
        The list from which the objects to be sent originate.
    """
    serializer_class = DatasetSerializer
    lookup_field = 'pk'
    queryset = Dataset.objects.get_queryset()


class ListPerson(ListCreateAPIView):
    """Class for listing and filtering person objects.

    serializer_class = PersonSerializer
        The class that defines how to serialize.
    queryset = Person.objects.all()
        The list from which the objects to be sent originate.
    filter_fields = ('id', 'name')
        The filters by which the list can be searched.
    lookup_field = 'pk'
        The field by which the objects are identified.
    """
    serializer_class = PersonSerializer
    queryset = Person.objects.get_queryset()
    filter_fields = ('id', 'name', 'isDeactivated')
    lookup_field = 'pk'


class ModifyPerson(RetrieveUpdateDestroyAPIView):
    """Class to delete, display and edit person objects.

    serializer_class = PersonSerializer
        The class that defines how to serialize.
    lookup_field = 'pk'
        The field by which the objects are identified.
    queryset = Person.objects.all()
        The list from which the objects to be sent originate.

    """
    serializer_class = PersonSerializer
    lookup_field = 'pk'
    queryset = Person.objects.get_queryset()


class ListAdmin(ListCreateAPIView):
    """Class for listing and filtering admin objects.

    serializer_class = AdminSerializer
        The class that defines how to serialize.
    queryset = Admin.objects.all()
        The list from which the objects to be sent originate.
    filter_fields = ('id', 'name', 'password')
        The filters by which the list can be searched.
    """
    serializer_class = AdminSerializer
    queryset = Admin.objects.get_queryset()
    filter_fields = ('id', 'name', 'isDeactivated', 'password')


class ModifyAdmin(RetrieveUpdateDestroyAPIView):
    """Class to delete, display and edit admin objects.

    serializer_class = AdminSerializer
        The class that defines how to serialize.
    lookup_field = 'pk'
        The field by which the objects are identified.
    queryset = Admin.objects.all()
        The list from which the objects to be sent originate.
    """
    serializer_class = AdminSerializer
    lookup_field = 'pk'
    queryset = Admin.objects.get_queryset()


class ListUser(ListCreateAPIView):
    """Class for listing and filtering user objects.

    serializer_class = UserSerializer
        The class that defines how to serialize.
    queryset = User.objects.all()
        The list from which the objects to be sent originate.The list from which the objects to be sent originate.
    filter_fields = ('id', 'name')
        The filters by which the list can be searched.
    """
    serializer_class = UserSerializer
    queryset = User.objects.get_queryset()
    filter_fields = ('id', 'name', 'isDeactivated')


class ModifyUser(RetrieveUpdateDestroyAPIView):
    """Class to delete, display and edit user objects.

    serializer_class = UserSerializer
        The class that defines how to serialize.
    lookup_field = 'pk'
        The field by which the objects are identified.
    queryset = User.objects.all()
        The list from which the objects to be sent originate.
    """
    serializer_class = UserSerializer
    lookup_field = 'pk'
    queryset = User.objects.get_queryset()


class ListSetup(ListCreateAPIView):
    """Class for listing and filtering setup objects.

    erializer_class = SetupSerializer
        The class that defines how to serialize.
    queryset = Setup.objects.all()
        The list from which the objects to be sent originate.
    filter_fields = ('name', 'creator', 'dataset')
        The filters by which the list can be searched.
    """
    serializer_class = SetupSerializer
    queryset = Setup.objects.get_queryset()
    filter_fields = ('name', 'creator', 'dataset', 'subspacesShown')


class ModifySetup(RetrieveUpdateDestroyAPIView):
    """Class to delete, display and edit setup objects.

    serializer_class = SetupSerializer
        The class that defines how to serialize.
    lookup_field = 'pk'
        The field by which the objects are identified.
    queryset = Setup.objects.all()
        The list from which the objects to be sent originate.

    """
    serializer_class = SetupSerializer
    lookup_field = 'pk'
    queryset = Setup.objects.get_queryset()


class ListSession(ListCreateAPIView):
    """Class for listing and filtering session objects.

    serializer_class = SessionSerializer
        The class that defines how to serialize.
    queryset = Session.objects.all()
        The list from which the objects to be sent originate.
    filter_fields = ('user', 'setup')
        The filters by which the list can be searched.
    """
    serializer_class = SessionSerializer
    queryset = Session.objects.get_queryset()
    filter_fields = ('user', 'setup')


class ModifySession(RetrieveUpdateDestroyAPIView):
    """Class to delete, display and edit session objects.

    serializer_class = SessionSerializer
        The class that defines how to serialize.
    lookup_field = 'pk'
        The field by which the objects are identified.
    queryset = Session.objects.all()
        The list from which the objects to be sent originate.
    """
    serializer_class = SessionSerializer
    lookup_field = 'pk'
    queryset = Session.objects.get_queryset()
