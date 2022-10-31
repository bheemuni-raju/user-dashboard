import { get, startCase } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import axios from 'axios';
import  hooks from 'lib/hooks';

const FlyoutWrapper = styled.div`
    position: absolute;
    right: 0;
    top: 50px;
    bottom: 0;
    width: 400px;
    height: 100vh;
    background-color: #fff;
    transition: right .2s ease-in-out;
    z-index: 10000001;
    box-shadow: -2px 5px 10px 1px rgb(0 0 0 / 18%);
`;

const FlyoutHeader = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    border-bottom: 1px solid #efefef;
    padding: 10px 0px;
    background-color: #f3f8fe;
    margin-right: 30px;
`;

const FlyoutBodyHeader = styled.div`
    border-bottom: 1px solid #efefef;
    padding: 10px 10px;
    text-transform: uppercase;
`;

const FlyoutCard = styled.a`
    display: flex;
    flex-direction: row;
    padding: 10px 10px;
    justify-content : space-between;

    &:hover {
        background-color: #f3f8fe;
        color: #000;
    }
`;

const OrgWrapper = styled.div`
    display: flex;
    flex-direction : column;
    flex: 3;
`

function OrganizationDrawer({ close }) {
    const drawerRef = useRef();
    const user = useSelector(state => state.auth.user);
    const userAvatar = user && user.picture;

    const [organizations, setOrganizations] = useState([]);
    hooks.useOnClickOutside(drawerRef, close);

    useEffect(() => {
        getOrganizations();
    }, [])

    async function getOrganizations() {
        return axios({
            url: `${window.NAPI_URL}/usermanagement/organization/listAll`,
            method: 'GET',
            headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        })
            .then((response) => {
                setOrganizations(response.data);
            })
            .catch((error) => {
                console.log("Error", error);
            });
    }

    const orgs = user.userOrganizations.map((org) => {
        let orgDetails = organizations.find(x => x.orgFormattedName === org.orgFormattedName);
        return {
            orgName: get(org, 'orgFormattedName', '').toUpperCase(),
            orgFormattedName: get(org, 'orgFormattedName', ''),
            orgId: get(orgDetails, "orgId", ""),
            default: (get(org, 'orgFormattedName', '') === get(user, 'orgFormattedName', '')) ? true : false,
            appRoleName: get(org, 'appRoleName', '')
        }
    });

    const onClickOrg = (org, user) => {
        if (user.orgFormattedName !== org.orgFormattedName) {
            alert(`Switching to ${org.orgName} Organization!`);
            changeDefaultOrg(org, user);
        }
    }

    const changeDefaultOrg = (org, user) => {
        let userOrganizations = get(user, 'userOrganizations', []);
        let appRoleName = "";
        userOrganizations.map((data) => {
            if (data.orgFormattedName === org.orgFormattedName) {
                appRoleName = org.appRoleName;
            }
        });

        return axios({
            url: `${window.NAPI_URL}/usermanagement/employee/changeDefaultOrg`,
            method: 'POST',
            headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            data: {
                orgFormattedName: org.orgFormattedName,
                orgId: org.orgId,
                appRoleName
            }
        })
            .then(() => {
                window.location.reload();
            })
            .catch((error) => {
                console.log(error);
            });
    }

    return (
        <FlyoutWrapper ref={drawerRef}>
            <FlyoutHeader>
                <img
                    src={userAvatar}
                    className="rounded-circle"
                />
                <div>{user.name}</div>
                <div>{user.email}</div>
            </FlyoutHeader>
            <section>
                <FlyoutBodyHeader>
                    My Organizations
                </FlyoutBodyHeader>
                {orgs.map((org, idx) => {
                    return (
                        <FlyoutCard style={{ backgroundColor: org.default ? '#6B5EAE' : 'none', color: org.default ? '#fff' : '#00000' }} key={idx} onClick={() => onClickOrg(org, user)}>
                            <OrgWrapper>
                                <div>{startCase(org.orgName).toUpperCase()}</div>
                                <div>Organization ID: {org.orgId}</div>
                            </OrgWrapper>
                            {org.default && <i className="fa fa-check" style={{ flex: 1 }}></i>}
                        </FlyoutCard>
                    )
                })}
            </section>
        </FlyoutWrapper>
    )
}

export default OrganizationDrawer;
