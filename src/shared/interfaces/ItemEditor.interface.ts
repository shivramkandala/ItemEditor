import { UserActionsType } from '../types/ItemEditor.types';

export interface SelectOptions {
  optionName: string;
  optionValue: string;
}

export interface IFormItemDetails {
  id: string;
  fieldName: string;
  fieldType: string;
  fieldValue: string;
  fieldOptions?: SelectOptions[];
}

export interface IFormItem {
  id: string;
  name: string;
  fields: IFormItemDetails[];
}

export interface IFieldChange {
  id: string;
  value: string;
  parentID: string;
}

export interface IUserActionType {
  type: UserActionsType;
  fieldChange?: IFieldChange;
  selectedItemID?: string;
}

export interface IFormItemHistory {
  selectedItemID?: string;
  past: IUserActionType[];
  present: IUserActionType;
  future: IUserActionType[];
}
