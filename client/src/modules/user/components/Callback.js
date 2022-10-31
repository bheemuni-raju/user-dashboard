import React, { Component } from 'react';

class Callback extends Component {
  render() {
    console.log('Callback called');
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white'
        }}
      >
        <i className="fa fa-refresh fa-spin fa-2x" />
      </div>
    );
  }
}

export default Callback;