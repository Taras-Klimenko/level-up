import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import path from 'path';
import { exec } from 'node:child_process';
import fs from 'fs';

const t = initTRPC.create();

export const appRouter = t.router({
  healthCheck: t.procedure.query(() => 'Server is running'),

  transcribeAudio: t.procedure
    .input(z.object({ fileName: z.string() }))
    .mutation(async ({ input }) => {
      const audioPath = path.join(__dirname, '../../uploads', input.fileName);
      const outputDir = path.join(__dirname, '../../uploads');
      const transcriptionFile = `${audioPath}.txt`;

      return new Promise((resolve, reject) => {
        const command = `set PYTHONIOENCODING=utf-8 && whisper "${audioPath}" --model medium --language ru --output_format txt --output_dir "${outputDir}"`;

        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error('Whisper error:', stderr);
            console.log(stdout);
            return reject({ error: 'Failed to transcribe audiofile' });
          }

          fs.readFile(transcriptionFile, 'utf-8', (err, data) => {
            if (err) {
              console.log(err);
              return reject({ error: 'Failed to read transcription' });
            }

            fs.unlinkSync(audioPath);
            fs.unlinkSync(transcriptionFile);

            resolve({ transcription: data.trim() });
          });
        });
      });
    }),
});

export type AppRouter = typeof appRouter;
