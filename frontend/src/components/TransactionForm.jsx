// components/TransactionForm.jsx
import { useState } from "react";

function TransactionForm({ onSubmit, users = [], categories = [], isAdmin }) {

  const [form, setForm] = useState({
    type: "Income",
    description: "",
    categoryId: "",
    amount: "",
    userId: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>

      <select name="type" value={form.type} onChange={handleChange}>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>

      <input name="description" placeholder="Description" onChange={handleChange} />

      <select name="categoryId" onChange={handleChange}>
        <option>Select Category</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <input name="amount" type="number" placeholder="Amount" onChange={handleChange} />

      {/* Admin can select user */}
      {isAdmin && (
        <select name="userId" onChange={handleChange}>
          <option>Select User</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      )}

      <button type="submit">Add Transaction</button>
    </form>
  );
}

export default TransactionForm;