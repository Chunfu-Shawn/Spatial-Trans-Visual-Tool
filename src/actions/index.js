import {scaleOrdinal} from 'd3-scale';
import {schemeCategory10, schemePaired} from 'd3-scale-chromatic';
import {saveAs} from 'file-saver';
import {find, findIndex, groupBy, indexOf, isArray} from 'lodash';
import OpenSeadragon from 'openseadragon';
import isPlainObject from 'react-redux/lib/utils/isPlainObject';
import CustomError from '../CustomError';
import {getPassingFilterIndices} from '../dataset_filter';
import {DirectAccessDataset} from '../DirectAccessDataset';
import {createCategoryToStats} from '../MetaEmbedding';

import {getPositions} from '../ThreeUtil';
import {
  addFeatureSetsToX,
  CATEGORY_20B,
  CATEGORY_20C,
  createColorScale,
  createEmbeddingDensity,
  FEATURE_TYPE,
  FEATURE_TYPE_MEASURES_EXCLUDE,
  getFeatureSets,
  getInterpolator,
  indexSort,
  randomSeq,
  summarizeDensity,
  TRACE_TYPE_IMAGE,
  TRACE_TYPE_META_IMAGE,
  TRACE_TYPE_SCATTER,
  updateTraceColors,
} from '../util';

export const DEFAULT_POINT_SIZE = 1;
export const DEFAULT_MARKER_OPACITY = 1;
export const DEFAULT_UNSELECTED_MARKER_OPACITY = 0.1;
export const DEFAULT_INTERPOLATORS = {};
DEFAULT_INTERPOLATORS[FEATURE_TYPE.X] = {
  name: 'Viridis',
  reversed: false,
  value: getInterpolator('Viridis'),
};
DEFAULT_INTERPOLATORS[FEATURE_TYPE.COUNT] = {
  name: 'Greys',
  reversed: false,
  value: getInterpolator('Greys'),
};
DEFAULT_INTERPOLATORS[FEATURE_TYPE.OBS] = {
  name: 'Inferno',
  reversed: false,
  value: getInterpolator('Inferno'),
};
DEFAULT_INTERPOLATORS[FEATURE_TYPE.MODULE] = {
  name: 'RdBu',
  reversed: true,
  value: getInterpolator('RdBu'),
};

export const DEFAULT_DISTRIBUTION_PLOT_INTERPOLATOR = 'Reds';
export const DEFAULT_DRAG_MODE =
  process.env.REACT_APP_DEFAULT_DRAG_MODE || 'pan';

export const DEFAULT_SHOW_AXIS = true;
export const DEFAULT_SHOW_FOG = false;
export const DEFAULT_DARK_MODE = window.matchMedia
  ? window.matchMedia('(prefers-color-scheme: dark)').matches
  : false;
export const DEFAULT_LABEL_FONT_SIZE = 14;
export const DEFAULT_LABEL_STROKE_WIDTH = 4;

export const SET_DRAG_DIVIDER = 'SET_DRAG_DIVIDER';
export const SET_WINDOW_SIZE = 'SET_WINDOW_SIZE';
export const SET_DRAWER_OPEN = 'SET_DRAWER_OPEN';
export const SET_EMBEDDING_LABELS = 'SET_EMBEDDING_LABELS';
export const SET_DISTRIBUTION_PLOT_INTERPOLATOR =
  'SET_DISTRIBUTION_PLOT_INTERPOLATOR';
export const SET_CHART_OPTIONS = 'SET_CHART_OPTIONS';
export const SET_COMBINE_DATASET_FILTERS = 'SET_COMBINE_DATASET_FILTERS';
export const SET_DATASET_FILTERS = 'SET_DATASET_FILTERS'; // saved dataset filters
export const SET_DATASET_VIEWS = 'SET_DATASET_VIEWS'; // saved dataset views

export const SET_LEGEND_SCROLL_POSITION = 'SET_LEGEND_SCROLL_POSITION';
export const SET_ACTIVE_FEATURE = 'SET_ACTIVE_FEATURE';
export const SET_CHART_SIZE = 'SET_CHART_SIZE';
export const SET_SERVER_INFO = 'SET_SERVER_INFO';
export const SET_DATASET_FILTER = 'SET_DATASET_FILTER';
export const UPDATE_DATASET = 'UPDATE_DATASET';
export const SET_GLOBAL_FEATURE_SUMMARY = 'SET_GLOBAL_FEATURE_SUMMARY';

export const SET_DOMAIN = 'SET_DOMAIN';
export const UPDATE_CATEGORICAL_COLOR = 'UPDATE_CATEGORICAL_COLOR';
export const SET_CATEGORICAL_NAME = 'SET_CATEGORICAL_NAME';
export const UPDATE_CATEGORICAL_NAME = 'UPDATE_CATEGORICAL_NAME';
export const SET_MARKER_OPACITY = 'SET_MARKER_OPACITY';

export const SET_UNSELECTED_MARKER_OPACITY = 'SET_UNSELECTED_MARKER_OPACITY';

export const SET_SELECTION = 'SET_SELECTION';
export const SET_FEATURE_SUMMARY = 'SET_FEATURE_SUMMARY';

export const SET_SEARCH_TOKENS = 'SET_SEARCH_TOKENS';

export const SET_SELECTED_LAYERS = 'SET_SELECTED_LAYERS';
export const SET_SELECTED_EMBEDDING = 'SET_SELECTED_EMBEDDING';
export const SET_MESSAGE = 'SET_MESSAGE';
export const SET_INTERPOLATOR = 'SET_INTERPOLATOR';
export const SET_POINT_SIZE = 'SET_POINT_SIZE';
export const SET_UNSELECTED_POINT_SIZE = 'SET_UNSELECTED_POINT_SIZE';

export const SET_EMAIL = 'SET_EMAIL';
export const SET_USER = 'SET_USER';
export const SET_DATASET = 'SET_DATASET';
export const SET_MARKERS = 'SET_MARKERS';
export const SET_DIALOG = 'SET_DIALOG';

export const OPEN_DATASET_DIALOG = 'OPEN_DATASET_DIALOG';
export const EDIT_DATASET_DIALOG = 'EDIT_DATASET_DIALOG';
export const SAVE_DATASET_FILTER_DIALOG = 'SAVE_DATASET_FILTER_DIALOG';
export const SAVE_FEATURE_SET_DIALOG = 'SAVE_FEATURE_SET_DIALOG';
export const HELP_DIALOG = 'HELP_DIALOG';
export const DELETE_DATASET_DIALOG = 'DELETE_DATASET_DIALOG';

export const SET_DATASET_CHOICES = 'SET_DATASET_CHOICES';

export const SET_DISTRIBUTION_DATA = 'SET_DISTRIBUTION_DATA';
export const SET_SELECTED_DISTRIBUTION_DATA = 'SET_SELECTED_DISTRIBUTION_DATA';

export const SET_DISTRIBUTION_PLOT_OPTIONS = 'SET_DISTRIBUTION_PLOT_OPTIONS';
export const SET_EMBEDDING_DATA = 'SET_EMBEDDING_DATA';

export const ADD_TASK = 'ADD_TASK';
export const REMOVE_TASK = 'REMOVE_TASK';

export const SET_TAB = 'SET_TAB';

export const SET_LOADING_APP = 'LOADING_APP';

export const SET_JOB_RESULTS = 'SET_JOB_RESULTS';
export const SET_JOB_RESULT = 'SET_JOB_RESULT';
//let auth = new NoAuth();

export function getEmbeddingKey(embedding, includeDensity = true) {
  let key = embedding.name;
  if (embedding.mode != null && includeDensity) {
    key += '_' + embedding.mode;
  }
  return key;
}

export function getTraceKey(trace) {
  return trace.name + '_' + getEmbeddingKey(trace.embedding);
}

export function init(dataset,geneId) {
  return function (dispatch, getState) {
    dispatch(_setLoadingApp({loading: true, progress: 0}));
    const startTime = new Date().getTime();
    const approximateColdBootTime = 10;

    function loadingAppProgress() {
      if (getState().loadingApp.loading) {
        let elapsed = (new Date().getTime() - startTime) / 1000;
        let p = Math.min(100, 100 * (elapsed / approximateColdBootTime));
        dispatch(_setLoadingApp({loading: true, progress: p}));
        if (p < 100) {
          window.setTimeout(loadingAppProgress, 300);
        }
      }
    }

    window.setTimeout(loadingAppProgress, 500);
    dispatch(_setLoadingApp({loading: false}));
    const task = {name: 'Load Dataset'};
    dispatch(addTask(task));
    if(dataset !== null){
      try{
        dispatch(setDataset(dataset,geneId))
      }catch (err){
        handleError(
            dispatch,
            err,
            'Unable to retrieve datasets. Please try again.'
        );
      }
    }
    dispatch(removeTask(task))
    return Promise.resolve();
  };
}

export function deleteFeatureSet(id) {
  return function (dispatch, getState) {
    const task = {name: 'Delete set'};
    dispatch(addTask(task));
    try {
      let markers = getState().markers;
      let found = false;
      for (let i = 0; i < markers.length; i++) {
        if (markers[i].id === id) {
          markers.splice(i, 1);
          found = true;
          break;
        }
      }
      if (!found) {
        console.log('Unable to find feature set id ' + id);
      }
      dispatch(setMarkers(markers.slice()));
      dispatch(setMessage('Set deleted'));
    }catch(err) {
      handleError(dispatch, err, 'Unable to delete set. Please try again.');
    }finally {
      dispatch(removeTask(task));
    };
  };
}

export function removeDatasetFilter(filterKey) {
  return function (dispatch, getState) {
    if (filterKey == null) {
      // clear all
      dispatch(setDatasetFilter({}));
    } else {
      let datasetFilter = getState().datasetFilter;
      if (filterKey === 'selection') {
        for (let key in datasetFilter) {
          if (Array.isArray(datasetFilter[key])) {
            delete datasetFilter[key];
          }
        }
      } else {
        delete datasetFilter[filterKey];
      }
      dispatch(setDatasetFilter(Object.assign({}, datasetFilter)));
    }
    dispatch(handleFilterUpdated());
  };
}

function getDatasetFilterDependencies(datasetFilter) {
  let features = new Set();
  let basis = new Set();
  for (let key in datasetFilter) {
    // basis, path for brush filter
    const filterObject = datasetFilter[key];
    if (Array.isArray(filterObject)) {
      // brush filter
    } else if (filterObject.operation === 'in') {
      features.add(key);
    } else {
      if (
        filterObject.operation !== '' &&
        !isNaN(filterObject.value) &&
        filterObject.value != null
      ) {
        features.add(key);
      }
    }
  }
  return {features: features, basis: basis};
}

export function getDatasetFilterNames(datasetFilter) {
  const names = [];
  let isBrushing = false;
  for (let key in datasetFilter) {
    const value = datasetFilter[key];
    if (Array.isArray(value)) {
      isBrushing = true;
    } else if (value.operation === 'in') {
      names.push(key);
    } else if (
      value.operation != null &&
      value.operation !== '' &&
      !isNaN(value.value) &&
      value.value != null
    ) {
      names.push(key);
    }
  }
  if (isBrushing) {
    names.push('selection');
  }
  return names;
}

export function getDatasetFilterArray(datasetFilter) {
  let filters = [];
  const brushIndices = new Set();
  // brush filters are combined with OR
  for (let key in datasetFilter) {
    // basis, path for brush filter
    const value = datasetFilter[key];
    if (Array.isArray(value)) {
      value.forEach((brushFilter) => {
        brushFilter.indices.forEach((index) => brushIndices.add(index));
      });
    }
  }
  if (brushIndices.size > 0) {
    filters.push(['__index', 'in', brushIndices]);
  }
  for (let key in datasetFilter) {
    const value = datasetFilter[key];
    let f = null;
    if (Array.isArray(value)) {
      continue;
    }
    if (value.operation === 'in') {
      f = [key, value.operation, value.value];
    } else if (
      value.operation != null &&
      value.operation !== '' &&
      !isNaN(value.value) &&
      value.value != null
    ) {
      f = [key, value.operation, value.value];
    }
    if (f != null) {
      filters.push(f);
    }
  }
  return filters;
}

function getFilterJson(state) {
  return datasetFilterToJson(
    state.dataset,
    state.datasetFilter,
    state.combineDatasetFilters
  );
}

export function datasetFilterToJson(
  dataset,
  datasetFilter,
  combineDatasetFilters
) {
  let filters = getDatasetFilterArray(datasetFilter);
  if (filters.length > 0) {
    const obs = dataset.obs;
    const obsCat = dataset.obsCat;
    for (let i = 0; i < filters.length; i++) {
      // add obs/ prefix
      const filter = filters[i];
      if (filter[0] === '__index') {
        filter[2] = Array.from(filter[2]); // convert Set to array
      } else if (
        obsCat.indexOf(filter[0]) !== -1 ||
        obs.indexOf(filter[0]) !== -1
      ) {
        filter[0] = 'obs/' + filter[0];
      }
    }
    return {filters: filters, combine: combineDatasetFilters};
  }
}

export function downloadSelectedIds() {
  return function (dispatch, getState) {
    const task = {name: 'Download ids'};
    dispatch(addTask(task));
    const state = getState();
    let filter = getFilterJson(state, true);
    state.dataset.api
      .getSelectedIdsPromise(
        {
          filter: filter,
        },
        state.cachedData
      )
      .then((result) => {
        const blob = new Blob([result.ids.join('\n')], {
          type: 'text/plain;charset=utf-8',
        });
        saveAs(blob, 'selection.txt');
      })
      .finally(() => {
        dispatch(removeTask(task));
      })
      .catch((err) => {
        handleError(dispatch, err);
      });
  };
}

export function setDistributionPlotOptions(payload) {
  return {type: SET_DISTRIBUTION_PLOT_OPTIONS, payload: payload};
}

export function setChartOptions(payload) {
  return {type: SET_CHART_OPTIONS, payload: payload};
}

export function setDrawerOpen(payload) {
  return {type: SET_DRAWER_OPEN, payload: payload};
}

function _setCombineDatasetFilters(payload) {
  return {type: SET_COMBINE_DATASET_FILTERS, payload: payload};
}

export function setCombineDatasetFilters(payload) {
  return function (dispatch, getState) {
    dispatch(_setCombineDatasetFilters(payload));
    dispatch(handleFilterUpdated());
  };
}

export function setChartSize(payload) {
  return {type: SET_CHART_SIZE, payload: payload};
}

export function setWindowSize(payload) {
  return {type: SET_WINDOW_SIZE, payload: payload};
}

export function setDragDivider(payload) {
  return {type: SET_DRAG_DIVIDER, payload: payload};
}

export function _setActiveFeature(payload) {
  return {type: SET_ACTIVE_FEATURE, payload: payload};
}

export function setActiveFeature(payload) {
  return {type: SET_ACTIVE_FEATURE, payload: payload};
}

export function setLegendScrollPosition(payload) {
  return {type: SET_LEGEND_SCROLL_POSITION, payload: payload};
}

function setGlobalFeatureSummary(payload) {
  return {type: SET_GLOBAL_FEATURE_SUMMARY, payload: payload};
}

function setDatasetFilter(payload) {
  return {type: SET_DATASET_FILTER, payload: payload};
}

function setSelection(payload) {
  return {type: SET_SELECTION, payload: payload};
}

function setFeatureSummary(payload) {
  return {type: SET_FEATURE_SUMMARY, payload: payload};
}

function handleFilterUpdated() {
  return function (dispatch, getState) {
    const task = {name: 'Update Filter'};
    dispatch(addTask(task));
    // whenever filter is updated, we need to get selection statistics
    const state = getState();
    const searchTokens = state.searchTokens;
    let filter = getFilterJson(state);
    const groupedSearchTokens = groupBy(searchTokens, 'type');
    addFeatureSetsToX(
      getFeatureSets(
        state.markers,
        groupedSearchTokens[FEATURE_TYPE.FEATURE_SET] || []
      ),
      (searchTokens[FEATURE_TYPE.X] || []).map((item) => item.id)
    );

    const measures = [];
    for (const key in groupedSearchTokens) {
      if (FEATURE_TYPE_MEASURES_EXCLUDE.indexOf(key) === -1) {
        const prefix = key === FEATURE_TYPE.X ? '' : key + '/';
        groupedSearchTokens[key].forEach((item) =>
          measures.push(prefix + item.id)
        );
      }
    }

    let q = {
      selection: {
        measures: measures,
        dimensions: (groupedSearchTokens[FEATURE_TYPE.OBS_CAT] || []).map(
          (item) => item.id
        ),
      },
    };

    if (filter) {
      q.selection.filter = filter;
    }

    if (filter == null) {
      if (state.selection != null) {
        // reset
        dispatch(setSelection(null));
      }
      dispatch(setSelectedDistributionData([]));
      dispatch(setFeatureSummary({}));
      dispatch(removeTask(task));
      return;
    }

    const cachedData = state.cachedData;
    getState()
      .dataset.api.getDataPromise(q, cachedData)
      .then((result) => {
        dispatch(handleSelectionResult(result.selection, true));
      })
      .catch((err) => {
        handleError(dispatch, err);
      })
      .finally(() => dispatch(removeTask(task)));
  };
}

export function handleBrushFilterUpdated(payload) {
  return function (dispatch, getState) {
    const name = payload.name; // full basis name
    const value = payload.value; // value has basis and indices
    const clear = payload.clear;
    const indices = payload.value != null ? payload.value.indices : null;
    let datasetFilter = getState().datasetFilter;

    function clearFilters() {
      if (clear) {
        for (let key in datasetFilter) {
          const value = datasetFilter[key];
          if (Array.isArray(value)) {
            delete datasetFilter[key];
          }
        }
      }
    }

    let update = true;
    if (value == null || indices.size === 0) {
      // remove filter
      update = datasetFilter[name] != null;
      delete datasetFilter[name];
      clearFilters();
    } else {
      let priorFilters = datasetFilter[name];
      let isToggleRegion = false;
      if (priorFilters != null) {
        const priorIndex =
          value.id != null
            ? findIndex(priorFilters, (f) => f.id === value.id)
            : -1;
        if (priorIndex !== -1) {
          // toggle region
          isToggleRegion = true;
          priorFilters.splice(priorIndex, 1);
        }
      }
      if (!isToggleRegion) {
        clearFilters();
        priorFilters = datasetFilter[name];
        if (priorFilters == null) {
          priorFilters = [];
          datasetFilter[name] = priorFilters;
        }
        priorFilters.push({
          basis: value.basis,
          indices: indices,
          id: value.id,
        });
      }
    }
    if (update) {
      dispatch(setDatasetFilter(Object.assign({}, datasetFilter)));
      dispatch(handleFilterUpdated());
    }
  };
}

export function handleMeasureFilterUpdated(payload) {
  return function (dispatch, getState) {
    const name = payload.name;
    const operation = payload.operation;
    const value = payload.value;
    let update = payload.update;

    let datasetFilter = getState().datasetFilter;
    let filter = datasetFilter[name];

    if (filter == null) {
      filter = {operation: '>', value: NaN};
      datasetFilter[name] = filter;
    }
    if (update) {
      if (value != null) {
        update = !isNaN(value)
          ? value !== filter.value
          : isNaN(value) !== isNaN(filter.value);
      }
      if (operation != null) {
        update =
          update || (operation !== filter.operation && !isNaN(filter.value));
      }
    }
    if (operation != null) {
      filter.operation = operation;
    }
    if (value != null) {
      filter.value = value;
    }

    dispatch(setDatasetFilter(Object.assign({}, datasetFilter)));
    if (update) {
      dispatch(handleFilterUpdated());
    }
  };
}

export function handleDimensionFilterUpdated(payload) {
  return function (dispatch, getState) {
    let name = payload.name;
    let newValue = payload.value;
    let shiftKey = payload.shiftKey;
    let metaKey = payload.metaKey;
    let datasetFilter = getState().datasetFilter;
    let embeddingData = getState().embeddingData;
    let categories;
    for (let i = 0; i < embeddingData.length; i++) {
      if (embeddingData[i].name === name) {
        categories = embeddingData[i].colorScale.domain();
        break;
      }
    }
    let categoricalFilter = datasetFilter[name];
    if (categoricalFilter == null) {
      categoricalFilter = {operation: 'in', value: []};
      datasetFilter[name] = categoricalFilter;
    }

    if (shiftKey && categoricalFilter.value.length > 0) {
      // add last click to current
      let lastIndex = categories.indexOf(
        categoricalFilter.value[categoricalFilter.value.length - 1]
      );
      let currentIndex = categories.indexOf(newValue);
      // put clicked category at end of array
      if (currentIndex > lastIndex) {
        for (let i = lastIndex; i <= currentIndex; i++) {
          let index = categoricalFilter.value.indexOf(newValue);
          if (index !== -1) {
            categoricalFilter.value.splice(index, 1);
          }
          categoricalFilter.value.push(categories[i]);
        }
      } else {
        for (let i = lastIndex; i >= currentIndex; i--) {
          let index = categoricalFilter.value.indexOf(newValue);
          if (index !== -1) {
            categoricalFilter.value.splice(index, 1);
          }
          categoricalFilter.value.push(categories[i]);
        }
      }
    } else {
      let selectedIndex = categoricalFilter.value.indexOf(newValue);
      if (!metaKey) {
        // clear and toggle current
        categoricalFilter.value = [];
      }
      if (selectedIndex !== -1) {
        // exists, remove
        categoricalFilter.value.splice(selectedIndex, 1);
        if (categoricalFilter.value.length === 0) {
          delete datasetFilter[name];
        }
      } else {
        categoricalFilter.value.push(newValue);
      }
    }
    dispatch(setDatasetFilter(datasetFilter));
    dispatch(handleFilterUpdated());
  };
}

export function handleDomainChange(payload) {
  return {type: SET_DOMAIN, payload: payload};
}

function _handleCategoricalNameChange(payload) {
  return {type: SET_CATEGORICAL_NAME, payload: payload};
}

function handleUpdateCategoricalName(payload) {
  return {type: UPDATE_CATEGORICAL_NAME, payload: payload};
}

export function _handleColorChange(payload) {
  return {type: UPDATE_CATEGORICAL_COLOR, payload: payload};
}

export function handleColorChange(payload) {
  return function (dispatch, getState) {
    // save, but do not persist
    dispatch(_handleColorChange(payload));
  };
}

export function handleCategoricalNameChange(payload) {
  return function (dispatch, getState) {
    // save, but do not persist
    dispatch(handleUpdateCategoricalName(payload));
  };
}

export function setPointSize(payload) {
  return {type: SET_POINT_SIZE, payload: payload};
}

export function setUnselectedPointSize(payload) {
  return {type: SET_UNSELECTED_POINT_SIZE, payload: payload};
}

function getDefaultDatasetView(dataset) {
  const embeddingNames = dataset.embeddings.map((e) => e.name);
  let selectedEmbedding = null;
  let obsCat = null;
  if (embeddingNames.length > 0) {
    // default embedding view priorities
    let embeddingPriorities = ['tissue_hires','spatial', 'fle', 'umap', 'tsne'];
    let embeddingName = null;
    for (
      let priorityIndex = 0;
      priorityIndex < embeddingPriorities.length && embeddingName == null;
      priorityIndex++
    ) {
      for (let i = 0; i < embeddingNames.length; i++) {
        if (
          embeddingNames[i]
            .toLowerCase()
            .indexOf(embeddingPriorities[priorityIndex]) !== -1
        ) {
          embeddingName = embeddingNames[i];
          break;
        }
      }
    }

    if (embeddingName == null) {
      embeddingName = embeddingNames[0];
    }
    selectedEmbedding =
      dataset.embeddings[
        dataset.embeddings.map((e) => e.name).indexOf(embeddingName)
      ];
  }
  if (dataset.markers != null && dataset.markers.length > 0) {
    let category = dataset.markers[0].category;
    const suffix = ' (rank_genes_';
    let index = category.indexOf(suffix);
    if (index !== -1) {
      category = category.substring(0, index);
    }
    if (dataset.obsCat.indexOf(category) !== -1) {
      obsCat = category;
    }
  }
  if (obsCat == null) {
    // default metadata view priorities
    let catPriorities = [
      'anno',
      'cell_type',
      'celltype',
      'leiden',
      'louvain',
      'seurat_cluster',
      'cluster',
    ];
    for (
      let priorityIndex = 0;
      priorityIndex < catPriorities.length && obsCat == null;
      priorityIndex++
    ) {
      for (let i = 0; i < dataset.obsCat.length; i++) {
        if (
          dataset.obsCat[i]
            .toLowerCase()
            .indexOf(catPriorities[priorityIndex]) !== -1
        ) {
          obsCat = dataset.obsCat[i];
          break;
        }
      }
    }
  }

  return {selectedEmbedding, obsCat};
}

function loadDefaultDatasetView() {
  return function (dispatch, getState) {
    const dataset = getState().dataset;
    const {selectedEmbedding, obsCat} = getDefaultDatasetView(dataset);
    if (obsCat != null) {
      dispatch(setSearchTokens([{id: obsCat, type: FEATURE_TYPE.OBS_CAT}]));
    }
    if (selectedEmbedding != null) {
      dispatch(setSelectedEmbedding([selectedEmbedding]));
    }
  };
}

function loadGeneDefaultDatasetView(geneId) {
  return function (dispatch, getState) {
    const dataset = getState().dataset;
    const {selectedEmbedding} = getDefaultDatasetView(dataset);
    dispatch(setSearchTokens([{id: geneId, type: 'X'}]));
    if (selectedEmbedding != null) {
      dispatch(setSelectedEmbedding([selectedEmbedding]));
    }
  };
}

export function setMessage(payload) {
  return {type: SET_MESSAGE, payload: payload};
}

export function setInterpolator(payload) {
  return {type: SET_INTERPOLATOR, payload: payload};
}

export function setDistributionPlotInterpolator(payload) {
  return {type: SET_DISTRIBUTION_PLOT_INTERPOLATOR, payload: payload};
}

export function setEmbeddingData(payload) {
  return {type: SET_EMBEDDING_DATA, payload: payload};
}

export function setDialog(payload) {
  return {type: SET_DIALOG, payload: payload};
}

export function setMarkers(payload) {
  return {type: SET_MARKERS, payload: payload};
}

function addTask(payload) {
  return {type: ADD_TASK, payload: payload};
}

function removeTask(payload) {
  return {type: REMOVE_TASK, payload: payload};
}

export function setTab(payload) {
  return {type: SET_TAB, payload: payload};
}

function _setLoadingApp(payload) {
  return {type: SET_LOADING_APP, payload: payload};
}

function _setDataset(payload) {
  return {type: SET_DATASET, payload: payload};
}

export function setMarkerOpacity(payload) {
  return {type: SET_MARKER_OPACITY, payload: payload};
}

export function setUnselectedMarkerOpacity(payload) {
  return {type: SET_UNSELECTED_MARKER_OPACITY, payload: payload};
}

export function toggleEmbeddingLabel(payload) {
  return function (dispatch, getState) {
    const embeddingLabels = getState().embeddingLabels;
    const index = embeddingLabels.indexOf(payload);
    if (index === -1) {
      embeddingLabels.push(payload);
    } else {
      embeddingLabels.splice(index, 1);
    }
    return dispatch({
      type: SET_EMBEDDING_LABELS,
      payload: embeddingLabels.slice(),
    });
  };
}

function setDistributionData(payload) {
  return {type: SET_DISTRIBUTION_DATA, payload: payload};
}

function setSelectedDistributionData(payload) {
  return {type: SET_SELECTED_DISTRIBUTION_DATA, payload: payload};
}

export function setSearchTokens(tokens, updateActiveFeature = true) {
  return function (dispatch, getState) {
    dispatch({type: SET_SEARCH_TOKENS, payload: tokens});
    dispatch(_updateCharts(null, updateActiveFeature));
  };
}

export function setSelectedLayers(payload) {
  return function (dispatch, getState) {
    dispatch({type: SET_SELECTED_LAYERS, payload: payload});
    dispatch(_updateCharts(null));
  };
}

export function setSelectedEmbedding(payload) {
  return function (dispatch, getState) {
    const prior = getState().embeddings;
    dispatch({type: SET_SELECTED_EMBEDDING, payload: payload});
    dispatch(
      _updateCharts((err) => {
        dispatch({type: SET_SELECTED_EMBEDDING, payload: prior});
      })
    );
  };
}

function setDatasetViews(payload) {
  return {type: SET_DATASET_VIEWS, payload: payload};
}

export function setDataset(datasetInput, geneId=null, loadDefaultView = true, setLoading = true) {
  return function (dispatch, getState) {
    // force re-render selected dataset dropdown
    let dataset = Object.assign({}, datasetInput);
    dataset.id = datasetInput.id;
    dataset.embeddings = [];
    dataset.features = [];
    dataset.obs = [];
    dataset.obsCat = [];

    let categoryNameResults;
    let datasetViews = [];
    let newDataset;

    function onPromisesComplete() {
      newDataset = Object.assign({}, dataset, newDataset);
      newDataset.api = dataset.api;
      newDataset.id = dataset.id;
      dispatch(_setDataset(newDataset));

      if (categoryNameResults != null) {
        dispatch(_handleCategoricalNameChange(categoryNameResults));
      }
      dispatch(setDatasetViews(datasetViews));
      // dispatch(setDatasetFilters(datasetFilters));
      if(geneId !== null) {
          dispatch(loadGeneDefaultDatasetView(geneId));
      }else if (loadDefaultView) {
          dispatch(loadDefaultDatasetView());
        }
    }

    const task = setLoading ? {name: 'Set dataset'} : null;
    if (task) {
      dispatch(addTask(task));
    }

    dataset.api = new DirectAccessDataset();

    const initPromise = dataset.api.init(dataset.id, dataset.url);
    const promises = [initPromise];

    const schemaPromise = dataset.api.getSchemaPromise().then((result) => {
      newDataset = result;
    })
    promises.push(schemaPromise);

    return Promise.all(promises)
      .then(() => onPromisesComplete())
      .finally(() => {
        if (task) {
          dispatch(removeTask(task));
        }
      })
      .catch((err) => {
        handleError(
          dispatch,
          err,
          'Unable to retrieve dataset. Please try again.'
        );
      });
  };
}

function handleSelectionResult(selectionResult, clear) {
  // not need to clear when adding a new feature
  return function (dispatch, getState) {
    const state = getState();
    if (selectionResult) {
      dispatch(setSelection(selectionResult.indices));
      // userPoints are in chart space, points are in server space, count is total number of cells selected
      if (selectionResult.summary) {
        // merge or clear selection
        let selectionSummary = clear
          ? selectionResult.summary
          : Object.assign(
              {},
              getState().featureSummary,
              selectionResult.summary
            );
        dispatch(setFeatureSummary(selectionSummary));
      }
      if (selectionResult.distribution) {
        let selectedDistributionData = state.selectedDistributionData;
        if (clear) {
          selectedDistributionData = [];
        }
        const groupedSearchTokens = groupBy(state.searchTokens, 'type');
        addFeatureSetsToX(
          getFeatureSets(
            state.markers,
            groupedSearchTokens[FEATURE_TYPE.FEATURE_SET] || []
          ),
          (groupedSearchTokens[FEATURE_TYPE.X] || []).map((item) => item.id)
        );
        selectedDistributionData = updateDistributionData(
          selectionResult.distribution,
          selectedDistributionData,
          groupedSearchTokens
        );
        dispatch(setSelectedDistributionData(selectedDistributionData));
      }
    }
  };
}

function updateDistributionData(
  newDistributionData,
  existingDistributionData,
  groupedSearchTokens
) {
  let keys = new Set(Object.keys(existingDistributionData));
  if (newDistributionData) {
    for (const key in newDistributionData) {
      keys.add(key);
    }
  }
  keys.forEach((key) => {
    existingDistributionData[key] = _updateDistributionData(
      newDistributionData ? newDistributionData[key] : null,
      existingDistributionData[key] || [],
      groupedSearchTokens
    );
  });
  return existingDistributionData;
}

function _updateDistributionData(
  newDistributionData,
  existingDistributionData,
  groupedSearchTokens
) {
  const xTokens = (groupedSearchTokens[FEATURE_TYPE.X] || []).map(
    (item) => item.id
  );
  const obsCatTokens = (groupedSearchTokens[FEATURE_TYPE.OBS_CAT] || []).map(
    (item) => item.id
  );
  const obsTokens = (groupedSearchTokens[FEATURE_TYPE.OBS] || []).map(
    (item) => item.id
  );
  const moduleTokens = (groupedSearchTokens[FEATURE_TYPE.MODULE] || []).map(
    (item) => item.id
  );
  const dimensionKeys = [obsCatTokens.join('-')];
  // keep active dimensions and features only
  let distributionData = existingDistributionData.filter(
    (entry) =>
      dimensionKeys.indexOf(entry.dimension) !== -1 &&
      (xTokens.indexOf(entry.feature) !== -1 ||
        obsTokens.indexOf(entry.feature) !== -1 ||
        moduleTokens.indexOf(entry.feature) !== -1)
  );

  if (newDistributionData) {
    // remove old data that is also in new data
    newDistributionData.forEach((entry) => {
      for (let i = 0; i < distributionData.length; i++) {
        if (
          distributionData[i].dimension === entry.dimension &&
          distributionData[i].feature === entry.feature
        ) {
          distributionData.splice(i, 1);
          break;
        }
      }
    });
    distributionData = distributionData.concat(newDistributionData);
  }

  // sort features matching X entry order
  const featureSortOrder = {};
  xTokens
    .concat(obsTokens)
    .concat(moduleTokens)
    .forEach((name, index) => {
      featureSortOrder[name] = index;
    });
  distributionData.sort((a, b) => {
    a = featureSortOrder[a.feature];
    b = featureSortOrder[b.feature];
    return a - b;
  });
  return distributionData;
}

function _updateCharts(onError, updateActiveFeature = true) {
  return function (dispatch, getState) {
    const state = getState();
    if (state.dataset == null) {
      return;
    }

    const groupedSearchTokens = groupBy(state.searchTokens, 'type');
    Object.values(FEATURE_TYPE).forEach((key) => {
      if (!groupedSearchTokens[key]) {
        groupedSearchTokens[key] = []; // default
      }
    });
    const featureSetTokens = groupedSearchTokens[FEATURE_TYPE.FEATURE_SET];
    let xValues = groupedSearchTokens[FEATURE_TYPE.X].map((token) => token.id);
    const obsCatValues = groupedSearchTokens[FEATURE_TYPE.OBS_CAT].map(
      (token) => token.id
    );
    const obsValues = groupedSearchTokens[FEATURE_TYPE.OBS].map(
      (token) => token.id
    );
    const moduleValues = groupedSearchTokens[FEATURE_TYPE.MODULE].map(
      (token) => token.id
    );

    addFeatureSetsToX(getFeatureSets(state.markers, featureSetTokens), xValues);

    const embeddings = state.embeddings;
    let distributionData = state.distributionData;
    let selectedDistributionData = state.selectedDistributionData;
    let embeddingData = state.embeddingData;
    const globalFeatureSummary = state.globalFeatureSummary;
    const cachedData = state.cachedData;
    const embeddingsToFetch = [];
    const valuesToFetch = new Set();
    const embeddingKeys = new Set();
    const features = new Set();
    const filterJson = getFilterJson(state);
    xValues
      .concat(obsValues)
      .concat(obsCatValues)
      .concat(moduleValues)
      .forEach((feature) => {
        features.add(feature);
      });
    const newXValues = [];
    state.layers.forEach((layer) => {
      xValues.forEach((feature) => {
        features.add(layer + '/' + feature);
        newXValues.push(layer + '/' + feature);
      });
    });
    xValues = xValues.concat(newXValues);
    const embeddingImagesToFetch = [];
    embeddings.forEach((embedding) => {
      const embeddingKey = getEmbeddingKey(embedding);
      embeddingKeys.add(embeddingKey);
      if (cachedData[embeddingKey] == null) {
        if (embedding.dimensions > 0) {
          embeddingsToFetch.push(embedding);
        } else {
          if (cachedData[embedding.attrs.group] == null) {
            valuesToFetch.add(embedding.attrs.group);
          }

          embedding.attrs.selection.forEach((selection) => {
            if (cachedData[selection[0]] == null) {
              valuesToFetch.add(selection[0]);
            }
          });
          embeddingImagesToFetch.push(embedding);
        }
      }
    });
    const promises = [];
    embeddingImagesToFetch.forEach((embedding) => {
      const embeddingKey = getEmbeddingKey(embedding);
      if (cachedData[embeddingKey] == null) {
        const url = state.dataset.api.getFileUrl(embedding.image);
        const imagePromise = new Promise((resolve, reject) => {
          fetch(url)
            .then((result) => result.text())
            .then(
              (text) =>
                document.createRange().createContextualFragment(text)
                  .firstElementChild
            )
            .then((node) => {
              // inline css
              if (node.querySelector('style')) {
                const div = document.createElement('div');
                div.style.display = 'none';
                div.appendChild(node);
                document.body.appendChild(div);
                const style = node.querySelector('style');
                const rules = style.sheet.rules;

                for (let i = 0; i < rules.length; i++) {
                  const rule = rules[i];
                  const matches = node.querySelectorAll(rule.selectorText);
                  const styleMap = rule.styleMap;
                  for (let j = 0; j < matches.length; j++) {
                    const child = matches[j];
                    for (let key of styleMap.keys()) {
                      child.style[key] = styleMap.get(key).toString();
                    }
                  }
                }
                div.remove();
                style.remove();
              }
              cachedData[embeddingKey] = node;
              resolve();
            });
        });
        promises.push(imagePromise);
      }
    });
    if (filterJson != null) {
      let filterDependencies = getDatasetFilterDependencies(
        state.datasetFilter
      );
      filterDependencies.features.forEach((feature) => {
        if (cachedData[feature] == null) {
          valuesToFetch.add(feature);
        }
      });
    }
    features.forEach((feature) => {
      if (cachedData[feature] == null) {
        valuesToFetch.add(feature);
      }
    });
    // don't fetch "other" features but add to features so they are displayed in embeddings
    // "other" features need to be in cachedData and globalFeatureSummary
    const keys = Object.values(FEATURE_TYPE);
    const otherSearchTokenKeys = [];
    for (const key in groupedSearchTokens) {
      if (keys.indexOf(key) === -1) {
        otherSearchTokenKeys.push(key);
      }
    }

    otherSearchTokenKeys.forEach((key) => {
      groupedSearchTokens[key].forEach((item) => features.add(item.id));
    });
    // set active flag on cached embedding data
    embeddingData.forEach((trace) => {
      const embeddingKey = getEmbeddingKey(trace.embedding);
      const active =
        embeddingKeys.has(embeddingKey) &&
        (features.has(trace.name) ||
          (features.size === 0 && trace.name === '__count'));
      if (active) {
        trace.date = new Date();
      }
      trace.active = active;
    });

    const distributionCategories = obsCatValues.slice();
    const distributionCategoryKeys = [distributionCategories.join('-')];
    const distributionMeasuresToFetch = new Set();
    const distribution =
      (xValues.length > 0 ||
        moduleValues.length > 0 ||
        obsValues.length > 0 ||
        otherSearchTokenKeys.length > 0) &&
      obsCatValues.length > 0;
    if (distribution) {
      // TODO cleanup this code
      let cachedDistributionKeys = {}; // category-feature
      for (const key in distributionData) {
        distributionData[key].forEach((distributionDataItem) => {
          cachedDistributionKeys[
            distributionDataItem.name + '-' + distributionDataItem.feature
          ] = true;
        });
      }
      distributionCategoryKeys.forEach((category) => {
        xValues.forEach((feature) => {
          let key = category + '-' + feature;
          if (cachedDistributionKeys[key] == null) {
            distributionMeasuresToFetch.add(feature);
          }
        });
        obsValues.forEach((feature) => {
          let key = category + '-' + feature;
          if (cachedDistributionKeys[key] == null) {
            distributionMeasuresToFetch.add('obs/' + feature);
          }
        });
        moduleValues.forEach((feature) => {
          let key = category + '-' + feature;
          if (cachedDistributionKeys[key] == null) {
            distributionMeasuresToFetch.add('module/' + feature);
          }
        });
        otherSearchTokenKeys.forEach((searchTokenKey) => {
          groupedSearchTokens[searchTokenKey].forEach((item) => {
            let key = category + '-' + item.id;
            if (cachedDistributionKeys[key] == null) {
              distributionMeasuresToFetch.add(searchTokenKey + '/' + item.id);
            }
          });
        });
      });
    }
    let q = {};
    if (embeddingsToFetch.length > 0) {
      q.embedding = [];
      embeddingsToFetch.forEach((embedding) => {
        if (embedding.mode != null) {
          // fetch unbinned coordinates
          const key = getEmbeddingKey(embedding, false);
          if (
            indexOf(embeddingsToFetch, (e) => getEmbeddingKey(e) === key) !== -1
          ) {
            const index = indexOf(
              state.dataset.embeddings,
              (e) => getEmbeddingKey(e, false) === key
            );
            if (index === -1) {
              throw new Error(
                key + ' not found in ' + state.dataset.embeddings
              );
            }
            embeddingsToFetch.push(state.dataset.embeddings[index]);
          }
        }
      });
      embeddingsToFetch.forEach((embedding) => {
        q.embedding.push(embedding);
      });
    }
    if (valuesToFetch.size > 0) {
      const dataset = state.dataset;
      q.values = {measures: [], dimensions: []};
      valuesToFetch.forEach((value) => {
        if (dataset.obsCat.indexOf(value) !== -1) {
          q.values.dimensions.push(value);
        } else if (dataset.obs.indexOf(value) !== -1) {
          q.values.measures.push('obs/' + value);
        } else if (moduleValues.indexOf(value) !== -1) {
          q.values.measures.push('module/' + value);
        } else {
          q.values.measures.push(value);
        }
      });
    }

    const globalFeatureSummaryMeasuresCacheMiss = [];
    const globalFeatureSummaryDimensionsCacheMiss = [];
    xValues.forEach((feature) => {
      if (globalFeatureSummary[feature] == null) {
        globalFeatureSummaryMeasuresCacheMiss.push(feature);
      }
    });
    obsValues.forEach((feature) => {
      if (globalFeatureSummary[feature] == null) {
        globalFeatureSummaryMeasuresCacheMiss.push('obs/' + feature);
      }
    });
    moduleValues.forEach((feature) => {
      if (globalFeatureSummary[feature] == null) {
        globalFeatureSummaryMeasuresCacheMiss.push('module/' + feature);
      }
    });
    obsCatValues.forEach((feature) => {
      if (globalFeatureSummary[feature] == null) {
        globalFeatureSummaryDimensionsCacheMiss.push(feature);
      }
    });

    if (
      globalFeatureSummaryMeasuresCacheMiss.length > 0 ||
      globalFeatureSummaryDimensionsCacheMiss.length > 0
    ) {
      q.stats = {
        measures: globalFeatureSummaryMeasuresCacheMiss,
        dimensions: globalFeatureSummaryDimensionsCacheMiss,
      };
    }

    if (
      distributionCategories.length > 0 &&
      distributionMeasuresToFetch.size > 0
    ) {
      q.groupedStats = {
        measures: Array.from(distributionMeasuresToFetch),
        dimensions: [distributionCategories],
      };
    }

    // TODO update selection in new embedding space
    if (
      filterJson != null &&
      (globalFeatureSummaryMeasuresCacheMiss.length > 0 ||
        globalFeatureSummaryDimensionsCacheMiss.length > 0)
    ) {
      q.selection = {
        filter: filterJson,
        measures:
          globalFeatureSummaryDimensionsCacheMiss.length > 0
            ? xValues
            : globalFeatureSummaryMeasuresCacheMiss,
        dimensions: obsCatValues,
      };
    }

    const fetchData = Object.keys(q).length > 0;
    const task =
      fetchData || promises.length > 0
        ? {
            name: 'Update charts',
          }
        : null;
    if (task) {
      dispatch(addTask(task));
    }
    const dataPromise = fetchData
      ? state.dataset.api.getDataPromise(q, cachedData)
      : Promise.resolve({});
    const allPromises = [dataPromise].concat(promises);
    return Promise.all(allPromises)
      .then((values) => {
        const result = values[0];
        dispatch(setGlobalFeatureSummary(result.summary));
        const newEmbeddingData = getNewEmbeddingData(state, features);
        embeddingData = embeddingData.concat(newEmbeddingData);

        dispatch(
          setDistributionData(
            updateDistributionData(
              result.distribution,
              distributionData,
              groupedSearchTokens
            )
          )
        );
        dispatch(setEmbeddingData(embeddingData));
        if (updateActiveFeature) {
          dispatch(setActiveFeature(getNewActiveFeature(embeddingData)));
        }
        if (result.selection) {
          dispatch(handleSelectionResult(result.selection, false));
        } else {
          // clear selection
          dispatch(
            setSelectedDistributionData(
              updateDistributionData(
                null,
                selectedDistributionData,
                groupedSearchTokens
              )
            )
          );
        }
      })
      .finally(() => {
        if (task) {
          dispatch(removeTask(task));
        }
      })
      .catch((err) => {
        handleError(
          dispatch,
          err,
          'Unable to retrieve data. Please try again.'
        );
        if (onError) {
          onError(err);
        }
      });
  };
}

function getNewActiveFeature(embeddingData) {
  let traces = embeddingData.filter((trace) => trace.active);
  if (traces.length === 0) {
    return null;
  }
  const trace = traces[traces.length - 1];
  const embeddingKey = getTraceKey(trace); // last feature becomes primary
  return {
    name: trace.name,
    type: trace.featureType,
    embeddingKey: embeddingKey,
  };
}

// depends on global feature summary
function getNewEmbeddingData(state, features) {
  const embeddings = state.embeddings;
  const embeddingData = state.embeddingData;
  const newEmbeddingData = [];
  const globalFeatureSummary = state.globalFeatureSummary;
  const interpolator = state.interpolator;
  const dataset = state.dataset;
  const cachedData = state.cachedData;
  const selection = state.selection;
  const searchTokens = state.searchTokens;
  const categoricalNames = state.categoricalNames;
  const existingFeaturePlusEmbeddingKeys = new Set();
  embeddingData.forEach((embeddingDatum) => {
    const embeddingKey = getEmbeddingKey(embeddingDatum.embedding);
    const key = embeddingDatum.name + '_' + embeddingKey;
    existingFeaturePlusEmbeddingKeys.add(key);
  });
  if (features.size === 0) {
    features.add('__count');
  }

  embeddings.forEach((embedding) => {
    const embeddingKey = getEmbeddingKey(embedding);
    // type can be image, scatter, or meta_image
    const traceType =
      embedding.spatial != null
        ? embedding.spatial.type
        : embedding.type
        ? embedding.type
        : TRACE_TYPE_SCATTER;
    let coordinates =
      traceType !== TRACE_TYPE_META_IMAGE ? cachedData[embeddingKey] : null;
    if (coordinates == null && embedding.mode != null) {
      const unbinnedCoords = cachedData[getEmbeddingKey(embedding, false)];
      const binnedValues = createEmbeddingDensity(
        unbinnedCoords[embedding.name + '_1'],
        unbinnedCoords[embedding.name + '_2']
      );
      const binnedCoords = {};
      binnedCoords[embedding.name + '_1'] = binnedValues.x;
      binnedCoords[embedding.name + '_2'] = binnedValues.y;
      binnedCoords[embedding.name + '_index'] = binnedValues.index;
      binnedCoords[embedding.name + '_3'] = binnedValues.index;
      cachedData[embeddingKey] = binnedCoords; // save binned coords
      coordinates = binnedCoords;
    }
    const x =
      traceType !== TRACE_TYPE_META_IMAGE
        ? coordinates[embedding.name + '_1']
        : null;
    const y =
      traceType !== TRACE_TYPE_META_IMAGE
        ? coordinates[embedding.name + '_2']
        : null;
    const z =
      traceType !== TRACE_TYPE_META_IMAGE
        ? coordinates[embedding.name + '_3']
        : null;

    features.forEach((feature) => {
      const featurePlusEmbeddingKey = feature + '_' + embeddingKey;
      let featureKey = feature;
      if (!existingFeaturePlusEmbeddingKeys.has(featurePlusEmbeddingKey)) {
        let featureSummary = globalFeatureSummary[feature];
        let values = cachedData[featureKey];
        if (values == null) {
          if (feature === '__count') {
            values = new Int8Array(dataset.shape[0]);
            values.fill(1);
          } else {
            console.log(featureKey + ' not found');
          }
        }
        let purity = null;
        if (values.value !== undefined) {
          purity = values.purity;
          values = values.value;
        }
        const searchToken = find(searchTokens, (item) => item.id === feature);
        let featureType;
        if (searchToken) {
          featureType = searchToken.type;
        }
        // could also be feature in a set
        if (featureType == null) {
          featureType =
            feature === '__count' ? FEATURE_TYPE.COUNT : FEATURE_TYPE.X;
        }

        const isCategorical = featureType === FEATURE_TYPE.OBS_CAT;
        let colorScale = null;

        if (!isCategorical) {
          // __count range is per embedding so we always recompute for now
          if (isPlainObject(values)) {
            let newValues = new Float32Array(dataset.shape[0]);
            for (let i = 0, n = values.index.length; i < n; i++) {
              newValues[values.index[i]] = values.values[i];
            }
            values = newValues;
          }
          if (featureSummary == null || feature === '__count') {
            let min = Number.MAX_VALUE;
            let max = -Number.MAX_VALUE;
            let sum = 0;
            for (let i = 0, n = values.length; i < n; i++) {
              let value = values[i];
              min = value < min ? value : min;
              max = value > max ? value : max;
              sum += value;
            }
            featureSummary = {min: min, max: max, mean: sum / values.length};
            globalFeatureSummary[feature] = featureSummary;
          }
          let domain = [featureSummary.min, featureSummary.max];
          if (
            featureSummary.customMin != null &&
            !isNaN(featureSummary.customMin)
          ) {
            domain[0] = featureSummary.customMin;
          }
          if (
            featureSummary.customMax != null &&
            !isNaN(featureSummary.customMax)
          ) {
            domain[1] = featureSummary.customMax;
          }
          let typeInterpolator = interpolator[featureType];
          if (typeInterpolator == null) {
            typeInterpolator = DEFAULT_INTERPOLATORS[FEATURE_TYPE.X];
            interpolator[featureType] = typeInterpolator;
          }
          colorScale = createColorScale(typeInterpolator).domain(domain);
        } else {
          let traceUniqueValues = featureSummary.categories;
          // if (traceUniqueValues.length === 1 && traceUniqueValues[0] === true) {
          //     traceUniqueValues = traceUniqueValues.concat([null]);
          //     traceSummary.categories = traceUniqueValues;
          //     traceSummary.counts = traceSummary.counts.concat([state.dataset.shape[0] - traceSummary.counts[0]]);
          // }

          let colorMap = dataset.colors ? dataset.colors[feature] : null;
          let colors;
          if (colorMap == null) {
            if (traceUniqueValues.length <= 10) {
              colors = schemeCategory10;
            } else if (traceUniqueValues.length <= 12) {
              colors = schemePaired;
            } else if (traceUniqueValues.length <= 20) {
              colors = CATEGORY_20B;
            } else {
              colors = CATEGORY_20B.concat(CATEGORY_20C);
            }
          } else {
            if (isArray(colorMap)) {
              colors = colorMap;
            } else {
              colors = [];
              traceUniqueValues.forEach((value, index) => {
                let color = colorMap[value];
                if (color == null) {
                  color = schemeCategory10[index % schemeCategory10.length];
                }
                colors.push(color);
              });
            }
          }

          let colorsArray = []; // ensure there is a color for every unique value
          for (let i = 0; i < traceUniqueValues.length; i++) {
            colorsArray[i] = colors[i % colors.length];
          }

          // load saved colors from database
          // category -> originalValue -> {newValue, positiveMarkers, negativeMarkers, color}
          const originalValueToData = categoricalNames[feature];
          if (originalValueToData) {
            for (const originalValue in originalValueToData) {
              for (const originalValue in originalValueToData) {
                const value = originalValueToData[originalValue];
                if (value.color != null) {
                  const index = traceUniqueValues.indexOf(originalValue);
                  if (index !== -1) {
                    colorsArray[index] = value.color;
                  }
                }
              }
            }
          }
          colorScale = scaleOrdinal(colorsArray).domain(traceUniqueValues);
          colorScale.summary = featureSummary;
        }

        if (
          traceType === TRACE_TYPE_META_IMAGE &&
          embedding.categoryToIndices == null
        ) {
          const groupBy = cachedData[embedding.attrs.group];
          const categoryToIndices = {};
          const passingIndices = getPassingFilterIndices(cachedData, {
            filters: embedding.attrs.selection,
          });
          if (passingIndices.size === 0) {
            throw new Error('No passing indices found');
          }
          for (let index of passingIndices) {
            const category = groupBy[index];
            let indices = categoryToIndices[category];
            if (indices === undefined) {
              indices = [];
              categoryToIndices[category] = indices;
            }
            indices.push(index);
          }
          embedding.categoryToIndices = categoryToIndices;
        }

        const trace = {
          embedding: Object.assign({}, embedding),
          name: feature,
          featureType: featureType,
          x: x,
          y: y,
          z: z != null ? z : undefined,
          dimensions: z != null ? 3 : 2,
          date: new Date(),
          active: true,
          colorScale: colorScale,
          continuous: !isCategorical,
          isCategorical: isCategorical,
          values: values, // for color
          type: traceType,
        };
        if (trace.mode != null) {
          trace.index = coordinates[embedding.name + '_index'];
          trace._values = trace.values;
          trace.values = summarizeDensity(
            trace.values,
            trace.index,
            selection,
            trace.continuous ? 'max' : 'mode'
          );
        }
        if (traceType === TRACE_TYPE_SCATTER) {
          trace.positions = getPositions(trace);
        }
        if (traceType === TRACE_TYPE_META_IMAGE) {
          const svg = cachedData[getEmbeddingKey(embedding)];
          trace.source = svg.cloneNode(true);
          trace.zscore = true;
          trace.gallerySource = svg.cloneNode(true);
          trace.categoryToIndices = embedding.categoryToIndices;

          if (trace.continuous) {
            // compute mean and standard deviation
            colorScale.domain([-3, 3]);
            let mean = 0;
            let count = 0;
            for (let category in embedding.categoryToIndices) {
              const indices = embedding.categoryToIndices[category];
              for (let i = 0, n = indices.length; i < n; i++) {
                mean += trace.values[indices[i]];
                count++;
              }
            }
            mean = mean / count;
            let sum = 0;
            for (let category in embedding.categoryToIndices) {
              const indices = embedding.categoryToIndices[category];
              for (let i = 0, n = indices.length; i < n; i++) {
                let diff = trace.values[indices[i]] - mean;
                diff = diff * diff;
                sum += diff;
              }
            }
            const n = count - 1;
            const variance = sum / n;
            trace.mean = mean;
            trace.stdev = Math.sqrt(variance);
          }
          trace.fullCategoryToStats = createCategoryToStats(trace, new Set());
          trace.categoryToStats =
            state.selection.size != null && state.selection.size === 0
              ? trace.fullCategoryToStats
              : createCategoryToStats(trace, state.selection);
        }
        updateTraceColors(trace);

        if (traceType === TRACE_TYPE_IMAGE) {
          // TODO cache image
          trace.indices = !isCategorical
            ? indexSort(values, true)
            : randomSeq(values.length);
          const url = dataset.api.getFileUrl(embedding.spatial.image);
          trace.tileSource = new OpenSeadragon.ImageTileSource({
            url: url,
            buildPyramid: true,
            crossOriginPolicy: 'Anonymous',
          });
        }

        newEmbeddingData.push(trace);
      }
    });
  });
  return newEmbeddingData;
}

export function handleError(dispatch, err, message) {
  console.log(err);
  if (message == null) {
    message =
      err instanceof CustomError
        ? err.message
        : 'An unexpected error occurred. Please try again.';
  }
  dispatch(setMessage(new Error(message)));
}
