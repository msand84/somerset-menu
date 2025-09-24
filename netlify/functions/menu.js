exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    // Get today's date in MM-DD-YYYY format
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();
    const date = `${month}-${day}-${year}`;

    console.log(`Fetching menu for date: ${date}`);
    
    const apiUrl = `https://api.mealviewer.com/api/v4/school/SomersetES/${date}/${date}/`;
    
    // Simple fetch
    const response = await fetch(apiUrl);
    const data = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: data,
        fetchedAt: new Date().toISOString(),
        date: date
      })
    };

  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
