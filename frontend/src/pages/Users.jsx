import { useEffect, useState } from "react";
import api from "../api/axios";

function Users() {

  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await api.get("/users");
    setUsers(res.data);
  };

  return (
    <div>

      <h2>All Users</h2>

      <ul>
        {users.map(u => (
          <li key={u.id}>
            {u.name} - {u.role}
          </li>
        ))}
      </ul>

    </div>
  );
}

export default Users;