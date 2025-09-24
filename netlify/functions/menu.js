const https = require('https');
const http = require('http');

exports.handler = async (event, context) => {
  console.log('Function started');
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

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
      date
