/*
 * @flow
 * Copyright (C) 2015–2016 MetaBrainz Foundation
 *
 * This file is part of MusicBrainz, the open internet music database,
 * and is licensed under the GPL version 2, or (at your option) any
 * later version: http://www.gnu.org/licenses/gpl-2.0.txt
 */

import ko from 'knockout';

import formatDate from './formatDate';

function formatDatePeriod<+T: {...DatePeriodRoleT, ...}>(entity: T) {
  let {begin_date, end_date, ended} = entity;

  begin_date = formatDate(begin_date);
  end_date = formatDate(end_date);
  ended = (ko.unwrap(ended): boolean);

  if (!begin_date && !end_date) {
    return ended ? l(' \u2013 ????') : '';
  }

  if (begin_date === end_date) {
    return begin_date;
  }

  if (begin_date && end_date) {
    return texp.l('{begin_date} \u2013 {end_date}', {begin_date, end_date});
  }

  if (!begin_date) {
    return texp.l('\u2013 {end_date}', {end_date});
  }

  if (!end_date) {
    return ended
      ? texp.l('{begin_date} \u2013 ????', {begin_date})
      : texp.l('{begin_date} \u2013', {begin_date});
  }

  return '';
}

export default formatDatePeriod;
