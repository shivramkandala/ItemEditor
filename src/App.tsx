import React from 'react';
import './App.css';
import ItemEditor from './components/itemeditor';
import { MOCK_DATA } from './mockdata/Data';
import { IFormItem } from './shared/interfaces/ItemEditor.interface';

function App() {
  const itemsList = JSON.parse(JSON.stringify(MOCK_DATA));
  const title = 'Item Editor';
  const handleSave = (items: IFormItem[]) => {
    if (items.length > 0) {
      console.log('Modified Items', items);
      alert('Modified Items are received and can be seen in console');
    }
    if (items.length === 0) {
      alert('No Items modified');
    }
  };
  return (
    <div className="App">
      <ItemEditor items={itemsList} onSave={handleSave} title={title} />
    </div>
  );
}

export default App;
