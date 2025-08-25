// Example usage in an Express route/controller:
// const authHeader = req.headers['authorization'];
// const accessToken = authHeader && authHeader.split(' ')[1]; // Only the JWT part
// await userService.updateProfile(accessToken, userId, profileData);
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
    const supabase = getSupabaseClient(accessToken);
    const { data, error } = await supabase
      .from('auth.users')
      .select('email')
      .eq('id', id)
    if (error) throw new Error(error.message);
    return data?.email;
  }

  static async getProfile(accessToken, id) {
    const supabase = getSupabaseClient(accessToken);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
    if (error) throw new Error(error.message);
    return data;
  }
}

module.exports = userService;