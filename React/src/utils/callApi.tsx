export async function callApi<T = any>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" = "POST",
    data?: Record<string, any>
  ): Promise<T> {
    const token = localStorage.getItem("token");
  
    const response = await fetch(`http://127.0.0.1:5000/api${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "API request failed");
    }
  
    return response.json() as Promise<T>;
  }
  