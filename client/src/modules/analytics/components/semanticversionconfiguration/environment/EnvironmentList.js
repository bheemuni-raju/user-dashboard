import React, { useRef, useState } from "react";
import { Button } from "reactstrap";
import { useSelector } from "react-redux";
import { get } from "lodash";
import { Box, BoxBody } from "components/box";
import ByjusGrid from "modules/core/components/grid/ByjusGridV3";
import { callApi } from "store/middleware/api";
import { semantic, validatePermission } from "lib/permissionList";
import EnvironmentModal from "./EnvironmentModal";
import ToggleButton from "react-toggle-button";
import ByjusDropdown from "components/ByjusDropdown";
import { toggleButtonColor } from "../../../../../utils/styles";

const EnvironmentList = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [showEnvironmentModal, setShowEnvironmentModal] = useState(false);
  const user = useSelector((state) => get(state, "auth.user"));
  let byjusGridRef = useRef();

  const buildToolbarItems = () => {
    const createFlag = validatePermission(user, semantic.createEnvironmentType);

    return (
      <Button
        color="secondary"
        size="sm"
        hidden={!createFlag}
        onClick={onClickCreate}
      >
        <i className="fa fa-plus"></i> Create
      </Button>
    );
  };

  const updateEnvironmentStatus = async (record, status) => {
    let body = {
      id: record.id,
      isActive: status,
    };
    let url = `/usermanagement/semantic/environment/delete`;
    let method = "PUT";

    callApi(url, method, body, null, null, true)
      .then((response) => {
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
    let userStatus = value ? false : true;
    await updateEnvironmentStatus(record, userStatus);
  };

  const closeEnvironmentModal = () => {
    setShowEnvironmentModal(false);
    setData(null);
    refreshGrid();
  };

  const onClickCreate = () => {
    setShowEnvironmentModal(true);
  };

  const onClickEdit = (data) => {
    setShowEnvironmentModal(true);
    setData(data);
  };

  const refreshGrid = () => {
    byjusGridRef.current.refreshGrid();
  };

  const formatters = () => ({
    statusFormatter: (cell, row) => {
      const canDeleteEnvironment = validatePermission(user, [
        semantic.deleteEnvironmentType,
      ]);
      let toggleValue = cell === "true" ? true : false;

      return (
        <ToggleButton
          inactiveLabel={""}
          activeLabel={""}
          colors={{
            toggleButtonColor,
          }}
          hidden={!canDeleteEnvironment}
          value={toggleValue}
          onToggle={(value) => onClickToggle(row, value)}
        />
      );
    },
    actionFormatter: (cell, row) => {
      const canEditEnvironment =
        row.isActive === "true" &&
        validatePermission(user, [semantic.editEnvironmentType]);
      const actionItem = [
        {
          title: "Edit",
          icon: "fa fa-pencil",
          onClick: () => onClickEdit(row),
          isAllowed: canEditEnvironment,
        },
      ];
      if (canEditEnvironment) {
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
          gridId="ums_semantic_environment_grid"
          ref={byjusGridRef}
          toolbarItems={buildToolbarItems()}
          formatters={formatters()}
          modelName="Environment"
          gridDataUrl="/usermanagement/semantic/environment/list"
        />
        {showEnvironmentModal && (
          <EnvironmentModal
            closeModal={closeEnvironmentModal}
            refreshGrid={refreshGrid}
            data={data}
          />
        )}
      </BoxBody>
    </Box>
  );
};

export default EnvironmentList;
