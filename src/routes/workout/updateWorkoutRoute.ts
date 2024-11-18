import { Context } from 'hono';
import { errorResponse } from '../../utils/response_utils';

export const updateWorkoutRoute = async (context: Context): Promise<Response> => {
	const { verifyToken } = await import('../../utils/auth');
	try {
		const { req: request, env } = context;
		const { workout_id, workout_text } = await request.json();
		console.log('updateWorkoutRoute', workout_id, workout_text);

		const authResponse = await verifyToken(request.raw, env);
		if (authResponse instanceof Response) return authResponse;

		const user = authResponse.user;
		const id = env.WL_DURABLE_OBJECT.idFromString(user.user_id);
		const stub = env.WL_DURABLE_OBJECT.get(id);
		await stub.updateWorkout(workout_id, workout_text);
		console.log('Workout updated');

		return new Response(JSON.stringify({}), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.log('caught error', error);
		return errorResponse('Internal server error', 500);
	}
};
