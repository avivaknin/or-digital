
export async function sendMessage(
  message: string
): Promise<{ text: string; sources?: any[] }> {
  try {
    const response = await fetch('/.netlify/functions/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'שגיאה בשרת' }));
      throw new Error(errorData.error || `שגיאה: ${response.statusText}`);
    }

    return await response.json();
    
  } catch (error) {
    console.error("Error in sendMessage:", error);
    let errorMessage = "מצטער, נתקלתי בבעיה. אנא נסה שוב מאוחר יותר.";
    if (error instanceof Error) {
        errorMessage = `שגיאה: ${error.message}`;
    }
    return { text: errorMessage, sources: [] };
  }
}