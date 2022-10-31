import React from 'react';
import { Drawer, Comment, Avatar, Button, Spin, Timeline, Alert } from 'antd';
import { get, startCase, isEmpty, sortBy } from 'lodash';
import moment from 'moment';

class UserHistory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    buildHistoryTimeline = (updateHistory = [], userData = {}) => {
        const { createdAt } = userData;
        let history = [...updateHistory, {
            updatedAt: createdAt,
            updatedBy: 'Added in system'
        }];

        history = history.sort((a, b) => {
            return new Date(get(b, 'updatedAt')).getTime() - new Date(get(a, 'updatedAt')).getTime()
        })
        return (!isEmpty(history) ?
            <Timeline mode="alternate">
                {history.map((log, index) => {
                    const { updatedAt, updatedBy, reason="", changes = {} } = log;
                    const changeAt = moment(updatedAt).format('LLL');
                    return (
                        <Timeline.Item color="green" key={index}>{`${changeAt}`}
                            <p>Updated By : {updatedBy} </p>
                            {Object.keys(changes).map((key, index) => {
                                const { oldValue, newValue } = changes[key];
                                return (
                                    <p key={index}>
                                        <strong>{`${startCase(key)} : `}</strong> {" "}
                                        {`From ${oldValue || 'NA'} To ${newValue || 'NA'}`}
                                    </p>
                                )
                            })}
                            {(reason) && <p><b>Reason :</b> {reason}</p>}
                        </Timeline.Item>
                    )
                })}
            </Timeline> :
            <div style={{ margin: '1%' }}>
                < Alert type="info" message="No History Found!" />
            </div>
        )
    }

    render() {
        const { history = [], closeModal, userData } = this.props;

        return (
            <Drawer
                title={`History : ${history.length}(Changes)`}
                placement="right"
                width="60%"
                closable={true}
                onClose={closeModal}
                visible={true}
                zIndex={1040}
            >
                {this.buildHistoryTimeline(history, userData)}
            </Drawer>
        );
    }
}

export default UserHistory;
