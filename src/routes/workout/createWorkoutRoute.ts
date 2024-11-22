import { Context } from 'hono';
import { errorResponse } from '../../utils/response_utils';
import { recordWorkout } from '../../utils/analytics';

export const createWorkoutRoute = async (context: Context): Promise<Response> => {
	const { verifyToken } = await import('../../utils/auth');
	try {
		const { req: request, env } = context;

		const authResponse = await verifyToken(request.raw, env);
		if (authResponse instanceof Response) return authResponse;

		const user = authResponse.user;
		const id = env.WL_DURABLE_OBJECT.idFromName(user.email);
		const stub = env.WL_DURABLE_OBJECT.get(id);
		const result = await stub.createWorkout();

		recordWorkout(result, env);

		return new Response(JSON.stringify({ workout_id: result }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.log(error);
		return errorResponse('Internal server error', 500);
	}
};
