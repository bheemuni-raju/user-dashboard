import { createSelectors as createAppSelectors } from '../modules/core/reducers';
import { createSelectors as createAuthSelectors } from '../modules/user/authReducer';
//import {createSelectors as createOrderSelectors} from '../modules/order/reducers/order'
//import { createSelectors as createInventorySelectors } from '../modules/inventory/reducers/inventory';
//import { createSelectors as createUserSelectors } from '../modules/user/userReducer';

export default {
    app: createAppSelectors('app'),
    auth: createAuthSelectors('auth'),
    //user: createUserSelectors('user'),
    //order: createOrderSelectors('order'),
    //inventory: createInventorySelectors('inventory')
}
