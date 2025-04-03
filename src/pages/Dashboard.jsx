import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Header from "../components/Header";
import axiosInstance from "../services/axiosConfig";
import "../index.css";

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      // Check if token exists in localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage");
        return;
      }

      // Log token to verify it exists (remove in production)
      console.log("Using token:", token);

      const response = await axiosInstance.get("/items");
      console.log("Response:", response);
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async (id, quantity) => {
    if (quantity <= 0) return alert("Stock already empty!");
    try {
      await axiosInstance.put(`/items/${id}`, { quantity: quantity - 1 });
      fetchItems();
    } catch (error) {
      console.error("Error dispatching item:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
    }
  };

  const columns = [
    { name: "Item Name", selector: (row) => row.name, sortable: true },
    { name: "Category", selector: (row) => row.category, sortable: true },
    { name: "Quantity", selector: (row) => row.quantity, sortable: true },
    {
      name: "Date Added",
      selector: (row) => new Date(row.dateAdded).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <button
          className={`dispatch-btn ${row.quantity > 5 ? "blue" : "red"}`}
          onClick={() => handleDispatch(row._id, row.quantity)}
        >
          Dispatch
        </button>
      ),
    },
  ];

  return (
    <div className="dashboard-container">
      <Header />
      <h2 className="dashboard-title">Warehouse Inventory</h2>
      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p>No items found or authentication error. Check console for details.</p>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          pagination
          highlightOnHover
          className="data-table"
        />
      )}
    </div>
  );
};

export default Dashboard;