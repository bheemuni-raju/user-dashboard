import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router';
import { Row, Col, Label, Button, Card } from 'reactstrap';
import { pull, capitalize, chunk } from 'lodash';

import ModalWindow from 'components/modalWindow';
import { Page, PageHeader, PageBody } from 'components/page';
import { Box, BoxBody } from 'components/box';
import { FieldGroup } from 'components/form';
import { callApi } from 'store/middleware/api';

import '../index.scss';

class PermissionModuleCreate extends Component {
    constructor(props) {
        super(props)
        this.state = {
            entityIndex: 1,
            entityIndexArray: [1],
            moduleFormValues: {},
            isValidValue: true,
            permissionModalHeading: '',
            permissionModalContent: null,
            showModal: false,
            loading: false,
            error: null
        }
    }

    handleEntityFormChanges = (event) => {
        const { moduleFormValues } = this.state
        const { name, value } = event.target

        moduleFormValues[name] = value
        this.setState({ moduleFormValues })
    }

    onClickAddEntity = () => {
        let { entityIndex, entityIndexArray } = this.state

        entityIndex++
        entityIndexArray.push(entityIndex)

        this.setState({ entityIndex, entityIndexArray })
    }

    onClickViewEntityPermission = (event) => {
        const { name } = event.target
        const { moduleFormValues } = this.state
        const entityDetails = this.getEntityDetails(Number(name), moduleFormValues)
        let { entity, permissions } = entityDetails

        this.setState({
            showModal: true,
            permissionModalHeading: capitalize(entity),
            permissionModalContent: permissions
        })
    }

    onClickDeleteEntity = (event) => {
        const { name } = event.target
        const { entityIndexArray } = this.state

        pull(entityIndexArray, Number(name))

        this.setState({ entityIndexArray })
    }

    getEntityDetails = (index, moduleFormValues) => {
        const { appName } = this.props;
        const entityName = moduleFormValues[`entity_${index}`].trim();
        const formattedEntityName = entityName && entityName.split(' ').join('_');
        const entityPermissions = moduleFormValues[`permissions_${index}`] || "";
        const trimmedEntityPermissions = entityPermissions.trim ? entityPermissions.trim() : entityPermissions;
        const permissionArray = trimmedEntityPermissions && trimmedEntityPermissions.split(',')
        const permissionObject = {};
        const apps = [
            'fms', 'oms', 'lms', 'ums',
            'wms', 'poms', 'scachieve',
            'ims', 'sos', 'kart', 'scos', 'uxachieve',
            'counselling', 'cxms', 'exms', 'mos', 'uxos', 'dfos',
            'dfachieve', 'stms', 'compliance', 'cns'
        ];
        /**TODO:Include appName in permission from new app. Do a datafix for all applications */
        const formattedAppName = apps.includes(appName) ? appName.trim().split(' ').join('_') : '';
        permissionArray && permissionArray.forEach((permission) => {
            permissionObject[permission] = `${formattedAppName ? `${formattedAppName}_` : ''}${moduleFormValues.group.trim().split(' ').join('_')}_${formattedEntityName}_${permission.trim().split(' ').join('_')}`.toUpperCase()
        })

        return {
            entity: entityName,
            permissions: permissionObject
        }
    }

    formatModuleResponse = (response) => {
        const { group, entities } = response
        let entitiesObject = {}

        const entityIndex = entities && entities.length
        const entityIndexArray = entities.map((entity, index) => {
            return index + 1
        })

        entities.length && entities.forEach((entity, index) => {
            // eslint-disable-next-line
            entitiesObject[`entity_${index + 1}`] = entity.entity,
                entitiesObject[`permissions_${index + 1}`] = Object.keys(entity.permissions).join(',')
        })

        return {
            entityIndex,
            entityIndexArray,
            moduleFormValues: {
                group,
                ...entitiesObject
            }
        }
    }

    onClickSaveModule = () => {
        const { moduleId } = this.props
        const method = moduleId ? 'PUT' : 'POST'
        const url = method == "POST" ? `/usermanagement/permission/permissionModule` : `/usermanagement/permission/permissionModule/${moduleId}`
        const { entityIndexArray, moduleFormValues } = this.state
        let isValid = this.validateModuleForm(entityIndexArray, moduleFormValues)

        if (isValid) {
            const bodyPayload = this.generateBodyPayload(entityIndexArray, moduleFormValues)

            this.setState({ loading: true })
            callApi(url, method, bodyPayload, null, null, true)
                .then(response => {
                    this.props.history.goBack()
                })
                .catch(error => {
                    this.setState({ loading: false, error: error.message })
                })
        }
        else {
            this.setState({ isValidValue: isValid })
        }
    }

    validateModuleForm = (entityIndexArray, moduleFormValues) => {
        let isValidValue = true
        //To check whether required fields are having values or not
        entityIndexArray.forEach((entityIndex) => {
            if (!moduleFormValues[`entity_${entityIndex}`] || !moduleFormValues[`permissions_${entityIndex}`]) {
                isValidValue = false
            }
        })

        return isValidValue
    }

    generateBodyPayload = (entityIndexArray, moduleFormValues) => {
        const { appName } = this.props
        const entityArray =
            entityIndexArray.map((index) => {
                return this.getEntityDetails(index, moduleFormValues)
            })

        return {
            app: appName,
            group: moduleFormValues.group,
            entities: entityArray
        }
    }

    closePermissionModal = () => {
        this.setState({
            showModal: false,
            permissionModalHeading: '',
            permissionModalContent: null
        })
    }

    buildPermissionModalBody = (permissionModalContent) => {
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

    buildEntityForm = () => {
        const { entityIndexArray } = this.state

        return (
            entityIndexArray.map((entityIndex, index) => {
                const entityName = `entity_${entityIndex}`
                const entityPermission = `permissions_${entityIndex}`
                const { moduleFormValues, isValidValue } = this.state

                return (
                    <Card key={index}>
                        <form>
                            <div className="text-right">
                                <Button
                                    color="info"
                                    size="sm"
                                    name={`${entityIndex}`}
                                    onClick={this.onClickViewEntityPermission}
                                    disabled={moduleFormValues[entityName] ? false : true}
                                >
                                    <i className="fa fa-eye" onClick={(event) => {
                                        event.stopPropagation()
                                        event.target.parentElement.click()
                                    }} />
                                </Button>
                                {" "}
                                {entityIndex > 1 &&
                                    <Button size="sm"
                                        name={`${entityIndex}`}
                                        color="danger"
                                        onClick={this.onClickDeleteEntity}
                                    >
                                        <i className="fa fa-close" onClick={(event) => {
                                            event.stopPropagation()
                                            event.target.parentElement.click()
                                        }} />
                                    </Button>}
                            </div>
                            <FieldGroup
                                name={entityName}
                                type="text"
                                label="Screen"
                                value={moduleFormValues[entityName] || ""}
                                valid={(!moduleFormValues[entityName] && !isValidValue) ? "error" : null}
                                onChange={this.handleEntityFormChanges}

                                required={true}
                            />
                            <FieldGroup
                                name={entityPermission}
                                type="text"
                                label="Permissions"
                                value={moduleFormValues[entityPermission] || ""}
                                placeholder="Permission1, Permission2"
                                valid={(!moduleFormValues[entityPermission] && !isValidValue) ? "error" : null}
                                onChange={this.handleEntityFormChanges}
                                required={true}
                            />
                        </form>
                    </Card>)
            })
        )
    }

    buildModuleForm = () => {
        const { moduleFormValues, isValidValue } = this.state
        return (
            <Fragment>
                <Row>
                    <Col md={1}><Label>Group : </Label></Col>
                    <Col md={6}>
                        <FieldGroup
                            name="group"
                            type="text"
                            required={true}
                            value={moduleFormValues[`group`] || ""}
                            valid={(!moduleFormValues[`group`] && !isValidValue) ? "error" : null}
                            onChange={this.handleEntityFormChanges}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md={1}><Label>Screens : </Label></Col>
                    <Col md={6}>
                        {this.buildEntityForm()}
                    </Col>
                </Row>
            </Fragment>
        )
    }

    componentDidMount = () => {
        const { moduleId } = this.props

        if (moduleId) {
            this.setState({ loading: true })
            callApi(`/usermanagement/permission/permissionModule/${moduleId}`, 'GET', null, null, null, true)
                .then(response => {
                    const formattedResponse = this.formatModuleResponse(response)
                    const { moduleFormValues, entityIndex, entityIndexArray } = formattedResponse
                    this.setState({
                        moduleFormValues,
                        entityIndex,
                        entityIndexArray,
                        loading: false,
                        error: null
                    })
                })
                .catch(error => {
                    this.setState({ loading: false, error: error.message })
                })
        }
    }

    render() {
        const { loading, error, permissionModalHeading, permissionModalContent } = this.state
        return (
            <Page>
                <PageHeader heading="Module Details" />
                <PageBody error={error}>
                    <Box>
                        <BoxBody loading={loading} className="permission-module-form">

                            {this.buildModuleForm()}
                            <Button
                                type="button"
                                color="success"
                                onClick={() => this.onClickAddEntity()}
                            ><i className="fa fa-plus" /></Button>
                            <div className="text-right">
                                <Button type="button" color="success" onClick={this.onClickSaveModule}>Save</Button>
                                {'   '}
                                <Button type="button" color="danger" onClick={() => this.props.history.goBack()}>Cancel</Button>
                            </div>
                            <ModalWindow
                                closeButton={true}
                                showModal={this.state.showModal}
                                closeModal={this.closePermissionModal}
                                heading={`${permissionModalHeading} Permissions`}
                                loading={loading}
                                error={error}
                            >
                                {permissionModalContent && this.buildPermissionModalBody(permissionModalContent)}
                            </ModalWindow>
                        </BoxBody>
                    </Box>
                </PageBody>
            </Page>
        )
    }
}

export default withRouter(PermissionModuleCreate)
