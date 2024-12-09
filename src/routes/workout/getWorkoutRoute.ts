import { Context } from 'hono';
import { errorResponse } from '../../utils/response_utils';

export const getWorkoutRoute = async (context: Context): Promise<Response> => {
	const { verifyToken } = await import('../../utils/auth');
	try {
		const { req: request, env } = context;
		const url = new URL(request.url);
		const workout_id = url.searchParams.get('workout_id');

		const authResponse = await verifyToken(request.raw, env);
		if (authResponse instanceof Response) return authResponse;

		const user = authResponse.user;
		const id = env.WL_DURABLE_OBJECT.idFromName(user.email);
		const stub = env.WL_DURABLE_OBJECT.get(id);
		const meta = await stub.getWorkout(workout_id);
		const { exercises, rows } = await stub.getExercisesByWorkoutId(workout_id);

		return new Response(JSON.stringify({ meta, exercises, rows }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.log(error);
		return errorResponse('Internal server error', 500);
	}
};
