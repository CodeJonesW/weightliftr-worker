import { Context } from 'hono';
import { errorResponse } from '../../utils/response_utils';

export const createWorkoutRoute = async (context: Context): Promise<Response> => {
	const { verifyToken } = await import('../../utils/auth');
	try {
		const { req: request, env } = context;
		console.log('createWorkoutRoute');

		const authResponse = await verifyToken(request.raw, env);
		if (authResponse instanceof Response) return authResponse;

		const user = authResponse.user;
		const id = env.WL_DURABLE_OBJECT.idFromString(user.user_id);
		const stub = env.WL_DURABLE_OBJECT.get(id);
		const result = await stub.createWorkout();
		console.log('asdf', result);

		return new Response(JSON.stringify({ workout_id: result }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.log(error);
		return errorResponse('Internal server error', 500);
	}
};
