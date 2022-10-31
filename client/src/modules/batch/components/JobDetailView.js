import React, { useState, useEffect } from 'react';
import { get } from 'lodash';
import moment from 'moment';
import Table from 'rc-table';

import { Box, BoxHeader, BoxBody } from "components/box";
import 'rc-table/assets/index.css';

const JobDetailView = (props) =>  {
  const [ loading, setLoading ]  = useState(false);
  const [ error, setError ]  = useState(null);
  const [ logs, setLogs ]  = useState([]);
  const [ nextForwardToken, setNextForwardToken ] = useState("");
  const [ nextBackwardToken, setNextBackwardToken] = useState("");
  const [ expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [ expandIconAsCell, setExpandIconAsCell] = useState(true);
  const [ expandRowByClick, setExpandRowByClick] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [])

  const loadLogs = async (nextToken) => {
    const { jobId } = props.match.params;
    setLoading(false);
    try {
      const response = await fetch(`${window.NAPI_URL}/batchmanagement/job/getLogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jobId,
          nextToken
        })
      })

      const apiResponse = await response.json();
      const newLogs = get(apiResponse, 'logs.data.events');
      const oldLogs = logs.slice();
      setLoading(false);
      setLogs([
          ...oldLogs,
          ...newLogs
      ]);
      setNextBackwardToken(get(apiResponse, 'logs.data.nextBackwardToken'));
      setNextForwardToken(get(apiResponse, 'logs.data.nextForwardToken'));
    }
    catch (e) {
      setLoading(false);
      setError('Error in getting logs, please contact tech support');
    }
  }

  const onClickLoadMoreLogs = () => {
    loadLogs(nextForwardToken);
  }

  const onExpand = (expanded, record) => {
    console.log('onExpand', expanded, record);
  }

  const onExpandedRowsChange = rows => {
    setExpandedRowKeys(rows);
  }

  const onExpandIconAsCellChange = e => {
    setExpandIconAsCell(e.target.checked);
  }

  const onExpandRowByClickChange = e => {
    setExpandRowByClick(e.target.checked);
  }

  const isJsonString = (str) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  const { jobId } = props.match.params;
  const columns = [{ 
    title: 'Timestamp', 
    dataIndex: 'timestamp', 
    key: 'timestamp', 
    width: 200, 
    render: time => moment(time).format() 
  },{ 
    title: 'Message', 
    dataIndex: 'message', 
    key: 'message' 
  }];

    return (
      <Box type="default">
        <BoxHeader heading={`Job Detail: ${jobId}`} closeBtn={true} />
        <BoxBody error={error} loading={loading}>
          <p>No older events found at the moment.
                <button className="btn btn-default" onClick={onClickLoadMoreLogs}>Load Logs</button>
          </p>
          <Table
            columns={columns}
            expandIconAsCell={expandIconAsCell}
            expandRowByClick={expandRowByClick}
            expandedRowRender={(record, index, indent, expanded) =>
              expanded ? <pre>{isJsonString(record.message) ? JSON.stringify(JSON.parse(record.message), null, 3) : record.message}</pre> : null
            }
            expandedRowKeys={expandedRowKeys}
            onExpandedRowsChange={onExpandedRowsChange}
            onExpand={onExpand}
            data={logs}
            rowKey={record => record.id}
            useFixedHeader
            style={{ width: 1300, height: 550 }}
            scroll={{ x: 1500, y: 550 }}
          />
        </BoxBody>
      </Box>
    )
}

export default JobDetailView;
