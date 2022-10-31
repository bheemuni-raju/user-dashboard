import React, { useRef, useState } from "react";
import { Button } from "reactstrap";
import { useSelector } from "react-redux";
import ToggleButton from "react-toggle-button";
import { toggleButtonColor } from "../../../../../utils/styles";
import { get } from "lodash";
import { Box, BoxBody } from "components/box";
import ByjusGrid from "modules/core/components/grid/ByjusGridV3";
import { callApi } from "store/middleware/api";
import { semantic, validatePermission } from "lib/permissionList";
import ByjusDropdown from "components/ByjusDropdown";
import ModalWindow from "components/modalWindow";
import SemanticModal from "./SemanticModal";
import SemanticConfigListView from "./SemanticConfigListView";

const SemanticConfigList = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [showSemanticModal, setShowSemanticModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [templateData, setTemplateData] = useState(null);
  const user = useSelector((state) => get(state, "auth.user"));
  const byjusGridRef = useRef();

  const onClickCreate = () => {
    setShowSemanticModal(true);
  };

  const buildToolbarItems = () => {
    const createFlag = validatePermission(user, semantic.createSemanticConfig);

    return (
      <Button
        color="secondary"
        size="sm"
        hidden={!createFlag}
        onClick={onClickCreate}
      >
        <i className="fa fa-plus" /> Create
      </Button>
    );
  };

  const closeModal = () => {
    setShowViewModal(false);
  };

  const onClickView = (cell, row) => {
    setShowViewModal(true);
    setTemplateData(row);
  };

  const updateSemanticConfigStatus = async (record, status) => {
    const body = {
      id: record.id,
      isActive: status,
    };
    const url = `/usermanagement/semantic/delete`;
    const method = "PUT";

    callApi(url, method, body, null, null, true)
      .then(() => {
        setLoading(false);
        setError(null);
        byjusGridRef && refreshGrid();
      })
      .catch((error) => {
        setLoading(false);
        setError(error);
      });
  };

  const onClickToggle = async (record, value) => {
    const userStatus = !value;
    await updateSemanticConfigStatus(record, userStatus);
  };

  const closeSemanticModal = () => {
    setShowSemanticModal(false);
    setData(null);
    refreshGrid();
  };

  const onClickEdit = (data) => {
    setShowSemanticModal(true);
    setData(data);
  };

  const refreshGrid = () => {
    byjusGridRef.current.refreshGrid();
  };

  const formatters = () => ({
    appTypeAndEnvironmentFormatter: (cell, row) => {
      const entities = cell.map((record) => {
        return record && record.formattedName;
      });
      return entities && entities.join(", ");
    },
    statusFormatter: (cell, row) => {
      const canSemanticConfig = validatePermission(user, [
        semantic.deleteSemanticConfig,
      ]);
      const toggleValue = cell === "true";

      return (
        <ToggleButton
          inactiveLabel=""
          activeLabel=""
          colors={{
            toggleButtonColor,
          }}
          hidden={!canSemanticConfig}
          value={toggleValue}
          onToggle={(value) => onClickToggle(row, value)}
        />
      );
    },
    actionFormatter: (cell, row) => {
      const canEditSemanticConfig =
        row.isActive === "true" &&
        validatePermission(user, [semantic.editSemanticConfig]);

      const actionItem = [
        {
          title: "Edit",
          icon: "fa fa-pencil",
          onClick: () => onClickEdit(row),
          isAllowed: canEditSemanticConfig,
        },
        {
          title: "View",
          icon: "fa fa-eye",
          onClick: () => onClickView(cell, row),
        },
      ];

      if (canEditSemanticConfig) {
        return (
          <ByjusDropdown
            type="simple"
            defaultTitle=""
            titleIcon="fa fa-gear"
            items={actionItem}
          />
        );
      }
    },
  });

  return (
    <Box>
      <BoxBody loading={loading} error={error}>
        <ByjusGrid
          isKey="_id"
          gridId="ums_semantic_grid"
          ref={byjusGridRef}
          toolbarItems={buildToolbarItems()}
          formatters={formatters()}
          modelName="SemanticConfiguration"
          gridDataUrl="/usermanagement/semantic/list"
        />
        {showSemanticModal && (
          <SemanticModal
            closeModal={closeSemanticModal}
            refreshGrid={refreshGrid}
            data={data}
          />
        )}
        <ModalWindow
          showModal={showViewModal}
          closeModal={closeModal}
          closeButton
          heading="Semantic Configuration"
        >
          {templateData && (
            <SemanticConfigListView templateData={templateData} />
          )}
        </ModalWindow>
      </BoxBody>
    </Box>
  );
};

export default SemanticConfigList;
