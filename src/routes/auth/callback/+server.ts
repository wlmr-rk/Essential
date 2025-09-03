
export const GET = async (event) => {
  const {
    url,
    locals: { supabase },
  } = event;
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/dashboard';

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return new Response(null, {
        status: 303,
        headers: {
          Location: `/${next.slice(1)}`
        }
      });
    }
  }

  // return the user to an error page with instructions
  return new Response(null, {
    status: 303,
    headers: {
      Location: '/auth/auth-code-error'
    }
  });
};
