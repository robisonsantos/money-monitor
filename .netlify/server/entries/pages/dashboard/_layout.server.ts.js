import { redirect } from "@sveltejs/kit";
const load = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, "/");
  }
  return {
    user: locals.user
  };
};
export {
  load
};
