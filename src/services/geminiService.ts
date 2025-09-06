export async function sendMessage(
    message: string,
    onStream: (chunk: { text: string; sources?: any[] }) => void
): Promise<void> {
    try {
        const response = await fetch('/.netlify/functions/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        if (!response.ok || !response.body) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let chunkResult = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                break;
            }
            chunkResult += decoder.decode(value, { stream: true });
            
            let boundary = chunkResult.indexOf('\n');
            while (boundary !== -1) {
                const jsonString = chunkResult.substring(0, boundary);
                chunkResult = chunkResult.substring(boundary + 1);
                
                if (jsonString.trim()) {
                    try {
                        const parsedChunk = JSON.parse(jsonString);
                        onStream(parsedChunk);
                    } catch (e) {
                        console.error("Failed to parse JSON chunk", e, jsonString);
                    }
                }
                boundary = chunkResult.indexOf('\n');
            }
        }
    } catch (error) {
        console.error("Error sending message:", error);
        let errorMessage = "מצטער, נתקלתי בבעיה. אנא נסה שוב מאוחר יותר.";
        if (error instanceof Error) {
            errorMessage = `שגיאה: ${error.message}`;
        }
        onStream({ text: errorMessage });
    }
}