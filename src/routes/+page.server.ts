import { investmentDb } from '$lib/database';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const investments = investmentDb.getAllInvestments();
  return {
    investments
  };
};