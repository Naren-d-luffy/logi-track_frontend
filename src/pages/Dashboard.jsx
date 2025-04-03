import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Header from "../components/Header";
import axiosInstance from "../services/axiosConfig";
import Swal from "sweetalert2";
import "../index.css";

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    category: "",
  });
  const [editItemId, setEditItemId] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axiosInstance.get("/items");
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const csvHeaders = [
    { label: "Item Name", key: "name" },
    { label: "Category", key: "category" },
    { label: "Quantity", key: "quantity" },
    { label: "Date Added", key: "dateAdded" },
  ];

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Inventory Report", 14, 15);

    const tableData = items.map((item) => [
      item.name,
      item.category,
      item.quantity,
      new Date(item.dateAdded).toLocaleDateString(),
    ]);

    autoTable(doc, {
      head: [["Item Name", "Category", "Quantity", "Date Added"]],
      body: tableData,
      startY: 25,
    });

    doc.save("Inventory_Report.pdf");
  };

  const handleDispatch = async (id, quantity) => {
    if (quantity <= 0) {
      Swal.fire("Stock Empty!", "Cannot dispatch. Stock is empty!", "error");
      return;
    }

    try {
      await axiosInstance.put(`/items/${id}`, { quantity: quantity - 1 });
      fetchItems();

      if (quantity - 1 < 6) {
        Swal.fire("Warning!", "Item stock is below 5!", "warning");
      }
    } catch (error) {
      console.error("Error dispatching item:", error);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to undo this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/items/${id}`);
          fetchItems();
          Swal.fire("Deleted!", "The item has been removed.", "success");
        } catch (error) {
          console.error("Error deleting item:", error);
        }
      }
    });
  };

  const handleAddOrUpdateItem = async (e) => {
    e.preventDefault();
    try {
      if (editItemId) {
        await axiosInstance.put(`/items/${editItemId}`, formData);
        Swal.fire("Updated!", "Item details updated successfully!", "success");
      } else {
        await axiosInstance.post("/items", formData);
        Swal.fire("Added!", "New item added successfully!", "success");
      }

      setShowModal(false);
      setFormData({ name: "", quantity: "", category: "" });
      setEditItemId(null);
      fetchItems();
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const handleEdit = (item) => {
    setEditItemId(item._id);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      category: item.category,
    });
    setShowModal(true);
  };

  const handleAddItemClick = () => {
    setEditItemId(null);
    setFormData({ name: "", quantity: "", category: "" });
    setShowModal(true);
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
        <div className="action-buttons">
          <button
            className="dispatch-btn"
            onClick={() => handleDispatch(row._id, row.quantity)}
          >
            Dispatch
          </button>
          <button className="edit-btn" onClick={() => handleEdit(row)}>
            Edit
          </button>
          <button
            className="delete-btn"
            onClick={() => handleDelete(row._id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="dashboard-container">
      <Header />
      <h2 className="dashboard-title">Warehouse Inventory</h2>
      <div className="export-buttons">
      <button onClick={generatePDF} className="csv-btn">
        <CSVLink
          data={items}
          headers={csvHeaders}
          filename={"inventory.csv"}
          className="link-btn"
        >
          Export CSV
        </CSVLink>
        </button>
        <button onClick={generatePDF} className="pdf-btn">
          Export PDF
        </button>
        <button className="add-item-btn" onClick={handleAddItemClick}>
          Add Item
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          pagination
          highlightOnHover
          className="data-table"
        />
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-btn" onClick={() => setShowModal(false)}>
              &times;
            </span>
            <h3>{editItemId ? "Edit Item" : "Add New Item"}</h3>
            <form onSubmit={handleAddOrUpdateItem}>
              <label>Item Name:</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <label>Quantity:</label>
              <input
                type="number"
                required
                min="0"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
              />

              <label>Category:</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />

              <button type="submit" className="submit-btn">
                {editItemId ? "Update Item" : "Add Item"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
