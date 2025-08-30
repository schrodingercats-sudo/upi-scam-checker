const testVoiceGenie = async () => {
  try {
    const response = await fetch('http://localhost:3002/api/voicegenie', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerNumber: '+1234567890',
        campaignId: 'test-campaign-123',
        customerInformation: {
          first_name: 'Test',
          last_name: 'User'
        }
      }),
    });

    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
};

testVoiceGenie();