export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Get today and tomorrow
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
    
    for (const date of dates) {
      const apiDate = formatApiDate(date);
      const apiUrl = `https://api.mealviewer.com/api/v4/school/SomersetES/${apiDate}/${apiDate}/`;
      
      try {
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
        }
      } catch (dayError) {
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

    res.status(200).json({
      success: true,
      weekData: weekMenuData,
      fetchedAt: new Date().toISOString(),
      weekOf: today.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      })
    });

  } catch (error) {
    console.error('Function error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      fetchedAt: new Date().toISOString()
    });
  }
}
