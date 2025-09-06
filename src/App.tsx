import { useState } from 'react';
import { sendMessage } from './services/geminiService';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { text: input, isUser: true }];
    setMessages(newMessages);
    setInput('');
    
    const placeholderIndex = newMessages.length;
    setMessages(prev => [...prev, { text: '...', isUser: false }]);

    try {
      await sendMessage(input, (chunk) => {
        setMessages(prev => {
          const updatedMessages = [...prev];
          updatedMessages[placeholderIndex].text = (updatedMessages[placeholderIndex].text.replace('...', '') + chunk.text).replace(/<summary>.*?<\/summary>/gs, '').replace(/<fullAnswer>.*?<\/fullAnswer>/gs, '');
          return updatedMessages;
        });
      });
    } catch (error) {
      setMessages(prev => {
        const updatedMessages = [...prev];
        updatedMessages[placeholderIndex].text = "מצטער, נתקלתי בבעיה. אנא נסה שוב מאוחר יותר.";
        return updatedMessages;
      });
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Digital Assistant</h1>
      <div style={{ border: '1px solid #ccc', padding: '10px', height: '400px', overflowY: 'scroll', marginBottom: '10px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.isUser ? 'right' : 'left', marginBottom: '10px' }}>
            <span style={{ backgroundColor: msg.isUser ? '#dcf8c6' : '#f1f0f0', padding: '8px', borderRadius: '10px' }}>
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          style={{ flexGrow: 1, padding: '10px', marginRight: '10px' }}
        />
        <button onClick={handleSendMessage} style={{ padding: '10px' }}>שלח</button>
      </div>
    </div>
  );
}

export default App;