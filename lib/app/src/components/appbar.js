import React from 'react';
import AppBar from 'material-ui/AppBar';

const TITLE = process.env.REACT_APP_TITLE;

export default class EZAppBar extends React.Component {
  render() {
    return(
      <AppBar
        title={TITLE}
        showMenuIconButton={false}
        style={{position: 'fixed'}}
      />
    );
  }
}