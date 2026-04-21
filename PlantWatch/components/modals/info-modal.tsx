import { Modal, View, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemeColors } from '@/hooks/get-theme-colors';

interface InfoModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
  title?: string;
}

export function InfoModal({ visible, message, onClose, title = 'Info' }: InfoModalProps) {
  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          <ThemedText style={styles.modalTitle}>{title}</ThemedText>
          <ThemedText style={styles.message}>{message}</ThemedText>
          <TouchableOpacity style={styles.okButton} onPress={onClose}>
            <ThemedText style={styles.okButtonText}>OK</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (width: number, height: number) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: width * 0.062,
    width: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: ThemeColors.header,
    marginBottom: height * 0.012,
  },
  message: {
    fontSize: 15,
    color: '#555',
    marginBottom: height * 0.022,
    lineHeight: 22,
  },
  okButton: {
    backgroundColor: ThemeColors.button,
    padding: height * 0.0166,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: height * 0.005,
  },
  okButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
