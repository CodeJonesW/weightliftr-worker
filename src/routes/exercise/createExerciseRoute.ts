import { Context } from 'hono';
import { errorResponse } from '../../utils/response_utils';
import { recordExercise } from '../../utils/record_analytics';

export const createExerciseRoute = async (context: Context): Promise<Response> => {
	console.log('createExerciseRoute');
	const { verifyToken } = await import('../../utils/auth');
	try {
		const { req: request, env } = context;
		const { exercise, workout_id } = await request.json();
		const { reps, sets, weight, name } = exercise;
		console.log('reps:', reps);
		console.log('sets:', sets);
		console.log('weight:', weight);
		console.log('name:', name);
		console.log('workout_id:', workout_id);

		const authResponse = await verifyToken(request.raw, env);
		if (authResponse instanceof Response) return authResponse;

		const user = authResponse.user;
		const id = env.WL_DURABLE_OBJECT.idFromName(user.email);
		const stub = env.WL_DURABLE_OBJECT.get(id);
		const result = await stub.createExercise(reps, sets, weight, name, workout_id);

		recordExercise(reps, sets, weight, name, workout_id, user.email, env);

		return new Response(JSON.stringify({ workout_id: result }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.log(error);
		return errorResponse('Internal server error', 500);
	}
};
