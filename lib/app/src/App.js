import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Drawer from 'material-ui/Drawer';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Flexbox from 'flexbox-react';

import AppBar from './components/appbar';
import Menu from './components/menu';
import Spinner from './components/spinner';
import EmptyError from './components/error_empty';
import ServerError from './components/error_server';
import NotSupportedError from './components/error_not_supported';
import BugError from './components/error_bug';
import IssueError from './components/error_issue';
import Markdown from './components/markdown';
import Package from './components/package';

import './App.css';
import 'github-markdown-css/github-markdown.css';

const API_URL = `${window.location.protocol}//${window.location.hostname}:${process.env.REACT_APP_PROXY_PORT}/api`;

class Content extends React.Component {

  state = {
    loading: false,
    content: {},
    error: 0,
    errorDetails: "",
    resource: "",
    sections: []
  };

  componentDidMount() {
    fetch(`${API_URL}/config`)
      .then(response => response.json())
      .then(response => {
        this.setState({
          sections: response.sections
        });
      })
      .catch(error => {
        this.onError(1, 'Can\'t fetch the data. Make sure the server is running.');
      });
  }

  loadItemResource = (resource) => {
    this.onLoadStarted(resource);
    this.onError(0);

    fetch(`${API_URL}/resource?res=${encodeURIComponent(resource)}`)
      .then(response => response.json())
      .then(response => {
        this.onContentLoaded(response);
      })
      .catch(error => {
        this.onError(1, 'Can\'t fetch the data. Make sure the server is running.');
      });
  };

  onContentLoaded = (content) => {
    if (content.resource === this.state.resource) {
      this.setState({
        content: content,
        loading: false,
        error: 0
      });
    }
  };

  onLoadStarted = (resource) => {
    this.setState({
      loading: true,
      resource
    });
  };

  onError = (code, details) => {
    if (code !== 0) {
      this.setState({
        error: code,
        errorDetails: details,
        loading: false
      });
    } else {
      this.setState({
        error: code
      });
    }
  };

  renderError = () => {
    switch (this.state.error) {
      case 1:
        return <ServerError details={this.state.errorDetails} />;
      case 2:
        return <NotSupportedError details={this.state.errorDetails} />;
      default:
        return <BugError details={this.state.errorDetails} />;
    }
  };

  renderEmpty = () => {
    return <EmptyError details="No content for this resource" />;
  };

  renderIssue = (status) => {
    return <IssueError details={`Something is wrong: ${status}`} />;
  };

  renderLocal = () => {
    if (!this.state.content.contents) {
      return this.renderEmpty();
    } else if (this.state.content.status >= 400) {
      return this.renderIssue(this.state.content.contents);
    }
    return <Markdown className="markdown-body" text={this.state.content.contents} />;
  };

  renderPackage = () => {
    if (!this.state.content.contents) {
      return this.renderEmpty();
    }

    return (
      <Package
        info={this.state.content}
        loadFunc={this.loadItemResource}
      />
    );
  };

  renderContent = () => {
    if (!this.state.content.type) {
      return null;
    }

    switch (this.state.content.type) {
      case 'local':
      case 'external':
        return this.renderLocal();
      case 'package':
          return this.renderPackage();
      default:
        return this.onError(2, `Resource type is not supported: ${this.state.content.type}`);
    }
  };

  render() {
    return(
      <div style={{height: '100%'}}>
        <AppBar />
        <Drawer width={400} open containerStyle={{top: this.props.muiTheme.appBar.height}}>
          <Menu
            currentResource={this.state.resource}
            loadFunc={this.loadItemResource}
            sections={this.state.sections}
          />
        </Drawer>
        <div
          style={{
            marginLeft: '400px',
            position: 'relative',
            height: `calc(100% - ${this.props.muiTheme.appBar.height}px)`,
            paddingTop: this.props.muiTheme.appBar.height
          }}
        >
          {this.state.loading && <Spinner />}
            <Flexbox style={{ minHeight: "100%" }} flexDirection="column">
              {this.state.error ? this.renderError() : this.renderContent()}
            </Flexbox>
        </div>
      </div>
    );
  }
}

const ContentNode = muiThemeable()(Content);

class App extends React.Component {
  render() {
    const theme = getMuiTheme();
    return (
      <MuiThemeProvider muiTheme={theme}>
        <ContentNode />
      </MuiThemeProvider>
    );
  }
}

export default App;
