import React from 'react';
import LinearProgress from 'material-ui/LinearProgress';

export default class Spinner extends React.Component {
  render() {
    return (
      <LinearProgress mode="indeterminate" style={{background: 'transparent', position: 'fixed'}}/>
    );
  }
}