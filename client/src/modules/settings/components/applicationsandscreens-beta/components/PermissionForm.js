import React, { Fragment, useState, useEffect } from 'react';
import { withRouter } from 'react-router';
import { Row, Col, Label, Button, Card } from 'reactstrap';
import { pull, capitalize, chunk } from 'lodash';
import { isEmpty, snakeCase } from 'lodash';

import ModalWindow from 'components/modalWindow';
import { Page, PageHeader, PageBody } from 'components/page';
import { Box, BoxBody } from 'components/box';
import { FieldGroup } from 'components/form';
import { callApi } from 'store/middleware/api';

import '../index.scss';

const PermissionForm = (props) => {
  const [entityIndex, setEntityIndex] = useState(1);
  const [entityIndexArray, setEntityIndexArray] = useState([1]);
  const [moduleFormValues, setModuleFormValues] = useState({});
  let [moduleFormChangeValues, setModuleFormChangeValues] = useState({});
  const [isValidValue, setIsValidValue] = useState(true);
  const [permissionModalHeading, setPermissionModalHeading] = useState('');
  const [permissionModalContent, setPermissionModalContent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apps, setApps] = useState([]);

  useEffect(() => {
    async function getAllApplications() {
      const url = `/usermanagement/v1/permission/listAllApplications`;
      const method = "GET";
      const appResponse = await callApi(url, method, null, null, null, true)
      setApps(appResponse);
    }

    getAllApplications();
  }, [])

  useEffect(() => {
    async function getModuleDetails() {
      const { permissionId } = props

      if (permissionId) {
        setLoading(true);
        callApi(`/usermanagement/v1/permission/${permissionId}`, 'GET', null, null, null, true)
          .then(response => {
            setModuleFormValues(response);
            setModuleFormChangeValues(response);
            setLoading(false);
            setError(null);
          })
          .catch(error => {
            setLoading(false);
            setError(error.message);
          })
      }
    }

    getModuleDetails();
  }, [])


  const handleEntityFormChanges = (event) => {
    const { appName: appFromProps } = props;
    let oldModuleFormChangeValues = { ...moduleFormChangeValues };
    const { name, value } = event.target
    oldModuleFormChangeValues[name] = value
    const { dataValues = [], entityWithPermission, moduleWithEntity, appWithModule } = oldModuleFormChangeValues;
    const appName = appWithModule ? appWithModule.dataValues.formattedName.toUpperCase() : appFromProps;
    const moduleName = moduleWithEntity ? moduleWithEntity.dataValues.permissionGroup.replace(/ /g, "_") : "";
    const entityName = entityWithPermission ? entityWithPermission.dataValues.entityName : "";
    const pKey = dataValues && dataValues.permissionKey ? dataValues.permissionKey : "";

    if (name === "group") {
      if (!isEmpty(oldModuleFormChangeValues.moduleWithEntity)) {
        oldModuleFormChangeValues.moduleWithEntity.dataValues.permissionGroup = value;
        let formattedPValue = appName + "_" + value + "_" + entityName + "_" + pKey;
        if (!isEmpty(oldModuleFormChangeValues.dataValues)) {
          oldModuleFormChangeValues.dataValues.permissionValue = formattedPValue ? formattedPValue.toUpperCase() : "";
        }
        else {
          oldModuleFormChangeValues["dataValues"] = {
            "permissionValue": formattedPValue.toUpperCase()
          }
        }
      }
      else {
        oldModuleFormChangeValues["moduleWithEntity"] = {
          "dataValues": {
            "permissionGroup": value
          }
        }
      }
    }
    else if (name === "entity") {
      if (!isEmpty(oldModuleFormChangeValues.entityWithPermission)) {
        oldModuleFormChangeValues.entityWithPermission.dataValues.entityName = value;
        let formattedPValue = appName + "_" + moduleName + "_" + value + "_" + pKey;
        if (!isEmpty(oldModuleFormChangeValues.dataValues)) {
          oldModuleFormChangeValues.dataValues.permissionValue = formattedPValue ? formattedPValue.toUpperCase() : "";
        }
        else {
          oldModuleFormChangeValues["dataValues"] = {
            "permissionValue": formattedPValue.toUpperCase()
          }
        }
      }
      else {
        oldModuleFormChangeValues["entityWithPermission"] = {
          "dataValues": {
            "entityName": value
          }
        }
      }
    }
    else if (name === "permission") {
      let formattedPermissionValue = value.replace(",", " ").replace(";", " ").replace(".", " ").split(" ")[0];
      let formattedPValue = appName + "_" + moduleName + "_" + entityName + "_" + formattedPermissionValue;
      if (!isEmpty(oldModuleFormChangeValues.dataValues)) {
        oldModuleFormChangeValues.dataValues.permissionKey = formattedPermissionValue;
        if (!isEmpty(oldModuleFormChangeValues.dataValues)) {
          oldModuleFormChangeValues.dataValues.permissionValue = formattedPValue ? formattedPValue.toUpperCase() : "";
        }
        else {
          oldModuleFormChangeValues["dataValues"] = {
            "permissionValue": formattedPValue.toUpperCase()
          }
        }
      }
      else {
        oldModuleFormChangeValues["dataValues"] = {
          "permissionKey": formattedPermissionValue,
          "permissionValue": formattedPValue.toUpperCase()
        }
      }
    }

    setModuleFormChangeValues(oldModuleFormChangeValues);
  }

  const onClickViewEntityPermission = (event) => {
    const { name } = event.target
    const { dataValues, entityWithPermission } = moduleFormChangeValues;

    const { permissionKey: pkey, permissionValue: pvalue } = dataValues;
    const permissionObject = {};
    permissionObject[pkey] = pvalue;

    const entityDetails = {
      entity: !isEmpty(entityWithPermission) ? entityWithPermission.dataValues.entityName : "",
      permissions: permissionObject
    }

    let { entity, permissions } = entityDetails

    setShowModal(true);
    setPermissionModalHeading(capitalize(entity));
    setPermissionModalContent(permissions);
  }

  const onClickSaveModule = () => {
    const { permissionId } = props
    const method = permissionId ? 'PUT' : 'POST'
    const url = method == "POST" ? `/usermanagement/v1/permission` : `/usermanagement/v1/permission/${permissionId}`
    let isValid = validateModuleForm()

    if (isValid) {
      const bodyPayload = generateBodyPayload()

      setLoading(true);
      callApi(url, method, bodyPayload, null, null, true)
        .then(response => {
          props.history.goBack()
        })
        .catch(error => {
          setLoading(false);
          setError(error.message);
        })
    }
    else {
      setIsValidValue(isValid);
    }
  }

  const validateModuleForm = () => {
    let isValidValue = true
    //To check whether required fields are having values or not
    if (!moduleFormChangeValues[`entityWithPermission`] || !moduleFormChangeValues[`dataValues`]) {
      isValidValue = false
    }

    return isValidValue
  }

  const generateBodyPayload = () => {
    const { appName } = props
    const { dataValues, entityWithPermission, moduleWithEntity } = moduleFormChangeValues;
    const pkey = dataValues.permissionKey;
    const pvalue = dataValues.permissionValue;
    const permissionObject = {};
    permissionObject[pkey] = pvalue;
    const entityArray = [{
      entityName: entityWithPermission.dataValues.entityName,
      permissionObject
    }]

    return {
      app: appName,
      group: moduleWithEntity.dataValues.permissionGroup,
      entities: entityArray
    }
  }

  const closePermissionModal = () => {
    setShowModal(false);
    setPermissionModalHeading('');
    setPermissionModalContent(null);
  }

  const buildPermissionModalBody = (permissionModalContent) => {
    const permissionKeys = permissionModalContent && Object.keys(permissionModalContent)
    const rows = permissionKeys && chunk(permissionKeys, 2)

    return rows && rows.length ?
      rows.map((row, index) => {
        return (<Row key={index}>
          {row.map((col, index) => {
            return (<Col md={6} key={index}>
              <strong>{capitalize(col)} : </strong>
              <span>{permissionModalContent[col]}</span>
            </Col>)
          })}
        </Row>)
      }) :
      <div>No Permissions Available</div>
  }

  const buildEntityForm = () => {
    const { isEdit } = props;
    const { dataValues = [], entityWithPermission } = moduleFormChangeValues;
    const { permissionKey, permissionValue } = dataValues;
    const entityName = !isEmpty(entityWithPermission) ? entityWithPermission.dataValues.entityName : "";

    return (
      <Card>
        <form>
          <div className="text-right">
            <Button
              color="info"
              size="sm"
              name={`viewPermissionButton`}
              onClick={onClickViewEntityPermission}
              disabled={entityName ? false : true}
            >
              <i className="fa fa-eye" onClick={(event) => {
                event.stopPropagation()
                event.target.parentElement.click()
              }} />
            </Button>
          </div>
          <FieldGroup
            name={`entity`}
            type="text"
            label="Screen"
            value={entityName || ""}
            valid={(!entityName && !isValidValue) ? "error" : null}
            onChange={handleEntityFormChanges}
            disabled={isEdit ? true : false}

            required={true}
          />
          <FieldGroup
            name={`permission`}
            type="text"
            label="Permissions"
            value={permissionKey || ""}
            placeholder="Permission"
            valid={(!permissionValue && !isValidValue) ? "error" : null}
            onChange={handleEntityFormChanges}
            required={true}
          />
        </form>
      </Card>)
  }

  const buildModuleForm = () => {
    const { isEdit } = props;
    const { moduleWithEntity } = moduleFormChangeValues;
    let group = !isEmpty(moduleWithEntity) ? moduleWithEntity.dataValues.permissionGroup : "";

    return (
      <Fragment>
        <Row>
          <Col md={1}><Label>Group : </Label></Col>
          <Col md={6}>
            <FieldGroup
              name="group"
              type="text"
              required={true}
              value={group || ""}
              valid={(!group && !isValidValue) ? "error" : null}
              onChange={handleEntityFormChanges}
              disabled={isEdit ? true : false}
            />
          </Col>
        </Row>
        <Row>
          <Col md={1}><Label>Screens : </Label></Col>
          <Col md={6}>
            {buildEntityForm()}
          </Col>
        </Row>
      </Fragment>
    )
  }

  return (
    <Page>
      <PageHeader heading="Module Details" />
      <PageBody error={error}>
        <Box>
          <BoxBody loading={loading} className="permission-module-form">

            {buildModuleForm()}
            <div className="text-right">
              <Button type="button" color="success" onClick={onClickSaveModule}>Save</Button>
              {'   '}
              <Button type="button" color="danger" onClick={() => props.history.goBack()}>Cancel</Button>
            </div>
            <ModalWindow
              closeButton={true}
              showModal={showModal}
              closeModal={closePermissionModal}
              heading={`${permissionModalHeading} Permissions`}
              loading={loading}
              error={error}
            >
              {permissionModalContent && buildPermissionModalBody(permissionModalContent)}
            </ModalWindow>
          </BoxBody>
        </Box>
      </PageBody>
    </Page>
  )
}

export default withRouter(PermissionForm)
