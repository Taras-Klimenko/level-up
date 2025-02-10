import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

import { getAccessToken, axiosInstance } from './token';

dotenv.config();

export const getTextFromSpeech = async (audioFilePath: string) => {
  try {
    const accessToken = await getAccessToken(
      'SALUTE_SPEECH_PERS',
      'SBER_AUTH_KEY'
    );

    if (!accessToken) {
      throw new Error('Failed to receive access token');
    }

    const audioData = fs.readFileSync(audioFilePath);

    const response = await axiosInstance.post(
      `${process.env.SBER_SPEECH_RECOGNITION_URL}`,
      audioData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'audio/mpeg',
          Accept: 'application/json',
        },
      }
    );

    return response.data.result.join('');
  } catch (error: any) {
    console.error(
      'Error during speech recognition:',
      error.response?.data || error.message
    );
  }
};
