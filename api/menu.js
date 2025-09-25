{\rtf1\ansi\ansicpg1252\cocoartf2865
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 export default async function handler(req, res) \{\
  // Set CORS headers\
  res.setHeader('Access-Control-Allow-Origin', '*');\
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');\
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');\
\
  // Handle preflight requests\
  if (req.method === 'OPTIONS') \{\
    res.status(200).end();\
    return;\
  \}\
\
  try \{\
    // Get today and tomorrow\
    const today = new Date();\
    const tomorrow = new Date(today);\
    tomorrow.setDate(today.getDate() + 1);\
    \
    const formatApiDate = (date) => \{\
      const month = String(date.getMonth() + 1).padStart(2, '0');\
      const day = String(date.getDate()).padStart(2, '0');\
      const year = date.getFullYear();\
      return `$\{month\}-$\{day\}-$\{year\}`;\
    \};\
\
    const dates = [today, tomorrow];\
    const weekMenuData = [];\
    \
    console.log('Fetching 2 days of data...');\
    \
    for (const date of dates) \{\
      const apiDate = formatApiDate(date);\
      const apiUrl = `https://api.mealviewer.com/api/v4/school/SomersetES/$\{apiDate\}/$\{apiDate\}/`;\
      \
      console.log(`Trying to fetch: $\{apiUrl\}`);\
      \
      try \{\
        const response = await fetch(apiUrl);\
        console.log(`Response status for $\{apiDate\}: $\{response.status\}`);\
        \
        if (response.ok) \{\
          const dayData = await response.json();\
          weekMenuData.push(\{\
            date: apiDate,\
            dayName: date.toLocaleDateString('en-US', \{ weekday: 'long' \}),\
            fullDate: date.toLocaleDateString('en-US', \{ \
              weekday: 'long', \
              month: 'long', \
              day: 'numeric' \
            \}),\
            data: dayData,\
            success: true\
          \});\
          console.log(`Successfully got data for $\{apiDate\}`);\
        \} else \{\
          weekMenuData.push(\{\
            date: apiDate,\
            dayName: date.toLocaleDateString('en-US', \{ weekday: 'long' \}),\
            fullDate: date.toLocaleDateString('en-US', \{ \
              weekday: 'long', \
              month: 'long', \
              day: 'numeric' \
            \}),\
            data: null,\
            success: false,\
            error: `No data available`\
          \});\
        \}\
      \} catch (dayError) \{\
        console.error(`Day error for $\{apiDate\}:`, dayError);\
        weekMenuData.push(\{\
          date: apiDate,\
          dayName: date.toLocaleDateString('en-US', \{ weekday: 'long' \}),\
          fullDate: date.toLocaleDateString('en-US', \{ \
            weekday: 'long', \
            month: 'long', \
            day: 'numeric' \
          \}),\
          data: null,\
          success: false,\
          error: 'Fetch failed'\
        \});\
      \}\
    \}\
\
    console.log('Returning weekly data...');\
\
    res.status(200).json(\{\
      success: true,\
      weekData: weekMenuData,\
      fetchedAt: new Date().toISOString(),\
      weekOf: today.toLocaleDateString('en-US', \{ \
        month: 'long', \
        day: 'numeric',\
        year: 'numeric'\
      \})\
    \});\
\
  \} catch (error) \{\
    console.error('Main function error:', error);\
    \
    res.status(500).json(\{\
      success: false,\
      error: error.message,\
      fetchedAt: new Date().toISOString()\
    \});\
  \}\
\}}