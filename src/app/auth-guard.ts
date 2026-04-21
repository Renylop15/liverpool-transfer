import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://chyuacdnyaduqnawsoii.supabase.co'; 
const supabaseKey = 'sb_publishable_j34PDqBJtmzklQqnP6kL4A_AxNnerKR';
const supabase = createClient(supabaseUrl, supabaseKey);

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  
  // Le preguntamos a Supabase si hay alguien con la sesión iniciada
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    return true; // ¡Pásale, eres admin!
  } else {
    router.navigate(['/login']); // Te mando a la pantalla de login
    return false;
  }
};