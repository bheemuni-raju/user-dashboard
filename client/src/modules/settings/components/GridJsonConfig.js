import React, { Component } from 'react';
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';
import { withRouter } from 'react-router'
import { Button } from 'reactstrap';
import { isEqual } from 'lodash';

class GridJsonConfig extends Component {
    constructor(props) {
        super(props);
        this.state = {
            model: null,
            templateData: null,
            isConfigValid: true
        }
    }

    onChangeContent = (changeObject) => {
        const { jsObject } = changeObject;

        if (jsObject) {
            this.setState({ templateData: jsObject, isConfigValid: true });
        }
        else {
            this.setState({ isConfigValid: false });
        }
    }

    onClickResest = () => {
        const { templateData } = this.state;

        /**For resetting to original value, column state should be updated.Hence making it empty first and then setting to original value */
        this.setState({ templateData: {} }, () => {
            this.setState({ templateData, isConfigValid: true });
        });
    }

    onClickClear = () => {
        this.setState({ templateData: {} });
    }

    onClickCancel = () => {
        this.props.history.push('/settings/grid-configuration');
    }

    componentDidMount = () => {
        const { templateData } = this.props;

        this.setState({ templateData });
    }

    componentWillReceiveProps = (nextProps) => {
        const { templateData } = nextProps;

        if (!isEqual(this.state.templateData, templateData)) {
            this.setState({ templateData });
        }
    }

    onClickSave = () => {
        const { onClickSave } = this.props;
        const { isConfigValid, templateData } = this.state;

        if (isConfigValid) {
            onClickSave(templateData);
        }
    }

    render = () => {
        const { templateData, isConfigValid } = this.state;

        return (
            <div>
                <JSONInput
                    //id='a_unique_id'
                    width="100%"
                    placeholder={templateData}
                    theme="darktheme"
                    locale={locale}
                    onChange={this.onChangeContent}
                    waitAfterKeyPress={1000}
                />
                <hr />
                <div>
                    <Button color="primary" onClick={this.onClickResest}>Reset</Button>{" "}
                    <Button color="danger" onClick={this.onClickClear}>Clear</Button>{" "}
                    <Button color="primary" disabled={!isConfigValid} onClick={this.onClickSave}>Save</Button>{" "}
                    <Button color="danger" onClick={this.onClickCancel}>Cancel</Button>{" "}
                </div>
            </div>
        )
    }
}

export default withRouter(GridJsonConfig);
