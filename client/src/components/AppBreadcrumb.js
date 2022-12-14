import React, { Component } from 'react';
import { Route, Link, matchPath } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { startCase } from 'lodash';

let routes;

const getPaths = (pathname) => {
    const paths = ['/'];

    if (pathname === '/') return paths;

    pathname.split('/').reduce((prev, curr) => {
        const currPath = `${prev}/${curr}`;
        paths.push(currPath);
        return currPath;
    });
    return paths;
};

const findRouteName = (url) => {
    const aroute = routes.find(route => matchPath(url, { path: route.path, exact: route.exact }));
    return (aroute && aroute.name) ? aroute.name : null
};

const BreadcrumbsItem = ({ match }) => {
    const matchArray = match.url && match.url.split("/");
    const lastItem = matchArray.pop();
    const routeName = lastItem ? startCase(lastItem) : "Home";

    if (routeName) {
        const matchUrl = match.url === "/" ? "/dashboard" : match.url;

        return (
            // eslint-disable-next-line react/prop-types
            match.isExact ?
                <BreadcrumbItem active>{routeName}</BreadcrumbItem>
                :
                <BreadcrumbItem>
                    <Link to={matchUrl}>
                        {routeName}
                    </Link>
                </BreadcrumbItem>
        );
    }
    return null;
};

BreadcrumbsItem.propTypes = {
    match: PropTypes.shape({
        url: PropTypes.string
    })
};

const Breadcrumbs = (args) => {
    const paths = getPaths(args.location.pathname);
    const items = paths.map((path, i) => <Route key={i.toString()} path={path} component={BreadcrumbsItem} />);
    return (
        <Breadcrumb>
            {items}
        </Breadcrumb>
    );
};

const propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    appRoutes: PropTypes.any,
    tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string])
};

const defaultProps = {
    tag: 'div',
    className: '',
    appRoutes: [{ path: '/', exact: true, name: 'Home', component: null }]
};

class AppBreadcrumb extends Component {
    constructor(props) {
        super(props);

        this.state = { routes: props.appRoutes };
        routes = this.state.routes;
    }

    render() {
        const { className, tag: Tag, ...attributes } = this.props;

        delete attributes.children;
        delete attributes.appRoutes;

        const classes = classNames(className, "pl-2");

        return (
            <Tag className={classes} style={{ marginTop: '50px' }}>
                <Route path="/:path" component={Breadcrumbs} {...attributes} />
            </Tag>
        );
    }
}

AppBreadcrumb.propTypes = propTypes;
AppBreadcrumb.defaultProps = defaultProps;

export default AppBreadcrumb;