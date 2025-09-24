{\rtf1\ansi\ansicpg1252\cocoartf2865
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const https = require('https');\
\
exports.handler = async (event, context) => \{\
  console.log('Function called');\
  \
  // CORS headers\
  const headers = \{\
    'Access-Control-Allow-Origin': '*',\
    'Access-Control-Allow-Headers': 'Content-Type',\
    'Content-Type': 'application/json',\
  \};\
\
  try \{\
    // Get today's date in the format MM-DD-YYYY\
    const today = new Date();\
    const month = String(today.getMonth() + 1).padStart(2, '0');\
    const day = String(today.getDate()).padStart(2, '0');\
    const year = today.getFullYear();\
    const date = `$\{month\}-$\{day\}-$\{year\}`;\
\
    console.log(`Fetching menu for: $\{date\}`);\
\
    const apiUrl = `https://api.mealviewer.com/api/v4/school/SomersetES/$\{date\}/$\{date\}/`;\
    \
    // Use a simple fetch\
    const response = await fetch(apiUrl);\
    const data = await response.json();\
\
    console.log('Data fetched successfully');\
\
    return \{\
      statusCode: 200,\
      headers,\
      body: JSON.stringify(\{\
        success: true,\
        data: data,\
        date: date,\
        timestamp: new Date().toISOString()\
      \})\
    \};\
\
  \} catch (error) \{\
    console.error('Function error:', error);\
    \
    return \{\
      statusCode: 500,\
      headers,\
      body: JSON.stringify(\{\
        success: false,\
        error: error.message,\
        timestamp: new Date().toISOString()\
      \})\
    \};\
  \}\
\};}