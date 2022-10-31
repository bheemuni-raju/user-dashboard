import React, { Component } from "react";
import PropTypes from "prop-types";
import { emojify } from "node-emoji";

import ModalWindow from "components/modalWindow";

const propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  fixed: PropTypes.bool,
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
};
   
const defaultProps = {
  tag: "footer",
  fixed: false,
};

const SemanticTag = ({ tag = "0.0.0", openTagHandler }) => {
  return (
    <>
      <div style={{ position: "relative", left: "5.25%" }}>
        <a
          href="javascript:void(0);"
          syyle="position: relative; left: 10%;"
          onClick={openTagHandler}
        >
          {tag}
        </a>
      </div>
    </>
  );
};

const ReleaseNotes = ({ releaseNotes }) => {
  return (  
    <>
      {releaseNotes &&
        Array.isArray(releaseNotes) &&
        releaseNotes.length > 0 &&
        releaseNotes.map(function (item, key) {
          item = item.trim();
          // item = item.replace(/(:.*?:)/g,""+emojiName.get('\$1'))
          if (
            item == "Bug Fixes" ||
            item == "Features" ||
            item == "Breaking Changes"
          ) {
            return <h4  key={key} style={{fontWeight:"bold"}}>{item}</h4>;
          }
          return <p key={key}>{emojify(item)}</p>;
        })}
    </>
  );
};

class SemanticVersion extends Component {
  constructor(props) {
    super(props);
    this.state = { tag: null, releaseNotes: [], isReleaseModal: false };
    this.openTagHandler = this.openTagHandler.bind(this);
    this.closeTagModal = this.closeTagModal.bind(this);
  }

  componentDidMount() {
    this.getReleaseTagAndNotes();
  }

  async getReleaseTagAndNotes() {
    try {
      let response = await fetch(
        `https://7n0k67xxm7.execute-api.ap-south-1.amazonaws.com/dev/releaseNote`,
        {
          headers: {},
        }
      );
      response = await response.json();

      this.setState({
        tag: response.tag || null,
        releaseNotes: response.resbody || null,
      });
    } catch (error) {
      console.log("fetch error", error);
    }
  }

  openTagHandler() {
    this.setState({ isReleaseModal: true });
  }

  closeTagModal() {
    this.setState({ isReleaseModal: false });
  }

  render() {
    const { tag, releaseNotes, isReleaseModal } = this.state;
    const headerMessage = `Release Notes ${tag}`;
    const version = tag ? `@${tag}` : null;
    return (
      <>
        <SemanticTag openTagHandler={this.openTagHandler} tag={version} />
        {isReleaseModal ? (
          <ModalWindow
            showModal={isReleaseModal}
            closeModal={this.closeTagModal}
            heading={headerMessage}
            size="md"
          >
            {/* <h2>New release {tag} &#128640;</h2> */}
            <ReleaseNotes releaseNotes={releaseNotes} />
          </ModalWindow>
        ) : null}
      </>
    );
  }
}

SemanticVersion.propTypes = propTypes;
SemanticVersion.defaultProps = defaultProps;

export default SemanticVersion;
