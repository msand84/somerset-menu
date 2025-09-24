exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    // Get date from query parameter or calculate next school day
    let date = event.queryStringParameters?.date;
    
    if (!date) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      
      if (dayOfWeek === 5) { // Friday
        today.setDate(today.getDate() + 3);
      } else if (dayOfWeek === 6) { // Saturday
        today.setDate(today.getDate() + 2);
      } else if (dayOfWeek === 0) { // Sunday
        today.setDate(today.getDate() + 1);
      }
      
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const year = today.getFullYear();
      date = `${month}-${day}-${year}`;
    }

    console.log(`Fetching menu for date: ${date}`);
    
    const apiUrl = `https://api.mealviewer.com/api/v4/school/SomersetES/${date}/${date}/`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Menu data fetched successfully');

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
    console.error('Function error:', error.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        fetchedAt: new Date().toISOString()
      })
    };
  }
};
