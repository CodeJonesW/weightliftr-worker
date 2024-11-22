import { Env } from '../types/index';

export const recordNewUser = async (email: string, env: Env) => {
	env.WL_ANALYTICS_DATA.writeDataPoint({
		blobs: ['user_signup'],
		indexes: [email],
	});
};
