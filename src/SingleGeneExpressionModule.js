import React from 'react';
import {Provider} from 'react-redux';
import {applyMiddleware, createStore} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {init, setWindowSize} from './actions';
import rootReducer from './reducers';
import SingleGeneExpressionWrapper from "./SingleGeneExpressionWrapper";


export function SingleGeneExpressionModule(props) {
    const {
        width = 400,
        height = 400,
        setCustom = false,
        dataset,
        gene
    } = props

    const store = createStore(
        rootReducer,
        applyMiddleware(thunkMiddleware)
    );
    store.dispatch(init(dataset,gene));
    store.dispatch(setWindowSize(
        {
            width: width,
            height: height,
            setCustom: setCustom
        }));

    return(
        <Provider store={store}>
            {/*<React.StrictMode>*/}
            <div id={`VisualTool_${gene}`}
                 style={{
                     borderRadius: 5,
                     borderStyle: "solid",
                     borderWidth: 2,
                     borderColor: "lightgray",
                     // whether custom
                     width: setCustom ? width: 400,
                     height: setCustom ? height: 400,
                     transform:"translate3d(0, 0, 0)"
                 }}>
                <SingleGeneExpressionWrapper gene={gene}/>
            </div>
            {/*</React.StrictMode>*/}
        </Provider>
    );
}
