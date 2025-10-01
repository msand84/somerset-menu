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
    // Get upcoming school days (today through Friday, or next week if it's the weekend)
    const getUpcomingSchoolDays = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset to start of day for comparison
      const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      const upcomingDays = [];
      
      // If it's Saturday (6) or Sunday (0), show next week (Mon-Fri)
      if (currentDay === 0 || currentDay === 6) {
        const nextMonday = new Date(today);
        const daysUntilMonday = currentDay === 0 ? 1 : 2;
        nextMonday.setDate(today.getDate() + daysUntilMonday);
        
        // Add Monday through Friday of next week
        for (let i = 0; i < 5; i++) {
          const date = new Date(nextMonday);
          date.setDate(nextMonday.getDate() + i);
          upcomingDays.push(date);
        }
      } 
      // If it's a weekday (Mon-Fri), show today through Friday
      else {
        const daysUntilFriday = 5 - currentDay; // Days remaining until Friday
        
        // Add today through Friday
        for (let i = 0; i <= daysUntilFriday; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          upcomingDays.push(date);
        }
      }
      
      return upcomingDays;
    };

    const formatApiDate = (date) => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}-${day}-${year}`;
    };

    const upcomingDays = getUpcomingSchoolDays();
    const weekMenuData = [];
    
    console.log(`Fetching menu for: ${upcomingDays.map(d => formatApiDate(d)).join(', ')}`);
    
    // Fetch menu data for each day
    for (const date of upcomingDays) {
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
      weekOf: upcomingDays[0].toLocaleDateString('en-US', { 
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
