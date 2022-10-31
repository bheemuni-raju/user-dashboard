import React, { useState } from "react";

import PropTypes from "prop-types";

import ByjusGrid from "../../../../core/components/grid/ByjusGridV3";
import { Box, BoxBody } from "../../../../../components/box";
import NotificationChannelCreateEditModal from "./NotificationChannelCreateEditModal";

function NotificationList(props) {
  const {
    loading,
    error,
    byjusGridRef,
    buildToolbarItems,
    formatters,
    toggleNotificationChannelModal,
    closeNotificationChannelModal,
    refreshGrid,
    data,
    actionType,
    user,
  } = props;

  return (
    <Box>
      <BoxBody loading={loading} error={error}>
        <ByjusGrid
          isKey="_id"
          gridId="ums_notification_channel_grid"
          ref={byjusGridRef}
          toolbarItems={buildToolbarItems()}
          formatters={formatters()}
          modelName="NotificationChannel"
          gridDataUrl="/usermanagement/semantic/notificationchannel/list"
        />
        {toggleNotificationChannelModal && (
          <NotificationChannelCreateEditModal
            closeModal={closeNotificationChannelModal}
            refreshGrid={refreshGrid}
            data={data}
            actionType={actionType}
            user={user}
          />
        )}
      </BoxBody>
    </Box>
  );
}

NotificationList.propTypes = {
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string.isRequired,
  byjusGridRef: PropTypes.objectOf(Object).isRequired,
  buildToolbarItems: PropTypes.func.isRequired,
  formatters: PropTypes.func.isRequired,
  toggleNotificationChannelModal: PropTypes.bool.isRequired,
  closeNotificationChannelModal: PropTypes.func.isRequired,
  refreshGrid: PropTypes.func.isRequired,
  data: PropTypes.objectOf(Object).isRequired,
  actionType: PropTypes.string.isRequired,
  user: PropTypes.objectOf(Object).isRequired,
};

export default NotificationList;
