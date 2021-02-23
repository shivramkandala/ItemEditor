import './Toggle.css';

const Toggle = ({ labelName, value, onChange }: any) => {
  const onInputChange = (event: any) => {
    onChange(event.target.checked);
  };

  return (
    <div className="form-label-container">
      <label className="custom-checkbox">
        <input type="checkbox" checked={value} onChange={onInputChange} />
        <span className="custom-checkbox-label"></span>
        <label className="form-label toggle-label">{labelName}</label>
      </label>
    </div>
  );
};

export default Toggle;
