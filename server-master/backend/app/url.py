from django.conf.urls import url
from .views import *
import requests
import json

"""
This list contains all paths which can be addressed and the corresponding object which is returned.
"""
urlpatterns = [
    url(r'listfeedbackmode/$', ListFeedbackModes.as_view()),
    url(r'listhistorymode/$', ListHistoryModes.as_view()),
    url(r'listlabels/$', ListLabels.as_view()),
    url(r'listdatasettype/$', ListDatasetType.as_view()),
    url(r'listparams/$', ListParams.as_view()),
    url(r'listclassifier/$', ListClassifier.as_view()),
    url(r'listquerystrategy/$', ListQueryStrategy.as_view()),
    url(r'listdatasets/$', ListDataset.as_view()),
    url(r'listdatasets/item/(?P<pk>[0-9]+)/$', ModifyDataset.as_view()),
    url(r'listpersons/$', ListPerson.as_view()),
    url(r'listpersons/item/(?P<pk>[0-9]+)/$', ModifyPerson.as_view()),
    url(r'listuser/$', ListUser.as_view()),
    url(r'listuser/item/(?P<pk>[0-9]+)/$', ModifyUser.as_view()),
    url(r'listadmins/$', ListAdmin.as_view()),
    url(r'listadmins/item/(?P<pk>[0-9]+)/$', ModifyAdmin.as_view()),
    url(r'listsetups/$', ListSetup.as_view()),
    url(r'listsetups/item/(?P<pk>[0-9]+)/$', ModifySetup.as_view()),
    url(r'listsetups/ocal/(?P<pk>[0-9]+)/$', OcalAPISetup.as_view()),
    url(r'listsessions/$', ListSession.as_view()),
    url(r'listsessions/item/(?P<pk>[0-9]+)/$', ModifySession.as_view()),
    url(r'listsessions/ocal/(?P<pk>[0-9]+)/$', OcalAPI.as_view())
]
