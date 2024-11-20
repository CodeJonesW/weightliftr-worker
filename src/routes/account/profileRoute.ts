import { Context } from 'hono';
import { errorResponse } from '../../utils/response_utils';

export const profileRoute = async (context: Context): Promise<Response> => {
	const { req: request, env } = context;

	const { verifyToken } = await import('../../utils/auth');
	const authResponse = await verifyToken(request.raw, env);
	if (authResponse instanceof Response) return authResponse;

	const user = authResponse.user;
	console.log('user', user);

	const id = env.WL_DURABLE_OBJECT.idFromName(user.email);
	console.log('id', id);
	const stub = env.WL_DURABLE_OBJECT.get(id);

	let workouts = await stub.getWorkouts();

	const responseData = {
		message: 'Profile data',
		user,
		workouts,
	};

	return new Response(JSON.stringify(responseData), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
};
