import {IconButton, Snackbar} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import * as React from 'react';
import {useEffect, useRef} from 'react';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';
import {connect} from 'react-redux';
import {
    DELETE_DATASET_DIALOG,
    HELP_DIALOG,
    SAVE_DATASET_FILTER_DIALOG,
    SAVE_FEATURE_SET_DIALOG, setChartOptions,
    setDialog,
    setDrawerOpen,
    setMessage,
} from './actions';
import DeleteDatasetDialog from './DeleteDatasetDialog';
import HelpDialog from './HelpDialog';
import LandingPage from './LandingPage';
import SaveDatasetFilterDialog from './SaveDatasetViewDialog';
import SaveSetDialog from './SaveSetDialog';
import {withTheme} from '@emotion/react';
import SimpliedEmbeddingChart from "./SimpliedEmbeddingChart";


function SingleGeneExpression(props) {
    const {
        theme,
        dataset,
        dialog,
        loading,
        loadingApp,
        message,
        setMessage,
        tab,
        handleChartOptions
    } = props;

    function handleMessageClose() {
        setMessage(null);
    }

    // tabs: 1. embedding, 2. grouped table with kde per feature, dotplot
    // need to add filter, selection

    const color = theme.palette.primary.main;
    const footerBackground = theme.palette.background.paper;

    useEffect(()=>{
        // set them be light
        let chartOptions = props.chartOptions
        chartOptions.darkMode = false;
        handleChartOptions(chartOptions);
    },[])

    return (
        <Box sx={{display: 'flex', backgroundColor: footerBackground}}>
            {dialog === DELETE_DATASET_DIALOG && <DeleteDatasetDialog />}
            {dialog === SAVE_DATASET_FILTER_DIALOG && <SaveDatasetFilterDialog />}
            {dialog === HELP_DIALOG && <HelpDialog />}
            {dialog === SAVE_FEATURE_SET_DIALOG && <SaveSetDialog />}
            <Box
                scomponent="main"
                sx={{
                    flexGrow: 1,
                    marginLeft: 1,
                    paddingBottom: 14,
                    color: color,
                    backgroundColor: footerBackground,
                }}
            >
                {loadingApp.loading && (
                    <div>
                        <h2>
                            Loading
                            <LinearProgress
                                style={{width: '90%'}}
                                variant="determinate"
                                value={loadingApp.progress}
                            />
                        </h2>
                    </div>
                )}

                {dataset == null &&
                    tab === 'embedding' &&
                    !loading &&
                    !loadingApp.loading && (
                        <div>
                            <LandingPage />
                        </div>
                    )}
                {dataset != null && (
                    <SimpliedEmbeddingChart/>
                )}
            </Box>

            {loading && (
                <Dialog aria-labelledby="loading-dialog-title" open={true}
                        container={() => document.getElementById('VisualTool')}>
                    <DialogTitle id="loading-dialog-title">
                        <CircularProgress size={20} /> Loading...
                    </DialogTitle>
                </Dialog>
            )}

            {message != null && (
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    onClose={handleMessageClose}
                    open={true}
                    autoHideDuration={6000}
                    action={[
                        <IconButton
                            key="close"
                            aria-label="Close"
                            color="inherit"
                            onClick={handleMessageClose}
                            size="large"
                        >
                            <CloseIcon />
                        </IconButton>,
                    ]}
                    message={
                        <span id="message-id">
              {message instanceof Error ? message.message : message}
            </span>
                    }
                />
            )}
        </Box>
    );
}

const mapStateToProps = (state) => {
    return {
        dataset: state.dataset,
        drawerOpen: state.panel.drawerOpen,
        dialog: state.dialog,
        loading: state.tasks.length > 0,
        loadingApp: state.loadingApp,
        message: state.message,
        tab: state.tab,
        chartOptions: state.chartOptions,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        handleDialog: (value) => {
            dispatch(setDialog(value));
        },
        handleDrawerOpen: (value) => {
            dispatch(setDrawerOpen(value));
        },
        setMessage: (value) => {
            dispatch(setMessage(value));
        },
        handleChartOptions: (value) => {
            dispatch(setChartOptions(value));
        }
    };
};

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(SingleGeneExpression));
