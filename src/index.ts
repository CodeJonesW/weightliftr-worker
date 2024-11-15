import { Env } from './types';
import { registerRoute, profileRoute, loginRoute } from './routes';
import { Hono } from 'hono';
import { DurableObject } from 'cloudflare:workers';
import schema from '../durable_object_schema';

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
		let cursor = this.ctx.storage.sql.exec('SELECT * FROM Workout');
		// @ts-ignore
		return cursor.raw().toArray();
	}
}

const app = new Hono<{ Bindings: Env }>();

app.post('/api/login', loginRoute);
app.post('/api/register', registerRoute);
app.get('/api/profile', profileRoute);

export default app;
