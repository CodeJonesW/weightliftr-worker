import bcrypt from 'bcryptjs';
import { errorResponse } from '../../utils/response_utils';
import { recordNewUser } from '../../utils/analytics';
import { Context } from 'hono';

export const registerRoute = async (context: Context): Promise<Response> => {
	const { req: request, env } = context;

	const email = request.header('x-email');
	const password = request.header('x-password');

	if (!email || !password) {
		return errorResponse('Missing email or password', 400);
	}
	const id = env.WL_DURABLE_OBJECT.idFromName(email);
	const stub = env.WL_DURABLE_OBJECT.get(id);

	const exists = await stub.checkIfUserExistsByEmail(email);
	if (exists.length > 0) {
		return errorResponse('User already exists', 400);
	}

	const saltRounds = 10;
	const hashedPassword = await bcrypt.hash(password, saltRounds);

	const response = await stub.insertUser(email, hashedPassword);

	if (response) {
		recordNewUser(email, env);
		return new Response(JSON.stringify({ message: 'User added successfully' }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} else {
		return errorResponse('Failed to insert user', 500);
	}
};
