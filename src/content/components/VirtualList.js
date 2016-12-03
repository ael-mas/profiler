import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';

class VirtualListRow extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  render() {
    const { renderItem, item, index } = this.props;
    return renderItem(item, index);
  }
}

VirtualListRow.propTypes = {
  renderItem: PropTypes.func.isRequired,
  item: PropTypes.any.isRequired,
  index: PropTypes.number.isRequired,
  isSpecial: PropTypes.bool,
};

class VirtualListInner extends Component {
  constructor(props) {
    super(props);
    this._containerCreated = e => { this._container = e; };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  getBoundingClientRect() {
    if (this._container) {
      return this._container.getBoundingClientRect();
    }
    return new window.DOMRect();
  }

  render() {
    const { itemHeight, className, renderItem, items, specialItems, visibleRangeStart, visibleRangeEnd } = this.props;

    return (
      <div className={className}
           ref={this._containerCreated}
            style={{
              height: `${items.length * itemHeight}px`,
              width: '3000px',
            }}>
        <div className={`${className}TopSpacer`}
             key={-1}
             style={{height: Math.max(0, visibleRangeStart) * itemHeight + 'px'}} />
        {
          items.map((item, i) => {
            if (i < visibleRangeStart || i >= visibleRangeEnd) {
              return null;
            }
            return <VirtualListRow key={i} index={i} renderItem={renderItem} item={item} items={items} isSpecial={specialItems.includes(item)}/>;
          })
        }
      </div>
    );
  }
}

VirtualListInner.propTypes = {
  itemHeight: PropTypes.number.isRequired,
  className: PropTypes.string,
  renderItem: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
  specialItems: PropTypes.array.isRequired,
  visibleRangeStart: PropTypes.number.isRequired,
  visibleRangeEnd: PropTypes.number.isRequired,
};

class VirtualList extends Component {

  constructor(props) {
    super(props);
    this._onScroll = this._onScroll.bind(this);
    this._visibleRange = this.computeVisibleRange();
  }

  componentDidMount() {
    this.refs.container.addEventListener('scroll', this._onScroll);
    this._onScroll(); // for initial size
  }

  componentWillUnmount() {
    this.refs.container.removeEventListener('scroll', this._onScroll);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  _onScroll() {
    this._visibleRange = this.computeVisibleRange();
    this.forceUpdate();
  }

  computeVisibleRange() {
    const { itemHeight, disableOverscan } = this.props;
    if (!this.refs.container) {
      return { visibleRangeStart: 0, visibleRangeEnd: 100 };
    }
    const outerRect = this.refs.container.getBoundingClientRect();
    const innerRectY = this.refs.inner.getBoundingClientRect().top;
    const overscan = disableOverscan ? 0 : 25;
    const chunkSize = 16;
    let visibleRangeStart = Math.floor((outerRect.top - innerRectY) / itemHeight) - overscan;
    let visibleRangeEnd = Math.ceil((outerRect.bottom - innerRectY) / itemHeight) + overscan;
    if (!disableOverscan) {
      visibleRangeStart = Math.floor(visibleRangeStart / chunkSize) * chunkSize;
      visibleRangeEnd = Math.ceil(visibleRangeEnd / chunkSize) * chunkSize;
    }
    return { visibleRangeStart, visibleRangeEnd };
  }

  scrollItemIntoView(itemIndex, offsetX) {
    if (!this.refs.container) {
      return;
    }
    const itemTop = itemIndex * this.props.itemHeight;
    const itemBottom = itemTop + this.props.itemHeight;
    const { container } = this.refs;

    if (container.scrollTop > itemTop) {
      container.scrollTop = itemTop;
    } else if (container.scrollTop + container.clientHeight < itemBottom) {
      container.scrollTop = Math.min(itemTop, itemBottom - container.clientHeight);
    }

    const interestingWidth = 400;
    const itemLeft = offsetX;
    const itemRight = itemLeft + interestingWidth;

    if (container.scrollLeft > itemLeft) {
      container.scrollLeft = itemLeft;
    } else if (container.scrollLeft + container.clientWidth < itemRight) {
      container.scrollLeft = Math.min(itemLeft, itemRight - container.clientWidth);
    }
  }

  focus() {
    this.refs.container.focus();
  }

  render() {
    const { itemHeight, className, renderItem, items, focusable, specialItems, onKeyDown } = this.props;
    const { visibleRangeStart, visibleRangeEnd } = this._visibleRange;
    return (
      <div className={className} ref='container' tabIndex={ focusable ? 0 : -1 } onKeyDown={onKeyDown}>
        <VirtualListInner className={`${className}Inner`}
                          visibleRangeStart={Math.max(0, visibleRangeStart)}
                          visibleRangeEnd={Math.min(items.length, visibleRangeEnd)}
                          itemHeight={itemHeight}
                          renderItem={renderItem}
                          items={items}
                          specialItems={specialItems}
                          ref='inner' />
      </div>
    );
  }

}

VirtualList.propTypes = {
  itemHeight: PropTypes.number.isRequired,
  className: PropTypes.string,
  renderItem: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
  focusable: PropTypes.bool.isRequired,
  specialItems: PropTypes.array.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  disableOverscan: PropTypes.bool,
};

export default VirtualList;
