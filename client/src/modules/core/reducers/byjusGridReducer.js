export const SAVE_REQUEST = '/gridConfig/SAVE_REQUEST';
export const CLEAR_REQUEST = '/gridConfig/CLEAR_REQUEST';

const saveRequest = (values) => ({ type: SAVE_REQUEST, values });
const clearRequest = (values) => ({ type: CLEAR_REQUEST, values });

export const saveGridConfig = (gridValues, pathName) => dispatch => {
    dispatch(saveRequest({ gridValues, pathName }));
};

export const clearGridConfig = () => dispatch => {
    dispatch(clearRequest());
};

export default (state = {}, action) => {
    switch (action.type) {
        case SAVE_REQUEST:
            return {
                ...state,
                gridValues: action.values.gridValues,
                pathName: action.values.pathName
            };
        case CLEAR_REQUEST:
            return {
                ...state,
                gridValues: {},
                pathName: ""
            };
        default:
            return state;
    }
};
