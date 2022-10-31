import React, { useState } from "react";
import { Alert, Button } from "reactstrap";
import { upperCase } from "lodash";
import flatten from "flat";
import { Parser } from "json2csv";

import { BoxBody } from "components/box";
import ByjusGrid from "modules/core/components/grid/ByjusGrid";

const TalkTimeCohortSummary = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [csvContent, setDownloadData] = useState("");

  const getColumns = () => {
    const columns = [
      {
        dataField: "_id",
        text: "Date",
      },
      {
        dataField: "cohort_0",
        text: "TT 0 Min",
      },
      {
        dataField: "cohort_1_90",
        text: "TT 1-90 Min",
      },
      {
        dataField: "cohort_90_120",
        text: "TT 91-120 Min",
      },
      {
        dataField: "cohort_above_120",
        text: "TT >120 Min",
      },
      {
        dataField: "cohort_0_tm_dispute_raised",
        text: "TM 0 TTDR",
      },
      {
        dataField: "cohort_1_90_tm_dispute_raised",
        text: "TM 1-90 TTDR",
      },
      {
        dataField: "cohort_90_120_tm_dispute_raised",
        text: "TM 91-120 TTDR",
      },
      {
        dataField: "cohort_above_120_tm_dispute_raised",
        text: "TM >120 TTDR",
      },
      {
        dataField: "cohort_90_120_bda_dispute_raised",
        text: "SP 91-120 TTDR",
      },
      {
        dataField: "cohort_above_120_bda_dispute_raised",
        text: "SP >120 TTDR",
      },
    ];

    return columns;
  };

  const getHeaders = (records) => {
    const headerMap = {};
    records.forEach((ele) => {
      Object.keys(ele).forEach((key) => (headerMap[key] = 1));
    });

    const headers = Object.keys(headerMap);
    return headers;
  };

  const formatExportData = (records, originalKeys) => {
    let changeKey = ["_id"];
    let mapKey = ["date"];

    records.forEach((row, index) => {
      let record = {};
      for (let i = 0; i < originalKeys.length; i++) {
        let idx = changeKey.indexOf(originalKeys[i]);
        if (idx !== -1) {
          record[upperCase(mapKey[idx])] = row[originalKeys[i]];
        } else {
          record[upperCase(originalKeys[i])] = row[originalKeys[i]];
        }
      }
      records[index] = record;
    });

    return records;
  };

  const downloadReport = (state, res) => {
    if (!res) return;
    const records = res.docs.map((ele) =>
      flatten(JSON.parse(JSON.stringify(ele)))
    );
    let originalKeys = getHeaders(records);

    let formattedRecords = formatExportData(records, originalKeys);
    let headers = getHeaders(formattedRecords);
    const json2csvParser = new Parser({ fields: headers });
    const csvContent = json2csvParser.parse(formattedRecords);
    setDownloadData(csvContent);
  };

  const onClickDownloadHandler = () => {
    let uri = URL.createObjectURL(
      new Blob([csvContent], { type: "data:text/csv;charset=utf-8," })
    );
    let downloadLink = document.createElement("a");
    downloadLink.href = uri;
    downloadLink.download = `report.csv`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const buildToolbarItems = () => {
    return (
      <Button color="success" size="sm" onClick={onClickDownloadHandler}>
        <i className="fa fa-download" /> Download Report
      </Button>
    );
  };

  const columns = getColumns();

  return (
    <BoxBody loading={loading} error={error}>
      <Alert color="info">
        <b>TT 0 Min</b> - Talktime 0 minutes, 
        <b>TT 1-90 Min</b> - Talktime between 1-90 minutes, 
        <b>TT 91-120 Min</b> - Talktime between 91-120 minutes, 
        <b>TT >120 Min</b> - Talktime above 120 minutes, TM 0 TTDR - 0 Talktime TM Dispute Raised, 
        <b>TM 1-90 TTDR</b> - Between 1-90 min Talktime TM Dispute Raised, 
        <b>TM 91-120 TTDR</b> - Between 91-120 min Talktime TM Dispute Raised, 
        <b>TM >120 TTDR</b> - Above 120 min Talktime TM Dispute Raised,
        <b>SP 91-120 TTDR</b> - Between 91-120 min Talktime SP Dispute Raised, 
        <b>SP >120 TTDR</b> - Above 120 min Talktime SP Dispute Raised
      </Alert>
      <ByjusGrid
        gridDataUrl={`/usermanagement/wfhtalktime/getTalktimeCohortSummary`}
        columns={columns}
        onLoadDataCompletion={downloadReport}
        toolbarItems={buildToolbarItems()}
      />
    </BoxBody>
  );
};

export default TalkTimeCohortSummary;
