exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    console.log('Weekly function started');
    
    // Get today and tomorrow only (simpler test)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const formatApiDate = (date) => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}-${day}-${year}`;
    };

    const dates = [today, tomorrow];
    const weekMenuData = [];
    
    console.log('Fetching 2 days of data...');
    
    for (const date of dates) {
      const apiDate = formatApiDate(date);
      const apiUrl = `https://api.mealviewer.com/api/v4/school/SomersetES/${apiDate}/${apiDate}/`;
      
      console.log(`Trying to fetch: ${apiUrl}`);
      
      try {
        const response = await fetch(apiUrl);
        console.log(`Response status for ${apiDate}: ${response.status}`);
        
        if (response.ok) {
          const dayData = await response.json();
          weekMenuData.push({
            date: apiDate,
            dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
            fullDate: date.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            }),
            data: dayData,
            success: true
          });
          console.log(`Successfully got data for ${apiDate}`);
        } else {
          weekMenuData.push({
            date: apiDate,
            dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
            fullDate: date.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            }),
            data: null,
            success: false,
            error: `No data available`
          });
          console.log(`No data for ${apiDate}`);
        }
      } catch (dayError) {
        console.error(`Day error for ${apiDate}:`, dayError);
        weekMenuData.push({
          date: apiDate,
          dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
          fullDate: date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          }),
          data: null,
          success: false,
          error: 'Fetch failed'
        });
      }
    }

    console.log('Returning weekly data...');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        weekData: weekMenuData,
        fetchedAt: new Date().toISOString(),
        weekOf: today.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric',
          year: 'numeric'
        })
      })
    };

  } catch (error) {
    console.error('Main function error:', error);
    
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
