import { Env, User } from '../../types';

export const checkIfUserExistsByEmail = async (email: string, env: Env): Promise<null | User> => {
	return await env.DB.prepare(`SELECT * FROM Users WHERE email = ?`).bind(email).first();
};

export const insertAuthEntry = async (env: Env, user_id: any) => {
	return await env.DB.prepare(`INSERT INTO Auth (user_id) VALUES (?)`).bind(user_id).run();
};
export const findUserClientData = async (env: Env, user_id: any) => {
	return await env.DB.prepare(`SELECT email FROM Users WHERE user_id = ?`).bind(user_id).first();
};
