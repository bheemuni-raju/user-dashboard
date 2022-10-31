import React from 'react';
import ReactJson from 'react-json-view';

import { Button, Form, Drawer, Col, Row, Input } from 'antd';

class ConfigurationView extends React.Component {
    render() {
        const { onClose, onSave, visible, rowData = {} } = this.props;
        const { getFieldDecorator } = this.props.form;
        const { configs } = rowData;

        return (
            <Drawer
                title="View Configuration"
                placement="right"
                width={720}
                onClose={onClose}
                visible={visible}
                zIndex={1040}
            >
                <Form layout="vertical" hideRequiredMark>
                    <Row gutter={16}>
                        <Col span={24}>
                            <ReactJson
                                src={configs}
                                theme="hopscotch"
                            />
                        </Col>
                    </Row>
                </Form>
                <div className="drawer-footer">
                    <Button onClick={onClose} style={{ marginRight: 8 }}>
                        Cancel
                    </Button>
                </div>
            </Drawer>
        )
    }
}

const DrawerConfigurationView = Form.create()(ConfigurationView);

export default DrawerConfigurationView;