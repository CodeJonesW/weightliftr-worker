import { Env } from './types';
import {
	registerRoute,
	profileRoute,
	loginRoute,
	createWorkoutRoute,
	deleteWorkoutRoute,
	getWorkoutRoute,
	updateWorkoutRoute,
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

	async getWorkout(workout_id: string) {
		try {
			const cursor = this.ctx.storage.sql.exec<{ workout_id: string; workout_text: string }>(
				'SELECT * FROM Workout WHERE workout_id = ?',
				workout_id
			);

			// If your library provides `.raw()`, it may return raw data
			// e.g., [ [ "some_id", "some_text" ] ] instead of [{ workout_id: "some_id", workout_text: "some_text" }]
			// @ts-ignore
			const rawResult = cursor.raw().toArray();
			console.log('rawResult:', rawResult);

			// Map the raw results to objects if necessary
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
	async getWorkouts() {
		try {
			const cursor = this.ctx.storage.sql.exec<{ workout_id: string; workout_text: string }>('SELECT * FROM Workout');

			// If your library provides `.raw()`, it may return raw data
			// e.g., [ [ "some_id", "some_text" ] ] instead of [{ workout_id: "some_id", workout_text: "some_text" }]
			// @ts-ignore
			const rawResult = cursor.raw().toArray();
			console.log('rawResult:', rawResult);

			// Map the raw results to objects if necessary
			// @ts-ignore
			const result = rawResult.map(([workout_id, created_at, workout_text]) => ({
				workout_id,
				created_at,
				workout_text,
			}));

			// Return the first object if only one result is expected
			return result;
		} catch (error) {
			console.error('Error fetching workouts:', error);
			throw error;
		}
	}

	async createWorkout() {
		const workoutId = uuidv4();

		const cursor = this.ctx.storage.sql.exec<{ workout_id: string }>(
			'INSERT INTO Workout (workout_id) VALUES (?) RETURNING workout_id',
			workoutId
		);
		// @ts-ignore
		const result = cursor.raw().toArray();
		console.log('Inserted workout ID:', result);
		return result[0][0];
	}

	async updateWorkout(workoutId: string, workoutText: string) {
		console.log('UPDATE Workout SET workout_text = ? WHERE workout_id = ?');
		try {
			const cursor = this.ctx.storage.sql.exec<{ workout_id: string }>(
				'UPDATE Workout SET workout_text = ? WHERE workout_id = ?',
				workoutText,
				workoutId
			);
			console.log('cursor:', cursor);
		} catch (e) {
			console.error('Error updating workout:', e);
			throw e;
		}
	}

	async deleteWorkout(workoutId: string) {
		const cursor = this.ctx.storage.sql.exec<{ workout_id: string }>(
			'DELETE FROM Workout WHERE workout_id = ? RETURNING workout_id',
			workoutId
		);
		// @ts-ignore
		const result = cursor.raw().toArray();
		return result[0][0];
	}
}

const app = new Hono<{ Bindings: Env }>();

app.post('/api/login', loginRoute);
app.post('/api/register', registerRoute);
app.get('/api/profile', profileRoute);
app.get('/api/workout', getWorkoutRoute);
app.post('/api/workout', createWorkoutRoute);
app.delete('/api/workout', deleteWorkoutRoute);
app.put('/api/workout', updateWorkoutRoute);

export default app;
