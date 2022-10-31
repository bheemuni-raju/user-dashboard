import React, { useRef } from 'react';
import moment from 'moment';
import { Badge } from 'reactstrap';
import { startCase, upperCase } from 'lodash';

import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import { Box, BoxBody } from 'components/box';

const SmsTransactionList = (props) => {
    const byjusGridRef = useRef();

    const formatters = {
        dateFormatter: (cell) => {
            return cell && moment(cell).format("YYYY-MM-DD HH:mm:ss");
        },
        smsProviderFormatter: (cell) => {
            let providerArray = cell;
            let formattedProviderArray = providerArray.map(value => {
                return startCase(value);
            });

            formattedProviderArray = formattedProviderArray.filter(x => x != null);
            return formattedProviderArray;
        },
        statusFormatter: (cell) => {

            const statusColourMap = {
                'success': 'success',
                'failure': 'danger'
            }

            return <Badge color={statusColourMap[cell]}>{upperCase(cell)}</Badge>
        },
        contentFormatter: (cell) => <span className="text-wrap">{cell}</span>

    };

    return (
        <Box>
            <BoxBody>
                <ByjusGrid
                    isKey="_id"
                    gridId="ums_sms_transactions_grid"
                    modelName="SmsTransactions"
                    formatters={formatters}
                    gridDataUrl={"/usermanagement/smstransactions/list"}
                    ref={byjusGridRef}
                />
            </BoxBody>
        </Box>
    );
};

export default SmsTransactionList;