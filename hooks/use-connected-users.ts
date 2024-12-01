import { useEffect, useState } from "react";

export function useConnectedUsers() {
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/connected-users");
        if (!res.ok)
          throw new Error(
            "Erreur lors de la récupération des utilisateurs connectés",
          );
        const users = await res.json();
        setConnectedUsers(users);
        console.log(users);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUsers();
  }, []);

  return { connectedUsers, error };
}
