import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

type Instrument = {
  id: number;
  name: string;
};

function App() {
  const [profiles, setProfiles] = useState<Instrument[]>([]);

  useEffect(() => {
    const getProfiles = async () => {
      const { data, error } = await supabase.from("profiles").select("*");

      if (error) {
        console.error(error);
        return;
      }

      setProfiles(data);
    };

    getProfiles();
  }, []);

  return (
    <ul>
      {profiles.map((profile) => (
        <li key={profile.id}>{profile.name}</li>
      ))}
    </ul>
  );
}

export default App;
