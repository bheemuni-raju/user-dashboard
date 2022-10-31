import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { Card, Row, Col } from "reactstrap";
import { map } from 'lodash';

const CardLayout = (props) => {
    const { cards } = props;

    return (
        <>
            {cards.map((card, idx) => {
                const isAllowedArray = map(card.items, 'isAllowed');
                const rootAllowed = isAllowedArray.includes(true);

                return (
                    <Fragment key={idx}>
                        {rootAllowed && <div className="p-2" key={idx}>
                            <h5 className="mb-3 card-title text-uppercase font-weight-bold">
                                {card.title}
                            </h5>
                            <Row className={"thumb-box"}>
                                {card && card.items && card.items.map((item, idx) => {
                                    return (
                                        <Fragment key={idx}>
                                            {item.isAllowed &&
                                                <Link to={item.url}>
                                                    <div className="thumbs">
                                                        <div className="link-content-icon">
                                                            <i className={item.icon} style={{ fontSize: 40 }}></i>
                                                            <p>{item.title}</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            }
                                        </Fragment>
                                    )
                                })}
                            </Row>
                            <hr style={{ borderBottom: '2px' }} />
                        </div>
                        }
                    </Fragment>
                )
            })}
        </>
    )
}

export default CardLayout;