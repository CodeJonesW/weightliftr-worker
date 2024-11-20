import { Context } from 'hono';
import { errorResponse } from '../../utils/response_utils';

export const loginRoute = async (context: Context): Promise<Response> => {
	const { req: request, env } = context;
	const email = request.header('x-email');
	const password = request.header('x-password');

	if (!email || !password) {
		return errorResponse('Missing email or password', 400);
	}
	const id = env.WL_DURABLE_OBJECT.idFromName(email);
	const stub = env.WL_DURABLE_OBJECT.get(id);
	const userData = await stub.checkIfUserExistsByEmail(email);

	if (userData.length === 0) {
		return errorResponse('User not found', 404);
	}

	const hashedPassword = userData[1];
	const bcrypt = await import('bcryptjs');
	const match = await bcrypt.compare(password, hashedPassword as string);
	if (!match) {
		return errorResponse('Invalid password', 401);
	}

	const jwt = await import('jsonwebtoken');
	const token = jwt.sign({ email: email }, env.JWT_SECRET, { expiresIn: '7d' });

	return new Response(JSON.stringify({ message: 'Login successful', access_token: token }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
};
