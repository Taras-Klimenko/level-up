import axios from 'axios';
import dotenv from 'dotenv';
import https from 'https';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

// This is to disable SSL verification for development
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

const fetchNewToken = async (): Promise<string | null> => {
  try {
    const response = await axiosInstance.post(
      `${process.env.SBER_AUTH_URL}`,
      'scope=SALUTE_SPEECH_PERS',
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${process.env.SBER_AUTH_KEY}`,
          RqUID: uuidv4(),
        },
      }
    );
    accessToken = response.data.access_token;
    tokenExpiry = response.data.expires_at - 70000; // requires new token if the old one has less than minute of lifetime

    return accessToken;
  } catch (error: any) {
    console.error(
      'Error fetching access token: ',
      error.response?.data || error.message
    );
    throw new Error('Failed to fetch access token');
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (!accessToken || !tokenExpiry || Date.now() >= tokenExpiry) {
    return await fetchNewToken();
  }
  return accessToken;
};
