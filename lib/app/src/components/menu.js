import React from 'react';
import { List, ListItem } from 'material-ui/List';
import { fade } from "material-ui/utils/colorManipulator";
import FontIcon from 'material-ui/FontIcon';
import muiThemeable from 'material-ui/styles/muiThemeable';

class ExternalLink extends React.Component {
  render() {
    return (
      <span>
        {this.props.children}
        <FontIcon
          className="material-icons"
          style={{
            fontSize: 'inherit',
            marginLeft: '6px',
            position: 'absolute',
            marginTop: '-4px'
          }}>launch</FontIcon>
      </span>
    );
  }
}

class ItemClass extends React.Component {

  constructor(props) {
    super(props);

    this.subtree = [];
    const getSubtree = (node, path = '') => {
      if (node.title) {
        path = [path, node.title].join('/');
      }
      this.subtree.push(path);
      if (node.children) {
        node.children.forEach((item) => {
          getSubtree(item, path);
        });
      }
    };
    getSubtree(props.item);
  }

  componentWillMount() {
    if (!window.location.hash && this.props.item.default) {
      this.loadItemResource();
    }

    if (this.getPathFromHash() === this.props.path && this.props.item.resource !== this.props.currentResource) {
      this.loadItemResource();
    }
  }

  getPathFromHash = () => window.location.hash.replace(/^#/, '');

  onClick = () => {
    if (!this.props.item.resource) {
      return;
    }
    this.props.onClick(this.props.path);

    this.loadItemResource();
  };

  loadItemResource = () => {
    this.props.loadFunc(this.props.item.resource);
    if (this.props.item.default) {
      window.location.hash = '';
      if (window.history && window.history.pushState) {
        window.history.pushState("", document.title, window.location.pathname
          + window.location.search);
      }
    } else if (this.props.path) {
      window.location.hash = this.props.path;
    }
  };

  render() {
    const item = this.props.item;
    return (
      item.link
        ?
          <a href={item.link} style={{textDecoration: 'none', color: 'inherit'}}>
            <ListItem
              primaryText={<ExternalLink>{item.title}</ExternalLink>}
            />
          </a>
        :
          <ListItem
            value={this.props.path}
            initiallyOpen={this.getPathFromHash() ? this.subtree.indexOf(this.getPathFromHash()) > -1 : item.default}
            primaryText={item.title}
            onClick={this.onClick}
            primaryTogglesNestedList={item.children && item.children.length ? true : false}
            innerDivStyle={{
              ...this.props.style,
              background: this.props.path === this.props.activeItemPath
                ? fade(this.props.muiTheme.palette.textColor, 0.2)
                : 'transparent'
            }}
            nestedItems={(item.children || []).map((nestedItem, key) => {
              const path = [this.props.path, nestedItem.title].join('/');
              return (
                <Item
                  key={key}
                  item={nestedItem}
                  currentResource={this.props.currentResource}
                  path={path}
                  activeItemPath={this.props.activeItemPath}
                  onClick={this.props.onClick}
                  style={{paddingLeft: '32px'}}
                  loadFunc={this.props.loadFunc}
                />
              );
            })}
          />
    );
  }
}

const Item = muiThemeable()(ItemClass);

export default class Menu extends React.Component {

  state = {
    activeItemPath: window.location.hash.replace(/^#/, '')
  };

  onItemClick = (path) => {
    this.setState({
      activeItemPath: path
    });
  };

  render() {
    return (
      <List>
        {this.props.sections.map((item, key) => {
          const path = ['', item.title].join('/');
          return (
            <Item
              key={key}
              item={item}
              currentResource={this.props.currentResource}
              path={path}
              activeItemPath={this.state.activeItemPath}
              onClick={this.onItemClick}
              loadFunc={this.props.loadFunc}
            />
          );
        })}
      </List>
    );
  }
}