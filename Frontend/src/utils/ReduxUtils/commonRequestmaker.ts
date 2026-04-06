import axios from "axios";
import qs from "qs";

type HttpMethod = "GET" | "POST";

export interface RequestOptions {
  method?: HttpMethod;
  payload?: Record<string, unknown>;  // POST body
  params?: Record<string, unknown>;   // GET query params
}

export const commonRequest = async <T = unknown>(
  url: string,
  options: RequestOptions = {}
): Promise<T> => {
  const {
    method = "GET",
    payload,
    params,
  } = options;

  let response;

  if (method === "GET") {
    response = await axios.get(url, {
      params,
      paramsSerializer: (p) => qs.stringify(p, { arrayFormat: "repeat" }),
    });
  } else {
    const body = payload ?? null;

    response = await axios.post(url, body);
  }

  return response.data as T;
};