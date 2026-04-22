import { View, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface DropdownProps<T> {
  items: T[];
  selectedValue: T | null;
  onSelect: (item: T) => void;
  getLabel: (item: T) => string;
  getKey: (item: T) => string;
  isOpen: boolean;
  onToggle: () => void;
  placeholder?: string;
  emptyText?: string;
  dropdownOverlays?: boolean;
  error?: boolean;
}

export function Dropdown<T>({
  items,
  selectedValue,
  onSelect,    // called with the selected item when user taps it
  getLabel,    // returns the display string for an item
  getKey,      // returns a unique identifier for an item, used for the active highlight and React key
  isOpen,      
  onToggle,    // called when the trigger is pressed to open/close the list
  placeholder = 'Select an option',
  emptyText = 'No options available',
  dropdownOverlays = false,
  error = false,
}: DropdownProps<T>) {
  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);

  return (
    <View style={dropdownOverlays ? styles.dropdownOverlaysWrapper : undefined}>
      <TouchableOpacity
        style={[styles.trigger, error && styles.triggerError]}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <ThemedText style={selectedValue ? styles.selected : styles.placeholder}>
          {selectedValue ? getLabel(selectedValue) : placeholder}
        </ThemedText>
        <IconSymbol
          name={isOpen ? 'arrowtriangle.up.fill' : 'arrowtriangle.down.fill'}
          size={13}
          color="#888"
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={[styles.list, dropdownOverlays && styles.listDropdownOverlays]}>
          {items.length === 0 ? (
            <View style={styles.item}>
              <ThemedText style={styles.itemText}>{emptyText}</ThemedText>
            </View>
          ) : (
            items.map(item => {
              const isSelected = selectedValue !== null && getKey(item) === getKey(selectedValue);
              return (
                <TouchableOpacity
                  key={getKey(item)}
                  style={[styles.item, isSelected && styles.itemActive]}
                  onPress={() => onSelect(item)}
                >
                  <ThemedText style={styles.itemText}>{getLabel(item)}</ThemedText>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

const getStyles = (width: number, height: number) => StyleSheet.create({
  dropdownOverlaysWrapper: {
    position: 'relative',
    zIndex: 10,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: height * 0.014,
    marginBottom: height * 0.005,
    minHeight: height * 0.057,
  },
  triggerError: {
    borderColor: '#d9534f',
  },
  selected: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    fontSize: 16,
    color: '#aaa',
  },
  list: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: height * 0.022,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  listDropdownOverlays: {
    position: 'absolute',
    top: height * 0.057,
    left: 0,
    right: 0,
    zIndex: 10,
    marginBottom: 0,
  },
  item: {
    paddingVertical: height * 0.014,
    paddingHorizontal: width * 0.041,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  itemActive: {
    backgroundColor: '#f0f7f4',
  },
  itemText: {
    fontSize: 15,
    color: '#333',
  },
});
