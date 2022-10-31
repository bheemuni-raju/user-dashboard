import React, { useRef, useState } from "react";
import { Button } from "reactstrap";
import { useSelector } from "react-redux";
import { get } from "lodash";
import { Box, BoxBody } from "components/box";
import ByjusGrid from "modules/core/components/grid/ByjusGridV3";
import { callApi } from "store/middleware/api";
import { semantic, validatePermission } from "lib/permissionList";
import ApplicationTypeModal from "./ApplicationTypeModal";
import ToggleButton from "react-toggle-button";
import ByjusDropdown from "components/ByjusDropdown";
import { toggleButtonColor } from "../../../../../utils/styles";

const ApplicationTypeList = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [showApplicationTypeModal, setShowApplicationTypeModal] =
    useState(false);
  const user = useSelector((state) => get(state, "auth.user"));
  let byjusGridRef = useRef();

  const onClickCreate = () => {
    setShowApplicationTypeModal(true);
  };

  const buildToolbarItems = () => {
    const createFlag = validatePermission(user, semantic.createApplicationType);

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

  const updateApplicationTypeStatus = async (record, status) => {
    let body = {
      id: record.id,
      isActive: status,
    };
    let url = `/usermanagement/semantic/applicationtype/delete`;
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
    await updateApplicationTypeStatus(record, userStatus);
  };

  const closeApplicationTypeModal = () => {
    setShowApplicationTypeModal(false);
    setData(null);
    refreshGrid();
  };

  const onClickEdit = (data) => {
    setShowApplicationTypeModal(true);
    setData(data);
  };

  const refreshGrid = () => {
    byjusGridRef.current.refreshGrid();
  };

  const formatters = () => ({
    statusFormatter: (cell, row) => {
      const canDeleteAppType = validatePermission(user, [
        semantic.deleteApplicationType,
      ]);
      let toggleValue = cell === "true" ? true : false;

      return (
        <ToggleButton
          inactiveLabel={""}
          activeLabel={""}
          colors={{
            toggleButtonColor,
          }}
          hidden={!canDeleteAppType}
          value={toggleValue}
          onToggle={(value) => onClickToggle(row, value)}
        />
      );
    },
    actionFormatter: (cell, row) => {
      const canEditAppType =
        row.isActive === "true" &&
        validatePermission(user, [semantic.editApplicationType]);

      const actionItem = [
        {
          title: "Edit",
          icon: "fa fa-pencil",
          onClick: () => onClickEdit(row),
          isAllowed: canEditAppType,
        },
      ];

      if (canEditAppType) {
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
          gridId="ums_semantic_application_type_grid"
          ref={byjusGridRef}
          toolbarItems={buildToolbarItems()}
          formatters={formatters()}
          modelName="ApplicationType"
          gridDataUrl="/usermanagement/semantic/applicationtype/list"
        />
        {showApplicationTypeModal && (
          <ApplicationTypeModal
            closeModal={closeApplicationTypeModal}
            refreshGrid={refreshGrid}
            data={data}
          />
        )}
      </BoxBody>
    </Box>
  );
};

export default ApplicationTypeList;
