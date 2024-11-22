require('dotenv').config();
const axios = require('axios');

async function fetchAnalyticsUserLoginData() {
	const apiKey = process.env.CLOUDFLARE_API_KEY;
	const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
	if (!apiKey) {
		throw new Error('Missing CLOUDFLARE_API_KEY in .env file');
	}

	const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/analytics_engine/sql`;
	const sqlQuery = `
    SELECT timestamp, blob1, index1
    FROM WL_ANALYTICS_DATA
    WHERE blob1 IN ('user_login') 
    ORDER BY timestamp DESC 
    LIMIT 10
  `;

	try {
		const response = await axios.post(url, sqlQuery, {
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
		});
		return response.data;
	} catch (error: any) {
		console.error('Error fetching analytics data:', error.message);
		throw error;
	}
}
