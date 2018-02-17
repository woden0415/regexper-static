import React from 'react';
import PropTypes from 'prop-types';

import Base from './Base';
import style from './style';

/** @extends React.PureComponent */
class Box extends Base {
  static defaultProps = {
    padding: 5,
    radius: 3
  }

  preReflow() {
    return this.contained;
  }

  reflow() {
    return new Promise(resolve => {
      const { padding, useAnchors } = this.props;
      const box = this.contained.getBBox();
      const labelBox = this.label ? this.label.getBBox() : { width: 0, height: 0};

      this.setBBox({
        width: Math.max(box.width + 2 * padding, labelBox.width),
        height: box.height + 2 * padding + labelBox.height,
        axisY: (useAnchors ? box.axisY : box.height / 2) + padding + labelBox.height,
        axisX1: useAnchors ? box.axisX1 + padding : 0,
        axisX2: useAnchors ? box.axisX2 + padding : box.width + 2 * padding
      });

      this.setState({
        width: this.getBBox().width,
        height: box.height + 2 * padding,
        contentTransform: `translate(${ padding } ${ padding + labelBox.height })`,
        rectTransform: `translate(0 ${ labelBox.height })`,
        labelTransform: `translate(0 ${ labelBox.height })`
      }, resolve);
    });
  }

  containedRef = contained => this.contained = contained

  labelRef = label => this.label = label

  render() {
    const { type, radius, label, children } = this.props;
    const { width, height, labelTransform, rectTransform, contentTransform } = this.state || {};

    const rectProps = {
      style: type ? style[type] : {},
      width,
      height,
      rx: radius,
      ry: radius,
      transform: rectTransform
    };
    const textProps = {
      transform: labelTransform,
      style: style.infoText,
      ref: this.labelRef
    };

    return <React.Fragment>
      <rect { ...rectProps } ></rect>
      { label && <text { ...textProps }>{ label }</text> }
      <g transform={ contentTransform }>
        { React.cloneElement(React.Children.only(children), {
          ref: this.containedRef
        }) }
      </g>
    </React.Fragment>;
  }
}

Box.propTypes = {
  children: PropTypes.node,
  label: PropTypes.string,
  padding: PropTypes.number,
  useAnchors: PropTypes.bool,
  radius: PropTypes.number,
  type: PropTypes.string
};

export default Box;