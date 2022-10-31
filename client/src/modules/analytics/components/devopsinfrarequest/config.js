export const statusColourMap = {
    "created": "secondary",
    "approved": "info",
    "in_progress": "warning",
    "rejected": "danger",
    "deployed": "success",
    "smoke_tested": "success"
}

export const getOperationChecklist = (status) => {
    const checkListMap = {
        "approved": [
            'I have verified all the commits made post last deployment.',
            'I have confirmed with respective QA about the dev-testing of the feature going live.',
            'I have seen the demo of the feature going live and confirms there are no breaking changes.'
        ],
        "rejected": [
            'I confirm to reject this request due to the below reason.'
        ],
        "deployed": [
            'I have verified that the application is loading by logging in to the production , verified the logs for other backend services.'
        ],
        "smoke_tested": [
            'I have smoke tested the application to make sure there are no breaking changes deployed.',
            'I have checked the new feature,fixes as per the release notes.'
        ]
    }
    return checkListMap[status];
}