import {IconButton, Tooltip} from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Popover from '@mui/material/Popover';
import Tab from '@mui/material/Tab';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Brightness2Icon from '@mui/icons-material/Brightness3';
import HelpIcon from '@mui/icons-material/Help';
import React, {useState} from 'react';
import {connect} from 'react-redux';
import {
  HELP_DIALOG,
  setChartOptions,
  setDataset,
  setDialog,
  setDrawerOpen,
  setMessage,
  setTab,
} from './actions';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {intFormat} from './formatters';
import {
  FEATURE_TYPE,
} from './util';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import MenuIcon from '@mui/icons-material/Menu';

function AppHeader(props) {
  const {
    chartOptions,
    dataset,
    drawerOpen,
    distributionData,
    handleChartOptions,
    handleDrawerOpen,
    handleDialog,
    handleTab,
    loadingApp,
    selection,
    searchTokens,
    tab,
  } = props;

  const [datasetDetailsEl, setDatasetDetailsEl] = useState(null);

  function onTabChange(event, value) {
    handleTab(value);
  }

  function toggleDrawer() {
    handleDrawerOpen(!drawerOpen);
  }

  function onHelp() {
    handleDialog(HELP_DIALOG);
  }

  function onDarkMode() {
    chartOptions.darkMode = !chartOptions.darkMode;
    handleChartOptions(chartOptions);
  }

  function onShowDatasetDetails(event) {
    setDatasetDetailsEl(event.currentTarget);
  }

  function onCloseDatasetDetails(event) {
    setDatasetDetailsEl(null);
  }

  const datasetDetailsOpen = Boolean(datasetDetailsEl);
  const shape = dataset != null && dataset.shape != null ? dataset.shape : null;
  const hasSelection =
    dataset != null && shape != null && shape[0] > 0 && selection != null;
  const obsCat = searchTokens
    .filter((item) => item.type === FEATURE_TYPE.OBS_CAT)
    .map((item) => item.id);

  return (
    <Box sx={{display: 'flex'}}>
      <AppBar
        position="absolute"
        color={'default'}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        {dataset != null && datasetDetailsOpen && (
          <Popover
            id={'dataset-details'}
            open={datasetDetailsOpen}
            anchorEl={datasetDetailsEl}
            onClose={onCloseDatasetDetails}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
          >
            <Box style={{width: 500, padding: '1em'}}>
              <Typography variant="h6">{dataset.name}</Typography>
            </Box>
          </Popover>
        )}
        <Toolbar variant="dense" style={{paddingLeft: 0}}>
          {dataset && (
            <IconButton
              size="large"
              color="inherit"
              aria-label="toggle drawer"
              onClick={toggleDrawer}
            >
              <MenuIcon />
            </IconButton>
          )}
          {!dataset && <Box sx={{paddingLeft: 1}}></Box>}

          <Typography sx={{paddingRight: 1}} variant="subtitle2">
            &nbsp;
            {hasSelection && shape != null && intFormat(selection.size) + ' / '}
            {shape != null && intFormat(shape[0]) + ' spots'}
          </Typography>
          {dataset && (
            <IconButton
              aria-label="Info"
              onClick={onShowDatasetDetails}
              aria-owns={datasetDetailsOpen ? 'dataset-details' : undefined}
              aria-haspopup="true"
              size="small"
            >
              <InfoOutlinedIcon />
            </IconButton>
          )}
          <Typography variant="subtitle2">
            {dataset != null ? dataset.name : ''}
          </Typography>
          <div style={{display: 'flex', marginLeft: 'auto'}}>
            {!loadingApp.loading && (
              <Tabs
                textColor="inherit"
                indicatorColor="secondary"
                value={tab}
                onChange={onTabChange}
              >
                <Tab
                  data-testid="embedding-tab"
                  value="embedding"
                  label="Embeddings"
                  disabled={dataset == null}
                />
                <Tab
                  data-testid="distributions-tab"
                  value="distribution"
                  label="Distributions"
                  disabled={dataset == null || distributionData.length === 0}
                />
                <Tab
                  data-testid="composition-tab"
                  value="composition"
                  label="Composition"
                  disabled={dataset == null || obsCat.length < 2}
                />
              </Tabs>
            )}
            {
              <Tooltip title={'Toggle Light/Dark Theme'}>
                <IconButton
                  edge={false}
                  className={chartOptions.darkMode ? 'cirro-active' : ''}
                  aria-label="Toggle Theme"
                  onClick={() => onDarkMode()}
                  size="large"
                >
                  <Brightness2Icon />
                </IconButton>
              </Tooltip>
            }
            {dataset != null && (
              <Tooltip title={'Help'}>
                <IconButton aria-label="Help" onClick={onHelp} size="large">
                  <HelpIcon />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

const mapStateToProps = (state) => {
  return {
    activeFeature: state.activeFeature,
    chartOptions: state.chartOptions,
    combineDatasetFilters: state.combineDatasetFilters,
    dataset: state.dataset,
    datasetChoices: state.datasetChoices,
    datasetFilter: state.datasetFilter,
    dialog: state.dialog,
    distributionData: state.distributionData,
    distributionPlotInterpolator: state.distributionPlotInterpolator,
    drawerOpen: state.panel.drawerOpen,
    email: state.email,
    embeddingLabels: state.embeddingLabels,
    embeddings: state.embeddings,
    interpolator: state.interpolator,
    loading: state.loading,
    loadingApp: state.loadingApp,
    markerOpacity: state.markerOpacity,
    message: state.message,
    pointSize: state.pointSize,
    savedDatasetState: state.savedDatasetState,
    searchTokens: state.searchTokens,
    selection: state.selection,
    tab: state.tab,
    unselectedMarkerOpacity: state.unselectedMarkerOpacity,
    user: state.user,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    handleTab: (value) => {
      dispatch(setTab(value));
    },
    handleMessage: (value) => {
      dispatch(setMessage(value));
    },
    handleDataset: (value) => {
      dispatch(setDataset(value));
    },
    handleDialog: (value) => {
      dispatch(setDialog(value));
    },
    handleChartOptions: (value) => {
      dispatch(setChartOptions(value));
    },
    handleDrawerOpen: (value) => {
      dispatch(setDrawerOpen(value));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AppHeader);
