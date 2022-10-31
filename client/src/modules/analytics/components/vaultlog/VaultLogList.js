import React, { useState, useRef } from 'react';
import { isEmpty, get } from 'lodash';
import moment from 'moment';
import { Link } from 'react-router-dom';

import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import { Box, BoxBody } from 'components/box';

import './vaultLog.scss'

const VaultLogList = (props) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [vaultLogData, setvaultLogData] = useState("");
    let byjusGridRef = useRef();
    const refreshGrid = () => {
        byjusGridRef.current.refreshGrid();
    }

    const formatters = () => ({
        emailFormatter: (cell, row) => {
            setvaultLogData(row)
            return (
                <div>
                    <Link
                        to={{ pathname: `/analytics/vault-log/email`, state: { vaultLogData: row, "getvaultLogDetailsByEmail": true } }}
                    >{cell}</Link>
                    <div style={{ width: "100%" }}>
                    </div>
                </div>
            )
        },

        vaultUidFormatter: (cell, row) => {
            setvaultLogData(row)
            return (
                <div>
                    <Link
                        to={{ pathname: `/analytics/vault-log/vaultuid`, state: { vaultLogData: row, "getvaultLogDetailsByEmail": false } }}
                    >{cell}</Link>
                    <div style={{ width: "100%" }}>
                    </div>
                </div>
            )
        },

        createdAtFormatter: (cell, row) => {
            let createdAt = row.createdAt;
            if (!isEmpty(createdAt)) {
                return createdAt && moment(createdAt).format("MMM D YYYY, h:mm a");
            }
        },

        accessedDateFormatter: (cell, row) => {
            let accessedDate = row.accessedDate;
            if (!isEmpty(accessedDate)) {
                return accessedDate && moment(accessedDate).format("MMM D YYYY, h:mm a");
            }
        }
    })


    return (
        <div style={{ maxWidth: "790px" }}>
            <Box>
                <BoxBody loading={loading} error={error}>
                    <ByjusGrid
                        isKey="_id"
                        gridId="ums_vaultlogdetails_grid"
                        ref={byjusGridRef}
                        formatters={formatters()}
                        contextCriterias={[
                            {
                                selectedColumn: "vaultId",
                                selectedOperator: "equal",
                                selectedValue: Number(props.vaultId)
                            }]}
                        gridDataUrl="/usermanagement/vault/vaultmanagement/logListByVaultUid"
                    />
                </BoxBody>
            </Box>
        </div>
    )
}

export default VaultLogList;
