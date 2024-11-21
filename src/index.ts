import { Env } from './types';
import {
	registerRoute,
	profileRoute,
	loginRoute,
	createWorkoutRoute,
	deleteWorkoutRoute,
	getWorkoutRoute,
	updateWorkoutRoute,
	createExerciseRoute,
} from './routes';
import { Hono } from 'hono';
import { DurableObject } from 'cloudflare:workers';
import schema from '../durable_object_schema';
import { v4 as uuidv4 } from 'uuid';

/**
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/durable-objects
 */

export class WL_DURABLE_OBJECT extends DurableObject {
	/**
	 * The constructor is invoked once upon creation of the Durable Object, i.e. the first call to
	 * 	`DurableObjectStub::get` for a given identifier (no-op constructors can be omitted)
	 *
	 * @param ctx - The interface for interacting with Durable Object state
	 * @param env - The interface to reference bindings declared in wrangler.toml
	 */

	sql: SqlStorage;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.sql = ctx.storage.sql;
		this.sql.exec(schema);
	}

	checkIfUserExistsByEmail(email: string) {
		const cursor = this.ctx.storage.sql.exec<{ email: string }>('SELECT email, user_password FROM Users WHERE email = ?', email);
		// @ts-ignore
		const result = cursor.raw().toArray();
		return result.length > 0 ? result[0] : [];
	}

	insertUser(email: string, hashedPassword: string) {
		const cursor = this.ctx.storage.sql.exec<{ email: string }>(
			'INSERT INTO Users (email, user_password) VALUES (?, ?) RETURNING email;',
			email,
			hashedPassword
		);
		// @ts-ignore
		const result = cursor.raw().toArray();
		return result.length > 0;
	}

	getWorkout(workout_id: string) {
		try {
			const cursor = this.ctx.storage.sql.exec('SELECT * FROM Workout WHERE workout_id = ?', workout_id);

			// @ts-ignore
			const rawResult = cursor.raw().toArray();
			console.log('rawResult:', rawResult);

			// @ts-ignore
			const result = rawResult.map(([workout_id, created_at, workout_text]) => ({
				workout_id,
				created_at,
				workout_text,
			}));

			// Return the first object if only one result is expected
			return result.length > 0 ? result[0] : null;
		} catch (error) {
			console.error('Error fetching workout:', error);
			throw error;
		}
	}
	getWorkouts() {
		try {
			const cursor = this.ctx.storage.sql.exec('SELECT * FROM Workout');

			// @ts-ignore
			const rawResult = cursor.raw().toArray();
			console.log('rawResult:', rawResult);

			// @ts-ignore
			const result = rawResult.map(([workout_id, created_at, workout_text]) => ({
				workout_id,
				created_at,
				workout_text,
			}));

			return result;
		} catch (error) {
			console.error('Error fetching workouts:', error);
			throw error;
		}
	}

	createWorkout() {
		const workoutId = uuidv4();
		const cursor = this.ctx.storage.sql.exec(
			'INSERT INTO Workout (workout_id, workout_text) VALUES (?, ?) RETURNING workout_id',
			workoutId,
			'My Workout'
		);
		// @ts-ignore
		const result = cursor.raw().toArray();
		console.log('Inserted workout ID:', result);
		return result[0][0];
	}

	updateWorkout(workoutId: string, workout_text: string) {
		console.log('UPDATE Workout SET workout_text = ? WHERE workout_id = ?');
		try {
			const cursor = this.ctx.storage.sql.exec('UPDATE Workout SET workout_text = ? WHERE workout_id = ?', workout_text, workoutId);
			console.log('cursor:', cursor);
		} catch (e) {
			console.error('Error updating workout:', e);
			throw e;
		}
	}

	deleteWorkout(workoutId: string) {
		const c1 = this.ctx.storage.sql.exec('DELETE FROM Exercise WHERE workout_id = ?;', workoutId);

		const c2 = this.ctx.storage.sql.exec('DELETE FROM Workout WHERE workout_id = ? RETURNING workout_id', workoutId);
		// @ts-ignore
		const result = c2.raw().toArray();
		return result[0][0];
	}

	createExercise(reps: string, sets: string, weight: string, name: string, workout_id: string) {
		const exerciseId = uuidv4();
		const cursor = this.ctx.storage.sql.exec(
			'INSERT INTO Exercise (exercise_id, reps, sets, weight, name, workout_id) VALUES (?, ?, ?, ?, ?, ?) RETURNING exercise_id',
			exerciseId,
			reps,
			sets,
			weight,
			name,
			workout_id
		);
		// @ts-ignore
		const result = cursor.raw().toArray();
		return result[0][0];
	}

	getExercisesByWorkoutId(workout_id: string) {
		const cursor = this.ctx.storage.sql.exec('SELECT exercise_id, reps, sets, weight, name FROM Exercise WHERE workout_id = ?', workout_id);
		// @ts-ignore
		const rawResult = cursor.raw().toArray();
		console.log('rawResult:', rawResult);

		// @ts-ignore
		const result = rawResult.map(([exercise_id, reps, sets, weight, name]) => ({
			exercise_id,
			reps,
			sets,
			weight,
			name,
		}));

		return result;
	}
}

const app = new Hono<{ Bindings: Env }>();

// Account routes
app.post('/api/login', loginRoute);
app.post('/api/register', registerRoute);
app.get('/api/profile', profileRoute);

// Workout routes
app.get('/api/workout', getWorkoutRoute);
app.post('/api/workout', createWorkoutRoute);
app.delete('/api/workout', deleteWorkoutRoute);
app.put('/api/workout', updateWorkoutRoute);

// Exercise routes
app.post('/api/exercise', createExerciseRoute);

export default app;
