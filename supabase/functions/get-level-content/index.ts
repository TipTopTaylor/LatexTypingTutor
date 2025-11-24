import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

// Map level strings to numbers
function getLevelNumber(level: string): number | null {
  if (level.startsWith('level')) {
    const num = parseInt(level.replace('level', ''));
    return isNaN(num) ? null : num;
  }
  
  // Special levels
  const specialLevels: Record<string, number> = {
    'forPhysicist': 7,
    'forMathematicians': 8
  };
  
  return specialLevels[level] || null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const url = new URL(req.url);
    const levelParam = url.searchParams.get('level');
    const sublevel = url.searchParams.get('sublevel');

    if (!levelParam || !sublevel) {
      return new Response(
        JSON.stringify({ error: 'Missing level or sublevel parameter' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const levelNumber = getLevelNumber(levelParam);
    if (levelNumber === null) {
      return new Response(
        JSON.stringify({ error: 'Invalid level parameter' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data, error } = await supabase
      .from('level_content')
      .select('content')
      .eq('level_number', levelNumber)
      .eq('sublevel_name', sublevel)
      .maybeSingle();

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Content not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ content: data.content }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});