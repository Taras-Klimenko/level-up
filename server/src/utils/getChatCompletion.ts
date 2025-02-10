import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

import { getAccessToken, axiosInstance } from './token';

dotenv.config();

export const getChatCompletion = async (question: string, answer: string) => {
  try {
    const accessToken = await getAccessToken(
      'GIGACHAT_API_PERS',
      'SBER_CHAT_AUTH_KEY'
    );

    if (!accessToken) {
      throw new Error('Failed to receive access token');
    }

    const requestData = JSON.stringify({
      model: 'GigaChat-Max',
      stream: false,
      update_interval: 0,
      messages: [
        {
          role: 'system',
          content: `Проанализируй ответ пользователя на следующий вопрос: ${question}. Постарайся оценить ответ правильность и полноту ответа пользователя, похвалить за верное направление мысли и предоставить дополнительные данные для полного ответа`,
        },
        {
          role: 'user',
          content: `${answer}`,
        },
      ],
    });

    const response = await axiosInstance.post(
      `${process.env.SBER_CHAT_COMPLETION_URL}`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices;
  } catch (error: any) {
    console.error(
      'Error during chat completion:',
      error.response?.data || error.message
    );
  }
};

// getChatCompletion(
//   'В чем преимущества использования структуры данных Map в JavaScript над обычными объектами?',
//   'В структуре данных Map ключами могут быть и другие типы данных, а не только строки и символы. Map хранит данные в том порядке, в котором они вносились. Map обладает рядом встороенных методов, которые упрощают работу с ними.'
// ).then((response) => console.log(response));
