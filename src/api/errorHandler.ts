import { AxiosError, AxiosResponse } from 'axios';

class SimpleAxiosError extends Error {
  response: AxiosResponse;

  constructor(msg: string, _response: AxiosResponse) {
    super(msg);
    this.response = _response;
    Object.setPrototypeOf(this, SimpleAxiosError.prototype);
  }
}

export const axiosErrorHandler = (error: AxiosError) => {
  const response = error.response as AxiosResponse;
  throw new SimpleAxiosError(error.message, response);
};
