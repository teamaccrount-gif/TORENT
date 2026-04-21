import axiosInstance from "../axiosInstance";
import qs from "qs";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  payload?: Record<string, unknown>;  // POST body
  params?: Record<string, unknown>;   // GET query params
  headers?: Record<string, string>;   // Custom headers
}

export const commonRequest = async <T = unknown>(
  url: string,
  options: RequestOptions = {}
): Promise<T> => {
  const {
    method = "GET",
    payload,
    params,
    headers,
  } = options;

  let response;

  if (method === "GET") {
    response = await axiosInstance.get(url, {
      params,
      headers,
      paramsSerializer: (p) => qs.stringify(p, { arrayFormat: "repeat" }),
    });
  } else if (method === "POST") {
    const body = payload ?? null;

    response = await axiosInstance.post(url, body, { headers });
  } else if (method === "PUT") {
    response = await axiosInstance.put(url, payload ?? null, { headers });
  } else {
    response = await axiosInstance.delete(url, {
      headers,
      data: payload ?? null,
    });
  }

  return response.data as T;
};
