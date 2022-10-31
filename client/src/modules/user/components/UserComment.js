import React from 'react';
import { Drawer, Comment, Avatar, Button, Spin } from 'antd';
import moment from 'moment';
import { get } from 'lodash';

import { callApi } from 'store/middleware/api';
import FormBuilder from 'components/form/FormBuilder';
import { alphabetColorCoding } from 'utils/componentUtil';
import { ErrorWrapper } from 'components/error';

import '../user.scss';

class CommentModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    onClickSaveComment = () => {
        const { loggedInUser, email, updateUrl } = this.props;
        const { commentForm } = this.refs;
        const formValues = commentForm.validateFormAndGetValues();

        if (formValues) {
            const { comment } = formValues;
            const bodyPayload = {
                email,
                comment,
                commentedBy: get(loggedInUser, 'email')
            }

            this.setState({ loading: true, loadingMessage: 'Saving Comments', error: null });
            callApi(updateUrl, 'PUT', bodyPayload, null, null, true)
                .then(response => {
                    this.setState({ comments: get(response || {}, 'comments', []), loading: false, error: null });
                    this.props.closeModal();
                })
                .catch(error => {
                    this.setState({ loading: false, error });
                })
        }
    }

    loadComments = (loadUrl) => {
        this.setState({ loading: true, loadingMessage: 'Loading Comments', error: null });
        callApi(loadUrl, 'GET', null, null, null, true)
            .then(response => {
                this.setState({ comments: response, loading: false, error: null })
            })
            .catch(error => {
                this.setState({ loading: false, error });
            })
    }

    getCommentBody = () => {
        const { comments = [], loading, loadingMessage, error } = this.state;

        return (<>
            <ErrorWrapper error={error} errorTop={true} />
            <Spin spinning={loading} tip={loadingMessage}>
                {comments && comments.map((ele, index) => {
                    const { commentedBy = "", commentedAt } = ele;
                    const commentedByFirstLetter = commentedBy.slice(0, 1).toUpperCase();
                    return (
                        <Comment
                            key={index}
                            author={commentedBy}
                            avatar={
                                <Avatar style={alphabetColorCoding(commentedByFirstLetter)}>
                                    {commentedByFirstLetter}
                                </Avatar>
                            }
                            content={
                                <p>{ele.comment}</p>
                            }
                            datetime={ele.commentedAt ? moment(commentedAt).format('LLL') : 'NA'}
                        />
                    )
                })}
                <FormBuilder
                    ref="commentForm"
                    fields={[{
                        type: 'textarea',
                        name: 'comment',
                        required: true,
                    }]}
                />
                <Button htmlType="submit" type="primary" onClick={this.onClickSaveComment}>Add Comment</Button>
            </Spin>
        </>
        )
    }

    componentDidMount = async () => {
        const { loadUrl } = this.props;
        await this.loadComments(loadUrl);
    }

    render() {
        const { closeModal } = this.props;

        return (
            <Drawer
                title="Comments"
                placement="right"
                width="40%"
                style={{ zIndex: '100000' }}
                closable={true}
                onClose={closeModal}
                visible={true}
            >
                {this.getCommentBody()}
            </Drawer>
        )
    }
}

export default CommentModal;
