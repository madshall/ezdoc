import React from 'react';
import Markdown from 'markdown-react-js';

var handleIterate = function(Tag, props, children) {
  switch(Tag) {
    case 'table':
      props.className = 'table table-striped';
      break;
    default:
      break;
  }
  return <Tag {...props}>{children}</Tag>;
};

export default class MD extends React.Component {

  render() {
    return (
      <Markdown
        text={this.props.text}
        className={this.props.className}
        onIterate={handleIterate}
        markdownOptions={{
          html: true,
          linkify: true,
          typographer: true
        }}
      />
    )
  }
};
