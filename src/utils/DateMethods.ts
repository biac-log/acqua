import moment from 'moment';

export const isBetween = (date: string, dateMin: string, dateMax: string): boolean => {
  const momentDate = moment(date, 'DD/MM/YYYY');
  const momentDateMin = moment(dateMin, 'DD/MM/YYYY');
  const momentDateMax = moment(dateMax, 'DD/MM/YYYY');

  return momentDate.isSameOrAfter(momentDateMin) && momentDate.isSameOrBefore(momentDateMax);
};

export const isBefore = (date: string, dateMax: string): boolean => {
  const momentDate = moment(date, 'DD/MM/YYYY');
  const momentDateMax = moment(dateMax, 'DD/MM/YYYY');

  return momentDate.isBefore(momentDateMax);
};

export const isAfter = (date: string, dateMin: string): boolean => {
  const momentDate = moment(date, 'DD/MM/YYYY');
  const momentDateMin = moment(dateMin, 'DD/MM/YYYY');

  return momentDate.isAfter(momentDateMin);
};

export const isSameOrBefore = (date: string, dateMax: string): boolean => {
  const momentDate = moment(date, 'DD/MM/YYYY');
  const momentDateMax = moment(dateMax, 'DD/MM/YYYY');
  return momentDate.isSameOrBefore(momentDateMax);
};

export const isSameOrAfter = (date: string, dateMin: string): boolean => {
  const momentDate = moment(date, 'DD/MM/YYYY');
  const momentDateMin = moment(dateMin, 'DD/MM/YYYY');

  return momentDate.isSameOrAfter(momentDateMin);
};

export const isValid = (date: string, format = 'DD/MM/YYYY'): boolean => {
  return moment(date, format).isValid();
};

export const getToday = (format = 'DD/MM/YYYY'): string => {
  return moment().format(format);
};

export const getFormated = (date: string, format = 'DD/MM/YYYY'): string => {
  if (moment(date, format).isValid()) return date;
  else return moment(date).format(format);
};

export const toUniversal = (date: string, format = 'DD/MM/YYYY'): string => {
  return moment(date, format).format('YYYY-MM-DD');
};
