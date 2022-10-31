export const SAVE_REQUEST = '/tabConfig/SAVE_REQUEST';
export const CLEAR_REQUEST = '/tabConfig/CLEAR_REQUEST';

const saveRequest = (values) => ({ type: SAVE_REQUEST, values });
const clearRequest = () => ({ type: CLEAR_REQUEST });

export const saveTabConfig = (tabValues, pathName) => dispatch => {
    return dispatch(saveRequest({ tabValues, pathName }));
};

export const clearTabConfig = () => dispatch => {
    return dispatch(clearRequest());
};

export default (state = {}, action) => {
    switch (action.type) {
        case SAVE_REQUEST:
            return {
                ...state,
                tabValues: action.values.tabValues,
                pathName: action.values.pathName
            };
        case CLEAR_REQUEST:
            return {
                ...state,
                tabValues: {},
                pathName: ""
            };
        default:
            return state;
    }
};