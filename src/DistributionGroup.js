import {InputLabel, MenuItem, Select, Switch} from '@mui/material';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import withStyles from '@mui/styles/withStyles';
import {scaleLinear} from 'd3-scale';
import React from 'react';
import DotPlotCanvas from './DotPlotCanvas';
import {EditableColorScheme} from './EditableColorScheme';
import {EditableSizeLegend} from './EditableSizeLegend';
import {boxplotStats, density, nrd0} from './kde';
import {
  createColorScale,
  getCategoryValue,
  INTERPOLATOR_SCALING_MIN_MAX_CATEGORY,
  INTERPOLATOR_SCALING_MIN_MAX_FEATURE,
  INTERPOLATOR_SCALING_NONE,
  NATSORT,
} from './util';
import ViolinPlot from './ViolinPlot';
import FormHelperText from '@mui/material/FormHelperText';
import FormControlLabel from '@mui/material/FormControlLabel';

const styles = (theme) => ({
  formControl: {
    display: 'block',
    margin: theme.spacing(1),
  },
});

function updateNames(data, categoricalNames) {
  const renamedDimensions = [];
  data[0].dimensions.forEach((dimension) => {
    renamedDimensions.push(categoricalNames[dimension] || {});
  });
  data.forEach((item) => {
    const names = [];
    renamedDimensions.forEach((dimension, index) => {
      const nameMap = renamedDimensions[index];
      let name = item.categories[index];
      name = getCategoryValue(nameMap, name);
      names[index] = name;
      item.name = names;
    });
  });
}

function reshapeData(data, distributionPlotOptions, categoryOrder) {
  // create 2-d array with categories along rows and features along columns
  let categoryToItems = {};

  data.forEach((item) => {
    let features = categoryToItems[item.name];
    if (features == null) {
      features = [];
      categoryToItems[item.name] = features;
    }
    features.push(item);
  });
  let categories = Object.keys(categoryToItems);
  if (categories.length >= 2000) {
    return null;
  }
  const dimension = data[0].dimension;

  if (distributionPlotOptions.sortBy !== dimension) {
    // sort categories by feature
    const category2mean = {};
    const category2percentExpressed = {};
    data.forEach((item) => {
      if (item.feature === distributionPlotOptions.sortBy) {
        category2mean[item.name] = item.mean;
        category2percentExpressed[item.name] = item.percentExpressed;
      }
    });
    categories.sort((a, b) => {
      let val1 = category2mean[a];
      let val2 = category2mean[b];
      let c = val1 === val2 ? 0 : val1 > val2 ? -1 : 1;
      if (c === 0) {
        val1 = category2percentExpressed[a];
        val2 = category2percentExpressed[b];
        c = val1 === val2 ? 0 : val1 > val2 ? -1 : 1;
      }
      return c;
    });
  } else {
    // sort by category
    const sorters = data[0].dimensions.map((name) => {
      if (categoryOrder[name]) {
        const orderedCategories = categoryOrder[name];
        const categoryToIndex = new Map();
        for (let i = 0; i < orderedCategories.length; i++) {
          categoryToIndex.set(orderedCategories[i], i);
        }
        return (a, b) => categoryToIndex.get(a) - categoryToIndex.get(b);
      }
      return NATSORT;
    });
    const ndim = sorters.length;
    const categoryItems = categories.map(
      (category) => categoryToItems[category][0]
    );
    categoryItems.sort((a, b) => {
      for (let i = 0; i < ndim; i++) {
        const r = sorters[i](a.categories[i], b.categories[i]);
        if (r !== 0) {
          return r;
        }
      }
      return 0;
    });
    categories = categoryItems.map((item) => item.name);
  }
  let data2d = [];
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const items = categoryToItems[category];
    data2d.push(items);
  }
  return data2d;
}

function getMeanAndPercentRange(result) {
  // let percentRange = [Number.MAX_VALUE, -Number.MAX_VALUE];
  let meanRange = [Number.MAX_VALUE, -Number.MAX_VALUE];
  result.forEach((feature) => {
    // percentRange[0] = Math.min(feature.percentExpressed, percentRange[0]);
    // percentRange[1] = Math.max(feature.percentExpressed, percentRange[1]);
    if (!Number.isNaN(feature.mean)) {
      meanRange[0] = Math.min(feature.mean, meanRange[0]);
      meanRange[1] = Math.max(feature.mean, meanRange[1]);
    }
  });
  return {mean: meanRange, percent: [0, 100]};
}

// export function computeDiffExp(data, pseudocount = 1) {
//
//     for (let i = 0; i < data.length; i++) { // category
//         const deResults = [];
//         for (let j = 0; j < data[0].length; j++) { // feature
//             const item = data[i][j];
//             const vector = item.vector;
//             const values = new Float32Array(vector.size());
//             for (let valueIndex = 0, n = values.length; valueIndex < n; valueIndex++) {
//                 values[valueIndex] = vector.get(valueIndex);
//             }
//             const restValues = [];
//             for (let categoryIndex = 0; categoryIndex < data.length; categoryIndex++) {
//                 if (i !== categoryIndex) {
//                     const restItem = data[categoryIndex][j];
//                     const restVector = restItem.vector;
//                     for (let valueIndex = 0, n = restVector.size(); valueIndex < n; valueIndex++) {
//                         restValues.push(restVector.get(valueIndex));
//                     }
//                 }
//             }
//
//             const selectedStats = continuousVectorStats(new Vector('', values));
//             const restStats = continuousVectorStats(new Vector('', restValues));
//             const result = mannWhitney(values, restValues);
//             result.foldChange = Math.log2((selectedStats.logSum / selectedStats.n) + pseudocount) - Math.log2((restStats.logSum / restStats.n) + pseudocount); // seurat
//             //result.foldChange = Math.log2(Math.expm1(mean1 + 1e-9) / Math.expm1(mean2 + 1e-9)) // scanpy;
//             result.percentExpressed2 = 100 * (restStats.numExpressed / restStats.n);
//             deResults.push(result);
//         }
//         const correctedPValues = fdr(deResults.map(item => item.p));
//         for (let j = 0; j < data[0].length; j++) { // feature
//             const item = data[i][j];
//             const de = deResults[j];
//             de.fdr = correctedPValues[j];
//             item.de = de;
//         }
//     }
// }

class DistributionGroup extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      min: '',
      max: '',
    };
  }

  onChartTypeChange = (event) => {
    this.props.onDistributionPlotOptions({chartType: event.target.value});
  };

  onViolinScaleChange = (event) => {
    this.props.onDistributionPlotOptions({violinScale: event.target.value});
  };

  onViolinShowBoxplot = (event) => {
    this.props.onDistributionPlotOptions({
      violinShowBoxplot: event.target.checked,
    });
  };
  onSortOrderChanged = (event) => {
    this.props.onDistributionPlotOptions({sortBy: event.target.value});
  };

  onMinUIChange = (value) => {
    this.setState({min: value});
  };
  onMaxUIChange = (value) => {
    this.setState({max: value});
  };

  onMinChange = (value) => {
    this.props.onDistributionPlotOptions({min: value});
  };
  onMaxChange = (value) => {
    this.props.onDistributionPlotOptions({max: value});
  };

  render() {
    const {
      textColor,
      categoryColorScales,
      dataset,
      distributionData,
      distributionPlotOptions,
      categoricalNames,
      selectedData,
      interpolator,
    } = this.props;
    if (distributionData == null || distributionData.length === 0) {
      return null;
    }
    const chartType = distributionPlotOptions.chartType;
    const meanAndPercentRange = getMeanAndPercentRange(distributionData);
    const meanRange =
      interpolator.scale !== INTERPOLATOR_SCALING_NONE
        ? [0, 1]
        : meanAndPercentRange.mean;
    const percentRange = meanAndPercentRange.percent;
    if (selectedData != null && selectedData.length > 0) {
      const selectedMeanAndPercentRange = getMeanAndPercentRange(selectedData);
      meanRange[0] = Math.min(
        meanRange[0],
        selectedMeanAndPercentRange.mean[0]
      );
      meanRange[1] = Math.max(
        meanRange[1],
        selectedMeanAndPercentRange.mean[1]
      );
      percentRange[0] = Math.min(
        percentRange[0],
        selectedMeanAndPercentRange.percent[0]
      );
      percentRange[1] = Math.max(
        percentRange[1],
        selectedMeanAndPercentRange.percent[1]
      );
    }

    if (
      distributionPlotOptions.min != null &&
      !isNaN(distributionPlotOptions.min)
    ) {
      meanRange[0] = distributionPlotOptions.min;
    }
    if (
      distributionPlotOptions.max != null &&
      !isNaN(distributionPlotOptions.max)
    ) {
      meanRange[1] = distributionPlotOptions.max;
    }

    if (
      distributionPlotOptions.minSize != null &&
      !isNaN(distributionPlotOptions.minSize)
    ) {
      percentRange[0] = distributionPlotOptions.minSize;
    }

    if (
      distributionPlotOptions.maxSize != null &&
      !isNaN(distributionPlotOptions.maxSize)
    ) {
      percentRange[1] = distributionPlotOptions.maxSize;
    }
    if (distributionPlotOptions.sortBy == null) {
      distributionPlotOptions.sortBy = distributionData[0].dimension;
    }
    if (distributionPlotOptions.sortBy !== distributionData[0].dimension) {
      // ensure valid feature
      let found = false;
      for (let i = 0; i < distributionData.length; i++) {
        if (distributionData[i].feature === distributionPlotOptions.sortBy) {
          found = true;
          break;
        }
      }
      if (!found) {
        distributionPlotOptions.sortBy = distributionData[0].dimension;
      }
    }

    const maxRadius = 9;
    const minRadius = 1;
    const colorScale = createColorScale(interpolator).domain(meanRange);
    const sizeScale = scaleLinear()
      .domain(percentRange)
      .range([minRadius, maxRadius])
      .clamp(true);
    updateNames(distributionData, categoricalNames);
    if (selectedData) {
      updateNames(selectedData, categoricalNames);
    }
    const data2d = reshapeData(
      distributionData,
      distributionPlotOptions,
      dataset.categoryOrder || {}
    );
    const selectedData2d =
      selectedData && selectedData.length > 0
        ? reshapeData(
            selectedData,
            distributionPlotOptions,
            dataset.categoryOrder || {}
          )
        : null;
    if (
      (data2d == null || data2d.length === 0) &&
      (selectedData2d == null || selectedData2d.length === 0)
    ) {
      return null;
    }
    const features = (data2d ? data2d[0] : selectedData2d[0]).map(
      (item) => item.feature
    );

    if (chartType === 'violin') {
      const allData = selectedData
        ? distributionData.concat(selectedData)
        : distributionData;
      features.forEach((feature) => {
        // // ensure density is computed
        // const summary = globalFeatureSummary[feature];
        // if (summary.bandwidth == null) {
        //     summary.bandwidth = nrd0(cachedData[feature]);
        // }
        //  const bandwidth = summary.bandwidth;
        allData.forEach((item) => {
          if (item.feature === feature && item.density == null) {
            const vector = item.vector;
            const values = new Float32Array(vector.size());
            for (let k = 0, n = values.length; k < n; k++) {
              values[k] = vector.get(k);
            }
            item.boxplotStats = boxplotStats(values);
            const bandwidth = nrd0(item.boxplotStats);
            item.bandwidth = bandwidth;
            item.density = density(values, bandwidth);
          }
        });
      });
    }

    const sortChoices = [distributionData[0].dimension].concat(features);
    return (
      <Box color="text.primary">
        {chartType !== 'violin' && data2d && (
          <DotPlotCanvas
            categoryColorScales={categoryColorScales}
            colorScale={colorScale}
            interpolator={interpolator}
            sizeScale={sizeScale}
            textColor={textColor}
            drawCircles={chartType === 'dotplot'}
            data={data2d}
          />
        )}
        {chartType === 'violin' && data2d && (
          <ViolinPlot
            categoryColorScales={categoryColorScales}
            colorScale={colorScale}
            textColor={textColor}
            options={distributionPlotOptions}
            data={data2d}
          />
        )}
        {chartType !== 'violin' && selectedData2d && (
          <DotPlotCanvas
            categoryColorScales={categoryColorScales}
            colorScale={colorScale}
            interpolator={interpolator}
            sizeScale={sizeScale}
            subtitle="selection"
            textColor={textColor}
            drawCircles={chartType === 'dotplot'}
            data={selectedData2d}
          />
        )}
        {chartType === 'violin' && selectedData2d && (
          <ViolinPlot
            categoryColorScales={categoryColorScales}
            colorScale={colorScale}
            subtitle="selection"
            options={distributionPlotOptions}
            textColor={textColor}
            data={selectedData2d}
          />
        )}
        {chartType !== 'violin' && (
          <EditableColorScheme
            colorScale={colorScale}
            textColor={textColor}
            domain={colorScale.domain()}
            interpolator={interpolator}
            onInterpolator={this.props.handleInterpolator}
            min={this.state.min}
            max={this.state.max}
            onMinChange={this.onMinChange}
            onMaxChange={this.onMaxChange}
            onMinUIChange={this.onMinUIChange}
            onMaxUIChange={this.onMaxUIChange}
          />
        )}
        {chartType !== 'violin' && (
          <FormControl className={this.props.classes.formControl}>
            <InputLabel>Standardize</InputLabel>
            <Select
              label={'Standardize'}
              size={'small'}
              onChange={(event) =>
                this.props.onColorScalingChange(event.target.value)
              }
              value={interpolator.scale}
            >
              <MenuItem value={'none'} divider>
                (None)
              </MenuItem>
              <MenuItem
                title={'Standardize features between 0 and 1'}
                value={INTERPOLATOR_SCALING_MIN_MAX_FEATURE}
              >
                Feature
              </MenuItem>
              <MenuItem
                title={'Standardize groups between 0 and 1'}
                value={INTERPOLATOR_SCALING_MIN_MAX_CATEGORY}
              >
                Category
              </MenuItem>
            </Select>
          </FormControl>
        )}
        {chartType === 'dotplot' && (
          <div style={{paddingTop: 16}}>
            <InputLabel shrink={true}>Size</InputLabel>
            <EditableSizeLegend
              sizeScale={sizeScale}
              textColor={textColor}
              onOptions={this.props.onDistributionPlotOptions}
              showReversed={false}
            />
          </div>
        )}
        <FormControl className={this.props.classes.formControl}>
          <InputLabel shrink={true}>Sort By</InputLabel>
          <Select
            label={'Sort By'}
            size={'small'}
            onChange={this.onSortOrderChanged}
            value={distributionPlotOptions.sortBy}
          >
            {sortChoices.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {chartType === 'violin' && (
          <FormControl className={this.props.classes.formControl}>
            <InputLabel id="violin-scale-label">Scale</InputLabel>
            <Select
              label={'Scale'}
              size={'small'}
              className={this.props.classes.select}
              labelId="violin-scale-label"
              value={distributionPlotOptions.violinScale}
              onChange={this.onViolinScaleChange}
            >
              <MenuItem value={'area'}>Area</MenuItem>
              <MenuItem value={'width'}>Width</MenuItem>
            </Select>
            <FormHelperText>
              If "area", violins have the same area. If "width", violins have
              the same maximum width.
            </FormHelperText>
          </FormControl>
        )}

        {chartType === 'violin' && (
          <div>
            <FormControlLabel
              control={
                <Switch
                  value={'violinShowBoxplot'}
                  checked={distributionPlotOptions.violinShowBoxplot}
                  onChange={this.onViolinShowBoxplot}
                />
              }
              label="Show Box Plot"
            />
          </div>
        )}

        <FormControl className={this.props.classes.formControl}>
          <InputLabel id="dist-chart-type-label">Chart Type</InputLabel>
          <Select
            label={'Chart Type'}
            size={'small'}
            className={this.props.classes.select}
            labelId="dist-chart-type-label"
            value={chartType}
            onChange={this.onChartTypeChange}
          >
            {this.props.showDotPlotOption && (
              <MenuItem value={'dotplot'}>Dot Plot</MenuItem>
            )}
            <MenuItem value={'heatmap'}>Heatmap</MenuItem>
            <MenuItem value={'violin'}>Violin</MenuItem>
          </Select>
        </FormControl>
      </Box>
    );
  }
}

export default withStyles(styles)(DistributionGroup);
