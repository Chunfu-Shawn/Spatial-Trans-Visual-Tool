import Box from '@mui/material/Box';
import {find} from 'lodash';
import React, {useEffect, useState} from 'react';

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
    setEmbeddingData,
    setLegendScrollPosition,
    setSearchTokens,
    setWindowSize,
} from './actions';
import ImageChart from './ImageChart';
import ScatterChartThree from './ScatterChartThree';
import {FEATURE_TYPE, TRACE_TYPE_META_IMAGE} from './util';
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

function SimpliedEmbeddingChart(props) {
    const {
        dataset,
        activeFeature,
        cachedData,
        categoricalNames,
        chartOptions,
        embeddingData,
        embeddingLabels,
        handleEmbeddingData,
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
        handleSearchTokens
    } = props;

    function onCamera(eventName, cameraDef) {
        const primaryTrace = find(
            embeddingData,
            (item) => getTraceKey(item) === activeFeature.embeddingKey
        );
        for (let i = 0, n = embeddingData.length; i < n; i++) {
            if (primaryTrace.embedding.name === embeddingData[i].embedding.name) {
                embeddingData[i].camera = cameraDef;
            }
        }
        handleEmbeddingData(embeddingData.slice());
    }

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
    const geneOption = {"id":"Apcdd1","gene_ids":"Apcdd1","feature_types":"Gene Expression","mt":false,"n_cells_by_counts":66,"mean_counts":0,"log1p_mean_counts":0,"pct_dropout_by_counts":99.79,"total_counts":94,"log1p_total_counts":4.55,"highly_variable":false,"means":0,"dispersions":0.6,"dispersions_norm":-0.2,"highly_variable_2k":false,"group":"","text":"Apcdd1"};
    useEffect(()=>{
        handleSearchTokens(
                    [
                        {id: geneOption.id, type: FEATURE_TYPE.X}
                    ]
                );
        console.log(searchTokens)
    },[])
    return (
        <Box bgcolor={'inherit'} color="inherit" style={{position: 'relative'}}>
            {primaryTrace.type === 'scatter' &&
                primaryTrace.embedding.mode == null && (
                    <ScatterChartThree
                        gene={true}
                        trace={primaryTrace}
                        cachedData={cachedData}
                        obsCat={activeEmbeddingLabels}
                        chartSize={primaryChartSize}
                        setChartOptions={onChartOptions}
                        chartOptions={chartOptions}
                        categoricalNames={categoricalNames}
                        selection={selection}
                        onSelected={onSelect}
                        pointSize={pointSize}
                        unselectedPointSize={unselectedPointSize}
                        markerOpacity={markerOpacity}
                        unselectedMarkerOpacity={unselectedMarkerOpacity}
                        color={primaryTrace.colors}
                        onCamera={onCamera}
                        handleClick={onDimensionFilterUpdated}
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
        dataset: state.dataset,
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
        handleEmbeddingData: (value) => {
            dispatch(setEmbeddingData(value));
        },
        handleSearchTokens: (value) => {
            dispatch(setSearchTokens(value, false));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SimpliedEmbeddingChart);
