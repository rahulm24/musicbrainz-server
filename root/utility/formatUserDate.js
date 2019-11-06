/*
 * @flow
 * This file is part of MusicBrainz, the open internet music database.
 * Copyright (C) 2015 MetaBrainz Foundation
 * Licensed under the GPL version 2, or (at your option) any later version:
 * http://www.gnu.org/licenses/gpl-2.0.txt
 */

import parseIsoDate from './parseIsoDate';

const formatterCache = new Map();

/*
 * This maps the `strftime` patterns we use to `Intl.DateTimeFormat` options.
 *
 * The object values below are in the form [typeName, options]. The typeName
 * identifies the exact subset of information we need to satisfy the pattern.
 * This is necessary because `DateTimeFormat` implementations are only
 * required to support a limited number of format combinations. [1] To work
 * around that, we use `formatToParts` and extract the specific part we want
 * using typeName as a key.
 *
 * Where typeName is null, we use `format` instead of `formatToParts`, since
 * we want the entire string. (In those cases, the specified options should
 * comprise a format combination that's always supported.)
 *
 * [1] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/
 *     Global_Objects/DateTimeFormat
 */

const patterns = {
  '%A': ['weekday', {weekday: 'long'}],
  '%B': ['month', {month: 'long'}],
  '%H': ['hour', {hour: '2-digit', hour12: false}],
  '%M': ['minute', {minute: '2-digit'}],
  '%S': ['second', {second: '2-digit'}],
  '%X': [null, {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }],
  '%Y': ['year', {year: 'numeric'}],
  '%Z': ['timeZoneName', {timeZoneName: 'short'}],
  '%a': ['weekday', {weekday: 'short'}],
  '%b': ['month', {month: 'short'}],
  '%c': [null, {
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    month: 'numeric',
    second: 'numeric',
    year: 'numeric',
  }],
  '%d': ['day', {day: '2-digit'}],
  '%e': ['day', {day: 'numeric'}],
  '%m': ['month', {month: '2-digit'}],
  '%x': [null, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }],
};

let HAS_INTL_DATETIMEFORMAT = true;

try {
  const now = new Date();
  formatDateUsingPattern(now, '%a', 'America/Chicago', 'en-US');
  formatDateUsingPattern(now, '%c', 'America/Chicago', 'en-US');
} catch (e) {
  HAS_INTL_DATETIMEFORMAT = false;
}

function formatDateUsingPattern(
  date: Date,
  pattern: string,
  timezone: string,
  locale: string,
) {
  const [property, options] = patterns[pattern];
  const cacheKey = pattern + '-' + timezone + '-' + locale;
  let formatter = formatterCache.get(cacheKey);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(
      locale,
      Object.assign({timeZone: timezone}, options),
    );
    formatterCache.set(formatter);
  }
  if (property) {
    const result = formatter.formatToParts(date);
    for (let i = 0; i < result.length; i++) {
      const part = result[i];
      if (part.type === property) {
        return part.value;
      }
    }
    return '';
  }
  return formatter.format(date);
}

type FormatUserDateOptions = {
  dateOnly?: boolean,
  format?: string,
  timezone?: string,
};

export function formatUserDateObject(
  $c: ?(CatalystContextT | SanitizedCatalystContextT),
  date: Date,
  options?: FormatUserDateOptions,
) {
  if (!HAS_INTL_DATETIMEFORMAT) {
    return date.toString();
  }

  const preferences = $c && $c.user ? $c.user.preferences : null;
  const timezone =
    (options && options.timezone) ||
    (preferences && preferences.timezone) ||
    'UTC';
  let format =
    (options && options.format) ||
    (preferences && preferences.datetime_format) ||
    '%Y-%m-%d %H:%M %Z';

  if (options && options.dateOnly) {
    format = format.replace('%c', '%x');
    format = format.replace(/%H:%M(:%S)?/, '');
    format = format.replace('%Z', '');
    format = format.replace(/,\s*$/, '');
    format = format.trim();
  }

  const bcp47Language = $c
    ? $c.stash.current_language.replace('_', '-')
    : 'default';

  return format.replace(/%[ABHMSXYZabcdemx]/g, function (pattern) {
    return formatDateUsingPattern(date, pattern, timezone, bcp47Language);
  });
}

export default function formatUserDate(
  $c: ?(CatalystContextT | SanitizedCatalystContextT),
  dateString: string,
  options?: FormatUserDateOptions,
) {
  const date = parseIsoDate(dateString);

  if (!date) {
    return '';
  }

  return formatUserDateObject($c, date, options);
}
