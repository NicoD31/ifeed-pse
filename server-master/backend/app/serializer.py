from rest_framework import serializers
from drf_queryfields import QueryFieldsMixin
from .models import *
import simplejson as jsons
import json
import requests
from .ocal import Ocal


class OcalAPISetupSerializer(QueryFieldsMixin, serializers.ModelSerializer):
    """Serializer for OcalAPI. Has a nested class Meta
    The class calls the OcalAPI and forwards the setup with another attribute ocal to the client.

    ocal = serializers.SerializerMethodField()
        The result of the OcalAPI.
    """
    ocal = serializers.SerializerMethodField()

    def get_ocal(self, obj):
        return obj.get_ocal()

    class Meta:
        """Contains attributes for serialisation

        Attributes
        ----------
        model
            The model it is serializing.
        fields
            The fields which are being serialized.
        """
        model = Setup
        fields = ('id', 'name', 'description', 'params', 'rawData', 'rewindable', 'subspacesShown', 'subspaces', 'subspaceGrids',
                  'subspaceGridsNormalized', 'iterations', 'maxAnswerTime',
                  'creationTime',
                  'dataset', 'feedbackMode', 'historyMode', 'creator', 'queryStrategy', 'finishedCreation', 'sessions', 'creator', 'classifier', 'ocal')
        read_only = ('ocal')


class OcalAPISerializer(QueryFieldsMixin, serializers.ModelSerializer):
    """Serializer for OcalAPI. Has a nested class Meta
    The class calls the OcalAPI and forwards the session with another attribute ocal to the client.

    ocal = serializers.SerializerMethodField()
        The result of the OcalAPI.
    name = serializers.SerializerMethodField()
        The name of the Session.
    """

    ocal = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()

    def get_name(self, obj):
        return obj.get_name()

    def get_ocal(self, obj):
        return obj.get_ocal()

    class Meta:
        """Contains attributes for serialisation

        Attributes
        ----------
        model
            The model it is serializing.
        fields
            The fields which are being serialized.
        """
        model = Session
        fields = ('id', 'name', 'inProgress', 'iteration', 'pauses', 'rewinds',
                  'history', 'heatmaps', 'labels', 'finalLabels', 'finished', 'setup', 'user', 'userlabelMatchesAPI', 'ocal')
        read_only = ('ocal')


class EnumSerializer(QueryFieldsMixin, serializers.Serializer):
    value = serializers.CharField(max_length=30)
    name = serializers.CharField(max_length=30)


class EnumWithJSONSerializer(QueryFieldsMixin, serializers.Serializer):
    value = serializers.DictField()
    name = serializers.CharField(max_length=30)


class DatasetTypeSerializer(QueryFieldsMixin, serializers.ModelSerializer):
    """Serializer for DatasetType. Has a nested class Meta"""

    class Meta:
        """contains attributes for serialisation

        Attributes
        ----------
        model
            The model it is serializing.
        fields
            The fields which are being serialized.
        """
        model = DatasetType
        fields = ('id', 'name',)


class ParamsSerializer(QueryFieldsMixin, serializers.ModelSerializer):
    """Serializer for ClassifierParams. Has a nested class Meta"""

    class Meta:
        """contains attributes for serialisation

        Attributes
        ----------
        model
            The model it is serializing.
        fields
            The fields which are being serialized.
        """
        model = Params
        fields = ('id', 'name', 'type', 'regex',)


class ClassifierSerializer(QueryFieldsMixin, serializers.ModelSerializer):
    """Serializer for Classifier. Has a nested class Meta"""

    class Meta:
        """contains attributes for serialisation

        Attributes
        ----------
        model
            The model it is serializing.
        fields
            The fields which are being serialized.
        """
        model = Classifier
        fields = ('id', 'name', 'params',)


class QueryStrategySerializer(QueryFieldsMixin, serializers.ModelSerializer):
    """Serializer for Classifier. Has a nested class Meta"""

    class Meta:
        """contains attributes for serialisation

        Attributes
        ----------
        model
            The model it is serializing.
        fields
            The fields which are being serialized.
        """
        model = QueryStrategy
        fields = ('id', 'name', 'params',)


class DatasetSerializer(QueryFieldsMixin, serializers.ModelSerializer):
    """Serializer for Datasets. Has a nested class Meta"""

    typename = serializers.SerializerMethodField()

    def get_typename(self, obj):
        return obj.type.name

    class Meta:
        """Contains attributes for serialisation

        Attributes
        ----------
        model
            The model it is serializing.
        fields
            The fields which are being serialized.
        """
        model = Dataset
        fields = ('id', 'name', 'type', 'typename', 'description',
                  'dataset', 'datasetNormalized', 'rawData', 'groundtruth', 'normalizeFactor')


class SetupSerializer(QueryFieldsMixin, serializers.ModelSerializer):
    """Serializer for Setups. Has a nested class Meta"""

    class Meta:
        """Contains attributes for serialisation

                Attributes
                ----------
                model
                    The model it is serializing.
                fields
                    The fields which are being serialized.
                """
        model = Setup
        fields = (
            'id', 'name', 'description', 'params', 'rawData', 'rewindable', 'subspacesShown', 'subspaces', 'subspaceGrids', 'subspaceGridsNormalized', 'iterations', 'maxAnswerTime',
            'creationTime',
            'dataset', 'feedbackMode', 'historyMode', 'creator', 'queryStrategy', 'finishedCreation', 'sessions', 'creator', 'classifier')


class SessionSerializer(QueryFieldsMixin, serializers.ModelSerializer):
    """Serializer for Sessions. Has a nested class Meta"""

    name = serializers.SerializerMethodField()

    def get_name(self, obj):
        return obj.get_name()

    class Meta:
        """Contains attributes for serialisation

                Attributes
                ----------
                model
                    The model it is serializing.
                fields
                    The fields which are being serialized.
                """
        model = Session
        fields = '__all__'


class PersonSerializer(QueryFieldsMixin, serializers.ModelSerializer):

    class Meta:
        """Contains attributes for serialisation

                Attributes
                ----------
                model
                    The model it is serializing.
                fields
                    The fields which are being serialized.
                """
        model = Person
        fields = ('id', 'name', 'isDeactivated')


class AdminSerializer(QueryFieldsMixin, serializers.ModelSerializer):
    """Serializer for Admins. Has a nested class Meta"""

    class Meta:
        """Contains attributes for serialisation

                Attributes
                ----------
                model
                    The model it is serializing.
                fields
                    The fields which are being serialized.
                """
        model = Admin
        fields = ('id', 'name', 'password', 'isDeactivated')


class UserSerializer(QueryFieldsMixin, serializers.ModelSerializer):
    """Serializer for Users. Has a nested class Meta"""

    class Meta:
        """Contains attributes for serialisation

                Attributes
                ----------
                model
                    The model it is serializing.
                fields
                    The fields which are being serialized.
                """
        model = User
        fields = ('id', 'name', 'isDeactivated')
