import './Input.css';

const Input = ({ labelName, value, onChange }: any) => {
  return (
    <div className="form-label-container">
      <div className="form-label ">{labelName}</div>
      <input
        className="custom-input input-value"
        type="text"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        name="name"
        placeholder="placeholder"
      />
    </div>
  );
};

export default Input;
