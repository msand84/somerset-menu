exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    // Get the current week's school days (Monday-Friday)
    const getWeekDates = () => {
      const today = new Date();
      const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Find Monday of current week
      const monday = new Date(today);
      const daysFromMonday = currentDay === 0 ? -6 : 1 - currentDay; // If Sunday, go back 6 days
      monday.setDate(today.getDate() + daysFromMonday);
      
      // Generate Monday through Friday
      const weekDates = [];
      for (let i = 0; i < 5; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        weekDates.push(date);
      }
      
      return weekDates;
    };

    const formatApiDate = (date) => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}-${day}-${year}`;
    };

    const weekDates = getWeekDates();
    console.log(`Fetching menu for week: ${weekDates.map(d => formatApiDate(d)).join(', ')}`);
    
    // Fetch menu data for each day
    const weekMenuData = [];
    
    for (const date of weekDates) {
      const apiDate = formatApiDate(date);
      const apiUrl = `https://api.mealviewer.com/api/v4/school/SomersetES/${apiDate}/${apiDate}/`;
      
      try {
        console.log(`Fetching: ${apiUrl}`);
        const response = await fetch(apiUrl);
        
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
        } else {
          console.log(`No data for ${apiDate} (${response.status})`);
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
            error: `No menu available (${response.status})`
          });
        }
      } catch (dayError) {
        console.error(`Error fetching ${apiDate}:`, dayError.message);
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
          error: dayError.message
        });
      }
    }

    console.log('Weekly menu data fetched successfully');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        weekData: weekMenuData,
        fetchedAt: new Date().toISOString(),
        weekOf: weekDates[0].toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric',
          year: 'numeric'
        })
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
