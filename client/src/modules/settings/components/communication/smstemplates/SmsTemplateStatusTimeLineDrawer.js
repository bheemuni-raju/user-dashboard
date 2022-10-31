import React from 'react'
import { Drawer, Timeline } from 'antd'
import { isEmpty, lowerCase, snakeCase } from 'lodash';
import moment from 'moment';
import SmsTemplateStatusLabel from './SmsTemplateStatusLabel';

export default function SmsTemplateStatusTimeLineDrawer({ actionDetails = {}, onClose, visible }) {
    const timeline = getStatusHistory(actionDetails) || [];

    return (
        <Drawer
            title={`Sms Template Status History`}
            placement="right"
            width="35%"
            style={{ zIndex: '100000' }}
            closable={true}
            onClose={onClose}
            visible={visible}
        >
            <Timeline mode="alternate">
                {
                    timeline.map((action, index) => (
                        <Timeline.Item key={index}>
                            <div className="text-uppercase">
                                <SmsTemplateStatusLabel status={action.status} />
                            </div>
                            <p className="mb-0">{action.doneBy}</p>
                            <p className="mb-0"><small>{action.time}</small></p>
                        </Timeline.Item>
                    ))
                }
            </Timeline>
        </Drawer>

    )
}


function getStatusHistory(actionDetails) {
    delete actionDetails.updatedAt;
    let timeLine = Object.keys(actionDetails)
        .filter(key => snakeCase(key).split('_')[snakeCase(key).split('_').length - 1] === "at")
        .sort((a, b) => new Date(actionDetails[b]) - new Date(actionDetails[a]))
        .map(key => {
            if (!isEmpty(actionDetails[key])) {
                return {
                    status: lowerCase(key.replace('At', '')),
                    time: moment(actionDetails[key]).format("lll"),
                    doneBy: actionDetails[`${key.replace('At', '')}By`]
                }
            }

            return null;
        })

    timeLine = timeLine.filter(item => !isEmpty(item));
    console.log(timeLine);
    return timeLine;
}