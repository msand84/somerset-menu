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
    // Get the next 5 school days (Monday-Friday), starting from today or next Monday
    const getNextSchoolWeek = () => {
      const today = new Date();
      const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      let startDate = new Date(today);
      
      // If it's Friday after school hours, Saturday, or Sunday, start from next Monday
      if (currentDay === 0) { // Sunday
        startDate.setDate(today.getDate() + 1); // Next Monday
      } else if (currentDay === 6) { // Saturday
        startDate.setDate(today.getDate() + 2); // Next Monday
      } else if (currentDay === 5) { // Friday
        // Check if it's late in the day (after 3 PM) - show next week
        const hour = today.getHours();
        if (hour >= 15) { // 3 PM or later
          startDate.setDate(today.getDate() + 3); // Next Monday
        }
      }
      // For Monday-Thursday (and Friday before 3 PM), start from today's week Monday
      else {
        // Find Monday of current week
        const daysFromMonday = 1 - currentDay;
        startDate.setDate(today.getDate() + daysFromMonday);
      }
      
      // If startDate is in the past (earlier than today), move to next Monday
      if (startDate < today && currentDay >= 1 && currentDay <= 4) {
        // We're in the middle of the week, use current week
      } else if (startDate < today) {
        startDate.setDate(today.getDate() + (8 - currentDay)); // Next Monday
      }
      
      // Generate 5 school days starting from startDate
      const weekDates = [];
      for (let i = 0; i < 5; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
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

    const weekDates = getNextSchoolWeek();
    const weekMenuData = [];
    
    console.log(`Fetching menu for: ${weekDates.map(d => formatApiDate(d)).join(', ')}`);
    
    // Fetch menu data for each day
    for (const date of weekDates) {
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
            error: 'No menu available'
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
      weekOf: weekDates[0].toLocaleDateString('en-US', { 
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
