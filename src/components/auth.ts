// import { getUserData } from "@/data/v";
import users from "@data/userSchema";
import {LOGIN} from '@data/v';

const handleSubmit = async (email: string, password: string): Promise<users> => {
  const response = await fetch(LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.user;
};

export default handleSubmit;