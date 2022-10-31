import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router';
import {
    Col, Row, Button,
    Card, CardHeader, CardBody, Collapse
} from 'reactstrap';
import { Link } from 'react-router-dom';
import {
    get,
    pull, chunk, capitalize,
    isEqual, flattenDeep,
    uniq, concat, difference, isObject
} from "lodash";
import Notify from 'react-s-alert';
import { AppSwitch } from '@byjus-orders/uikit-react';

import { ErrorWrapper } from 'components/error';
import { Box, BoxHeader, BoxBody } from "components/box";
import { callApi } from 'store/middleware/api';
import { Checkbox, FieldGroup } from 'components/form';
import ByjusComboBox from 'modules/core/components/combobox/ByjusComboBox';
import { applicationArray } from './utils/permissionConstant';
import '../PermissionTemplateRouter.scss';

class PermissionTemplateForm extends Component {
    constructor() {
        super()
        this.state = {
            loading: false,
            error: null,
            systemPermissions: [],
            modules: [],
            filteredModules: [],
            templatePermissions: [],
            filteredTemplatePermissions: [],
            isValid: true,
            name: "",
            description: "",
            appName: "",
            group: null,
            appGroups: []
        }
    }

    savePermissionTemplate = () => {
        const { templateId } = this.props
        const url = templateId ? `/usermanagement/permission/permissionTemplate/${templateId}` : `/usermanagement/permission/permissionTemplate`
        const method = templateId ? "PUT" : "POST"
        const { name, description, filteredTemplatePermissions, appName, isValid } = this.state

        if (!name) {
            this.setState({ isValid: false })
        }
        else if (filteredTemplatePermissions.length) {
            this.setState({ isValid: true })
            const bodyPayload = {
                name,
                description,
                permissions: filteredTemplatePermissions,
                app: (appName && isObject(appName)) ? appName.value : appName
            }
            this.setState({ loading: true, error: null })
            return callApi(url, method, bodyPayload, null, null, true)
                .then(res => {
                    this.setState({
                        name: res.name,
                        description: res.description,
                        filteredTemplatePermissions: res.permissions,
                        loading: false,
                        error: null
                    })
                    this.props.history.goBack()
                })
                .catch(error => {
                    this.setState({ loading: false })
                    Notify.error(error && error.message)
                })
        }
        else {
            Notify.error("Please assign atleast one permission to create a template!")
        }
    }

    onClickExpandCollapseBtn = (group) => {
        const collapseKey = `${group}Collapse`;

        this.setState({ [collapseKey]: !this.state[collapseKey] });
    }

    handleFormChanges = async (name, value) => {
        this.setState({ [name]: value })
    }

    handlePermissionChange = (event, permissions) => {
        const checkboxElm = event.target
        const { name, checked } = checkboxElm
        let { filteredTemplatePermissions } = this.state

        checked ? filteredTemplatePermissions.push(name) : pull(filteredTemplatePermissions, name)
        filteredTemplatePermissions = uniq(filteredTemplatePermissions);
        this.setState({ filteredTemplatePermissions })
    }

    handleSelectAllPermission = (event) => {
        const { checked } = event.target
        const { filteredTemplatePermissions } = this.state
        let updatedPermissions = []

        const groupPermissions = event.target.getAttribute('permissions') || "";
        const allPermissions = groupPermissions.split(',')

        if (checked) {
            updatedPermissions = concat(filteredTemplatePermissions, allPermissions)
        }
        else {
            updatedPermissions = difference(filteredTemplatePermissions, allPermissions)
        }

        updatedPermissions = uniq(updatedPermissions);
        this.setState({ filteredTemplatePermissions: updatedPermissions })
    }

    onChangeModulePermissionsSwitch = (e, modulePermissions) => {
        let { filteredTemplatePermissions } = this.state;
        const checked = get(e, 'target.checked');

        if (checked) {
            filteredTemplatePermissions = concat(filteredTemplatePermissions, modulePermissions);
        }
        else {
            filteredTemplatePermissions = difference(filteredTemplatePermissions, modulePermissions);
        }

        filteredTemplatePermissions = uniq(filteredTemplatePermissions);
        this.setState({ filteredTemplatePermissions });
    }

    getAllPermissions = (name) => {
        const { systemPermissions } = this.state

        const formattedName = `${name.toUpperCase()}_`
        const requestedPermissions = systemPermissions.filter((permission) => {
            return permission.indexOf(formattedName) >= 0
        })

        return requestedPermissions
    }

    getModulePermissions = () => {
        const { filteredModules, filteredTemplatePermissions } = this.state;

        return (
            <Fragment>
                {filteredModules.map((module, index) => {
                    const { group, entities } = module
                    const modulePermissions = this.getAllPermissions(group)
                    const isChecked = difference(modulePermissions, filteredTemplatePermissions).length == 0 ? true : false
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
                                    onChange={(e) => this.onChangeModulePermissionsSwitch(e, modulePermissions)} />
                                <div className="card-header-actions float-right">
                                    <button className="card-header-action btn btn-minimize" onClick={() => this.onClickExpandCollapseBtn(group)}>
                                        <i className={this.state[`${group}Collapse`] ? "fa fa-chevron-up" : "fa fa-chevron-down"}></i>
                                    </button>
                                </div>
                            </CardHeader>
                            <Collapse isOpen={this.state[`${group}Collapse`]} id="collapseExample">
                                <CardBody>
                                    {this.getPermissionTemplateBody(module, entities)}
                                </CardBody>
                            </Collapse>
                        </Card>
                    )
                })
                }
            </Fragment>
        )
    }

    getPermissionTemplateBody = (module, entities) => {
        const { filteredTemplatePermissions } = this.state
        return (entities && entities.map((entity, entityindex) => {
            const permissionObj = entity.permissions
            const entityPermissionsKeys = permissionObj && Object.keys(permissionObj)
            const permissionRows = entityPermissionsKeys.length && chunk(entityPermissionsKeys, 10)
            const entityPermissions = permissionRows.length && Object.values(permissionObj)
            let isCheckedAll = difference(entityPermissions, filteredTemplatePermissions).length == 0 ? true : false
            return (
                <Fragment key={entityindex}>
                    <div>
                        <h5 className="module-title">{capitalize(entity.entity)}</h5>
                        <span>
                            <Checkbox
                                name={entity.entity}
                                permissions={entityPermissions.join(',')}
                                checked={isCheckedAll}
                                onChange={this.handleSelectAllPermission}>All</Checkbox>
                        </span>
                    </div>
                    <Card key={entityindex} style={{ border: "none", flexDirection: 'row', flexFlow: "wrap" }}>
                        {permissionRows.map((permissionCol, index) => {
                            return permissionCol.map((permission, index) => {
                                const name = entity["permissions"][permission]
                                let isChecked = false
                                if (filteredTemplatePermissions.length) {
                                    isChecked = filteredTemplatePermissions.indexOf(name) >= 0 ? true : false
                                }

                                return (
                                    <Checkbox key={index}
                                        name={name}
                                        label={capitalize(permission)}
                                        checked={isChecked}
                                        module={module.group}
                                        entity={entity.entity}
                                        permissionname={permission}
                                        onChange={(event) => this.handlePermissionChange(event, entityPermissions)}
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

    componentDidUpdate = async (prevProps, prevState) => {
        let app = isObject(this.state.appName) ? this.state.appName.value : this.state.appName;

        if (!isEqual(prevState.appName, this.state.appName)) {
            /**Fetch Application group */
            await this.getPermissionGroups(app)
        }

        /**When application group exists and group is selected, then get Modules */
        if ((this.state.appGroups.length && !isEqual(prevState.appGroups, this.state.appGroups))) {
            await this.getApplicationPermissionModules(app)
        }

        /**Filter out the modules based on group changes */
        if (!isEqual(prevState.group, this.state.group) || !isEqual(prevState.modules, this.state.modules)) {
            let currentGrp = this.state.group && this.state.group.value
            if (currentGrp != "all") {
                let updatedModules = this.state.modules.filter((module) => {
                    return module.group === currentGrp
                })
                this.setState({ filteredModules: updatedModules })
            }
            else {
                this.setState({ filteredModules: this.state.modules })
            }
        }
    }

    getPermissionGroups = async (appName) => {
        const bodyPayload = {
            model: "PermissionModule",
            filter: { app: appName || null }
        }
        let groups = []
        const allOption = [{ label: "All", value: "all" }]

        this.setState({ loading: true })
        await callApi('/combo', 'POST', bodyPayload, null, null, true)
            .then(response => {
                groups = response.map((res) => {
                    return {
                        label: capitalize(res.group),
                        value: res.group
                    }
                })

                groups = groups.length ? concat(allOption, groups) : groups
                this.setState({ loading: false, error: null, appGroups: groups, group: { label: "All", value: "all" } })
            })
            .catch(error => {
                this.setState({ error })
            })
    }

    getApplicationPermissionModules = async (app) => {
        let { templatePermissions, filteredTemplatePermissions } = this.state

        this.setState({ loading: true })
        const modulesResponse = await callApi(`/usermanagement/permission/permissionTemplate/modules/?app=${app}`, 'GET', null, null, null, true)

        if (modulesResponse) {
            /**To get all permissions available in the system */
            let systemPermissions = modulesResponse.map((module, index) => {
                return module.entities.map((entity, index) => {
                    return entity && Object.values(entity.permissions)
                })
            })
            systemPermissions = flattenDeep(systemPermissions)

            /**To filter out the invalid permissions */
            filteredTemplatePermissions = templatePermissions.filter((permission) => {
                return systemPermissions.indexOf(permission) >= 0
            })

            this.setState({
                modules: modulesResponse,
                systemPermissions,
                filteredTemplatePermissions,
                loading: false
            })
        }
    }

    componentDidMount = async () => {
        const { templateId, clonedTemplateId } = this.props

        if (templateId || clonedTemplateId) {
            this.setState({ loading: true })
            const url = templateId ? `/usermanagement/permission/permissionTemplate/${templateId}` : `/usermanagement/permission/permissionTemplate/${clonedTemplateId}`
            const templateResponse = await callApi(url, 'GET', null, null, null, true)

            const { name, description, permissions, app } = templateResponse
            templateId && this.setState({ name, description, templatePermissions: permissions, appName: app, loading: false })
            clonedTemplateId && this.setState({ templatePermissions: permissions, appName: app, loading: false })
        }
    }

    buildForm = (modules) => {
        const { loading, name, description, appName, group, appGroups, isValid } = this.state;
        const { templateId, clonedTemplateId } = this.props;

        return (<Box >
            <BoxHeader heading="Create/Edit Permission Template" />
            <BoxBody loading={loading}>
                <Row>
                    <Col md={5}>
                        <FieldGroup
                            type="text"
                            label="Name"
                            name="name"
                            value={name || ""}
                            valid={!isValid ? "error" : null}
                            placeholder="Enter Name"
                            disabled={templateId ? true : false}
                            onChange={(e) => this.handleFormChanges(e.target.name, e.target.value)}
                            required={true}
                        />
                    </Col>
                    <Col md={5}>
                        <FieldGroup
                            type="textarea"
                            label="Description"
                            name="description"
                            value={description || ""}
                            placeholder="Enter Description"
                            onChange={(e) => this.handleFormChanges(e.target.name, e.target.value)}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md={5}>
                        <ByjusComboBox
                            label="Application"
                            name="appName"
                            value={appName || ""}
                            disabled={(templateId || clonedTemplateId) ? true : false}
                            placeholder="Select Application"
                            options={applicationArray}
                            onChange={this.handleFormChanges}
                            required={true}
                        />
                    </Col>
                    <Col md={5}>
                        <ByjusComboBox
                            label="Group"
                            name="group"
                            value={appName ? (group || "") : ""}
                            placeholder="Select Screen Group"
                            options={appGroups || []}
                            onChange={this.handleFormChanges}
                            required={false}
                        />
                    </Col>
                </Row>
                {appName && appGroups && (appGroups.length > 0) &&
                    <>
                        <hr />
                        <h4>Permissions</h4>
                        <Row className="row-with-top-margin">
                            <Col md={9}>{this.getModulePermissions()}</Col>
                        </Row>
                    </>
                }
                <div className="text-right">
                    <Button color="success" onClick={this.savePermissionTemplate}>Save Changes</Button>
                    {' '}
                    <Link to="/settings/permission-templates" className="btn btn-danger">Cancel</Link>
                </div>
            </BoxBody>
        </Box>)
    }

    render = () => {
        const { modules, loading, error } = this.state

        if (modules) {
            return (
                <Fragment>
                    <ErrorWrapper error={error} errorTop={true}>
                        {this.buildForm(modules)}
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
}

export default withRouter(PermissionTemplateForm)
