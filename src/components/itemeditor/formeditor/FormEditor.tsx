import { useEffect, useState } from 'react';
import { FieldType } from '../../../shared/types/ItemEditor.types';
import {
  IFormItem,
  IFormItemDetails,
  IFieldChange,
} from '../../../shared/interfaces/ItemEditor.interface';
import Input from '../../common/form/input';
import Toggle from '../../common/form/toggle';
import Select from '../../common/form/select';

interface EditorProps {
  item: IFormItem;
  onFieldChange(
    currentFieldChange: IFieldChange,
    previousFieldChange: IFieldChange
  ): void;
}

const FormEditor = ({ item, onFieldChange }: EditorProps) => {
  const [formFields, setFormFields] = useState(item.fields);

  const onValueChange = (
    field: IFormItemDetails,
    index: number,
    currentValue: any
  ) => {
    const currentFieldChange: IFieldChange = {
      id: field.id,
      value: currentValue,
      parentID: item.id,
    };

    const previousFieldChange: IFieldChange = {
      id: field.id,
      value: field.fieldValue,
      parentID: item.id,
    };
    const newFormFields = [...formFields];
    newFormFields[index].fieldValue = currentValue;
    setFormFields(newFormFields);
    onFieldChange(currentFieldChange, previousFieldChange);
  };
  useEffect(() => {
    setFormFields(item.fields);
  }, [item]);

  const renderInputField = (field: IFormItemDetails, index: number) => {
    switch (field.fieldType) {
      case FieldType.TEXT: {
        return (
          <Input
            labelName={field.fieldName}
            key={field.id}
            value={field.fieldValue}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onValueChange(field, index, event)
            }
          />
        );
      }
      case FieldType.TOGGLE: {
        return (
          <Toggle
            labelName={field.fieldName}
            value={field.fieldValue}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onValueChange(field, index, event)
            }
          />
        );
      }
      case FieldType.OPTION: {
        return (
          <Select
            labelName={field.fieldName}
            value={field.fieldValue}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onValueChange(field, index, event)
            }
            options={field.fieldOptions}
          />
        );
      }
      default: {
        return null;
      }
    }
  };
  return (
    <>
      <div>
        <div className="custom-title">Form Elements for {item.name}</div>
        {formFields &&
          formFields.map((field, index) => {
            return <div key={field.id}>{renderInputField(field, index)}</div>;
          })}
      </div>
    </>
  );
};

export default FormEditor;
