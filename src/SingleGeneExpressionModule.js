import React, {PureComponent} from 'react';
import {Provider} from 'react-redux';
import {applyMiddleware, createStore} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {init, setWindowSize} from './actions';
import rootReducer from './reducers';
import SingleGeneExpressionWrapper from "./SingleGeneExpressionWrapper";


export class SingleGeneExpressionModule extends PureComponent {
    render() {

        const {
            width = 400,
            height = 400,
            setCustom = false,
            dataset,
            gene
        } = this.props

        const store = createStore(
            rootReducer,
            applyMiddleware(thunkMiddleware)
        );
        store.dispatch(init(dataset, gene));
        store.dispatch(setWindowSize(
            {
                width: width,
                height: height,
                setCustom: setCustom
            }));

        return (
            <Provider store={store}>
                {/*<React.StrictMode>*/}
                <div id={`VisualTool_${gene}`}
                     style={{
                         borderRadius: 8,
                         padding: 2,
                         borderStyle: "solid",
                         borderWidth: 2,
                         borderColor: "lightgray",
                         // whether custom
                         width: setCustom ? width + 8 : 408,
                         height: setCustom ? height + 8 : 408,
                         transform: "translate3d(0, 0, 0)"
                     }}>
                    <SingleGeneExpressionWrapper gene={gene}/>
                </div>
                {/*</React.StrictMode>*/}
            </Provider>
        );
    }
}
