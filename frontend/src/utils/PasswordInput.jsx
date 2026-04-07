import { useState } from "react";

function PasswordInput({ name, value, onChange, placeholder = "Password" }) {

  const [show, setShow] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        required
      />

      <span
        onClick={() => setShow(prev => !prev)}
        style={{
          position: "absolute",
          right: "10px",
          top: "50%",
          transform: "translateY(-50%)",
          cursor: "pointer"
        }}
      >
        {show ? "🙈" : "👁️"}
      </span>

    </div>
  );
}

export default PasswordInput;