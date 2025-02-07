import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import path from 'path';
import fs from 'fs/promises';

ffmpeg.setFfmpegPath(ffmpegPath.path);

export const convertWebMToMp3 = (
  inputPath: string,
  outputPath?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const mp3Path = outputPath || inputPath.replace('.webm', '.mp3');

    ffmpeg(inputPath)
      .toFormat('mp3')
      .on('end', async () => {
        console.log(`Conversion successful: ${mp3Path}`);
        resolve(mp3Path);
      })
      .on('error', (err) => {
        console.error('Error converting WebM to MP3:', err);
        reject(err);
      })
      .save(mp3Path);
  });
};

const audioPath = path.join(
  __dirname,
  '../../uploads',
  'audio-1738949718143.webm'
);
convertWebMToMp3(audioPath);
