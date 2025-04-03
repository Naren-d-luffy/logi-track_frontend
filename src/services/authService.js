import axios from "./axiosConfig";

export const loginUser = async (credentials) => {
  const { data } = await axios.post("/admin/login", credentials);
  console.log("data:",data);  
  localStorage.setItem("token", data.token);
  return data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
};
