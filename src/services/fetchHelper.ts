// import users from "@/data/userSchema";

// fetchHelper.ts
/*
This helper function uses the fetch API and hooks to retrieve relevand data and other information from the backend API. It handles errors and loading states, and returns the data in a format that can be easily consumed by the components. The function is designed to be reusable across different components that need to fetch data from the backend, ensuring consistency and reducing code duplication.
*/

// fetchHelper.ts

export async function useFetcher<users>(url: string): Promise<{
  data: users | null ;
  error: string | null;
}> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      let message = response.statusText;

      try {
        const errorData = await response.json();
        message = errorData.message || message;
      } catch { }

      return { data: null, error: message };
    }

    const data: users = await response.json();

    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}
export default useFetcher;