import { Context } from 'hono';
import { errorResponse } from '../../utils/response_utils';
// import { recordExercise } from '../../utils/record_analytics';

export const createRowRoute = async (context: Context): Promise<Response> => {
	const { verifyToken } = await import('../../utils/auth');
	try {
		const { req: request, env } = context;
		const { row, workout_id } = await request.json();
		const { rowDistance: row_distance, rowTime: row_time } = row;
		console.log('distance:', row_distance);
		console.log('time:', row_time);
		console.log('workout_id:', workout_id);

		const authResponse = await verifyToken(request.raw, env);
		if (authResponse instanceof Response) return authResponse;

		const user = authResponse.user;
		const id = env.WL_DURABLE_OBJECT.idFromName(user.email);
		const stub = env.WL_DURABLE_OBJECT.get(id);
		const result = await stub.createRow(row_distance, row_time, workout_id);

		// update analytics for rows
		// recordExercise(reps, sets, weight, name, workout_id, user.email, env);

		return new Response(JSON.stringify({ workout_id: result }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.log(error);
		return errorResponse('Internal server error', 500);
	}
};
