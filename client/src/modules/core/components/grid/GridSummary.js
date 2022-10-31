import React, { useState, useEffect, forwardRef } from 'react';
import { Row, Col, Card, CardBody } from "reactstrap";
import { Spin } from 'antd';
import { startCase } from "lodash";
import styled from 'styled-components';

import { callApi } from "store/middleware/api";
import { indexColorCoding } from 'utils/componentUtil';

const Figure = styled(CardBody)`
      font-size: 1.5em;
      text-align: center;
      font-weight: 20px;
    `;

const GridSummary = (props, ref) => {
    const [summaryData, setSummaryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { summaryApiConfig } = props;

    useEffect(() => {
        loadSummaryData()
    }, []);

    useEffect(() => {
        loadSummaryData()
    }, [props.summaryApiConfig]);

    React.useImperativeHandle(ref, () => ({
        reloadSummaryData() {
            return loadSummaryData();
        }
    }))

    const loadSummaryData = () => {
        if (summaryApiConfig) {
            let { url, method, body = {}, isExternalUrl = false } = summaryApiConfig;

            /**If isExternalUrl is true make last parameter of callApi as false(means non- nucleus api) */
            method = method.toUpperCase();
            setLoading(true);
            return callApi(url, method || "GET", body, null, null, !isExternalUrl)
                .then(res => {
                    setLoading(false);
                    setSummaryData(res && res.docs);
                })
                .catch(error => {
                    setLoading(false);
                    setError(error);
                });
        }
    }

    return (
        <Spin spinning={loading} tip="Loading Summary" >
            {summaryData ?
                <Row style={{ marginTop: '0.5%' }}>
                    {summaryData.length > 0 && summaryData.map((item, idx) => {
                        const style = indexColorCoding(idx);

                        return (
                            <Col md={12 / summaryData.length} key={item._id}>
                                <Card>
                                    <Figure style={style}>
                                        {item.total}
                                        <div>{startCase(item._id)}{' '}</div>
                                    </Figure>
                                </Card>
                            </Col>
                        );
                    })}
                </Row> :
                <div />}
        </Spin>
    )
}

export default forwardRef(GridSummary);