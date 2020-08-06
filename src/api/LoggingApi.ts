import Axios, { AxiosError } from "axios";
import { UserModule } from "@/store/modules/user";
import { DateTime } from '@/models/DateTime';

export class LoggingDTO {
  id: number = 0;
  date: string = "";
  user: string = "";
  type: number = 0;
  application: string = "";
  applicationVersion: string = "";
  exceptionType: string = "";
  fonction: string = "";
  message: string = "";
  descriptionLongue: string = "";
  vu: boolean = false;
  dateVu: string = "";
  corriger: boolean = false;
  dateCorriger: string = "";
  commentaire: string = "";
}

export abstract class LoggingApi {
  private static axios = Axios.create();

  static async add(log: LoggingDTO) {
    log.user= UserModule.username;
    await this.axios.post<LoggingDTO>(`${process.env.VUE_APP_ApiLogging}/Logging`, log);
  }

  static generateLog(err: any, vm : any, info : any): LoggingDTO {
    let logging = new LoggingDTO();
    logging.application = "AcQua";
    logging.date = new DateTime().toJsonDateTime();
    logging.dateCorriger = DateTime.minValue().format("YYYY-MM-DD[T]HH:mm:ss");
    logging.dateVu = DateTime.minValue().format("YYYY-MM-DD[T]HH:mm:ss");
    logging.applicationVersion = "0.1";

    if(err?.isAxiosError){
      LoggingApi.generateAxiosLog(err, logging)
    }else{
      logging.message = err.message;
      logging.descriptionLongue = err.stack?.toString() || "";
    }

    console.log('Error :\n', err);
    console.log('Component :\n', vm);
    console.log('Info :\n', info);

    LoggingApi.add(logging);
    return logging;
  }

  static generateAxiosLog(err: AxiosError, logging : LoggingDTO){
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      logging.exceptionType = err.response.status.toString();
      logging.descriptionLongue += "\n Response data : \n" + JSON.stringify(err.response.data);
      logging.descriptionLongue += "\n Response headers : \n" +  JSON.stringify(err.response.headers);
    } else if (err.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      logging.descriptionLongue += "\n Request : " + JSON.stringify(err.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      logging.descriptionLongue += "\n" + err.message;
    }
    logging.fonction = `${err.config?.method?.toString()} ${err.config?.url?.toString()}`;
    logging.descriptionLongue += "\n Request config : \n" +  JSON.stringify(err.config);
  }
}
