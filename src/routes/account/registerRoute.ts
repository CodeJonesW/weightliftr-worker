import bcrypt from 'bcryptjs';
import { checkIfUserExistsByEmail } from '../../utils/db_utils/db_queries';
import { errorResponse } from '../../utils/response_utils';
import { Context } from 'hono';

export const registerRoute = async (context: Context): Promise<Response> => {
	console.log(context);
	const { req: request, env } = context;

	const email = request.header('x-email');
	const password = request.header('x-password');

	console.log('email', email);
	console.log('password', password);

	if (!email || !password) {
		return errorResponse('Missing email or password', 400);
	}

	const user = await checkIfUserExistsByEmail(email, env);
	if (user) {
		return errorResponse('User already exists', 400);
	}

	const saltRounds = 10;
	const hashedPassword = await bcrypt.hash(password, saltRounds);
	const id = env.WL_DURABLE_OBJECT.newUniqueId();
	console.log('id', id);

	const { success } = await env.DB.prepare(`INSERT INTO Users (email, user_password, user_id) VALUES (?, ?, ?)`)
		.bind(email, hashedPassword, String(id))
		.run();

	const stub = env.WL_DURABLE_OBJECT.get(id);
	console.log('stub', stub);

	if (success) {
		return new Response(JSON.stringify({ message: 'User added successfully' }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} else {
		return errorResponse('Failed to insert user', 500);
	}
};
