import React from 'react';
import { Button, Form, Drawer, Col, Row, Input } from 'antd';
import get from 'lodash/get';
import LoadingWrapper from 'components/LoadingWrapper';
import LogisticUsers from './middleware/LogisticUsers';

class ConfigurationForm extends React.Component {

    state = { loading: false }

    renderForm = () => {
        const { rowData = {} } = this.props;
        const { configs, formattedModuleName } = rowData;
        const mainConfig = JSON.stringify(configs, null, 3);
        const { getFieldDecorator } = this.props.form;

        switch (formattedModuleName) {
            case "CLONE_BOOK_ORDER":
                return <LogisticUsers
                    configs={configs[0]}
                    ref="formRef"
                    setLoading={this.setLoading}
                />;

            default:
                return getFieldDecorator('mainConfig', {
                    initialValue: mainConfig,
                    rules: [
                        {
                            required: true,
                            message: 'please enter config',
                        },
                    ],
                })(<Input.TextArea rows={30} placeholder="please enter config" />);
        }
    }

    handleSave = () => {
        const { onSave, rowData = {} } = this.props;
        const formRef = get(this.refs, 'formRef');
        const formValues = formRef ? formRef.validateFormAndGetValues() : null;
        if (formValues) {
            onSave(formValues, rowData);
        }
    }

    setLoading = loading => {
        this.setState({ loading })
    }

    render() {
        const { onClose, visible } = this.props;
        const { loading } = this.state;
        return (
            <Drawer
                title="Edit Configuration"
                placement="right"
                width={720}
                onClose={onClose}
                visible={visible}
                zIndex={1040}
            >
                <LoadingWrapper loading={loading}>
                    <Form layout="vertical" hideRequiredMark>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                // label="Main Config"
                                >

                                    {this.renderForm()}

                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                    <div className="drawer-footer">
                        <Button onClick={onClose} style={{ marginRight: 8 }}>
                            Cancel
                        </Button>
                        <Button onClick={this.handleSave} type="primary">
                            Save
                    </Button>
                    </div>
                </LoadingWrapper>
            </Drawer >
        )
    }
}

const DrawerConfigurationForm = Form.create()(ConfigurationForm);

export default DrawerConfigurationForm;