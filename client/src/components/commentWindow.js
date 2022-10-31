import React from 'react';
import { Modal, Button, Comment, Avatar, Form, List, Input } from 'antd';
import moment from 'moment';

import LoadingWrapper from './LoadingWrapper';

class commentWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
  }

  render() {
    const { showModal, comments, loading, children, closeModal } = this.props;

    return (
      <>
        <Modal
          bodyStyle={{'overflow-y': 'auto','height': '70vh'}}
          title="Comments"
          visible={showModal}
          onCancel={closeModal}
          okButtonProps={{ hidden: true }}
          cancelButtonProps={{ hidden: true }}>
          <LoadingWrapper loading={loading}>
            { comments && comments.map(ele => {
              return (
                <>
                  <Comment
                    author={ele.commentedBy}
                    avatar={
                      <Avatar style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
                        {ele.commentedBy.slice(0, 1).toUpperCase()}
                      </Avatar>
                    }
                    content={
                      <p>{ele.comment}</p>
                    }
                    datetime={ele.commentedAt ? moment(ele.commentedAt).fromNow() : 'NA'}
                    />
                </>
              )
            })}
            {children}
          </LoadingWrapper>
        </Modal>
      </>
    );
  }
}

export default commentWindow;