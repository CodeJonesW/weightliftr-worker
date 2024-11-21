import { Context } from 'hono';
import { errorResponse } from '../../utils/response_utils';

export const updateWorkoutRoute = async (context: Context): Promise<Response> => {
	const { verifyToken } = await import('../../utils/auth');
	try {
		const { req: request, env } = context;
		const { workout_id, workout_title } = await request.json();

		const authResponse = await verifyToken(request.raw, env);
		if (authResponse instanceof Response) return authResponse;

		const user = authResponse.user;
		const id = env.WL_DURABLE_OBJECT.idFromName(user.email);
		const stub = env.WL_DURABLE_OBJECT.get(id);
		await stub.updateWorkout(workout_id, workout_title);

		return new Response(JSON.stringify({}), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.log('caught error', error);
		return errorResponse('Internal server error', 500);
	}
};
