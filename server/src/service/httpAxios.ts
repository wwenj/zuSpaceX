import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  AxiosResponse,
} from 'axios';
import * as FormData from 'form-data';

/**
 * 创建 Axios 实例
 */
const axiosInstance: AxiosInstance = axios.create({
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求错误处理
 * @param error AxiosError
 */
function handleRequestError(error: AxiosError) {
  if (error.response) {
    // 创建新的错误对象，但保留原始的status和response信息
    const customError = new Error(
      `Request failed with status ${error.response.status}: ${
        error.response.data || 'No details'
      }`,
    );
    // 保留原始的response信息，以便上游能够检查status
    (customError as any).response = error.response;
    (customError as any).status = error.response.status;
    throw customError;
  } else if (error.request) {
    throw new Error('No response received from server');
  } else {
    throw new Error(`Request setup failed: ${error.message}`);
  }
}

/**
 * 通用请求方法
 * @param method HTTP 方法
 * @param url 请求 URL
 * @param data 请求体或参数
 * @param headers 自定义请求头
 * @param config 额外 Axios 配置
 */
async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any,
  headers?: Record<string, string>,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    // 检查 data 是否是 FormData 类型
    const isFormData = data && data instanceof FormData;

    const response: AxiosResponse<T> = await axiosInstance.request({
      url,
      method,
      data: isFormData
        ? data
        : ['POST', 'PUT'].includes(method)
          ? data
          : undefined,
      params: ['GET', 'DELETE'].includes(method) ? data : undefined,
      headers: {
        ...headers,
        ...(isFormData ? data.getHeaders() : {}), // 如果是 FormData，添加正确的 headers
      },
      ...config,
    });

    return response.data;
  } catch (error) {
    console.log(error);
    // 加个额外配置，如果业务需要自己处理error，这里不捕获该错误，正常返回
    if (headers?.noErrorCatch && error?.response?.data) {
      return error.response.data;
    }
    handleRequestError(error as AxiosError);
  }
}

/**
 * GET 请求
 */
export const get = <T>(
  url: string,
  params?: any,
  headers?: Record<string, string>,
) => request<T>('GET', url, params, headers);

/**
 * POST 请求
 */
export const post = <T>(
  url: string,
  data?: any,
  headers?: Record<string, string>,
) => request<T>('POST', url, data, headers);

/**
 * PUT 请求
 */
export const put = <T>(
  url: string,
  data?: any,
  headers?: Record<string, string>,
) => request<T>('PUT', url, data, headers);

/**
 * DELETE 请求
 */
export const del = <T>(
  url: string,
  params?: any,
  headers?: Record<string, string>,
) => request<T>('DELETE', url, params, headers);
