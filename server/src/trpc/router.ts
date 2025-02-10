import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import path from 'path';
import { exec } from 'node:child_process';
import fs from 'fs';
import { convertWebMToMp3 } from '../utils/convertAudio';
import { getTextFromSpeech } from '../utils/speechRecognition';
import { getChatCompletion } from '../utils/getChatCompletion';

const t = initTRPC.create();

export const appRouter = t.router({
  healthCheck: t.procedure.query(() => 'Server is running'),

  transcribeAudio: t.procedure
    .input(z.object({ fileName: z.string() }))
    .mutation(async ({ input }) => {
      const audioPath = path.join(__dirname, '../../uploads', input.fileName);
      const mp3Path = await convertWebMToMp3(audioPath);
      const transcription = await getTextFromSpeech(mp3Path);

      fs.unlinkSync(audioPath);
      fs.unlinkSync(mp3Path);
      return { transcription };

      // LEGACY WITH LOCAL WHISPER

      // return new Promise((resolve, reject) => {
      //   const command = `set PYTHONIOENCODING=utf-8 && whisper "${audioPath}" --model medium --language ru --output_format txt --output_dir "${outputDir}"`;

      //   exec(command, (error, stdout, stderr) => {
      //     if (error) {
      //       console.error('Whisper error:', stderr);
      //       console.log(stdout);
      //       return reject({ error: 'Failed to transcribe audiofile' });
      //     }

      //     fs.readFile(transcriptionFile, 'utf-8', (err, data) => {
      //       if (err) {
      //         console.log(err);
      //         return reject({ error: 'Failed to read transcription' });
      //       }

      //       fs.unlinkSync(audioPath);
      //       fs.unlinkSync(transcriptionFile);

      //       resolve({ transcription: data.trim() });
      //     });
      //   });
      // });
    }),

  analyzeResponse: t.procedure
    .input(z.object({ question: z.string(), answer: z.string() }))
    .mutation(async ({ input }) => {
      const { question, answer } = input;

      const response = await getChatCompletion(question, answer);
      console.log(response);

      return { response };
    }),
});

export type AppRouter = typeof appRouter;
