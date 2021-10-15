import simplejson as jsons
import json
import requests

ERROR = {'detail': 'Connection to API failed'}
HOST = 'http://localhost:8081/'

"""
This class establishes an ocalAPI connection and processes the data.
"""
class Ocal():
    def api_connection(self, address, jsonInput):
        try:
            return requests.post(address, data=jsonInput, headers={'content-type': 'application/json', 'accept': 'application/json'}).json()
        except Exception as e:
            return ERROR

    def get_ocal_connection_JSON(self, data, labels, params, classifier, queryStrategy, queryHistory, subspaces, subspaceGrids):
        dict = {}
        dict["data"] = data
        dict["labels"] = labels
        dict["params"] = params
        dict["params"]["classifier"] = classifier
        dict["params"]["query_strategy"] = queryStrategy
        dict["query_history"] = queryHistory
        dict["subspaces"] = subspaces
        dict["subspace_grids"] = subspaceGrids
        return dict

    def get_ocal(self, setup, val, labels, history):
        dict = self.get_ocal_connection_JSON(
            val, labels, setup.params, setup.classifier.name,  setup.queryStrategy.name, history, setup.subspaces, setup.subspaceGridsNormalized)
        js = jsons.dumps(dict, use_decimal=True)
        ret = self.api_connection(HOST, js)
        return ret
