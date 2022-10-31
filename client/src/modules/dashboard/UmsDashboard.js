import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { capitalize, get, startCase } from 'lodash';

import selectors from 'store/selectors';
import DashboardImage from 'assets/img/brand/ums-dashboard-gif.svg';

const styleProps = {
    border: "none",
    borderRadius: "2px",
    boxShadow: "0 2px 10px 0 rgba(70, 76, 79, .2)",
    width: '100%',
    height: '480px'
}

const Dashboard = (props) => {
    const { user } = props;
    /**
        * Need to be converted to token based rendering for mongodb charts
        * https://github.com/mongodb/charts-embedding-examples/tree/master/node
        */
    return (
        <section className="content-header" style={{ marginTop: "40px" }}>
            <div className="row">
                <h1 className="dashboard-message">{`Welcome ${startCase(get(user, 'name', ''))}`}</h1>
            </div>
            <div className="container" style={{ "maxWidth": "30%", "maxHeight": "30%", "verticalAlign": "middle" }}>
                <img className="dashboard-image" src={DashboardImage} />
            </div>
        </section>
    );
}

const capitalizeName = (name) => {
    let wordsArr = name && name.split(' ') || [];

    wordsArr = wordsArr.map((word) => {
        return capitalize(word);
    });

    return wordsArr.join(' ');
}

Dashboard.propTypes = {
    user: PropTypes.object.isRequired
}

const mapStatetoProps = state => ({
    user: selectors.auth.getUser(state)
})

export default (connect(mapStatetoProps)(Dashboard))
