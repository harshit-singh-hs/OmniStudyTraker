const API_URL = 'http://localhost:4501/sync';

export const pushState = async (syncCode, state) => {
  if (!syncCode || syncCode.length !== 6) return false;
  try {
    const response = await fetch(`${API_URL}/${syncCode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(state),
    });
    return response.ok;
  } catch (err) {
    console.error('Failed to push state:', err);
    return false;
  }
};

export const pullState = async (syncCode) => {
  if (!syncCode || syncCode.length !== 6) return null;
  try {
    const response = await fetch(`${API_URL}/${syncCode}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Failed to pull state:', err);
    return null;
  }
};
