import React from 'react';
import Icon from 'material-ui/svg-icons/action/thumb-down';

export default class Error extends React.Component {
  render() {
    return (
      <div
        style={{
          position: 'absolute',
          transform: 'none',
          left: '50%',
          top: '50%',
          margin: '-100px 0 0 -150px',
          width: '300px',
          color: "#CCC",
          textAlign: 'center'
        }}
      >
        <Icon
          color="#EEE"
          style={{
            height: '200px',
            width: '200px'
          }}
        />
        <span
          style={{
            color: "#CCC",
            display: 'block',
            fontSize: '24px',
            marginTop: '20px'
          }}
        >
          {this.props.details}
        </span>
      </div>
    );
  }
}