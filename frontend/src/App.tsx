import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import AppRoutes from "./routes/AppRoutes";
import { supabase } from "./services/supabase";

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <AppRoutes session={session} />;
}

export default App;