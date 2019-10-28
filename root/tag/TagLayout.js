/*
 * @flow
 * Copyright (C) 2018 MetaBrainz Foundation
 *
 * This file is part of MusicBrainz, the open internet music database,
 * and is licensed under the GPL version 2, or (at your option) any
 * later version: http://www.gnu.org/licenses/gpl-2.0.txt
 */

import * as React from 'react';

import Tabs from '../components/Tabs';
import Layout from '../layout';
import TagLink from '../static/scripts/common/components/TagLink';

type Props = {
  +children: React.Node,
  +page: string,
  +tag: string,
  +title?: string,
};

const tabLinks: $ReadOnlyArray<[string, () => string]> = [
  ['', N_l('Overview')],
  ['/artist', N_l('Artists')],
  ['/release-group', N_l('Release Groups')],
  ['/release', N_l('Releases')],
  ['/recording', N_l('Recordings')],
  ['/work', N_l('Works')],
  ['/label', N_l('Labels')],
  ['/place', N_l('Places')],
  ['/area', N_l('Areas')],
  ['/instrument', N_l('Instruments')],
  ['/series', N_lp('Series', 'plural')],
  ['/event', N_l('Events')],
];

const TagLayout = ({children, page, tag, title}: Props) => (
  <Layout
    fullWidth
    title={
      title
        ? hyphenateTitle(texp.l('Tag “{tag}”', {tag}), title)
        : texp.l('Tag “{tag}”', {tag})
    }
  >
    <div id="content">
      <h1>
        {exp.l('Tag “{tag}”', {tag: <TagLink tag={tag} />})}
      </h1>
      <Tabs>
        {tabLinks.map(link => (
          <li className={page === link[0] ? 'sel' : ''} key={link[0]}>
            <a href={'/tag/' + encodeURIComponent(tag) + link[0]}>
              {link[1]()}
            </a>
          </li>
        ))}
      </Tabs>
      {children}
    </div>
  </Layout>
);

export default TagLayout;
