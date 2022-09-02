import Link from '@mui/material/Link';
import withStyles from '@mui/styles/withStyles';
import Typography from '@mui/material/Typography';
import {extent, shuffle} from 'd3-array';
import {color} from 'd3-color';
import {scaleLinear, scaleSequential} from 'd3-scale';
import * as scaleChromatic from 'd3-scale-chromatic';
import natsort from 'natsort';
import React from 'react';
import simplify from 'simplify-js';
import {isString} from 'lodash';

export const NATSORT = natsort({insensitive: true});
export const interpolators = {};
interpolators['Diverging'] = [
  'interpolateBrBG',
  'interpolatePRGn',
  'interpolatePiYG',
  'interpolatePuOr',
  'interpolateRdBu',
  'interpolateRdGy',
  'interpolateRdYlBu',
  'interpolateRdYlGn',
  'interpolateSpectral',
];

interpolators['Sequential (Single Hue)'] = [
  'interpolateBlues',
  'interpolateGreens',
  'interpolateGreys',
  'interpolateOranges',
  'interpolatePurples',
  'interpolateReds',
];

interpolators['Sequential (Multi-Hue)'] = [
  'interpolateViridis',
  'interpolateInferno',
  'interpolateMagma',
  'interpolatePlasma',
  'interpolateWarm',
  'interpolateCool',
  'interpolateCubehelixDefault',
  'interpolateBuGn',
  'interpolateBuPu',
  'interpolateGnBu',
  'interpolateOrRd',
  'interpolatePuBuGn',
  'interpolatePuBu',
  'interpolatePuRd',
  'interpolateRdPu',
  'interpolateYlGnBu',
  'interpolateYlGn',
  'interpolateYlOrBr',
  'interpolateYlOrRd',
];

interpolators['Cyclical'] = ['interpolateRainbow', 'interpolateSinebow'];

// const TWENTY_COLORS = [
//     '#1f77b4', '#aec7e8', '#ff7f0e',
//     '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd',
//     '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f',
//     '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'];

export const SERVER_CAPABILITY_RENAME_CATEGORIES =
  'SERVER_CAPABILITY_RENAME_CATEGORIES';
export const SERVER_CAPABILITY_JOBS = 'SERVER_CAPABILITY_JOBS';
export const SERVER_CAPABILITY_FEATURE_SETS = 'SERVER_CAPABILITY_FEATURE_SETS';
export const SERVER_CAPABILITY_LINKS = 'SERVER_CAPABILITY_LINKS';
export const SERVER_CAPABILITY_EDIT_DATASET = 'SERVER_CAPABILITY_EDIT_DATASET';
export const SERVER_CAPABILITY_ADD_DATASET = 'SERVER_CAPABILITY_ADD_DATASET';
export const SERVER_CAPABILITY_DELETE_DATASET =
  'SERVER_CAPABILITY_DELETE_DATASET';

export const CATEGORY_20B = [
  '#393b79',
  '#5254a3',
  '#6b6ecf',
  '#9c9ede',
  '#637939',
  '#8ca252',
  '#b5cf6b',
  '#cedb9c',
  '#8c6d31',
  '#bd9e39',
  '#e7ba52',
  '#e7cb94',
  '#843c39',
  '#ad494a',
  '#d6616b',
  '#e7969c',
  '#7b4173',
  '#a55194',
  '#ce6dbd',
  '#de9ed6',
];
export const CATEGORY_20C = [
  '#3182bd',
  '#6baed6',
  '#9ecae1',
  '#c6dbef',
  '#e6550d',
  '#fd8d3c',
  '#fdae6b',
  '#fdd0a2',
  '#31a354',
  '#74c476',
  '#a1d99b',
  '#c7e9c0',
  '#756bb1',
  '#9e9ac8',
  '#bcbddc',
  '#dadaeb',
  '#636363',
  '#969696',
  '#bdbdbd',
  '#d9d9d9',
];

export const FEATURE_TYPE = {
  OBS: 'obs',
  OBS_CAT: 'obsCat',
  X: 'X',
  FEATURE_SET: 'featureSet',
  MODULE: 'module',
  COUNT: 'count',
};

export const FEATURE_TYPE_MEASURES_EXCLUDE = [
  FEATURE_TYPE.FEATURE_SET,
  FEATURE_TYPE.COUNT,
  FEATURE_TYPE.OBS_CAT,
];
export const TIES_STRATEGY_IGNORE = 0;
export const TIES_STRATEGY_AVERAGE = 1;
export const TIES_STRATEGY_MAXIMUM = 2;
export const TIES_STRATEGY_MINIMUM = 3;
export const TIES_STRATEGY_SEQUENTIAL = 4;

export const TRACE_TYPE_IMAGE = 'image';
export const TRACE_TYPE_SCATTER = 'scatter';
export const TRACE_TYPE_META_IMAGE = 'meta_image';

export const INTERPOLATOR_SCALING_MIN_MAX_FEATURE = 'min_max_feature';
export const INTERPOLATOR_SCALING_MIN_MAX_CATEGORY = 'min_max_category';
export const INTERPOLATOR_SCALING_NONE = 'none';

export function getCategoryValue(renamedCategories, category) {
  let renamedCategoryValue = renamedCategories[category];
  if (renamedCategoryValue != null && renamedCategoryValue.newValue != null) {
    return renamedCategoryValue.newValue;
  }
  return category;
}

export function isMac() {
  return window.navigator.platform.toLowerCase().indexOf('mac') !== -1;
}

const reactMarkdownStyles = (theme) => ({
  listItem: {
    marginTop: theme.spacing(1),
  },
});

export const REACT_MD_OVERRIDES = {
  h1: {
    component: Typography,
    props: {
      gutterBottom: true,
      variant: 'h5',
    },
  },
  h2: {component: Typography, props: {gutterBottom: true, variant: 'h6'}},
  h3: {
    component: Typography,
    props: {gutterBottom: true, variant: 'subtitle1'},
  },
  h4: {
    component: Typography,
    props: {gutterBottom: true, variant: 'caption', paragraph: true},
  },
  h5: {
    component: Typography,
    props: {gutterBottom: true, variant: 'caption', paragraph: true},
  },
  h6: {
    component: Typography,
    props: {gutterBottom: true, variant: 'caption', paragraph: true},
  },
  p: {component: Typography, props: {paragraph: true}},
  a: {component: Link, props: {target: '_blank'}},
  li: {
    component: withStyles(reactMarkdownStyles)(({classes, ...props}) => (
      <li className={classes.listItem}>
        <Typography component="span" {...props} />
      </li>
    )),
  },
};

export function summarizeDensity(
  values,
  index,
  selection,
  summarizationMethod
) {
  let newValues = [];
  let summarize;

  if (summarizationMethod === 'max') {
    summarize = (indices) => {
      let max = -Number.MAX_VALUE;
      for (let j = 0, nindices = indices.length; j < nindices; j++) {
        max = Math.max(values[indices[j]], max);
      }
      return max;
    };
  } else if (summarizationMethod === 'mode') {
    summarize = (indices) => {
      let valueToCount = new Map();
      for (let j = 0, nindices = indices.length; j < nindices; j++) {
        const value = values[indices[j]];
        let prior = valueToCount.get(value);
        if (prior === undefined) {
          prior = 0;
        }
        valueToCount.set(value, 1 + prior);
      }
      // TODO compute purity
      let max = -Number.MAX_VALUE;
      let maxValue = null;
      valueToCount.forEach((count, value) => {
        if (count > max) {
          max = count;
          maxValue = value;
        }
      });
      return maxValue;
    };
  } else {
    throw new Error();
  }
  const isSelectionEmpty = selection == null;
  for (let i = 0, n = index.length; i < n; i++) {
    const indices = index[i];
    const summarizedValue = summarize(
      isSelectionEmpty ? indices : indices.filter((item) => selection.has(item))
    );
    newValues.push(summarizedValue);
  }

  return newValues;
}

export function createEmbeddingDensity(xcoords, ycoords) {
  const nbins =
    xcoords.length > 18367
      ? Math.floor(Math.sqrt(xcoords.length / 1000)) * 14
      : 60;
  const xscale = scaleLinear()
    .domain(extent(xcoords))
    .range([0, nbins - 1]);
  const yscale = scaleLinear()
    .domain(extent(ycoords))
    .range([0, nbins - 1]);
  const binMap = new Map();
  for (let i = 0, n = xcoords.length; i < n; i++) {
    const xcoordNew = Math.floor(xscale(xcoords[i]));
    const ycoordNew = Math.floor(yscale(ycoords[i]));
    const bin = xcoordNew * nbins + ycoordNew;
    let binValue = binMap.get(bin);
    if (binValue === undefined) {
      binValue = {indices: [], x: xcoordNew, y: ycoordNew};
      binMap.set(bin, binValue);
    }
    binValue.indices.push(i);
  }
  const xvalues = [];
  const yvalues = [];
  const newIndexToOriginalIndices = [];
  binMap.forEach((binValue, bin) => {
    xvalues.push(binValue.x);
    yvalues.push(binValue.y);
    newIndexToOriginalIndices.push(binValue.indices);
  });
  return {
    x: xvalues,
    y: yvalues,
    mode: 'density',
    nbins: nbins,
    index: newIndexToOriginalIndices,
  };
}

export function scaleConstantRange(value) {
  function scale(x) {
    return value;
  }

  scale.invert = scale;
  scale.domain = scale.range = function (_) {
    return arguments.length ? (value = _[0]) : [value, value];
  };

  scale.copy = function () {
    return scaleConstantRange(value);
  };

  return scale;
}

export function copyToClipboard(text) {
  const container = document.activeElement;
  const fakeElem = document.createElement('textarea');
  const isRTL = document.documentElement.getAttribute('dir') == 'rtl';
  fakeElem.style.fontSize = '12pt';
  fakeElem.style.border = '0';
  fakeElem.style.padding = '0';
  fakeElem.style.margin = '0';
  // Move element out of screen horizontally
  fakeElem.style.position = 'absolute';
  fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px';
  fakeElem.setAttribute('readonly', '');
  // Move element to the same position vertically
  let yPosition = window.pageYOffset || document.documentElement.scrollTop;
  fakeElem.style.top = yPosition + 'px';
  fakeElem.value = text;
  container.appendChild(fakeElem);

  fakeElem.select();
  fakeElem.setSelectionRange(0, fakeElem.value.length);

  document.execCommand('copy');

  const fakeHandlerCallback = (event) => {
    document.activeElement.blur();
    window.getSelection().removeAllRanges();
    container.removeChild(fakeElem);
    container.removeEventListener('click', fakeHandlerCallback);
  };
  container.addEventListener('click', fakeHandlerCallback);
}

export function stripTrailingZeros(s) {
  let index = s.lastIndexOf('.');
  let ending = s.substring(index + 1);
  let allZeros = true;
  for (let i = 0, n = ending.length; i < n; i++) {
    if (ending[i] !== '0') {
      allZeros = false;
      break;
    }
  }
  if (allZeros) {
    s = s.substring(0, s.lastIndexOf('.'));
  }
  return s;
}

/**
 *
 * @param array. Array of format,data
 */
export function setClipboardData(clipboardData) {
  const container = document.activeElement;
  const isRTL = document.documentElement.getAttribute('dir') == 'rtl';
  const fakeElem = document.createElement('div');
  fakeElem.contentEditable = true;

  // Prevent zooming on iOS
  fakeElem.style.fontSize = '12pt';
  // Reset box model

  fakeElem.style.border = '0';
  fakeElem.style.padding = '0';
  fakeElem.style.margin = '0';
  // Move element out of screen horizontally
  fakeElem.style.position = 'absolute';
  fakeElem.style[isRTL ? 'right' : 'left'] = '-999999px';
  // Move element to the same position vertically
  fakeElem.style.top =
    (window.pageYOffset || document.documentElement.scrollTop) + 'px';
  fakeElem.setAttribute('readonly', '');
  //fakeElem.innerHTML = html;
  const copyListener = (e) => {
    clipboardData.forEach(function (elem) {
      e.clipboardData.setData(elem.format, elem.data);
    });

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    fakeElem.removeEventListener('copy', copyListener);
  };
  fakeElem.addEventListener('copy', copyListener);

  container.appendChild(fakeElem);

  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(fakeElem);
  selection.removeAllRanges();
  selection.addRange(range);
  const fakeHandlerCallback = (event) => {
    container.removeChild(fakeElem);
    container.removeEventListener('click', fakeHandlerCallback);
  };
  document.execCommand('copy');
  container.addEventListener('click', fakeHandlerCallback);
}

function getColorsRgba(trace) {
  const RGBA_NUM_ELEMENTS = 4;
  const rgbScale = getRgbScale();

  let colorScale = trace.colorScale;
  const npoints = trace.values.length;
  const colors = new Float32Array(npoints * RGBA_NUM_ELEMENTS);

  function rescaleRgb(c) {
    c.r = rgbScale(c.r);
    c.g = rgbScale(c.g);
    c.b = rgbScale(c.b);
    return c;
  }

  if (!trace.continuous) {
    const categories = colorScale.domain();
    const category2color = new Map();
    categories.forEach((category) => {
      category2color.set(category, rescaleRgb(color(colorScale(category))));
    });
    for (let i = 0, dst = 0; i < npoints; ++i) {
      const c = category2color.get(trace.values[i]);
      colors[dst++] = c.r;
      colors[dst++] = c.g;
      colors[dst++] = c.b;
      colors[dst++] = 1;
    }
  } else {
    const ncolors = 500;
    const colorBins = [];
    const domain = colorScale.domain();
    const unknown = rescaleRgb(color(colorScale.unknown()));
    const binScale = scaleLinear()
      .domain(domain)
      .range([0, ncolors - 1]);
    for (let i = 0; i < ncolors; ++i) {
      const value = binScale.invert(i);
      colorBins.push(rescaleRgb(color(colorScale(value))));
    }
    for (let i = 0, dst = 0; i < npoints; ++i) {
      const value = trace.values[i];
      if (Number.isNaN(value)) {
        colors[dst++] = unknown.r;
        colors[dst++] = unknown.g;
        colors[dst++] = unknown.b;
        colors[dst++] = 1;
      } else {
        let bin = Math.ceil(binScale(value));
        if (bin < 0) {
          bin = 0;
        } else if (bin >= ncolors) {
          bin = ncolors - 1;
        }
        const c = colorBins[bin];
        colors[dst++] = c.r;
        colors[dst++] = c.g;
        colors[dst++] = c.b;
        colors[dst++] = 1;
      }
    }
  }

  return colors;
}

export function updateTraceColors(trace) {
  if (trace.type === TRACE_TYPE_IMAGE) {
    let colors = [];
    let colorScale = trace.colorScale;
    const colorMapper = (rgb) => rgb.formatHex();
    for (let i = 0, n = trace.values.length; i < n; i++) {
      let rgb = color(colorScale(trace.values[i]));
      colors.push(colorMapper(rgb));
    }
    trace.colors = colors;
  } else if (trace.type === TRACE_TYPE_SCATTER) {
    trace.colors = getColorsRgba(trace);
  } else if (trace.type === TRACE_TYPE_META_IMAGE) {
    let colorScale = trace.colorScale;
    const svgNode = trace.source;
    const galleryNode = trace.gallerySource;
    const categoryToStats = trace.categoryToStats;
    if (trace.name !== '__count') {
      for (const category in categoryToStats) {
        const stats = categoryToStats[category];
        const query = category.replaceAll(' ', '_'); // FIXME
        svgNode.querySelectorAll('[id="' + query + '"]').forEach((node) => {
          const color =
            stats.value === undefined ? '#f0f0f0' : colorScale(stats.value);
          node.style.fill = color;
        });

        galleryNode.querySelectorAll('[id="' + query + '"]').forEach((node) => {
          const color =
            stats.value === undefined ? '#f0f0f0' : colorScale(stats.value);
          node.style.fill = color;
        });
      }
    } else {
      for (const category in categoryToStats) {
        const stats = categoryToStats[category];
        const query = category.replaceAll(' ', '_'); // FIXME
        svgNode.querySelectorAll('[id="' + query + '"]').forEach((node) => {
          if (stats.n === 0) {
            if (node.dataset.fill === undefined) {
              node.dataset.fill = node.style.fill;
            }
            node.style.fill = '#f0f0f0';
          } else if (node.dataset.fill !== undefined) {
            node.style.fill = node.dataset.fill;
          }
        });

        galleryNode.querySelectorAll('[id="' + query + '"]').forEach((node) => {
          if (stats.n === 0) {
            if (node.dataset.fill === undefined) {
              node.dataset.fill = node.style.fill;
            }
            node.style.fill = '#f0f0f0';
          } else if (node.dataset.fill !== undefined) {
            node.style.fill = node.dataset.fill;
          }
        });
      }
    }
  }
}

/**
 * Computes the rank using the given index array. The index array can be
 * obtained from the indexSort method. Does not handle ties.
 *
 */
export function rankIndexArray(index) {
  const n = index.length;
  const rank = new Uint32Array(n);
  for (let j = 0; j < n; j++) {
    rank[index[j]] = j + 1;
  }
  return rank;
}

export function indexSort(array, ascending) {
  const pairs = [];
  for (let i = 0, length = array.length; i < length; i++) {
    pairs.push({
      value: array[i],
      position: i,
    });
  }
  return indexSortPairs(pairs, ascending);
}

function resolveTie(ranks, tiesTrace, tiesStrategy = TIES_STRATEGY_AVERAGE) {
  // constant value of ranks over tiesTrace
  const c = ranks[tiesTrace[0]];

  // length of sequence of tied ranks
  const length = tiesTrace.length;

  switch (tiesStrategy) {
    case TIES_STRATEGY_AVERAGE: // Replace ranks with average
      fill(ranks, tiesTrace, (2 * c + length - 1) / 2.0);
      break;
    case TIES_STRATEGY_MAXIMUM: // Replace ranks with maximum values
      fill(ranks, tiesTrace, c + length - 1);
      break;
    case TIES_STRATEGY_MINIMUM: // Replace ties with minimum
      fill(ranks, tiesTrace, c);
      break;
    case TIES_STRATEGY_SEQUENTIAL: // Fill sequentially from c to c + length - 1
      // walk and fill

      const f = Math.round(c);
      for (let i = 0, n = tiesTrace.length; i < n; i++) {
        ranks[tiesTrace[i]] = f + i;
      }
      break;
    default:
      throw new Error();
  }
}

/**
 * Sets<code>data[i] = value</code> for each i in <code>tiesTrace.</code>
 *
 * @param data array to modify
 * @param tiesTrace list of index values to set
 * @param value value to set
 */
function fill(data, tiesTrace, value) {
  for (let i = 0, n = tiesTrace.length; i < n; i++) {
    data[tiesTrace[i]] = value;
  }
}

export function rankdata(values) {
  const ranks = [];
  for (let i = 0, n = values.length; i < n; i++) {
    ranks.push({
      value: values[i],
      position: i,
    });
  }

  ranks.sort(function (a, b) {
    return a.value < b.value
      ? -1
      : a.value === b.value
      ? a.position < b.position
        ? -1
        : 1
      : 1;
  });

  // Walk the sorted array, filling output array using sorted positions,
  // resolving ties as we go
  const out = new Float32Array(ranks.length);
  let pos = 1; // position in sorted array
  out[ranks[0].position] = pos;
  let tiesTrace = [];
  tiesTrace.push(ranks[0].position);
  for (let i = 1; i < ranks.length; i++) {
    if (ranks[i].value > ranks[i - 1].value) {
      // tie sequence has ended (or had length 1)
      pos = i + 1;
      if (tiesTrace.length > 1) {
        // if seq is nontrivial, resolve
        resolveTie(out, tiesTrace);
      }
      tiesTrace = [];
      tiesTrace.push(ranks[i].position);
    } else {
      // tie sequence continues
      tiesTrace.push(ranks[i].position);
    }
    out[ranks[i].position] = pos;
  }
  if (tiesTrace.length > 1) {
    // handle tie sequence at end
    resolveTie(out, tiesTrace);
  }
  return out;
}

function indexSortPairs(ranks, ascending) {
  if (ascending) {
    ranks.sort(function (a, b) {
      return a.value < b.value
        ? -1
        : a.value === b.value
        ? a.position < b.position
          ? -1
          : 1
        : 1;
    });
  } else {
    ranks.sort(function (a, b) {
      return a.value < b.value
        ? 1
        : a.value === b.value
        ? a.position < b.position
          ? 1
          : -1
        : -1;
    });
  }

  const indices = new Uint32Array(ranks.length);
  for (let i = 0, n = ranks.length; i < n; i++) {
    indices[i] = ranks[i].position;
  }
  return indices;
}

export function randomSeq(n, start = 0) {
  const indices = new Uint32Array(n);
  for (let i = 0; i < n; i++, start++) {
    indices[i] = start;
  }
  shuffle(indices);
  return indices;
}

/**
 * Computes the False Discovery Rate using the BH procedure.
 *
 * @param nominalPValues
 *            Array of nominal p-values.
 */
export function fdr(nominalPValues) {
  const size = nominalPValues.length;
  const pValueIndices = indexSort(nominalPValues, true);
  const ranks = rankIndexArray(pValueIndices);

  // check for ties
  for (let i = pValueIndices.length - 1; i > 0; i--) {
    const bigPValue = nominalPValues[pValueIndices[i]];
    const smallPValue = nominalPValues[pValueIndices[i - 1]];
    if (bigPValue === smallPValue) {
      ranks[pValueIndices[i - 1]] = ranks[pValueIndices[i]];
    }
  }

  const fdr = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    const rank = ranks[i];
    const p = nominalPValues[i];
    fdr[i] = (p * size) / rank;
  }

  // ensure fdr is monotonically decreasing
  const pIndices = indexSort(nominalPValues, false);
  for (let i = 0; i < pIndices.length - 1; i++) {
    const highIndex = pIndices[i];
    const lowIndex = pIndices[i + 1];
    fdr[lowIndex] = Math.min(fdr[lowIndex], fdr[highIndex]);
  }
  for (let i = 0; i < size; i++) {
    fdr[i] = Math.min(fdr[i], 1);
  }
  return fdr;
}

export function isPointInside(point, vs) {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

  const x = point.x,
    y = point.y;

  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i].x,
      yi = vs[i].y;
    const xj = vs[j].x,
      yj = vs[j].y;

    const intersect =
      yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

export function arrayToSvgPath(lassoPathArray) {
  if (lassoPathArray.length > 1) {
    lassoPathArray = simplify(lassoPathArray);
  }
  let svgPath = 'M ' + lassoPathArray[0].x + ' ' + lassoPathArray[0].y;
  for (let i = 1; i < lassoPathArray.length; i++) {
    svgPath += ' L ' + lassoPathArray[i].x + ' ' + lassoPathArray[i].y;
  }
  svgPath += ' Z';
  return svgPath;
}

export function getRgbScale() {
  return scaleLinear().domain([0, 255]).range([0, 1]);
}

export function fixInterpolatorName(name) {
  if (!name.startsWith('interpolate')) {
    name = 'interpolate' + name;
  }
  return name;
}

export function getInterpolator(name) {
  return scaleChromatic[fixInterpolatorName(name)];
}

export function createColorScale(colorScaleDef) {
  const scale = scaleSequential(colorScaleDef.value)
    .clamp(true)
    .unknown('#bdbdbd');
  if (colorScaleDef.reversed) {
    const interpolator = scale.interpolator();
    const mirror = (t) => interpolator(1 - t);
    scale.interpolator(mirror);
  }
  return scale;
}

export function convertIndicesToBins(points, bins) {
  let selectedBins = [];
  for (let i = 0, n = points.length; i < n; i++) {
    selectedBins.push(bins[points[i]]);
  }
  return selectedBins;
}

export function convertBinsToIndices(bins, selectedBins) {
  let points = [];
  selectedBins = new Set(selectedBins);
  for (let i = 0, n = bins.length; i < n; i++) {
    if (selectedBins.has(bins[i])) {
      points.push(i);
    }
  }

  return points;
}

// add to X, maintaining insertion order
export function addFeatureSetsToX(featureSets, X) {
  const uniqueX = new Set(X);
  featureSets.forEach((featureSet) => {
    let features = featureSet.features;
    if (features) {
      features.forEach((feature) => {
        if (!uniqueX.has(feature)) {
          X.push(feature);
          uniqueX.add(feature);
        }
      });
    }
  });
}

export function getFeatureSets(markers, featureSets) {
  const filteredFeatureSets = [];
  if (featureSets.length > 0) {
    let markerIdToMarker = new Map();
    markers.forEach((m) => {
      markerIdToMarker.set(m.id, m);
    });

    featureSets.forEach((featureSet) => {
      const featureSetId = isString(featureSet) ? featureSet : featureSet.id;
      const m = markerIdToMarker.get(featureSetId);
      if (m != null) {
        filteredFeatureSets.push(m);
      }
    });
  }
  return filteredFeatureSets;
}

export function getDevicePixelRatio() {
  let devicePixelRatio = 1;
  if (typeof window !== 'undefined' && 'devicePixelRatio' in window) {
    devicePixelRatio = window.devicePixelRatio;
  }
  return devicePixelRatio;
}
