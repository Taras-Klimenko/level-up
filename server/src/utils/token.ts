import axios from 'axios';
import dotenv from 'dotenv';
import https from 'https';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

// This is to disable SSL verification for development
export const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

interface TokenStore {
  accessToken: string | null;
  tokenExpiry: number | null;
}

const tokens: Record<string, TokenStore> = {};

const fetchNewToken = async (
  scope: string,
  authKey: string
): Promise<string | null> => {
  try {
    const response = await axiosInstance.post(
      `${process.env.SBER_AUTH_URL}`,
      `scope=${scope}`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${process.env[authKey]}`,
          RqUID: uuidv4(),
        },
      }
    );

    tokens[scope] = {
      accessToken: response.data.access_token,
      tokenExpiry: response.data.expires_at - 70000, // requires new token if the old one has less than minute of lifetime
    };

    return response.data.access_token;
  } catch (error: any) {
    console.error(
      `Error fetching ${scope} access token: `,
      error.response?.data || error.message
    );
    throw new Error(`Failed to fetch ${scope} access token`);
  }
};

export const getAccessToken = async (
  scope: string,
  authKey: string
): Promise<string | null> => {
  const tokenData = tokens[scope];

  if (
    !tokenData ||
    !tokenData.accessToken ||
    !tokenData.tokenExpiry ||
    Date.now() >= tokenData.tokenExpiry
  ) {
    return await fetchNewToken(scope, authKey);
  }
  return tokenData.accessToken;
};
