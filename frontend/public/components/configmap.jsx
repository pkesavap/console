import React from 'react';

import {makeDetailsPage, makeListPage, makeList} from './factory';
import ConfigMapAndSecretData from './configmap-and-secret-data';
import {Cog, LabelList, navFactory, ResourceCog, ResourceLink, Timestamp} from './utils';

const menuActions = [Cog.factory.ModifyLabels, Cog.factory.Delete];

const ConfigMapHeader = () => <div className="row co-m-table-grid__head">
  <div className="col-md-4">Config Map Name</div>
  <div className="col-md-4">Config Map Data</div>
  <div className="col-md-4">Config Map Age</div>
</div>;

const ConfigMapRow = ({obj: configMap}) => {
  const data = Object.keys(configMap.data || {}).length;
  const age = moment(configMap.metadata.creationTimestamp).fromNow();

  return <div className="row co-resource-list__item">
    <div className="col-md-4">
      <ResourceCog actions={menuActions} kind="configmap" resource={configMap} />
      <ResourceLink kind="configmap" name={configMap.metadata.name} namespace={configMap.metadata.namespace} title={configMap.metadata.uid} />
    </div>
    <div className="col-md-4">{data}</div>
    <div className="col-md-4">{age}</div>
  </div>;
};

const ConfigMapDetails = (configMap) => {
  return <div className="row">
    <div className="col-md-12">
      <div className="co-m-pane">
        <div className="co-m-pane__body">
          <dl>
            <dt>Name</dt>
            <dd>{configMap.metadata.name}</dd>
            <dt>Labels</dt>
            <dd><LabelList kind="configmap" labels={configMap.metadata.labels} /></dd>
            <dt>Created At</dt>
            <dd><Timestamp timestamp={configMap.metadata.creationTimestamp} /></dd>
          </dl>
        </div>

        <div></div>

        <div className="co-m-pane__heading">
          <h1 className="co-m-pane__title">Data</h1>
        </div>
        <div className="co-m-pane__body">
          <ConfigMapAndSecretData data={configMap.data} />
        </div>
      </div>
    </div>
  </div>;
};

const pages = [navFactory.details(ConfigMapDetails), navFactory.editYaml()];

const ConfigMaps = makeList('ConfigMaps', 'configmap', ConfigMapHeader, ConfigMapRow);
const ConfigMapsPage = makeListPage('ConfigMapsPage', 'configmap', ConfigMaps);
const ConfigMapsDetailsPage = makeDetailsPage('ConfigMapsDetailsPage', 'configmap', pages, menuActions);

export {ConfigMaps, ConfigMapsPage, ConfigMapsDetailsPage};
