export class PromiseResponseDTO<T> {
    public triggerEvent = false;
    public data!: T;
  }
  
  export class PromiseResponse<T> extends PromiseResponseDTO<T> {
    constructor(data: T, triggerEvent: boolean) {
      super();
      this.triggerEvent = triggerEvent;
      this.data = data;
    }
  }
  