import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

import { getAccessToken, axiosInstance } from './token';

dotenv.config();

const getTextFromSpeech = async () => {
  try {
    const accessToken = await getAccessToken(
      'SALUTE_SPEECH_PERS',
      'SBER_AUTH_KEY'
    );

    if (!accessToken) {
      throw new Error('Failed to receive access token');
    }

    const audioPath = path.join(
      __dirname,
      '../../uploads',
      'audio-1738949718143.mp3'
    );
    const audioData = fs.readFileSync(audioPath);

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

    console.log('Speech Recognition Response:', response.data);
  } catch (error: any) {
    console.error(
      'Error during speech recognition:',
      error.response?.data || error.message
    );
  }
};

getTextFromSpeech();
