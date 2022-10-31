import React from "react";
import { Page, PageBody } from "components/page";
import { Box, BoxBody } from "components/box";

const SemanticConfigListView = (props) => {
  const { templateData } = props;

  const SemanticConfigBox = (props) => {
    const { name, value } = props;

    return (
      <Box type="warning" style={{ maxHeight: "100px", overflow: "auto" }}>
        <BoxBody>
          <b>{name} </b>: &emsp; {value}
        </BoxBody>
      </Box>
    );
  };

  return (
    <Page>
      <PageBody>
        <SemanticConfigBox name="Domain" value={templateData.dns} />
        <SemanticConfigBox
          name="Application Name"
          value={templateData["applicationName.name"]}
        />
        <SemanticConfigBox
          name="Application Type"
          value={templateData["applicationtype.formattedName"]}
        />
        <SemanticConfigBox
          name="Environment"
          value={templateData["environment.formattedName"]}
        />
        <SemanticConfigBox
          name="Repository Path"
          value={templateData.repository_path}
        />
        <SemanticConfigBox
          name="Environment Path"
          value={templateData.env_path}
        />
      </PageBody>
    </Page>
  );
};

export default SemanticConfigListView;
