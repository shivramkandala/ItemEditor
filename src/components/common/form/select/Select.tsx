import { SelectOptions } from '../../../../shared/interfaces/ItemEditor.interface';
import './Select.css';

const Select = ({ labelName, value, onChange, options, field }: any) => {
  const onInputChange = (event: any) => {
    onChange(event.target.value);
  };

  return (
    <div className="form-label-container">
      <div className="form-label ">{labelName}</div>
      <div className="custom-select">
        <select className="input-value" value={value} onChange={onInputChange}>
          {options &&
            options.map((optionObj: SelectOptions) => {
              return (
                <option
                  key={optionObj.optionValue}
                  value={optionObj.optionValue}
                >
                  {optionObj.optionName}
                </option>
              );
            })}
        </select>
      </div>
    </div>
  );
};
export default Select;
