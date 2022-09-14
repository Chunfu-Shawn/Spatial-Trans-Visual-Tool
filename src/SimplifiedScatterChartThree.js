import withStyles from '@mui/styles/withStyles';
import React, {useEffect, useRef, useState} from 'react';
import {Color, Vector3} from 'three';
import {numberFormat2f} from './formatters';
import {
  createScatterPlot,
  POINT_VISUALIZER_ID,
  updateScatterChart,
} from './ThreeUtil';
import CirroTooltip, {SCATTER_TRANSITION} from './CirroTooltip';

export function getVisualizer(scatterPlot, id) {
  for (let i = 0; i < scatterPlot.visualizers.length; i++) {
    if (scatterPlot.visualizers[i].id === id) {
      return scatterPlot.visualizers[i];
    }
  }
}

const styles = (theme) => ({
  root: {
    '& > .MuiIconButton-root': {
      padding: 0,
    },
    '& > .cirro-active': {
      fill: 'rgb(220, 0, 78)',
      color: 'rgb(220, 0, 78)',
    },
    '& > .cirro-inactive': {
      fill: 'rgba(0, 0, 0, 0.26)',
      color: 'rgba(0, 0, 0, 0.26)',
    },
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'inline-block',
    verticalAlign: 'top',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
});

export function setAxesColors(scatterPlot, darkMode) {
  const axes = scatterPlot.scene.getObjectByName('axes');
  if (axes) {
    axes.setColors(
      darkMode ? new Color('rgb(255, 255, 255)') : new Color('rgb(0, 0, 0)')
    );
  }
}

function SimplifiedScatterChartThree(props) {
  const containerElementRef = useRef();
  const scatterPlotRef = useRef();
  const lastHoverIndexRef = useRef();
  const [forceUpdate, setForceUpdate] = useState(false);
  const previousChartSizeRef = useRef();
  const [tip, setTip] = useState({html: ''});

  const {
    cachedData,
    categoricalNames,
    chartOptions,
    chartSize,
    markerOpacity,
    obsCat,
    pointSize,
    selection,
    trace,
    unselectedMarkerOpacity,
    unselectedPointSize,
  } = props;

  const darkMode = chartOptions.darkMode;
  const showAxis = chartOptions.showAxis;
  const showFog = chartOptions.showFog;

  useEffect(() => {
    function webglcontextlost(e) {
      console.log('lost webgl context');
      e.preventDefault();
    }

    function webglcontextrestored(e) {
      console.log('restored webgl context');
      e.preventDefault();
      setForceUpdate((c) => !c);
    }

    if (scatterPlotRef.current == null) {
      const dragmode = chartOptions.dragmode;
      scatterPlotRef.current = createScatterPlot(
        containerElementRef.current,
        window.ApplePaySession,
        true
      );
      if (dragmode === 'pan') {
        scatterPlotRef.current.setInteractionMode('PAN');
      } else if (dragmode === 'select') {
        scatterPlotRef.current.setInteractionMode('SELECT');
        scatterPlotRef.current.rectangleSelector.setSelectionMode('BOX');
      } else if (dragmode === 'lasso') {
        scatterPlotRef.current.setInteractionMode('SELECT');
        scatterPlotRef.current.rectangleSelector.setSelectionMode('LASSO');
      }

      const canvas = containerElementRef.current.querySelector('canvas');
      canvas.style.outline = '0px';
      canvas.addEventListener('webglcontextlost', webglcontextlost);
      canvas.addEventListener('webglcontextrestored', webglcontextrestored);
    }
    if (chartOptions.camera) {
      scatterPlotRef.current.updateFromCameraDef(chartOptions.camera);
      chartOptions.camera = null;
    }
    chartOptions.scatterPlot = scatterPlotRef.current;
    return () => {
      if (containerElementRef.current) {
        const canvas = containerElementRef.current.querySelector('canvas');
        canvas.removeEventListener('webglcontextlost', webglcontextlost);
        canvas.removeEventListener(
          'webglcontextrestored',
          webglcontextrestored
        );
      }
    };
  }, [scatterPlotRef, containerElementRef, chartOptions]);

  useEffect(() => {
    function getSelectedIndex(point) {
      const positions = trace.positions;
      const camera = scatterPlotRef.current.camera;
      const widthHalf = chartSize.width / 2;
      const heightHalf = chartSize.height / 2;
      const pos = new Vector3();
      let selectedIndex = -1;
      const tolerance = 2;
      if (lastHoverIndexRef.current !== -1) {
        pos.x = positions[lastHoverIndexRef.current * 3];
        pos.y = positions[lastHoverIndexRef.current * 3 + 1];
        pos.z = positions[lastHoverIndexRef.current * 3 + 2];
        pos.project(camera);
        pos.x = pos.x * widthHalf + widthHalf;
        pos.y = -(pos.y * heightHalf) + heightHalf;
        if (
          Math.abs(pos.x - point.x) <= tolerance &&
          Math.abs(pos.y - point.y) <= tolerance
        ) {
          selectedIndex = lastHoverIndexRef.current;
        }
      }

      if (selectedIndex === -1) {
        // TODO get all hover points
        for (
          let i = 0, k = 0, npoints = trace.values.length;
          i < npoints;
          i++, k += 3
        ) {
          pos.x = positions[k];
          pos.y = positions[k + 1];
          pos.z = positions[k + 2];
          pos.project(camera);
          pos.x = pos.x * widthHalf + widthHalf;
          pos.y = -(pos.y * heightHalf) + heightHalf;
          if (
            Math.abs(pos.x - point.x) <= tolerance &&
            Math.abs(pos.y - point.y) <= tolerance
          ) {
            selectedIndex = i;
            break;
          }
        }
      }
      lastHoverIndexRef.current = selectedIndex;
      return selectedIndex;
    }

    scatterPlotRef.current.hoverCallback = (point, event) => {
      if (point == null) {
        setTip({html: ''});
      } else {
        const selectedIndex = getSelectedIndex(point);
        if (selectedIndex !== -1) {
          let value = trace.values[selectedIndex];
          if (typeof value === 'number') {
            value = numberFormat2f(value);
            if (value.endsWith('.00')) {
              value = value.substring(0, value.lastIndexOf('.'));
            }
          }
          setTip({
            html: '' + value,
            clientX: event.clientX,
            clientY: event.clientY,
          });
          // updateTooltipText(tip, '' + value, event);
        } else {
          setTip({html: ''});
          // updateTooltipText(tip, '', event);
        }
      }
    };
    return () => {
      scatterPlotRef.current.hoverCallback = null;
    };
  }, [scatterPlotRef, chartSize, trace]); // onHover

  useEffect(() => {
    setAxesColors(scatterPlotRef.current, darkMode);
    const axes = scatterPlotRef.current.scene.getObjectByName('axes');
    if (axes) {
      axes.visible = showAxis;
    }
    getVisualizer(
      scatterPlotRef.current,
      POINT_VISUALIZER_ID
    ).styles.fog.enabled = showFog;
  }, [scatterPlotRef, darkMode, showAxis, showFog]);

  useEffect(() => {
    if (previousChartSizeRef.current !== chartSize) {
      scatterPlotRef.current.resize();
    }
    previousChartSizeRef.current = chartSize;
    updateScatterChart(
      scatterPlotRef.current,
      trace,
      selection,
      markerOpacity,
      unselectedMarkerOpacity,
      pointSize,
      unselectedPointSize,
      categoricalNames,
      chartOptions,
      obsCat,
      cachedData
    );
  }, [
    scatterPlotRef,
    trace,
    selection,
    markerOpacity,
    unselectedMarkerOpacity,
    pointSize,
    unselectedPointSize,
    categoricalNames,
    chartOptions,
    obsCat,
    cachedData,
    chartSize,
    forceUpdate,
  ]);

  useEffect(() => {
    return () => {
      scatterPlotRef.current.dispose();
    };
  }, []);

  return (
      <div
        data-testid="scatter-chart-three"
        style={{
          display: 'inline-block',
          // change canvas size
          width: chartSize.width,
          height: chartSize.height,
        }}
        ref={containerElementRef}
      >
        <CirroTooltip
          html={tip.html}
          clientX={tip.clientX}
          clientY={tip.clientY}
          transition={SCATTER_TRANSITION}
        />
      </div>
  );
}

export default withStyles(styles)(SimplifiedScatterChartThree);
