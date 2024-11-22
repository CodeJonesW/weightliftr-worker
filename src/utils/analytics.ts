import { Env } from '../types/index';

export const recordNewUser = async (email: string, env: Env) => {
	try {
		env.WL_ANALYTICS.writeDataPoint({
			blobs: ['user_signup'],
			indexes: [email],
		});
		console.log('Recorded new user:', email);
	} catch (error) {
		console.error('Failed to record new user:', error);
		throw new Error('Error recording new user data');
	}
};

export const recordLogin = async (email: string, env: Env) => {
	try {
		env.WL_ANALYTICS.writeDataPoint({
			blobs: ['user_login'],
			indexes: [email],
		});
		console.log('Recorded login:', email);
	} catch (err) {
		console.error('Failed to record login:', err);
		throw new Error('Error recording login data');
	}
};

export const recordWorkout = async (workout_id: string, env: Env, metadata?: { email?: string; workout_name?: string }) => {
	if (!workout_id) {
		throw new Error('Invalid workout_id: Workout ID is required');
	}

	try {
		env.WL_ANALYTICS.writeDataPoint({
			blobs: ['workout', metadata?.workout_name || '', metadata?.email || ''],
			indexes: [workout_id],
		});

		console.log(`Workout recorded: ${workout_id}`);
	} catch (error) {
		console.error('Failed to record workout:', error);
		throw new Error('Error recording workout data');
	}
};

export const recordExercise = async (
	reps: string,
	sets: string,
	weight: string,
	name: string,
	workout_id: string,
	email: string,
	env: Env
) => {
	try {
		env.WL_ANALYTICS.writeDataPoint({
			blobs: ['exercise', email, name, reps, sets, weight],
			indexes: [workout_id],
		});
		console.log(`Exercise recorded: ${name}`);
	} catch (error) {
		console.error('Failed to record exercise:', error);
		throw new Error('Error recording exercise data');
	}
};
