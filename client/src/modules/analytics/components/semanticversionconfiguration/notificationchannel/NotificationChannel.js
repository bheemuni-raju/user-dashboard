import React, { useRef, useState } from "react";
import { Button } from "reactstrap";
import { useSelector } from "react-redux";
import ToggleButton from "react-toggle-button";

import { get } from "lodash";

import ByjusDropdown from "../../../../../components/ByjusDropdown";
import {
  semantic,
  validatePermission,
} from "../../../../../lib/permissionList";
import { callApi } from "../../../../../store/middleware/api";
import { toggleButtonColor } from "../../../../../utils/styles";
import NotificationList from "./NotificationList";

const NotificationChannel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionType, setActionType] = useState("");
  const [data, setData] = useState({});
  const [toggleNotificationChannelModal, settoggleNotificationChannelModal] =
    useState(false);
  const user = useSelector((state) => get(state, "auth.user"));
  const byjusGridRef = useRef();

  const onClickCreate = () => {
    settoggleNotificationChannelModal(true);
    setActionType("CREATE");
  };

  const refreshGrid = () => {
    byjusGridRef.current.refreshGrid();
  };

  const buildToolbarItems = () => {
    const createFlag = validatePermission(
      user,
      semantic.createNotificationChannel
    );

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

  const updateNotificationChannelStatus = async (record, status) => {
    const body = {
      id: record.id,
      isActive: status,
    };
    const url = `/usermanagement/semantic/notificationchannel/delete`;
    const method = "PUT";

    callApi(url, method, body, null, null, true)
      .then(() => {
        setLoading(false);
        setError("");
        setActionType("DELETE");
        refreshGrid();
      })
      .catch((err) => {
        setLoading(false);
        setError(err);
      });
  };

  const onClickToggle = async (record, value) => {
    const userStatus = !value;
    await updateNotificationChannelStatus(record, userStatus);
  };

  const closeNotificationChannelModal = () => {
    settoggleNotificationChannelModal(false);
    setData({});
    refreshGrid();
  };

  const onClickEdit = (row) => {
    settoggleNotificationChannelModal(true);
    setData(row);
    setActionType("UPDATE");
  };

  const formatters = () => ({
    statusFormatter: (cell, row) => {
      const canDeleteNotificationChannel = validatePermission(user, [
        semantic.deleteNotificationChannel,
      ]);
      const toggleValue = cell === "true";

      return (
        <ToggleButton
          inactiveLabel=""
          activeLabel=""
          colors={{
            toggleButtonColor,
          }}
          hidden={!canDeleteNotificationChannel}
          value={toggleValue}
          onToggle={(value) => onClickToggle(row, value)}
        />
      );
    },
    actionFormatter: (cell, row) => {
      const canEditNotificationChannel =
        row.isActive === "true" &&
        validatePermission(user, [semantic.editNotificationChannel]);
      // setData(row);

      const actionItem = [
        {
          title: "Edit",
          icon: "fa fa-pencil",
          onClick: () => onClickEdit(row),
          isAllowed: canEditNotificationChannel,
        },
      ];

      if (canEditNotificationChannel) {
        return (
          <ByjusDropdown
            type="simple"
            defaultTitle=""
            titleIcon="fa fa-gear"
            items={actionItem}
          />
        );
      }
      return null;
    },
  });

  return (
    <div>
      <NotificationList
        loading={loading}
        error={error}
        byjusGridRef={byjusGridRef}
        buildToolbarItems={buildToolbarItems}
        formatters={formatters}
        toggleNotificationChannelModal={toggleNotificationChannelModal}
        closeNotificationChannelModal={closeNotificationChannelModal}
        refreshGrid={refreshGrid}
        data={data}
        actionType={actionType}
        user={user}
      />
    </div>
  );
};

export default NotificationChannel;
