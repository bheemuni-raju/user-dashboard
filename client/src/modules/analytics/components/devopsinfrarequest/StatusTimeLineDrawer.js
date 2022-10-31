import React from "react"
import { Badge } from "reactstrap";
import {Timeline } from 'antd';
import { lowerCase } from 'lodash';
import moment from 'moment';

const StatusTimeLineDrawer=(actionDetails={})=>{
    const actions = actionDetails.actionDetails;
    const timeline = getHistory(actions);
    
    return (
            <Timeline mode="alternate">
                {
                    timeline.map((action, index) => (
                        <Timeline.Item key={index}>
                            <div className="text-uppercase">
                                <Badge color='info' className='status-label'>
                                    {action.status}
                                </Badge>
                            </div>
                            <p style={{ "font-size": "12px" }} className="mb-0">{action.doneBy}</p>
                            <p className="mb-0"><small>{action.time}</small></p>
                        </Timeline.Item>
                    ))
                }
            </Timeline>
    )
}


function getHistory(actions) {
    return Object.keys(actions)
       .filter(key => actions[key] !== null)
       .filter(key =>key.endsWith("At"))
       .sort((a, b) => new Date(actions[b]) - new Date(actions[a]))
        .map(key => ({
            status: lowerCase(key.replace('At', '')),
            time: moment(actions[key]).format("lll"),
            doneBy: actions[`${key.replace('At', '')}By`]
        }))
}
export default StatusTimeLineDrawer;