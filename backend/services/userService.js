const { createClient } = require('@supabase/supabase-js');

function getSupabaseClient(accessToken) {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
    {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    }
  );
}

class userService {
  // Pass accessToken as first argument to each method
  static async updateProfile(accessToken, id, profileData) {
    if (!accessToken || accessToken.split('.').length !== 3) {
      throw new Error("Invalid JWT token format in updateProfile");
    }
    const supabase = getSupabaseClient(accessToken);
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: id,
        ...profileData,
        updated_at: new Date()
      })
      .select('*');
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  static async getEmail(accessToken, id) {
    if (!accessToken || accessToken.split('.').length !== 3) {
      throw new Error("Invalid JWT token format in getEmail");
    }
    const supabase = getSupabaseClient(accessToken);
    const { data, error } = await supabase
      .from('auth.users')
      .select('email')
      .eq('id', id)
    if (error) throw new Error(error.message);
    return data?.email;
  }

  static async getProfile(accessToken, id) {
    if (!accessToken || accessToken.split('.').length !== 3) {
      throw new Error("Invalid JWT token format in getProfile");
    }
    const supabase = getSupabaseClient(accessToken);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
    if (error) 
      {console.log("[userService] Error fetching profile:", error.message);
        throw new Error(error.message);}
    return data;
  }
}

module.exports = userService;