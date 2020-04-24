import moment from "moment";
import { DateTime } from '@/models/DateTime';

export const numberToString = (number: number, nbDecimal: number) => {
  if(!nbDecimal) nbDecimal = 2;
  
  if(!number) return ''; 
  else return number.toFixed(nbDecimal);
}

export const dateToString = (dateTime: Date, format: string) => {
  if(!format) format = "DD/MM/YYYY";
  if(!dateTime) return '';
  return  moment(dateTime).format(format);
}

export const dateTimeToString = (dateTime: DateTime, format: string) => {
  return dateTime.toString(format);
}