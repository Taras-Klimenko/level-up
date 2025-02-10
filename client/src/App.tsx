import AudioRecorder from './AudioRecorder';
import './App.css';
import { useState } from 'react';

const question = {
  text: 'В чём преимущества использования структуры данных Map над обычными объектами в JavaScript?',
};

function App() {
  const [speechToText, setSpeechToText] = useState('');
  const [assessment, setAssessment] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleAudioRecorded = async (audioBlob: Blob) => {
    setProcessing(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');

    const uploadResponse = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: formData,
    });

    const { fileName } = await uploadResponse.json();
    console.log(fileName);

    const transcribeResponse = await fetch(
      'http://localhost:3000/trpc/transcribeAudio',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName }),
      }
    );

    const data = await transcribeResponse.json();

    console.log('Transcription:', data);
    setSpeechToText(data.result.data.transcription);

    const analyzeResponse = await fetch(
      'http://localhost:3000/trpc/analyzeResponse',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.text,
          answer: data.result.data.transcription,
        }),
      }
    );

    const result = await analyzeResponse.json();
    console.log(result);

    setAssessment(result.result.data.response[0].message.content);
    setProcessing(false);
  };

  return (
    <>
      <p>{question.text}</p>
      <AudioRecorder
        onAudioRecorded={handleAudioRecorded}
        speechToText={speechToText}
        assessment={assessment}
        processing={processing}
      />
    </>
  );
}

export default App;
