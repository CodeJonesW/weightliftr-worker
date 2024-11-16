import { Env } from './types';
import { registerRoute, profileRoute, loginRoute, createWorkoutRoute } from './routes';
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

	async getWorkouts() {
		console.log('SELECT * FROM Workout');
		let cursor = this.ctx.storage.sql.exec('SELECT * FROM Workout');
		// @ts-ignore
		return cursor.raw().toArray();
	}

	async createWorkout() {
		const workoutId = uuidv4();

		// Execute the query with bindings
		const cursor = this.ctx.storage.sql.exec<{ workout_id: string }>(
			'INSERT INTO Workout (workout_id) VALUES (?) RETURNING workout_id',
			workoutId
		);

		// Extract the result from the cursor
		// @ts-ignore
		const result = cursor.raw().toArray();
		return result[0][0];

		// Log and return the result
		console.log('Inserted workout ID:', result);
	}
}

const app = new Hono<{ Bindings: Env }>();

app.post('/api/login', loginRoute);
app.post('/api/register', registerRoute);
app.get('/api/profile', profileRoute);
app.post('/api/workout', createWorkoutRoute);

export default app;
