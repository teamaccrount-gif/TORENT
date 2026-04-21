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

  // Support path parameter replacement (e.g., :region, :area, :name)
  let processedUrl = url;
  const allParams = { ...(params as Record<string, unknown>), ...(payload as Record<string, unknown>) };
  const usedKeys = new Set<string>();
  
  Object.keys(allParams).forEach((key) => {
    const placeholder = `:${key}`;
    if (processedUrl.includes(placeholder)) {
      const value = allParams[key];
      if (typeof value === 'string' || typeof value === 'number') {
        processedUrl = processedUrl.replace(placeholder, String(value));
        usedKeys.add(key);
      }
    }
  });

  // Remove used path parameters from query params to avoid duplication
  const filteredParams = params ? { ...params as Record<string, unknown> } : undefined;
  if (filteredParams) {
    usedKeys.forEach(key => delete filteredParams[key]);
  }

  let response;

  if (method === "GET") {
    response = await axiosInstance.get(processedUrl, {
      params: filteredParams,
      headers,
      paramsSerializer: (p) => qs.stringify(p, { arrayFormat: "repeat" }),
    });
  } else if (method === "POST") {
    const body = payload ?? null;

    response = await axiosInstance.post(processedUrl, body, { headers });
  } else if (method === "PUT") {
    response = await axiosInstance.put(processedUrl, payload ?? null, { headers });
  } else {
    response = await axiosInstance.delete(processedUrl, {
      headers,
      data: payload ?? null,
    });
  }

  return response.data as T;
};
