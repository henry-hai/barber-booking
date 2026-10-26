/*
 * The one axios instance every dashboard request goes through.
 *
 * Two deployments, two ways of authenticating.
 *
 * Same origin (Render): Express serves this bundle from behind its basic
 * auth guard, so the browser has already prompted for credentials by the
 * time the app loads and attaches them to every same-origin request itself.
 * Nothing here needs to do anything, and serverAddress is "".
 *
 * Cross origin (CloudFront to API Gateway): the bundle is served plainly and
 * the API lives on another host. A browser never sends its stored basic-auth
 * credentials cross origin, so the app asks for them once, keeps them in
 * sessionStorage for the tab's lifetime, and sets the Authorization header
 * on each call itself. X-Requested-With tells the API this is the app, so a
 * 401 comes back without a WWW-Authenticate challenge and the browser's own
 * password dialog stays out of the way of the app's sign-in form.
 *
 * The credentials never appear in the bundle. They are typed in and held in
 * memory for the session, which is the same thing the browser's native
 * prompt does.
 */

import axios, { AxiosInstance } from "axios";
import { config } from "./config";

const STORAGE_KEY = "dashboard-credentials";
export const UNAUTHORIZED_EVENT = "dashboard:unauthorized";

export interface ICredentials { user: string, password: string }

/* True when the API is on another origin and the app must authenticate. */
export const crossOrigin = (): boolean => config.serverAddress !== "";

export function loadCredentials(): ICredentials | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as ICredentials : null;
  } catch {
    return null;
  }
}

export function saveCredentials(credentials: ICredentials): void {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(credentials)); } catch { /* private mode */ }
}

export function clearCredentials(): void {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* private mode */ }
}

/* btoa only takes Latin-1, so route the UTF-8 bytes through it. */
const basicHeader = ({ user, password }: ICredentials): string =>
  "Basic " + btoa(unescape(encodeURIComponent(`${user}:${password}`)));

export const api: AxiosInstance = axios.create({ baseURL: config.serverAddress });

api.interceptors.request.use((request) => {
  if (crossOrigin()) {
    const credentials = loadCredentials();
    if (credentials) { request.headers.Authorization = basicHeader(credentials); }
    request.headers["X-Requested-With"] = "dashboard";
  }
  return request;
});

/* A 401 cross origin means the stored credentials are wrong or gone. Drop
   them and tell the shell to show the sign-in form again. */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (crossOrigin() && error?.response?.status === 401) {
      clearCredentials();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    return Promise.reject(error);
  }
);
