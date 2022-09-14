import {IconButton, Snackbar} from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import * as React from 'react';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';
import {connect} from 'react-redux';
import {
    setChartOptions,
    setDialog,
    setMessage,
} from './actions';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import LandingPage from './LandingPage';
import SimpliedEmbeddingChart from "./SimplifiedEmbeddingChart";

const antIcon = (
    <LoadingOutlined
        style={{
            fontSize: 24,
        }}
        spin
    />
);


function SingleGeneExpression(props) {
    const {
        dataset,
        loading,
        loadingApp,
        message,
        setMessage,
        tab
    } = props;

    function handleMessageClose() {
        setMessage(null);
    }

    return (
        <Box sx={{display: 'flex', backgroundColor: "white",height:"100%"}}>
            <Box
                scomponent="main"
                sx={{
                    flexGrow: 1,
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
                <div style={{background:"#797979",width:"100%",height:"100%"}}>
                    <div style={{
                        padding:5,
                        color:"white",
                        display:"flex",
                        width:130,
                        background:"#3a3a3a",
                        position:"absolute",
                        top:"50%",
                        left:"50%",
                        borderRadius: 4,
                        borderStyle: "solid",
                        borderWidth: 2,
                        borderColor:"#3a3a3a",
                        boxShadow: "2px 2px 5px 1px #212121",
                        transform: "translate(-50%, -50%)"//将元素沿x轴反方向移动本元素的一半width,沿y轴反方向移动本元素的一半height
                    }}>
                        <Spin indicator={antIcon} />
                        <span style={{fontSize:18,marginLeft:10}}>Loading...</span>
                    </div>
                </div>
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
