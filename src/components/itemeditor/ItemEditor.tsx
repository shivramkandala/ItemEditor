import { useEffect, useReducer } from 'react';
import Items from './items';
import FormEditor from './formeditor';
import './ItemEditor.css';
import {
  IFormItem,
  IFieldChange,
  IFormItemHistory,
  IUserActionType,
} from '../../shared/interfaces/ItemEditor.interface';
import { UserActionsType } from '../../shared/types/ItemEditor.types';

interface ItemEditorProps {
  items: IFormItem[];
  onSave(items: IFormItem[]): void;
  title: string;
}

interface State {
  selectedItem: IFormItem;
  formItems: IFormItem[];
  formItemsHistory: IFormItemHistory[];
  currentPosition: number;
}

const emptyUserAction: IUserActionType = {
  type: UserActionsType.SELECTED_ITEM,
  selectedItemID: '',
};

const emptyFormItem: IFormItem = {
  id: '',
  name: '',
  fields: [],
};

const reducer = (state: State, action: any): State => {
  switch (action.type) {
    case 'SET_FORM_ITEMS': {
      return {
        ...state,
        formItems: action.formItems,
        selectedItem: action.selectedItem,
        formItemsHistory: [...state.formItemsHistory, action.newSelection],
        currentPosition: 0,
      };
    }
    case 'RESET': {
      return {
        ...state,
        formItems: action.formItems,
        selectedItem: action.selectedItem,
        formItemsHistory: [action.newSelection],
        currentPosition: 0,
      };
    }
    case 'REDO': {
      return {
        ...state,
        selectedItem: action.selectedItem,
        formItemsHistory: action.formItemsHistory
          ? [...action.formItemsHistory]
          : [...state.formItemsHistory],
        currentPosition: action.currentPosition,
      };
    }
    case 'ITEM_SELECTED': {
      return {
        ...state,
        selectedItem: action.selectedItem,
        formItemsHistory: [...state.formItemsHistory, action.newSelection],
        currentPosition: action.currentPosition,
      };
    }
    case 'FIELD_CHANGED': {
      return {
        ...state,
        formItemsHistory: [...action.formItemsHistory],
      };
    }
    case 'UNDO': {
      return {
        ...state,
        selectedItem: action.selectedItem,
        formItemsHistory: action.formItemsHistory
          ? [...action.formItemsHistory]
          : [...state.formItemsHistory],
        currentPosition: action.currentPosition,
      };
    }
    default: {
      return {
        ...state,
      };
    }
  }
};

const ItemEditor = ({ items, onSave, title }: ItemEditorProps) => {
  const [state, dispatch] = useReducer(reducer, {
    selectedItem: emptyFormItem,
    formItems: [],
    formItemsHistory: [],
    currentPosition: -1,
  });

  const onSaveItems = () => {
    const modifiedItems: IFormItem[] = [];
    items.forEach((item: IFormItem, index: number) => {
      const internalItem = state.formItems[index];
      if (JSON.stringify(item) !== JSON.stringify(internalItem)) {
        modifiedItems.push(internalItem);
      }
    });
    onSave(modifiedItems);
  };

  const onCancel = () => {
    const updatedItems = JSON.parse(JSON.stringify(items));
    const newSelection: IFormItemHistory = {
      selectedItemID: updatedItems[0].id,
      past: [],
      present: emptyUserAction,
      future: [],
    };

    dispatch({
      type: 'RESET',
      formItems: updatedItems,
      selectedItem: updatedItems[0],
      newSelection,
    });
  };

  // Current Position gives the required current form details
  // update the past, present and future of the formItemsHistory based on user input
  // undo actions are received from past array
  // and on each click , an action is performed and update the current state
  const onUndo = () => {
    const lastIndex = state.currentPosition;
    if (lastIndex > -1) {
      const lastFormItem: IFormItemHistory = state.formItemsHistory[lastIndex];
      const pastLength = lastFormItem.past.length;
      if (pastLength > 0) {
        let lastAction: any = lastFormItem.past[pastLength - 1];
        let lastSecondAction: any;
        let isSkip = false;
        // Get the current selected Item from FormItems
        // current Selected Item would be used to get present value
        const currentFormItem = state.formItems.find(
          (obj) => obj.id === lastAction.selectedItemID
        );
        const updateSelectedItem = { ...currentFormItem };
        let userActionOldPresent: IUserActionType = {
          ...lastFormItem.present,
        };
        if (
          currentFormItem &&
          currentFormItem.fields &&
          currentFormItem.fields.length > 0
        ) {
          const fieldIndex = currentFormItem.fields
            .map((obj: any) => obj.id)
            .indexOf(lastAction.fieldChange.id);

          // isSkip is used for handling special scenario for details see onFieldChange comments
          if (
            updateSelectedItem.fields[fieldIndex].fieldValue ===
              lastAction.fieldChange.value &&
            updateSelectedItem.fields[fieldIndex].id ===
              lastAction.fieldChange.id
          ) {
            isSkip = true;
            lastSecondAction = lastFormItem.past[pastLength - 2];
            updateSelectedItem.fields[fieldIndex].fieldValue =
              lastSecondAction.fieldChange.value;
          } else {
            updateSelectedItem.fields[fieldIndex].fieldValue =
              lastAction.fieldChange.value;
          }

          const userActionPresent: IUserActionType = {
            type: UserActionsType.FIELD_VALUE,
            fieldChange: {
              id: currentFormItem.fields[fieldIndex].id,
              value: currentFormItem.fields[fieldIndex].fieldValue,
              parentID: currentFormItem.id,
            },
            selectedItemID: currentFormItem.id,
          };

          let updatedPast = [];
          if (isSkip) {
            updatedPast = lastFormItem.past.slice(
              0,
              lastFormItem.past.length - 2
            );
          } else {
            updatedPast = lastFormItem.past.slice(
              0,
              lastFormItem.past.length - 1
            );
          }

          const formItemsHistoryUpdated = JSON.parse(
            JSON.stringify(state.formItemsHistory)
          );
          const currentSelectedHistory = formItemsHistoryUpdated[lastIndex];
          if (currentSelectedHistory) {
            currentSelectedHistory.past = [...updatedPast];
            currentSelectedHistory.present = userActionPresent;
            currentSelectedHistory.future = [
              userActionOldPresent,
              ...currentSelectedHistory.future,
            ];
            if (isSkip) {
              currentSelectedHistory.future = [
                lastAction,
                ...currentSelectedHistory.future,
              ];
            }
          }
          formItemsHistoryUpdated[lastIndex] = currentSelectedHistory;

          dispatch({
            type: 'UNDO',
            selectedItem: updateSelectedItem,
            formItemsHistory: formItemsHistoryUpdated,
            currentPosition: state.currentPosition,
          });
        } else {
          console.log('Unable to find the index');
        }
      } else {
        const PreviousFormItem: IFormItemHistory =
          state.formItemsHistory[lastIndex - 1];
        if (PreviousFormItem && PreviousFormItem.selectedItemID) {
          const updateSelectedItem = state.formItems.find(
            (obj) => obj.id === PreviousFormItem.selectedItemID
          );
          dispatch({
            type: 'UNDO',
            selectedItem: updateSelectedItem,
            currentPosition: lastIndex - 1,
          });
        } else {
          alert('No Undo Actions Available or All Undo Actions completed');
        }
      }
    } else {
      console.log('No Past Actions Available !!!!!!!!!!!!!!!!!!');
    }
  };

  // Current Position gives the required current form details
  // update the past, present and future of the formItemsHistory based on user input
  // redo actions are received from future array and perform redo on each click
  const onRedo = () => {
    const currentIndex = state.currentPosition;
    if (currentIndex > -1) {
      const PresentFormItem: IFormItemHistory =
        state.formItemsHistory[currentIndex];
      const futureLength = PresentFormItem.future.length;
      if (futureLength > 0) {
        const firstFutureAction: any = PresentFormItem.future[0];
        const currentFormItem = state.formItems.find(
          (obj) => obj.id === firstFutureAction.selectedItemID
        );
        let isSkip = false;
        let nextAction: any;
        if (currentFormItem && currentFormItem.id) {
          const updateSelectedItem = { ...currentFormItem };
          let userActionOldPresent: IUserActionType = {
            ...PresentFormItem.present,
          };

          const fieldIndex = currentFormItem.fields
            .map((obj: any) => obj.id)
            .indexOf(firstFutureAction.fieldChange.id);
          // isSkip is used for handling special scenario for details see onFieldChange comments
          if (
            updateSelectedItem.fields[fieldIndex].fieldValue ===
              firstFutureAction.fieldChange.value &&
            updateSelectedItem.fields[fieldIndex].id ===
              firstFutureAction.fieldChange.id
          ) {
            isSkip = true;
            nextAction = PresentFormItem.future[1];
            updateSelectedItem.fields[fieldIndex].fieldValue =
              nextAction.fieldChange.value;
          } else {
            updateSelectedItem.fields[fieldIndex].fieldValue =
              firstFutureAction.fieldChange.value;
          }

          const userActionPresent: IUserActionType = {
            type: UserActionsType.FIELD_VALUE,
            fieldChange: {
              id: currentFormItem.fields[fieldIndex].id,
              value: currentFormItem.fields[fieldIndex].fieldValue,
              parentID: currentFormItem.id,
            },
            selectedItemID: currentFormItem.id,
          };
          let updatedFuture = [];
          if (isSkip) {
            updatedFuture = PresentFormItem.future.slice(2);
          } else {
            updatedFuture = PresentFormItem.future.slice(1);
          }

          const formItemsHistoryUpdated = JSON.parse(
            JSON.stringify(state.formItemsHistory)
          );
          const currentSelectedHistory = formItemsHistoryUpdated[currentIndex];
          if (currentSelectedHistory) {
            currentSelectedHistory.past = [
              ...currentSelectedHistory.past,
              userActionOldPresent,
            ];
            currentSelectedHistory.present = userActionPresent;
            currentSelectedHistory.future = [...updatedFuture];
            if (isSkip) {
              currentSelectedHistory.past = [
                ...currentSelectedHistory.past,
                firstFutureAction,
              ];
            }
          }
          formItemsHistoryUpdated[currentIndex] = currentSelectedHistory;
          dispatch({
            type: 'REDO',
            selectedItem: updateSelectedItem,
            formItemsHistory: formItemsHistoryUpdated,
            currentPosition: state.currentPosition,
          });
        } else {
          console.log('Unable to find the index');
        }
      } else {
        const nextFormItem: IFormItemHistory =
          state.formItemsHistory[currentIndex + 1];
        if (nextFormItem && nextFormItem.selectedItemID) {
          const updateSelectedItem = state.formItems.find(
            (obj) => obj.id === nextFormItem.selectedItemID
          );
          dispatch({
            type: 'REDO',
            selectedItem: updateSelectedItem,
            currentPosition: currentIndex + 1,
          });
        } else {
          alert('No Redo Actions Available or All Redo Actions completed');
        }
      }
    } else {
      console.log('No Future Actions Available !!!!!!!!!!!!!!!!!!');
    }
  };

  // Each Selected Item will have past, present and future details
  // past will hold old events (Undo Actions)
  // present will hold current event
  // future will hold all Redo actions
  const onSelectedItem = (value: IFormItem) => {
    const newSelection: IFormItemHistory = {
      selectedItemID: value.id,
      past: [],
      present: emptyUserAction,
      future: [],
    };

    dispatch({
      type: 'ITEM_SELECTED',
      selectedItem: value,
      newSelection,
      currentPosition: state.formItemsHistory.length,
    });
  };

  // On Field Change, this method will capture current and previous value of field
  // One special scenario: user can modified a field and then update a different field
  // Example: 1st user edits Username and then edits active button.We need to capture 3 events for above scenario
  // Username present value, active button current and previous value
  const onFieldChange = (
    currentFieldChange: IFieldChange,
    previousFieldChange?: IFieldChange
  ) => {
    const userActionPast: IUserActionType = {
      type: UserActionsType.FIELD_VALUE,
      fieldChange: previousFieldChange,
      selectedItemID: currentFieldChange.parentID,
    };

    const userActionPresent: IUserActionType = {
      type: UserActionsType.FIELD_VALUE,
      fieldChange: currentFieldChange,
      selectedItemID: currentFieldChange.parentID,
    };

    const index = state.formItemsHistory
      .map((obj) => obj.selectedItemID)
      .lastIndexOf(currentFieldChange.parentID);
    const formItemsHistoryUpdated = JSON.parse(
      JSON.stringify(state.formItemsHistory)
    );
    const currentSelectedHistory = formItemsHistoryUpdated[index];

    if (currentSelectedHistory) {
      // special scenario
      if (
        currentSelectedHistory.present &&
        currentSelectedHistory.present.fieldChange &&
        currentSelectedHistory.present.fieldChange.id &&
        previousFieldChange?.id !==
          currentSelectedHistory.present.fieldChange.id
      ) {
        currentSelectedHistory.past = [
          ...currentSelectedHistory.past,
          currentSelectedHistory.present,
        ];
      }
      currentSelectedHistory.past = [
        ...currentSelectedHistory.past,
        userActionPast,
      ];
      currentSelectedHistory.present = userActionPresent;
      currentSelectedHistory.future = [];
    }
    formItemsHistoryUpdated[index] = currentSelectedHistory;

    dispatch({
      type: 'FIELD_CHANGED',
      formItemsHistory: formItemsHistoryUpdated,
    });
  };

  useEffect(() => {
    if (items && items.length > 0) {
      const updatedItems = JSON.parse(JSON.stringify(items));
      const userActionPast: IUserActionType = {
        type: UserActionsType.SELECTED_ITEM,
        selectedItemID: updatedItems[0].id,
      };
      const newSelection: IFormItemHistory = {
        selectedItemID: updatedItems[0].id,
        past: [],
        present: emptyUserAction,
        future: [],
      };

      dispatch({
        type: 'SET_FORM_ITEMS',
        formItems: updatedItems,
        selectedItem: updatedItems[0],
        userActionPast,
        newSelection,
      });
    }
  }, [items]);
  return (
    <div className="item-editor-container">
      <div className="editor-title">Item Editor</div>
      <div className="editor-container">
        <div className="item-list item-container">
          <Items
            items={state.formItems}
            item={state.selectedItem}
            onChangeItem={onSelectedItem}
          />
        </div>
        <div className="item-editor item-container">
          <FormEditor item={state.selectedItem} onFieldChange={onFieldChange} />
        </div>
      </div>
      <div className="button-container">
        <button className="custom-btn btn1" onClick={onSaveItems}>
          Save
        </button>
        <button className="custom-btn btn2" onClick={onCancel}>
          Cancel
        </button>
        <button className="custom-btn btn3" onClick={onUndo}>
          Undo
        </button>
        <button className="custom-btn btn3" onClick={onRedo}>
          Redo
        </button>
      </div>
    </div>
  );
};

export default ItemEditor;
