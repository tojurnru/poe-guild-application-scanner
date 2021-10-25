import { AxiosError, AxiosResponse } from 'axios';

import logger from '../controllers/logger';

export const axiosErrorHandler = (error: AxiosError) => {
  const response = error.response as AxiosResponse;
  const dataStr = JSON.stringify(response.data, null, 2);
  logger.error(`Axios Request: ${response.config.url}`);
  logger.error(`Axios Response ${response.status}, Data: ${dataStr}`);
};
