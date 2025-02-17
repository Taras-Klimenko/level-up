import { useMutation } from '@tanstack/react-query';
import AudioRecorder from './AudioRecorder';
import './App.css';
import { useState } from 'react';

const question = {
  text: 'В чём преимущества использования структуры данных Map над обычными объектами в JavaScript?',
};

function App() {
  const [speechToText, setSpeechToText] = useState('');
  const [assessment, setAssessment] = useState('');

  const uploadAudio = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData,
      });
      return response.json();
    },
  });

  const transcribeAudio = useMutation({
    mutationFn: async (fileName: string) => {
      const response = await fetch(
        'http://localhost:3000/trpc/transcribeAudio',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileName }),
        }
      );
      return response.json();
    },
  });

  const analyzeResponse = useMutation({
    mutationFn: async (transcription: string) => {
      const response = await fetch(
        'http://localhost:3000/trpc/analyzeResponse',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: question.text,
            answer: transcription,
          }),
        }
      );
      return response.json();
    },
  });

  const handleAudioRecorded = async (audioBlob: Blob) => {
    try {
      const { fileName } = await uploadAudio.mutateAsync(audioBlob);
      const transcriptionData = await transcribeAudio.mutateAsync(fileName);
      const transcription = transcriptionData.result.data.transcription;
      setSpeechToText(transcription);

      const analysisData = await analyzeResponse.mutateAsync(transcription);
      setAssessment(analysisData.result.data.response[0].message.content);
    } catch (error) {
      console.error('Error processing audio', error);
    }
  };

  return (
    <>
      <p>{question.text}</p>
      <AudioRecorder
        onAudioRecorded={handleAudioRecorded}
        speechToText={speechToText}
        assessment={assessment}
        processing={
          uploadAudio.isPending ||
          transcribeAudio.isPending ||
          analyzeResponse.isPending
        }
      />
    </>
  );
}

export default App;
