import React, { useState, useEffect } from 'react';

import { callApi } from 'store/middleware/api';

import MentionComment from 'modules/core/components/MentionComment';

const DeploymentRequestComment = (props) => {
    const { drId, refreshGrid } = props;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [requestId, setRequestId] = useState(drId);
    const [comments, setComments] = useState([]);

    useEffect(() => {
        setRequestId(drId);
        loadComments();
    }, [drId])

    const loadComments = async () => {
        setError(null);
        setLoading(true);
        await callApi(`/usermanagement/analyticsmanagement/deploymentrequest/getComments`, 'POST', {
            requestId
        }, null, null, true)
            .then(response => {
                setComments(response);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                setError(error.message);
            });
    }

    const addComment = async ({ comment, taggedBy, taggedEmail }) => {
        setError(null);
        setLoading(true);
        await callApi(`/usermanagement/analyticsmanagement/deploymentrequest/addComment`, 'POST', {
            requestId,
            comment,
            taggedEmail
        }, null, null, true)
            .then(response => {
                loadComments();
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                setError(error.message);
            });
    }

    return (
        <MentionComment
            comments={comments}
            onClickComment={addComment}
            sendEmail={false}
        >

        </MentionComment>
    )
}

export default DeploymentRequestComment;