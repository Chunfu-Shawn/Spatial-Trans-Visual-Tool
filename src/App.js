import {IconButton, Snackbar} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Drawer from '@mui/material/Drawer';
import LinearProgress from '@mui/material/LinearProgress';
import * as React from 'react';
import {useRef} from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import CloseIcon from '@mui/icons-material/Close';
import {connect} from 'react-redux';
import {
  HELP_DIALOG,
  setDialog,
  setDrawerOpen,
  setMessage,
} from './actions';
import AppHeader from './AppHeader';
import CompositionPlots from './CompositionPlots';
import DistributionPlots from './DistributionPlots';
import DraggableDivider from './DraggableDivider';
import EmbeddingChart from './EmbeddingChart';
import GalleryCharts from './GalleryCharts';
import HelpDialog from './HelpDialog';

import LandingPage from './LandingPage';
import SideBar from './SideBar';
import {withTheme} from '@emotion/react';
import {Spin} from "antd";
import {LoadingOutlined} from "@ant-design/icons";

export const drawerWidth = 240;
const antIcon = (
    <LoadingOutlined
        style={{
            fontSize: 24,
            color:"lightblue"
        }}
        spin
    />
);

function App(props) {
  const galleryRef = useRef();
  const embeddingyRef = useRef();
  const {
    drawerOpen,
    theme,
    dataset,
    dialog,
    loading,
    loadingApp,
    message,
    setMessage,
    tab,
    chartSize
  } = props;

  function handleMessageClose() {
    setMessage(null);
  }

  function onGallery() {
    galleryRef.current.scrollIntoView();
  }

  // tabs: 1. embedding, 2. grouped table with kde per feature, dotplot
  // need to add filter, selection

  const color = theme.palette.primary.main;
  const footerBackground = theme.palette.background.paper;
  return (
    <Box sx={{display: 'flex', backgroundColor: footerBackground}}>
      {dialog === HELP_DIALOG && <HelpDialog />}
      <AppHeader />
      <Drawer
        open={drawerOpen && dataset != null}
        variant="persistent"
        sx={{
          width: drawerOpen && dataset != null ? drawerWidth : null,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerOpen && dataset != null ? drawerWidth : null,
            boxSizing: 'border-box',
              height:"auto",
          },
        }}
      >
        <Toolbar />
        {dataset != null && (
          <SideBar key={dataset.id} />
        )}
      </Drawer>
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
        <Toolbar />
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
        {
          <>
            {dataset != null && (
              <div role="tabpanel" hidden={tab !== 'embedding'}>
                  <div ref={embeddingyRef}><EmbeddingChart onGallery={onGallery} /></div>
                  <div ref={galleryRef}><DraggableDivider /></div>
                <GalleryCharts embeddingyRef={embeddingyRef}/>
              </div>
            )}
            {dataset != null && (
              <div role="tabpanel" hidden={tab !== 'distribution'}>
                {<DistributionPlots />}
              </div>
            )}
            {dataset != null && (
              <div role="tabpanel" hidden={tab !== 'composition'}>
                {<CompositionPlots />}
              </div>
            )}
          </>
        }
      </Box>

        {loading && (
            <div style={{background:"#777777",width:chartSize.width,height:chartSize.height,zIndex:99999999}}>
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
    drawerOpen: state.panel.drawerOpen,
    dialog: state.dialog,
    loading: state.tasks.length > 0,
    loadingApp: state.loadingApp,
    message: state.message,
    tab: state.tab,
    chartSize: state.chartSize
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
  };
};

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(App));
