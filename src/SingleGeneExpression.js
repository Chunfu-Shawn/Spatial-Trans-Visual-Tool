import {IconButton, Snackbar} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import * as React from 'react';
import {useEffect} from 'react';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';
import {connect} from 'react-redux';
import {
    setChartOptions,
    setDialog,
    setMessage,
} from './actions';

import LandingPage from './LandingPage';
import SimpliedEmbeddingChart from "./SimplifiedEmbeddingChart";


function SingleGeneExpression(props) {
    const {
        dataset,
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

    return (
        <Box sx={{display: 'flex', backgroundColor: "white"}}>
            <Box
                scomponent="main"
                sx={{
                    flexGrow: 1,
                    marginLeft: 1,
                    paddingBottom: 14,
                    backgroundColor: "white",
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
        loading: state.tasks.length > 0,
        loadingApp: state.loadingApp,
        message: state.message,
        chartOptions: state.chartOptions,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        handleDialog: (value) => {
            dispatch(setDialog(value));
        },
        setMessage: (value) => {
            dispatch(setMessage(value));
        },
        handleChartOptions: (value) => {
            dispatch(setChartOptions(value));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SingleGeneExpression);
