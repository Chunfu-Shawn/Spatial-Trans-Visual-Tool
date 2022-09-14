import Box from '@mui/material/Box';
import {find} from 'lodash';
import React, {useEffect} from 'react';

import {connect} from 'react-redux';
import {
    getTraceKey,
    handleBrushFilterUpdated,
    handleCategoricalNameChange,
    handleColorChange,
    handleDimensionFilterUpdated,
    handleDomainChange,
    handleMeasureFilterUpdated,
    setChartOptions,
    setLegendScrollPosition,
    setWindowSize,
} from './actions';
import ImageChart from './ImageChart';
import SimplifiedScatterChartThree from './SimplifiedScatterChartThree.js';
import {FEATURE_TYPE} from './util';
import memoize from 'memoize-one';

const getActiveEmbeddingLabels = memoize((searchTokens, embeddingLabels) => {
    return searchTokens
        .filter(
            (item) =>
                item.type === FEATURE_TYPE.OBS_CAT &&
                embeddingLabels.indexOf(item.id) !== -1
        )
        .map((item) => item.id);
});

function SimplifiedEmbeddingChart(props) {
    const {
        activeFeature,
        cachedData,
        categoricalNames,
        chartOptions,
        embeddingData,
        embeddingLabels,
        markerOpacity,
        onChartOptions,
        onDimensionFilterUpdated,
        onSelect,
        pointSize,
        primaryChartSize,
        searchTokens,
        selection,
        unselectedMarkerOpacity,
        unselectedPointSize,
        handleChartOptions
    } = props;

    if (activeFeature == null) {
        return null;
    }
    const primaryTrace = find(
        embeddingData,
        (item) => getTraceKey(item) === activeFeature.embeddingKey
    );
    if (primaryTrace == null) {
        console.log(activeFeature.embeddingKey + ' not found');
        return null;
    }
    const activeEmbeddingLabels = getActiveEmbeddingLabels(
        searchTokens,
        embeddingLabels
    );
    useEffect(()=>{
        let chartOptionsTemp = {...chartOptions}
        // set darkMode = false
        chartOptionsTemp.darkMode=false
        handleChartOptions(chartOptionsTemp)
    },[])
    return (
        <Box bgcolor={'inherit'} color="inherit" style={{position: 'relative'}}>
            {primaryTrace.type === 'scatter' &&
                primaryTrace.embedding.mode == null && (
                    <SimplifiedScatterChartThree
                        trace={primaryTrace}
                        cachedData={cachedData}
                        obsCat={activeEmbeddingLabels}
                        chartSize={primaryChartSize}
                        chartOptions={chartOptions}
                        categoricalNames={categoricalNames}
                        selection={selection}
                        pointSize={pointSize}
                        unselectedPointSize={unselectedPointSize}
                        markerOpacity={markerOpacity}
                        unselectedMarkerOpacity={unselectedMarkerOpacity}
                        color={primaryTrace.colors}
                    />
                )}
            {primaryTrace.type === 'image' && (
                <ImageChart
                    cachedData={cachedData}
                    obsCat={activeEmbeddingLabels}
                    setChartOptions={onChartOptions}
                    chartOptions={chartOptions}
                    style={{display: 'inline-block'}}
                    trace={primaryTrace}
                    pointSize={pointSize}
                    chartSize={primaryChartSize}
                    categoricalNames={categoricalNames}
                    selection={selection}
                    markerOpacity={markerOpacity}
                    unselectedMarkerOpacity={unselectedMarkerOpacity}
                    onSelected={onSelect}
                    handleClick={onDimensionFilterUpdated}
                />
            )}
        </Box>
    );
}

const mapStateToProps = (state) => {
    return {
        activeFeature: state.activeFeature,
        embeddingData: state.embeddingData,
        cachedData: state.cachedData,
        categoricalNames: state.categoricalNames,
        chartOptions: state.chartOptions,
        datasetFilter: state.datasetFilter,
        embeddingLabels: state.embeddingLabels,
        featureSummary: state.featureSummary,
        globalFeatureSummary: state.globalFeatureSummary,
        legendScrollPosition: state.legendScrollPosition,
        markerOpacity: state.markerOpacity,
        selection: state.selection,
        pointSize: state.pointSize,
        primaryChartSize: state.panel.primaryChartSize,
        searchTokens: state.searchTokens,
        shape: state.dataset.shape,
        unselectedMarkerOpacity: state.unselectedMarkerOpacity,
        unselectedPointSize: state.unselectedPointSize,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        onChartOptions: (options) => {
            dispatch(setChartOptions(options));
        },
        onDomain: (value) => {
            dispatch(handleDomainChange(value));
        },
        onDimensionFilterUpdated: (e) => {
            dispatch(handleDimensionFilterUpdated(e));
        },
        onColorChange: (e) => {
            dispatch(handleColorChange(e));
        },
        onCategoricalNameChange: (e) => {
            dispatch(handleCategoricalNameChange(e));
        },
        onMeasureFilterUpdated: (e) => {
            dispatch(handleMeasureFilterUpdated(e));
        },
        onSelect: (e) => {
            dispatch(handleBrushFilterUpdated(e));
        },
        handleScrollPosition: (value) => {
            dispatch(setLegendScrollPosition(value));
        },
        handleWindowSize: (payload) => {
            dispatch(setWindowSize(payload));
        },
        handleChartOptions: (value) => {
            dispatch(setChartOptions(value));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SimplifiedEmbeddingChart);
