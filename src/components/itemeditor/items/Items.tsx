import { IFormItem } from '../../../shared/interfaces/ItemEditor.interface';
import './Item.css';

interface ItemProps {
  item: IFormItem;
  items: IFormItem[];
  onChangeItem(value: IFormItem): void;
}

const Items = ({ items, item, onChangeItem }: ItemProps) => {
  const onItemChange = (value: IFormItem) => {
    onChangeItem(value);
  };
  return (
    <div className="item-list-container">
      <div className="custom-title">Select an Item </div>
      {items &&
        items.map((fieldItem: any) => {
          return (
            <div
              onClick={() => {
                onItemChange(fieldItem);
              }}
              className={
                'item ' + (item.id === fieldItem.id ? 'selected-item' : '')
              }
              key={fieldItem.id}
            >
              {fieldItem.name}
            </div>
          );
        })}
    </div>
  );
};

export default Items;
