import moment from 'moment';

export const momentLocal = moment;
export const momentUTC = moment.utc;

export const IsEmpty = (value: any) => {
  // if(Object.keys(value).length === 0 && Object.getPrototypeOf(value) === Object.prototype)
  // console.log('isEmpty:', Object.getPrototypeOf(value));
  return (value == null || value.length === 0 || Object.getPrototypeOf(value) === null);
};

export const IsNonEmptyString = (str: string) => {
  return typeof str === 'string' && !!str.trim();
};

export const IsNumeric = (num: any) => {
  // eslint-disable-next-line no-restricted-globals
  return !isNaN(num);
};

export const optJSONParse = (data: string, defaultValue: any) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    return defaultValue;
  }
};
