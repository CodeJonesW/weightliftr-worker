import jwt from 'jsonwebtoken';
import { Env } from '../types';

export const verifyToken = async (request: Request, env: Env): Promise<{ user: any } | Response> => {
	const authHeader = request.headers.get('Authorization');
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		console.log('Unauthorized', authHeader);
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const token = authHeader.split(' ')[1];
	try {
		const decoded = jwt.verify(token, env.JWT_SECRET);
		console.log('Decoded', decoded);
		return { user: decoded };
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Invalid token' }), {
			status: 403,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
