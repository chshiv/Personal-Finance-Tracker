import { useState } from "react";
import { createCategory, updateCategory, deleteCategory } from "../api/categoryApi";
import "../styles/Dashboard.css"

export default function ManageCategories({ categories, setCategories, setToast }) {

  const [newCategory, setNewCategory] = useState("");
  const [editingCat, setEditingCat] = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
  
    if (!newCategory.trim()) return;
  
    try {
      const res = await createCategory({ name: newCategory });
  
      // ✅ update UI instantly
      setCategories(prev => [...prev, res.data]);
  
      setNewCategory("");

      setToast({
        message: res.data.message || "Category added",
        type: "success"
      });

    }
    catch (err) {
      console.error(err);
    
      setToast({
        message: err.response?.data?.message || "Something went wrong",
        type: "error"
      });
    }
  };

  // UPDATE CATEGORY
  const handleUpdate = async (cat) => {
    try {
      const res = await updateCategory(cat.id, { name: cat.name });

      setCategories(prev =>
        prev.map(c => (c.id === cat.id ? res.data : c))
      );

      setEditingCat(null);

      setToast({
        message: res.data.message || "Category updated",
        type: "success"
      });
  
    } catch (err) {
      console.error(err);
    
      setToast({
        message: err.response?.data?.message || "Something went wrong",
        type: "error"
      });
    }
  };

  // DELETE CATEGORY
  const handleDelete = async (id) => {
    try {
      const res = await deleteCategory(id);

      setCategories(prev => prev.filter(c => c.id !== id));
      setToast({
        message: res.data.message || "Category deleted",
        type: "success"
      });

    } catch (err) {
      console.error(err);
    
      setToast({
        message: err.response?.data?.message || "Something went wrong",
        type: "error"
      });
    }
  };

  return (
    <div className="categories">
      <h3>Manage Categories</h3>

      <form onSubmit={handleAdd} className="category-form">
      <input
        type="text"
        placeholder="New category"
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
      />
      <button className="feature-btn" type="submit">Add</button>
    </form>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {categories.map(c => {
            const isEditing = editingCat?.id === c.id;

            return (
              <tr key={c.id} className={isEditing ? "editing-row" : ""}>

                {isEditing ? (
                  <>
                    <td>
                      <input
                        value={editingCat.name}
                        onChange={(e) =>
                          setEditingCat({
                            ...editingCat,
                            name: e.target.value
                          })
                        }
                      />
                    </td>

                    <td>
                      <button
                        className="btn-save"
                        onClick={() => handleUpdate(editingCat)}
                      >
                        Save
                      </button>

                      <button
                        className="btn-cancel"
                        onClick={() => setEditingCat(null)}
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{c.name}</td>

                    <td>
                      <button onClick={() => setEditingCat(c)}>
                        Edit
                      </button>

                      <button onClick={() => handleDelete(c.id)}>
                        Delete
                      </button>
                    </td>
                  </>
                )}

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}