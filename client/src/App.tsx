import AudioRecorder from './AudioRecorder';
import './App.css';
import { useState } from 'react';

function App() {
  const [speechToText, setSpeechToText] = useState('');
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
    setProcessing(false);
  };

  return (
    <AudioRecorder
      onAudioRecorded={handleAudioRecorded}
      speechToText={speechToText}
      processing={processing}
    />
  );
}

export default App;
