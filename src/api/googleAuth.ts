import { gapi } from "gapi-script";

const CLIENT_ID = "544876181637-16ck6ffnsh1n3h23i9qgqblv8ph0r361.apps.googleusercontent.com";
const API_KEY = "AIzaSyDHtnqJsKSH9K4tffXAVkjT4Q4q_77iZ6s";

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
          apiKey: API_KEY,
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
      client_id: CLIENT_ID,
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
  
  