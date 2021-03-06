import { UserModule } from '@/store/modules/user';
import { DateTime } from '@/models/DateTime';
import api from './AxiosApi';
import { AxiosError } from 'axios';

export class LoggingDTO {
  id = 0;
  date = '';
  user = '';
  type = 0;
  application = '';
  applicationVersion = '';
  exceptionType = '';
  fonction = '';
  message = '';
  descriptionLongue = '';
  vu = false;
  dateVu = '';
  corriger = false;
  dateCorriger = '';
  commentaire = '';
}

export abstract class LoggingApi {
  static async add(log: LoggingDTO) {
    log.user = UserModule.username;
    await api.Logging.post<LoggingDTO>(`/Logging`, log);
  }

  static generateLog(err: any, vm: any, info: any): LoggingDTO {
    const logging = new LoggingDTO();
    logging.application = 'AcQua';
    logging.date = new DateTime().toJsonDateTime();
    logging.dateCorriger = DateTime.minValue().format('YYYY-MM-DD[T]HH:mm:ss');
    logging.dateVu = DateTime.minValue().format('YYYY-MM-DD[T]HH:mm:ss');
    logging.applicationVersion = '0.1';

    if (err?.isAxiosError) {
      LoggingApi.generateAxiosLog(err, logging);
    } else {
      logging.message = err.message;
      logging.descriptionLongue = err.stack?.toString() || '';
    }

    console.log('Error :\n', err);
    console.log('Component :\n', vm);
    console.log('Info :\n', info);

    LoggingApi.add(logging);
    return logging;
  }

  static generateAxiosLog(err: AxiosError, logging: LoggingDTO) {
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      logging.exceptionType = err.response.status.toString();
      logging.descriptionLongue += `\n Response data : \n${JSON.stringify(err.response.data)}`;
      logging.descriptionLongue += `\n Response headers : \n${JSON.stringify(err.response.headers)}`;
    } else if (err.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      logging.descriptionLongue += `\n Request : ${JSON.stringify(err.request)}`;
    } else {
      // Something happened in setting up the request that triggered an Error
      logging.descriptionLongue += `\n${err.message}`;
    }
    logging.fonction = `${err.config?.method?.toString()} ${err.config?.url?.toString()}`;
    logging.descriptionLongue += `\n Request config : \n${JSON.stringify(err.config)}`;
  }
}
