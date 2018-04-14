import React from 'react';
import PropTypes from 'prop-types';
import Markdown from './markdown';
import Flexbox from 'flexbox-react';
import lodash from 'lodash';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {Card, CardHeader, CardText} from 'material-ui/Card';

class PackageInfoItemThemeable extends React.Component {
  render() {
    return (
      <Card
        style={{ boxShadow: "none", width: "100%" }}
      >
        <CardHeader
          title={this.props.title}
          subtitle={this.props.subtitle}
          actAsExpander={this.props.list}
          showExpandableButton={this.props.list}
          textStyle={{ padding: 0, width: "100%" }}
          style={{ padding: "16px 0px 0px 0px", width: "100%" }}
          titleStyle={{ marginBottom: "10px", padding: "0px" }}
        />
        {this.props.children &&
        <CardText
          expandable={this.props.list}
          style={{ paddingTop: "0px", color: this.props.muiTheme.card.subtitleColor }}
        >
          {this.props.children}
        </CardText>
        }
      </Card>
    );
  }
}

const PackageInfoItem = muiThemeable()(PackageInfoItemThemeable);

class Person extends React.Component {
  render() {
    return (
      <div>
        <div>
          {this.props.name || this.props.email}
        </div>
        {this.props.name &&
        <div style={{ textAlign: "right" }}>
          {this.props.email}
        </div>
        }
      </div>
    );
  }
}


export default class Package extends React.Component {
  static propTypes = {
    info: PropTypes.shape({
      contents: PropTypes.string
    }).isRequired,
    loadFunc: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      version: props.info.version
    };
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      version: newProps.info.version
    });
  }

  handleVersionChange = (e, index, version) => {
    this.setState({
      version: version
    });
    this.props.loadFunc(`${this.props.info.name}@${version}`);
  };

  render() {
    const versions = lodash.get(this.props, "info.versions", []).reverse();
    const author = lodash.get(this.props, "info.author", {});
    const maintainers = lodash.get(this.props, "info.maintainers", []);
    const contributors = lodash.get(this.props, "info.contributors", []);
    const lastModified = lodash.get(this.props, "info.time.modified", null);

    return (
      <Flexbox direction="row" width="100%" height="100%" flexGrow={1}>
        <Flexbox flexGrow={1}>
          <Markdown className="markdown-body" text={this.props.info.contents} />
        </Flexbox>
        <Flexbox
          width="300px"
          minWidth="300px"
          maxWidth="300px"
          flexDirection="column"
          style={{
            boxShadow: "rgba(0, 0, 0, 0.16) 0px 3px 10px",
            padding: "16px 32px",
            boxSizing: "border-box"
          }}
        >
          <PackageInfoItem
            title="Versions"
            subtitle={this.props.info.version}
            list
          >
            {versions.map(_ => <div key={_} style={{ lineHeight: "20px" }}>{_}</div>)}
          </PackageInfoItem>
          {author.name &&
            <PackageInfoItem
              title="Author"
              subtitle={<Person name={author.name} email={author.email} />}
            >
            </PackageInfoItem>
          }
          {maintainers.length
            ?
            <PackageInfoItem
              title="Maintainers"
              subtitle={maintainers.length}
              list
            >
              {maintainers.map((_, i) => <Person key={`${_.name}${_.email}${i}`} name={_.name} email={_.email} />)}
            </PackageInfoItem>
            : null
          }
          {contributors.length
            ?
            <PackageInfoItem
              title="Contributors"
              subtitle={contributors.length}
              list
            >
              {contributors.map((_, i) => <Person key={`${_.name}${_.email}${i}`} name={_.name} email={_.email} />)}
            </PackageInfoItem>
            : null
          }
          {lastModified &&
          <PackageInfoItem
            title="Last modified"
            subtitle={(new Date(lastModified)).toLocaleDateString()}
          >
          </PackageInfoItem>
          }
          {this.props.info.license &&
          <PackageInfoItem
            title="License"
            subtitle={this.props.info.license}
          >
          </PackageInfoItem>
          }
        </Flexbox>
      </Flexbox>
    );
  }
}