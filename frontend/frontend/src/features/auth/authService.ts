import api from "../../api/axios";

// Login fonksiyonu: email ve şifreyle backend'e istek atar
export async function login(email: string, password: string) {
  const response = await api.post("/auth/login", { email, password });
  return response.data; // {token: "..."}
}

// (İleride register, logout gibi fonksiyonlar da burada olur)