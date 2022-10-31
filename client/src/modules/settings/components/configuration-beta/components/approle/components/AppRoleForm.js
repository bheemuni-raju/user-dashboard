import React, { Fragment, useState, useEffect } from 'react';
import { withRouter } from 'react-router';
import {
    Col, Row, Button,
    Card, CardHeader, CardBody, Collapse, UncontrolledCollapse
} from 'reactstrap';
import { Link } from 'react-router-dom';
import {
    get, snakeCase, startsWith,
    pull, chunk, capitalize,
    isEqual, flattenDeep, isEmpty,
    uniq, concat, difference, isObject
} from "lodash";
import Notify from 'react-s-alert';
import { AppSwitch } from '@byjus-orders/uikit-react';

import { ErrorWrapper } from 'components/error';
import { Box, BoxHeader, BoxBody } from "components/box";
import { callApi } from 'store/middleware/api';
import { Checkbox, FieldGroup } from 'components/form';
import ByjusComboBox from 'modules/core/components/combobox/ByjusComboBox';
import '../appRole.scss';

const AppRoleForm = (props) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [systemPermissions, setSystemPermissions] = useState([]);
    const [modules, setModules] = useState([]);
    const [filteredModules, setFilteredModules] = useState([]);
    const [appRolePermissions, setAppRolePermissions] = useState([]);
    const [filteredAppRolePermissions, setFilteredAppRolePermissions] = useState([]);
    const [isValid, setValidFlag] = useState(true);
    const [name, setAppRoleName] = useState("");
    const [appName, setAppName] = useState("ums");
    const [group, setGroup] = useState(null);
    const [appGroups, setAppGroups] = useState([]);
    const [description, setDescription] = useState("");
    const { formattedName } = props.match.params;

    const saveAppRole = () => {
        const { isEdit, formattedName: appRole } = props
        const url = isEdit ? `/usermanagement/v1/config/approle/${appRole}` : `/usermanagement/v1/config/approle/`
        const method = isEdit ? "PUT" : "POST"

        if (!name && !formattedName) {
            setValidFlag(false);
        }
        else if (filteredAppRolePermissions.length) {
            setValidFlag(true);
            const bodyPayload = {
                name,
                description,
                permissions: filteredAppRolePermissions,
                appName: "ums",
                onToggle: false
            }
            setLoading(true);
            setError(null);

            return callApi(url, method, bodyPayload, null, null, true)
                .then(res => {
                    setAppRoleName(name);
                    setDescription(description);
                    setFilteredAppRolePermissions(res.permissions);
                    setLoading(false);
                    setError(null);

                    props.history.goBack()
                })
                .catch(error => {
                    setLoading(false);
                    Notify.error(error && error.message)
                })
        }
        else {
            Notify.error("Please assign atleast one permission to create an Application Role!")
        }
    }

    const handleFormChanges = async (name, value) => {
        if (name === "name") {
            setAppRoleName(value);
        }

        if (name === "description") {
            setDescription(value);
        }

        if (name === "group") {
            setGroup(value);
        }
    }

    const handlePermissionChange = (event, permissions) => {
        let updatedPermissions = filteredAppRolePermissions;
        const checkboxElm = event.target
        const { name, checked } = checkboxElm

        checked ? updatedPermissions.push(name) : pull(updatedPermissions, name)
        updatedPermissions = uniq(updatedPermissions);
        setFilteredAppRolePermissions(updatedPermissions);
    }

    const handleSelectAllPermission = (event) => {
        const { checked } = event.target
        let updatedPermissions = []

        const groupPermissions = event.target.getAttribute('permissions') || "";
        const allPermissions = groupPermissions.split(',')

        if (checked) {
            updatedPermissions = concat(filteredAppRolePermissions, allPermissions)
        }
        else {
            updatedPermissions = difference(filteredAppRolePermissions, allPermissions)
        }

        updatedPermissions = uniq(updatedPermissions);
        setFilteredAppRolePermissions(updatedPermissions);
    }

    const onChangeModulePermissionsSwitch = (e, modulePermissions) => {
        const checked = get(e, 'target.checked');
        let updatedPermissions = [];

        if (checked) {
            updatedPermissions = concat(filteredAppRolePermissions, modulePermissions);
        }
        else {
            updatedPermissions = difference(filteredAppRolePermissions, modulePermissions);
        }

        updatedPermissions = uniq(updatedPermissions);
        setFilteredAppRolePermissions(updatedPermissions);
    }

    const getAllPermissions = (name) => {
        const formattedName = `${appName.toUpperCase()}_${snakeCase(name).toUpperCase()}_`
        const requestedPermissions = systemPermissions.filter((permission) => {
            return startsWith(permission, formattedName);
        })

        return requestedPermissions
    }

    const getModulePermissions = () => {
        return (
            <Fragment>
                {filteredModules.map((module, index) => {
                    const { group, entities, _id } = module
                    const modulePermissions = getAllPermissions(group)
                    const isChecked = difference(modulePermissions, filteredAppRolePermissions).length == 0 ? true : false
                    return (
                        <Card key={index}>
                            <CardHeader>
                                {capitalize(group)}{' '}
                                <AppSwitch
                                    style={{ verticalAlign: "middle" }}
                                    label color={'info'}
                                    size={'sm'}
                                    dataOn="All"
                                    dataOff="NA"
                                    checked={isChecked}
                                    onChange={(e) => onChangeModulePermissionsSwitch(e, modulePermissions)} />
                                <div className="card-header-actions float-right">
                                    <button id={`toggler_${_id}`} className="card-header-action btn btn-minimize">
                                        <i className="fa fa-pencil-square-o"></i>
                                    </button>
                                </div>
                            </CardHeader>
                            <UncontrolledCollapse toggler={`toggler_${_id}`}>
                                <CardBody>
                                    {getAppRoleBody(module, entities)}
                                </CardBody>
                            </UncontrolledCollapse>
                        </Card>
                    )
                })
                }
            </Fragment>
        )
    }

    const getAppRoleBody = (module, entities) => {
        return (entities && entities.map((entity, entityindex) => {
            const permissionObj = entity.permissions
            const entityPermissionsKeys = permissionObj && Object.keys(permissionObj)
            const permissionRows = entityPermissionsKeys.length && chunk(entityPermissionsKeys, 10)
            const entityPermissions = permissionRows.length && Object.values(permissionObj)
            let isCheckedAll = difference(entityPermissions, filteredAppRolePermissions).length == 0 ? true : false
            return (
                <Fragment key={entityindex}>
                    <div>
                        <h5 className="module-title">{capitalize(entity.entity)}</h5>
                        <span>
                            <Checkbox
                                name={entity.entity}
                                permissions={entityPermissions.join(',')}
                                checked={isCheckedAll}
                                onChange={handleSelectAllPermission}>All</Checkbox>
                        </span>
                    </div>
                    <Card key={entityindex} style={{ border: "none", flexDirection: 'row', flexFlow: "wrap" }}>
                        {permissionRows.map((permissionCol, index) => {
                            return permissionCol.map((permission, index) => {
                                const name = entity["permissions"][permission]
                                let isChecked = false
                                if (filteredAppRolePermissions.length) {
                                    isChecked = filteredAppRolePermissions.indexOf(name) >= 0 ? true : false
                                }

                                return (
                                    <Checkbox key={index}
                                        name={name}
                                        label={capitalize(permission)}
                                        checked={isChecked}
                                        module={module.group}
                                        entity={entity.entity}
                                        permissionname={permission}
                                        onChange={(event) => handlePermissionChange(event, entityPermissions)}
                                    >{capitalize(permission)}</Checkbox>
                                )
                            })
                        })}
                    </Card>
                    <hr />
                </Fragment>
            )
        })
        )
    }

    useEffect(() => {

        async function getApplicationPermissionModules() {
            setLoading(true);
            const modulesResponse = await callApi(`/usermanagement/permission/permissionTemplate/modules/?app=ums`, 'GET', null, null, null, true)

            if (modulesResponse) {
                /**To get all permissions available in the system */
                let systemPermissions = modulesResponse.map((module, index) => {
                    return module.entities.map((entity, index) => {
                        return entity && Object.values(entity.permissions)
                    })
                })
                systemPermissions = flattenDeep(systemPermissions)

                let updatedPermissions = [];
                /**To filter out the invalid permissions */
                updatedPermissions = appRolePermissions.filter((permission) => {
                    return systemPermissions.indexOf(permission) >= 0
                })

                setModules(modulesResponse);
                setSystemPermissions(systemPermissions);
                setFilteredAppRolePermissions(updatedPermissions);
                setLoading(false);
            }
        }

        /**When application group exists and group is selected, then get Modules */
        if (appGroups.length) {
            getApplicationPermissionModules(appName)
        }
    }, [appGroups])

    useEffect(() => {
        let currentGrp = group && group.value
        if (currentGrp != "all") {
            let updatedModules = modules.filter((module) => {
                return module.group === currentGrp
            })
            setFilteredModules(updatedModules);
        }
        else {
            setFilteredModules(modules);
        }
    }, [group, modules])

    useEffect(() => {
        async function getPermissionGroups() {
            const { isEdit, formattedName } = props
            if (formattedName) {
                setLoading(true);
                const url = `/usermanagement/v1/config/approle/${formattedName}`;
                const appRoleResponse = await callApi(url, 'GET', null, null, null, true)

                const { name,appName, permissions, description } = appRoleResponse
                if (isEdit) {
                    setDescription(description);
                    setAppRoleName(name);
                }
    
                setAppRolePermissions(permissions);
                setAppName(appName);
                setLoading(false);
            }

            const bodyPayload = {
                model: "PermissionModule",
                filter: { app: appName || 'ums' }
            }
            let groups = []
            const allOption = [{ label: "All", value: "all" }]

            setLoading(true);
            await callApi('/combo', 'POST', bodyPayload, null, null, true)
                .then(response => {
                    groups = response.map((res) => {
                        return {
                            label: capitalize(res.group),
                            value: res.group
                        }
                    })

                    groups = groups.length ? concat(allOption, groups) : groups
                    setLoading(false);
                    setError(null);
                    setAppGroups(groups);
                    setGroup({ label: "All", value: "all" });
                })
                .catch(error => {
                    setError(error);
                })
        }
        getPermissionGroups();
    }, []);

    const buildForm = (modules) => {
        const { isEdit, formattedName } = props;
        
        return (<Box >
            <BoxHeader heading="Create/Edit Application Role" />
            <BoxBody loading={loading}>
                <Row>
                    <Col md={4}>
                        <FieldGroup
                            type="text"
                            label="Application Role"
                            name="name"
                            value={name || ""}
                            valid={!isValid ? "error" : null}
                            placeholder="Enter Application Role"
                            disabled={isEdit}
                            onChange={(e) => handleFormChanges(e.target.name, e.target.value)}
                            required={true}
                        />
                    </Col>
                    <Col md={4}>
                        <FieldGroup
                            type="textarea"
                            label="Description"
                            name="description"
                            value={description || ""}
                            placeholder="Enter Description"
                            onChange={(e) => handleFormChanges(e.target.name, e.target.value)}
                            required={true}
                        />
                    </Col>
                    <Col md={4}>
                        <ByjusComboBox
                            label="Permission Group"
                            name="group"
                            value={appName ? (group || "") : ""}
                            placeholder="Select Screen Group"
                            options={appGroups || []}
                            onChange={handleFormChanges}
                            required={true}
                        />
                    </Col>
                </Row>
                {appGroups && (appGroups.length > 0) &&
                    <>
                        <hr />
                        <h4>Permissions</h4>
                        <Row className="row-with-top-margin">
                            <Col md={9}>{getModulePermissions()}</Col>
                        </Row>
                    </>
                }
                <div className="text-right">
                    <Button color="success" onClick={saveAppRole}>Save Changes</Button>
                    {' '}
                    <Link to="/settings/app-roles" className="btn btn-danger">Cancel</Link>
                </div>
            </BoxBody>
        </Box>)
    }

    console.log(name);
    if (modules) {
        return (
            <Fragment>
                <ErrorWrapper error={error} errorTop={true}>
                    {buildForm(modules)}
                </ErrorWrapper>
            </Fragment>
        )
    }
    else {
        return (
            <div />
        )
    }
}

export default withRouter(AppRoleForm)
