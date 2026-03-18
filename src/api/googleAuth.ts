import { gapi } from "gapi-script";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const DISCOVERY_DOC = [
  "https://docs.googleapis.com/$discovery/rest?version=v1",
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
];

const SCOPES = [
  "https://www.googleapis.com/auth/documents.readonly",
  "https://www.googleapis.com/auth/drive.readonly",
].join(" ");

declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

interface TokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken || localStorage.getItem("google_access_token");
}

export async function initGoogle(): Promise<void> {
  return new Promise((resolve, reject) => {
    gapi.load("client", async () => {
      try {
        await gapi.client.init({
          apiKey: GOOGLE_API_KEY,
          discoveryDocs: DISCOVERY_DOC,
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

export async function signInGoogle(): Promise<string> {
  return new Promise((resolve, reject) => {
    const google = window.google;

    if (!google?.accounts?.oauth2) {
      reject(new Error("Google Identity Services script is not loaded."));
      return;
    }

    const client = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: (response: TokenResponse) => {
        if (response.error || !response.access_token) {
          reject(
            new Error(
              response.error_description ||
                response.error ||
                "Failed to get access token"
            )
          );
          return;
        }

        accessToken = response.access_token;
        localStorage.setItem("google_access_token", response.access_token);

        resolve(response.access_token);
      },
    });

    client.requestAccessToken({ prompt: "consent" });
  });
}

export function signOutGoogle() {
  accessToken = null;
  localStorage.removeItem("google_access_token");
}
  
  