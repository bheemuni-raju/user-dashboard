import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import { reducer as form } from 'redux-form'

import entities from './entities'
import app from '../modules/core/reducers'
import auth from '../modules/user/authReducer'
import gridConfig from '../modules/core/reducers/byjusGridReducer';
import tabConfig from '../modules/core/reducers/tabBuilderReducer';

export default (history) => combineReducers({
    entities,
    app,
    auth,
    form,
    gridConfig,
    tabConfig,
    router: connectRouter(history)
})