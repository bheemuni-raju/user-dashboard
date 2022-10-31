/**Genric formatters that can be used in ByjusGrid */

import moment from "moment";
import { startCase, lowerCase } from "lodash";

const dateFormatter = (cell) => {
    return cell ? moment(cell).format('LLL') : 'NA';
}

const startCaseFormatter = (cell = "") => {
    return startCase(lowerCase(cell));
}

export default {
    dateFormatter,
    startCaseFormatter
}