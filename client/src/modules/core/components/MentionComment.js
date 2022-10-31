import React from 'react';
import { connect } from 'react-redux';
import P from 'prop-types';
import { get, isEmpty, startCase, map, uniq, isEqual, concat, remove } from 'lodash';
import { Mentions, Avatar, Button, Spin, Comment } from 'antd';
import moment from 'moment';

import { callApi } from 'store/middleware/api';
import ByjusDropdown from 'components/ByjusDropdown';
import ByjusBadge from 'modules/core/components/ByjusBadge';

const { Option } = Mentions;

class MentionComment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            loading: false,
            taggedEmail: [],
            comment: "",
            comments: [],
            sources: [],
            filteredComments: [],
            saveLoading: false,
            disableBtn: true
        }
    }

    onChange = (value) => {
        this.setState({ comment: value, disableBtn: isEmpty(value) });
    }

    onSelect = (option) => {
        const { value } = option || {};
        let { taggedEmail } = this.state;

        taggedEmail.push(value);

        this.setState({ taggedEmail });
    }

    onSearch = (searchKey) => {
        if (searchKey != "") {
            this.fetchUsers(searchKey);
        }
    }

    fetchUsers = async (searchKey) => {
        const bodyPayload = {
            model: "MasterEmployee",
            filter: { "email": { "$nin": ["", null], "$regex": searchKey } },
            displayKey: "email",
            valueKey: "email",
            limit: 10
        }

        try {
            this.setState({ loading: true });
            await callApi('/combo', 'POST', bodyPayload, null, null, true)
                .then(response => {
                    const users = response.map(d => get(d, 'email'));
                    this.setState({ users, loading: false });
                })
                .catch(error => {
                    return error
                });
        } catch (error) {
            throw new Error(error);
        }
    }

    onClickCommentBtn = async () => {
        let { subject, link, onClickComment, user, linkToAdd = false, sendEmail = true } = this.props;
        const { taggedEmail, comment } = this.state;
        const taggedBy = get(user, 'email');
        const bodyPayload = {
            emails: taggedEmail,
            subject: `Importatnt: ${subject || ''}`,
            comment: this.getMailBody(comment, linkToAdd, link, taggedBy)
        };

        this.setState({ saveLoading: true });

        if (!isEmpty(taggedEmail) && sendEmail) {
            await callApi('/comment/notify', "POST", bodyPayload, null, null, true)
                .then(response => {
                    console.log('Notified successfully');
                })
                .catch(error => {
                    console.log(error);
                });
        }
        this.setState({ saveLoading: false, comment: "", disableBtn: true });
        onClickComment && await onClickComment({ comment, taggedBy, taggedEmail });
    }

    getMailBody = (comment, linkToAdd, link, taggedBy) => {
        const { extraMsg } = this.props;
        const path = linkToAdd ? (link || window.location.href) : null;

        return `
            <p>${`Hi, You have been tagged in the below comment by ${taggedBy}`} </p>
            <p>Please check.</p>
            <p>
                <strong>Comment :</strong>
                <span>${comment}</span>
            </p>
            ${path ? `<p>Click on the link to check further : <a href=${path}>${path}</a></p>` : ''}
            ${extraMsg ? `<p>${extraMsg}</p>` : ''}
            <p><strong>Note : </strong> This is a system-generated mail.Please do not reply back.</p>`;
    }

    componentDidMount = () => {
        const { comments = [] } = this.props;

        this.fetchUsers();
        this.setState({ comments, filteredComments: comments });
    }

    componentWillReceiveProps = (nextProps) => {
        if (!isEqual(this.props.comments, nextProps.comments)) {
            let sources = map(nextProps.comments, 'source');
            remove(sources, s => !s);
            const uniqueSources = concat(uniq(sources), ['all']);

            this.setState({ comments: nextProps.comments, filteredComments: nextProps.comments, sources: uniqueSources });
        }
    }

    onClickSource = (source) => {
        const { comments = [] } = this.state;
        const filteredComments = source === "all" ? comments : comments.filter(com => com.source === source);

        this.setState({ filteredComments });

        return filteredComments;
    }

    getUniqueCommentSource = () => {
        const { sources } = this.state;

        return sources.map((source) => {
            return {
                title: startCase(source),
                onClick: () => this.onClickSource(source)
            }
        });
    }

    render() {
        let { loading, users, saveLoading, disableBtn, comment, comments, filteredComments = [] } = this.state;
        const { style, prefix, placeholder } = this.props;

        filteredComments = filteredComments.sort((s1, s2) => new Date(s2.commentedAt).getTime() - new Date(s1.commentedAt).getTime());
        return (
            <>
                <Spin spinning={saveLoading}>
                    <Mentions rows="3"
                        style={style || { width: '50%' }}
                        onChange={this.onChange}
                        onSelect={this.onSelect}
                        onSearch={this.onSearch}
                        loading={loading}
                        autoFocus={true}
                        prefix={prefix || '@'}
                        value={comment}
                        placeholder={placeholder || `Enter comments here.. You can use '@'to notify users.`}
                    >
                        {
                            users.length
                                ? users.map((email, index) => {
                                    return (<Option key={email} value={email} className="antd-demo-dynamic-option">
                                        <Avatar style={{ color: '#f56a00', backgroundColor: '#fde3cf' }} icon="user">
                                            {email.slice(0, 1).toUpperCase()}
                                        </Avatar>
                                        <span>{` ${email}`}</span>
                                    </Option>)
                                })
                                : []
                        }
                    </Mentions>
                    {" "}
                    <Button type="primary" style={{ top: '30%', margin: '2%' }}
                        onClick={this.onClickCommentBtn}
                        disabled={disableBtn}>
                        Comment
                </Button>
                </Spin>
                {
                    !isEmpty(comments) &&
                    <div>
                        <span style={{ margin: '1%', display: 'flex' }}>
                            <h3 className="mr-1">
                                <ByjusBadge variant="warning">{`Comments : ${filteredComments.length}`}</ByjusBadge>
                            </h3>
                            <ByjusDropdown
                                size="sm"
                                defaultTitle="All"
                                color="info"
                                titleIcon="fa fa-filter"
                                items={this.getUniqueCommentSource()} />
                        </span>
                        {filteredComments.map((data, idx) => {
                            let { commentedBy, comment: eachComment = "", commentedAt, source } = data;

                            if (eachComment && eachComment.includes('http')) {
                                const commentPart = eachComment ? eachComment.split('http')[0] : "";
                                const urlStartIndex = eachComment ? eachComment.indexOf('http') : 0;
                                const url = eachComment ? eachComment.substr(urlStartIndex) : "";

                                eachComment = <>
                                    <span>{commentPart}<a className="text-info" href={url} target="_blank">{url}</a></span>
                                </>;
                            }

                            return (
                                <Comment
                                    //avatar={<i className="fa fa-commenting-o comment-icon text-primary" />}
                                    avatar={
                                        <Avatar style={{ color: '#f56a00', backgroundColor: '#fde3cf' }} >
                                            {commentedBy.slice(0, 1).toUpperCase()}
                                        </Avatar>
                                    }
                                    author={<span>
                                        <ByjusBadge variant="success" className="mr-1">{source}</ByjusBadge>
                                        <strong className="text-primary mr-1">{commentedBy}</strong>
                                        at {moment(commentedAt).format('LLL')}</span>}
                                    content={<p>
                                        {eachComment}
                                    </p>}
                                    key={idx}
                                />
                            )
                        })}
                    </div>
                }
            </>
        );
    }
}

const mapStateToProps = state => ({
    user: state.auth.user
});

MentionComment.propTypes = {
    link: P.string,
    onClickComment: P.func,
    style: P.object
}

export default connect(mapStateToProps)(MentionComment);