/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
// @flow

import * as React from 'react';
import type {
  IndexIntoSamplesTable,
  CategoryList,
  Thread,
} from '../../types/profile';
import Backtrace from './Backtrace';

type Props = {|
  +sampleIndex: IndexIntoSamplesTable,
  +categories: CategoryList,
  +fullThread: Thread,
|};

/**
 * This class displays the tooltip contents for a given sample. Typically the user
 * will want to know what the function is, and its category.
 */
export default class SampleTooltipContents extends React.PureComponent<Props> {
  render() {
    const { sampleIndex, fullThread, categories } = this.props;
    const { samples, stackTable } = fullThread;
    const stackIndex = samples.stack[sampleIndex];
    if (stackIndex === null) {
      return 'No stack information';
    }
    const categoryIndex = stackTable.category[stackIndex];
    const category = categories[categoryIndex];

    return (
      <>
        <div className="tooltipDetails">
          <div className="tooltipLabel">Category:</div>
          <div>
            <span
              className={`category-swatch category-color-${category.color}`}
            />
            {category.name}
          </div>
        </div>
        <div className="tooltipDetails">
          <div className="tooltipLabel">Stack:</div>
        </div>
        <Backtrace
          maxHeight="9.2em"
          stackIndex={stackIndex}
          thread={fullThread}
          implementationFilter="combined"
        />
      </>
    );
  }
}
