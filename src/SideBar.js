import {InputLabel, Switch, Typography} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import {debounce, find} from 'lodash';
import React, {useEffect, useMemo, useState} from 'react';
import {
  getTraceKey,
  handleDomainChange,
  setChartOptions,
  setChartSize,
  setInterpolator,
  setMarkerOpacity,
  setPointSize,
  setUnselectedMarkerOpacity,
  setUnselectedPointSize,
} from './actions';
import {EditableColorScheme} from './EditableColorScheme';
import {
  REACT_MD_OVERRIDES,
  TRACE_TYPE_META_IMAGE,
} from './util';
import withStyles from '@mui/styles/withStyles';
import {connect} from 'react-redux';
import Divider from '@mui/material/Divider';
import ExplorePanel from './ExplorePanel';
import Popover from '@mui/material/Popover';
import ReactMarkdown from 'markdown-to-jsx';
import {drawerWidth} from "./App";

const pointSizeOptions = [
  {value: 0.1, label: '10%'},
  {value: 0.25, label: '25%'},
  {value: 0.5, label: '50%'},
  {
    value: 0.75,
    label: '75%',
  },
  {value: 1, label: '100%'},
  {value: 1.5, label: '150%'},
  {value: 2, label: '200%'},
  {
    value: 3,
    label: '300%',
  },
  {value: 4, label: '400%'},
  {value: 5, label: '500%'},
];
const gallerySizeOptions = [
  {value: 200, label: 'Extra Small'},
  {value: 300, label: 'Small'},
  {
    value: 500,
    label: 'Medium',
  },
  {
    value: 800,
    label: 'Large',
  },
];

const styles = (theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    margin: theme.spacing(0, 0.5),
  },
  title: {textTransform: 'uppercase'},
  formControl: {
    display: 'block',
    minWidth: 216,
    maxWidth: 216,
    marginBottom: theme.spacing(1),
  },
  select: {
    minWidth: 216,
  },
});

function SideBar(props) {
  const [opacity, setOpacity] = useState(props.markerOpacity);
  const [unselectedOpacity, setUnselectedOpacity] = useState(
    props.unselectedMarkerOpacity
  );

  const [minColor, setMinColor] = useState('');
  const [maxColor, setMaxColor] = useState('');
  const [selectedViewEl, setSelectedViewEl] = useState(null);
  const [selectedView, setSelectedView] = useState(null);

  const {
    activeFeature,
    chartSize,
    classes,
    drawerWidth,
    embeddingData,
    globalFeatureSummary,
    interpolator,
    markerOpacity,
    pointSize,
    tab,
    unselectedPointSize,
    unselectedMarkerOpacity,
    handleInterpolator,
    handleChartSize,
    onDomain,
    handlePointSize,
    handleUnselectedPointSize,
    handleMarkerOpacity,
    handleUnselectedMarkerOpacity,
  } = props;

  const primaryTrace =
    activeFeature == null
      ? null
      : find(
          embeddingData,
          (trace) => getTraceKey(trace) === activeFeature.embeddingKey
        );
  const activeInterpolator =
    activeFeature == null ? null : interpolator[activeFeature.type];

  const updateMarkerOpacityDebouncedFunc = useMemo(
    () => debounce(updateMarkerOpacity, 500),
    []
  );
  const updateUnselectedMarkerOpacityDebouncedFunc = useMemo(
    () => debounce(updateUnselectedMarkerOpacity, 500),
    []
  );

  useEffect(() => {
    setOpacity(markerOpacity);
  }, [markerOpacity]);

  useEffect(() => {
    setUnselectedOpacity(unselectedMarkerOpacity);
  }, [unselectedMarkerOpacity]);

  useEffect(() => {
    const summary =
      activeFeature == null ? null : globalFeatureSummary[activeFeature.name];
    if (activeFeature == null) {
      setMinColor('');
      setMaxColor('');
    } else {
      const trace = find(
        embeddingData,
        (trace) => getTraceKey(trace) === activeFeature.embeddingKey
      );
      if (trace == null) {
        setMinColor('');
        setMaxColor('');
      } else if (trace.type !== TRACE_TYPE_META_IMAGE) {
        setMinColor(summary.customMin == null ? '' : summary.customMin);
        setMaxColor(summary.customMax == null ? '' : summary.customMax);
      } else {
        setMinColor(summary.customZMin == null ? '' : summary.customZMin);
        setMaxColor(summary.customZMax == null ? '' : summary.customZMax);
      }
    }
  }, [activeFeature, embeddingData, globalFeatureSummary]);

  function onInterpolator(value) {
    handleInterpolator({featureType: activeFeature.type, value: value});
  }

  function onMinUIChange(value) {
    setMinColor(value);
  }

  function onMaxUIChange(value) {
    setMaxColor(value);
  }

  function onMinChange(value) {
    console.log(activeFeature)
    const summary = globalFeatureSummary[activeFeature.name];
    const trace = find(
      embeddingData,
      (trace) => getTraceKey(trace) === activeFeature.embeddingKey
    );
    if (trace.type !== TRACE_TYPE_META_IMAGE) {
      summary.customMin = isNaN(value) ? undefined : value;
    } else {
      summary.customZMin = isNaN(value) ? undefined : value;
    }
    onDomain({
      name: activeFeature.name,
      summary: summary,
    });
  }

  function onMaxChange(value) {
    const summary = globalFeatureSummary[activeFeature.name];
    const trace = find(
      embeddingData,
      (trace) => getTraceKey(trace) === activeFeature.embeddingKey
    );
    if (trace.type !== TRACE_TYPE_META_IMAGE) {
      summary.customMax = isNaN(value) ? undefined : value;
    } else {
      summary.customZMax = isNaN(value) ? undefined : value;
    }
    onDomain({
      name: activeFeature.name,
      summary: summary,
    });
  }

  function onMarkerOpacityChange(event, value) {
    setOpacity(value);
    updateMarkerOpacityDebouncedFunc(value);
  }

  function updateMarkerOpacity(value) {
    let opacity = parseFloat(value);
    if (opacity >= 0 && opacity <= 1) {
      handleMarkerOpacity(opacity);
    }
  }

  function onUnselectedMarkerOpacityChange(event, value) {
    setUnselectedOpacity(value);
    updateUnselectedMarkerOpacityDebouncedFunc(value);
  }

  function updateUnselectedMarkerOpacity(value) {
    let opacity = parseFloat(value);
    if (opacity >= 0 && opacity <= 1) {
      handleUnselectedMarkerOpacity(opacity);
    }
  }

  function onPointSizeChange(event) {
    handlePointSize(event.target.value);
  }

  function onUnselectedPointSizeChange(event) {
    handleUnselectedPointSize(event.target.value);
  }

  function onChartSizeChange(event) {
    handleChartSize(event.target.value);
  }

  function handleCloseViewDetails() {
    setSelectedViewEl(null);
    setSelectedView(null);
  }

  return (
    <div className={classes.root} style={{padding:6}}>
      <ExplorePanel />
      <div style={tab === 'embedding' ? null : {display: 'none'}}>
        <Divider />
        <Typography
          gutterBottom={true}
          component={'h1'}
          className={classes.title}
        >
          View
        </Typography>
        <InputLabel shrink={true}>Opacity</InputLabel>
        <Slider
          min={0.0}
          max={1}
          step={0.01}
          sx={{width: drawerWidth-50, marginLeft: 1}}
          valueLabelDisplay="auto"
          value={opacity}
          onChange={onMarkerOpacityChange}
          aria-labelledby="continuous-slider"
        />

        <InputLabel shrink={true}>Filtered Marker Opacity</InputLabel>
        <Slider
          min={0.0}
          max={1}
          step={0.01}
          sx={{width: drawerWidth-50, marginLeft: 1}}
          valueLabelDisplay="auto"
          value={unselectedOpacity}
          onChange={onUnselectedMarkerOpacityChange}
          aria-labelledby="continuous-slider"
        />

        <FormControl className={classes.formControl} >
          <InputLabel htmlFor="point_size">Marker Size</InputLabel>
          <Select
            label={'Marker Size'}
            labelId={'point_size'}
            sx={{width: drawerWidth-50}}
            size={'small'}
            onChange={onPointSizeChange}
            value={pointSize}
            multiple={false}
          >
            {pointSizeOptions.map((item) => (
              <MenuItem key={item.label} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="filtered_point_size">
            Filtered Marker Size
          </InputLabel>
          <Select
            label={'Filtered Marker Size'}
            labelId={'filtered_point_size'}
            size={'small'}
            sx={{width: drawerWidth-50}}
            onChange={onUnselectedPointSizeChange}
            value={unselectedPointSize}
            multiple={false}
          >
            {pointSizeOptions.map((item) => (
              <MenuItem key={item.label} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="chart_size">Gallery Chart Size</InputLabel>
          <Select
            label={'Gallery Chart Size'}
            labelId={'chart_size'}
            size={'small'}
            sx={{width: drawerWidth-50}}
            onChange={onChartSizeChange}
            value={chartSize}
            multiple={false}
          >
            {gallerySizeOptions.map((item) => (
              <MenuItem key={item.label} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <EditableColorScheme
          interpolator={activeInterpolator}
          domain={
            primaryTrace &&
            primaryTrace.continuous &&
            primaryTrace.name !== '__count'
              ? primaryTrace.colorScale.domain()
              : null
          }
          drawerWidth={drawerWidth}
          min={minColor}
          max={maxColor}
          onMinChange={onMinChange}
          onMaxChange={onMaxChange}
          onMinUIChange={onMinUIChange}
          onMaxUIChange={onMaxUIChange}
          onInterpolator={onInterpolator}
        />
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    activeFeature: state.activeFeature,
    categoricalNames: state.categoricalNames,
    chartSize: state.chartSize,
    chartOptions: state.chartOptions,
    dataset: state.dataset,
    embeddingData: state.embeddingData,
    embeddings: state.embeddings,
    globalFeatureSummary: state.globalFeatureSummary,
    interpolator: state.interpolator,
    markerOpacity: state.markerOpacity,
    markers: state.markers,
    pointSize: state.pointSize,
    tab: state.tab,
    unselectedPointSize: state.unselectedPointSize,
    unselectedMarkerOpacity: state.unselectedMarkerOpacity,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    handleInterpolator: (value) => {
      dispatch(setInterpolator(value));
    },
    handleChartSize: (value) => {
      dispatch(setChartSize(value));
    },
    handleChartOptions: (value) => {
      dispatch(setChartOptions(value));
    },
    onDomain: (value) => {
      dispatch(handleDomainChange(value));
    },
    handlePointSize: (value) => {
      dispatch(setPointSize(value));
    },
    handleUnselectedPointSize: (value) => {
      dispatch(setUnselectedPointSize(value));
    },
    handleMarkerOpacity: (value) => {
      dispatch(setMarkerOpacity(value));
    },
    handleUnselectedMarkerOpacity: (value) => {
      dispatch(setUnselectedMarkerOpacity(value));
    },
  };
};
export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(SideBar)
);
