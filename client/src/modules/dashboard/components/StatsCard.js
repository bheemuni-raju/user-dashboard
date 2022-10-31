import React from 'react';
import { Card, CardBody, Row, Col } from 'reactstrap';

const StatsCard = (props) => {
    return (
        <Card className="card-stats">
            <CardBody className="p-2" style={{ background: `linear-gradient(45deg, ${props.gradientClr || "#5cc4cc"}, transparent)` }}>
                <div className="d-flex p-1">
                    <div xs="auto" className="flex-grow-1">
                        <h5 className="card-title text-uppercase mb-0">{props.title}</h5>
                        <span className="h5 font-weight-bold mb-0">
                            {props.count && props.count.toLocaleString() || 0}
                        </span>
                    </div>
                    <div xs="auto" className="p-0">
                        {props.sygnet && <img src={props.sygnet} style={{ height: "30px" }} />}
                        {props.icon && <i className={props.icon}></i>}

                    </div>
                </div>
                {/* <p className="mt-3 mb-0 text-sm"> */}
                {/* <span className="text-success mr-2">
                        <i className="fa fa-arrow-up"></i> xx%
                    </span>
                    <span className="text-nowrap">Since last month</span> */}
                {/* </p> */}
            </CardBody>
        </Card>
    )
}

export default StatsCard;